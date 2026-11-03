-- =====================================================================
-- KISAN MITRA MIGRATION: ATOMIC SLOT BOOKING, CAPACITY & TOKEN GENERATION (H3, H4, H7)
-- =====================================================================

-- 1. Unique index on (mandi_id, booking_date, token_number) to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_slot_bookings_mandi_date_token
  ON slot_bookings (mandi_id, booking_date, token_number);

-- 2. Partial unique index to reject duplicate active bookings for same farmer, mandi, and date
CREATE UNIQUE INDEX IF NOT EXISTS idx_slot_bookings_unique_active_farmer
  ON slot_bookings (mandi_id, booking_date, farmer_phone)
  WHERE status IN ('waiting', 'active', 'waitlisted');

-- 3. Partial unique index to reject duplicate vehicle in same 30-min window
CREATE UNIQUE INDEX IF NOT EXISTS idx_slot_bookings_unique_vehicle_slot
  ON slot_bookings (mandi_id, booking_date, slot_start_time, UPPER(vehicle_number))
  WHERE status IN ('waiting', 'active', 'waitlisted') AND vehicle_number IS NOT NULL;

-- 4. Postgres atomic slot booking RPC
CREATE OR REPLACE FUNCTION book_slot(
  p_mandi_id UUID,
  p_farmer_id UUID,
  p_farmer_name TEXT,
  p_farmer_phone TEXT,
  p_crop_name TEXT,
  p_quantity_quintals NUMERIC,
  p_vehicle_number TEXT,
  p_booking_date DATE,
  p_slot_start_time TIME,
  p_slot_end_time TIME,
  p_is_walkin BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
  v_mandi RECORD;
  v_active_count INTEGER;
  v_capacity INTEGER;
  v_clean_code TEXT;
  v_short_code TEXT;
  v_clean_date TEXT;
  v_next_seq INTEGER;
  v_token_number TEXT;
  v_booking RECORD;
  v_today_ist DATE;
  v_current_time_ist TIME;
  v_clean_vehicle TEXT;
BEGIN
  -- 1. Lock mandi row for capacity check and token serialization
  SELECT * INTO v_mandi FROM mandis WHERE id = p_mandi_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mandi not found with ID %', p_mandi_id;
  END IF;

  v_today_ist := (now() AT TIME ZONE 'Asia/Kolkata')::date;
  v_current_time_ist := (now() AT TIME ZONE 'Asia/Kolkata')::time;

  -- 2. Reject past dates & past time slots (H5, H6)
  IF p_booking_date < v_today_ist THEN
    RAISE EXCEPTION 'PAST_DATE: Cannot book a slot for a past date.';
  END IF;

  IF p_booking_date = v_today_ist AND p_slot_start_time < v_current_time_ist THEN
    RAISE EXCEPTION 'PAST_SLOT: Cannot book a time slot that has already passed today.';
  END IF;

  -- 3. Duplicate checks (H7)
  IF EXISTS (
    SELECT 1 FROM slot_bookings
    WHERE mandi_id = p_mandi_id
      AND booking_date = p_booking_date
      AND farmer_phone = p_farmer_phone
      AND status IN ('waiting', 'active', 'waitlisted')
  ) THEN
    RAISE EXCEPTION 'DUPLICATE_FARMER: You already have an active booking at this Mandi for this date.';
  END IF;

  v_clean_vehicle := UPPER(NULLIF(btrim(p_vehicle_number), ''));
  IF v_clean_vehicle IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM slot_bookings
      WHERE mandi_id = p_mandi_id
        AND booking_date = p_booking_date
        AND slot_start_time = p_slot_start_time
        AND UPPER(vehicle_number) = v_clean_vehicle
        AND status IN ('waiting', 'active', 'waitlisted')
    ) THEN
      RAISE EXCEPTION 'DUPLICATE_VEHICLE: Vehicle % already has a booking for this time window.', v_clean_vehicle;
    END IF;
  END IF;

  -- 4. Capacity check under lock (H3)
  SELECT COUNT(*) INTO v_active_count
  FROM slot_bookings
  WHERE mandi_id = p_mandi_id
    AND booking_date = p_booking_date
    AND slot_start_time = p_slot_start_time
    AND status IN ('waiting', 'active');

  v_capacity := COALESCE(v_mandi.slot_capacity, 6);

  IF v_active_count >= v_capacity THEN
    RAISE EXCEPTION 'SLOT_FULL: This 30-minute time slot is fully booked (% of % slots filled).', v_active_count, v_capacity;
  END IF;

  -- 5. Sequential token number per mandi and date under lock (H4)
  v_clean_code := UPPER(REGEXP_REPLACE(v_mandi.code, '[^a-zA-Z0-9]', '', 'g'));
  IF length(v_clean_code) >= 3 THEN
    v_short_code := RIGHT(v_clean_code, 3);
  ELSE
    v_short_code := COALESCE(v_clean_code, 'MND');
  END IF;

  SELECT COALESCE(MAX(
    CASE
      WHEN token_number ~ '-[0-9]+$' THEN SUBSTRING(token_number FROM '-([0-9]+)$')::INTEGER
      ELSE 0
    END
  ), 0) + 1
  INTO v_next_seq
  FROM slot_bookings
  WHERE mandi_id = p_mandi_id
    AND booking_date = p_booking_date;

  v_clean_date := TO_CHAR(p_booking_date, 'MMDD');
  v_token_number := 'TK-' || v_short_code || '-' || v_clean_date || '-' || LPAD(v_next_seq::TEXT, 3, '0');

  -- 6. Insert new booking atomically
  INSERT INTO slot_bookings (
    id,
    token_number,
    mandi_id,
    mandi_name,
    farmer_id,
    farmer_name,
    farmer_phone,
    crop_name,
    quantity_quintals,
    vehicle_number,
    booking_date,
    slot_start_time,
    slot_end_time,
    status,
    is_walkin,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_token_number,
    p_mandi_id,
    v_mandi.name,
    p_farmer_id,
    p_farmer_name,
    p_farmer_phone,
    p_crop_name,
    p_quantity_quintals,
    v_clean_vehicle,
    p_booking_date,
    p_slot_start_time,
    p_slot_end_time,
    'waiting',
    p_is_walkin,
    now(),
    now()
  )
  RETURNING * INTO v_booking;

  RETURN to_jsonb(v_booking);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enhanced Farmer Slot Cancellation RPC (Harmless double cancels, farmer ownership check, strict IST 1-day rule)
CREATE OR REPLACE FUNCTION cancel_farmer_slot(
  p_booking_id UUID,
  p_reason TEXT DEFAULT 'Cancelled by farmer'
)
RETURNS JSONB AS $$
DECLARE
  v_booking RECORD;
  v_promoted_id UUID;
  v_today_ist DATE;
BEGIN
  SELECT * INTO v_booking
  FROM slot_bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found with ID %', p_booking_id;
  END IF;

  -- Farmer ownership check: farmer must not cancel another farmer's booking
  IF v_booking.farmer_id IS NOT NULL AND auth.uid() IS NOT NULL AND v_booking.farmer_id <> auth.uid() THEN
    RAISE EXCEPTION 'UNAUTHORIZED: You cannot cancel another farmer''s booking.';
  END IF;

  -- Double cancels must be harmless
  IF v_booking.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_cancelled', true,
      'cancelled_booking_id', p_booking_id
    );
  END IF;

  IF v_booking.status IN ('completed', 'active') THEN
    RAISE EXCEPTION 'Active or completed slots cannot be cancelled.';
  END IF;

  -- 1-Day Rule strictly in IST: Must cancel strictly at least 1 day before the scheduled slot date
  v_today_ist := (now() AT TIME ZONE 'Asia/Kolkata')::date;
  IF v_booking.booking_date <= v_today_ist THEN
    RAISE EXCEPTION 'LATE_CANCELLATION: Cancellations are only allowed up to 1 day before the scheduled slot date.';
  END IF;

  -- Update booking to cancelled (trigger_reassign_freed_slot automatically handles waitlist promotion)
  UPDATE slot_bookings
  SET status = 'cancelled',
      cancellation_reason = p_reason,
      cancelled_at = now()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'cancelled_booking_id', p_booking_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. GRANT EXECUTE PERMISSIONS TO SUPABASE ROLES
GRANT EXECUTE ON FUNCTION book_slot(UUID, UUID, TEXT, TEXT, TEXT, NUMERIC, TEXT, DATE, TIME, TIME, BOOLEAN) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION cancel_farmer_slot(UUID, TEXT) TO authenticated, anon, service_role;

-- 7. FORCE POSTGREST SCHEMA CACHE RELOAD
NOTIFY pgrst, 'reload schema';
