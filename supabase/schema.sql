-- =====================================================================
-- KISAN MITRA — SUPABASE DATABASE SCHEMA FOR APMC MANDI & SLOT SYSTEM
-- =====================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- CHAT MESSAGES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'hi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created
  ON chat_messages(user_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save their own chat messages" ON chat_messages;
CREATE POLICY "Users can save their own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous visitors can save chat messages" ON chat_messages;
CREATE POLICY "Anonymous visitors can save chat messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- ---------------------------------------------------------------------
-- 1. MANDIS TABLE (APMC Market Yards)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mandis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- e.g., 'APMC-PUN-01'
  license_no TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  slot_capacity INTEGER NOT NULL DEFAULT 5, -- farmers handled per 30-min window
  opening_time TIME NOT NULL DEFAULT '06:00',
  closing_time TIME NOT NULL DEFAULT '18:00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link table for verified APMC Mandi Staff
CREATE TABLE IF NOT EXISTS mandi_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mandi_id UUID NOT NULL REFERENCES mandis(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mandi_id)
);

CREATE INDEX IF NOT EXISTS idx_mandi_staff_user ON mandi_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_mandi_staff_mandi ON mandi_staff(mandi_id);

-- Index for geographic and code lookups
CREATE INDEX IF NOT EXISTS idx_mandis_code ON mandis(code);
CREATE INDEX IF NOT EXISTS idx_mandis_district ON mandis(district);
CREATE INDEX IF NOT EXISTS idx_mandis_active ON mandis(is_active);

-- ---------------------------------------------------------------------
-- 2. SLOT BOOKINGS TABLE (Farmer 30-Minute Tokens)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS slot_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number TEXT NOT NULL, -- e.g. 'TK-PUN-0910-001'
  mandi_id UUID NOT NULL REFERENCES mandis(id) ON DELETE CASCADE,
  mandi_name TEXT NOT NULL,
  farmer_id UUID,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  quantity_quintals NUMERIC NOT NULL DEFAULT 10,
  vehicle_number TEXT,
  booking_date DATE NOT NULL,
  slot_start_time TIME NOT NULL,
  slot_end_time TIME NOT NULL, -- exactly 30 minutes after start_time
  status TEXT NOT NULL DEFAULT 'waiting' 
    CHECK (status IN ('waiting', 'active', 'completed', 'no-show', 'cancelled', 'waitlisted')),
  waitlist_position INTEGER DEFAULT NULL,
  cancellation_reason TEXT DEFAULT NULL,
  cancelled_at TIMESTAMPTZ DEFAULT NULL,
  is_walkin BOOLEAN NOT NULL DEFAULT false,
  arrival_time TIMESTAMPTZ,
  completion_time TIMESTAMPTZ,
  delay_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast queue sorting and farmer history
CREATE INDEX IF NOT EXISTS idx_slot_bookings_mandi_date ON slot_bookings(mandi_id, booking_date, slot_start_time);
CREATE INDEX IF NOT EXISTS idx_slot_bookings_status ON slot_bookings(status);
CREATE INDEX IF NOT EXISTS idx_slot_bookings_farmer_phone ON slot_bookings(farmer_phone);
CREATE INDEX IF NOT EXISTS idx_slot_bookings_token ON slot_bookings(token_number);

-- ---------------------------------------------------------------------
-- 3. FARMER DELAYS & PENALTIES TABLE (Cross-Mandi Network Accountability)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farmer_delays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES slot_bookings(id) ON DELETE SET NULL,
  farmer_phone TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  mandi_id UUID REFERENCES mandis(id) ON DELETE SET NULL,
  mandi_name TEXT NOT NULL,
  delay_type TEXT NOT NULL CHECK (delay_type IN ('late_arrival', 'no_show', 'cancellation_late')),
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  penalty_points INTEGER NOT NULL DEFAULT 1,
  reason TEXT,
  reported_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick lookup of repeat offenders across the network
CREATE INDEX IF NOT EXISTS idx_farmer_delays_phone ON farmer_delays(farmer_phone);
CREATE INDEX IF NOT EXISTS idx_farmer_delays_mandi ON farmer_delays(mandi_id);
CREATE INDEX IF NOT EXISTS idx_farmer_delays_type ON farmer_delays(delay_type);

-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
ALTER TABLE mandis ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandi_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_delays ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Mandis: Public discovery of active, verified mandis; staff can view and update their own mandi
DROP POLICY IF EXISTS "Public can view active mandis" ON mandis;
DROP POLICY IF EXISTS "Anyone can insert mandi" ON mandis;
DROP POLICY IF EXISTS "Anyone can update mandi" ON mandis;
CREATE POLICY "Public can view active verified mandis" ON mandis FOR SELECT USING (is_active = true AND is_verified = true);
CREATE POLICY "Mandi staff can view own mandi" ON mandis FOR SELECT TO authenticated USING (id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can insert mandi" ON mandis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Mandi staff can update own mandi" ON mandis FOR UPDATE TO authenticated USING (id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));

-- Mandi Staff: Users can view and insert their own staff link
DROP POLICY IF EXISTS "Staff can view own link" ON mandi_staff;
CREATE POLICY "Staff can view own link" ON mandi_staff FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Staff can insert own link" ON mandi_staff;
CREATE POLICY "Staff can insert own link" ON mandi_staff FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Slot Bookings: Farmers access own; mandi staff access their mandi's; farmers have cancel-only updates
DROP POLICY IF EXISTS "Public can read slot bookings" ON slot_bookings;
DROP POLICY IF EXISTS "Public can insert slot bookings" ON slot_bookings;
DROP POLICY IF EXISTS "Public can update slot bookings" ON slot_bookings;
CREATE POLICY "Farmers can view own bookings" ON slot_bookings FOR SELECT TO authenticated USING (auth.uid() = farmer_id);
CREATE POLICY "Mandi staff can view mandi bookings" ON slot_bookings FOR SELECT TO authenticated USING (mandi_id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));
CREATE POLICY "Farmers can insert own bookings" ON slot_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can cancel own bookings" ON slot_bookings FOR UPDATE TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id AND status = 'cancelled');
CREATE POLICY "Mandi staff can update mandi bookings" ON slot_bookings FOR UPDATE TO authenticated USING (mandi_id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));

-- Farmer Delays: Mandi staff access own mandi; farmers access delays on their phone
DROP POLICY IF EXISTS "Public can read farmer delays" ON farmer_delays;
DROP POLICY IF EXISTS "Public can insert farmer delays" ON farmer_delays;
CREATE POLICY "Mandi staff can view mandi delays" ON farmer_delays FOR SELECT TO authenticated USING (mandi_id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));
CREATE POLICY "Mandi staff can insert delays" ON farmer_delays FOR INSERT TO authenticated WITH CHECK (mandi_id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));
CREATE POLICY "Farmers can view own delays" ON farmer_delays FOR SELECT TO authenticated USING (farmer_phone IN (SELECT mobile_number FROM farmers WHERE user_id = auth.uid()));

-- Farmers Profile: Users access only their own row
DROP POLICY IF EXISTS "Public can view farmers" ON farmers;
DROP POLICY IF EXISTS "Public can insert farmers" ON farmers;
DROP POLICY IF EXISTS "Public can update farmers" ON farmers;
CREATE POLICY "Farmers can view own profile" ON farmers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Farmers can insert own profile" ON farmers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Farmers can update own profile" ON farmers FOR UPDATE TO authenticated USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 5. ENABLE SUPABASE REALTIME FOR LIVE BIDIRECTIONAL SYNC
-- ---------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE slot_bookings;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE farmer_delays;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE mandis;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- ---------------------------------------------------------------------
-- 6. SEED DATA: MAHARASHTRA APMC MANDIS (WITH GEOGRAPHIC COORDINATES)
-- ---------------------------------------------------------------------
INSERT INTO mandis (id, name, code, license_no, district, state, address, latitude, longitude, contact_person, contact_phone, contact_email, slot_capacity, opening_time, closing_time)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'Pune APMC Market Yard',
    'APMC-PUN-01',
    'LIC-MH-PUN-2024-001',
    'Pune',
    'Maharashtra',
    'Gultekdi Market Yard, Pune, Maharashtra 411037',
    18.4907,
    73.8683,
    'Suresh Patil (Secretary)',
    '+919822012345',
    'pune.apmc@kisanmitra.gov.in',
    6,
    '06:00',
    '18:00'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    'Baramati APMC Yard',
    'APMC-BRM-02',
    'LIC-MH-BRM-2024-089',
    'Pune',
    'Maharashtra',
    'MIDC Road, Baramati, District Pune 413133',
    18.1517,
    74.5772,
    'Rajendra Deshmukh',
    '+919822054321',
    'baramati.apmc@kisanmitra.gov.in',
    5,
    '06:30',
    '17:30'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-333333333333',
    'Ahmednagar APMC Main Yard',
    'APMC-AHM-03',
    'LIC-MH-AHM-2024-042',
    'Ahmednagar',
    'Maharashtra',
    'Station Road, Near Railway Goods Shed, Ahmednagar 414001',
    19.0948,
    74.7480,
    'Vikas Gaikwad',
    '+919823198765',
    'ahmednagar.apmc@kisanmitra.gov.in',
    8,
    '06:00',
    '19:00'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-444444444444',
    'Nashik APMC Onion & Grain Yard',
    'APMC-NSK-04',
    'LIC-MH-NSK-2024-118',
    'Nashik',
    'Maharashtra',
    'Peth Road, Panchavati, Nashik 422003',
    20.0125,
    73.7915,
    'Bhausaheb Jadhav',
    '+919822456789',
    'nashik.apmc@kisanmitra.gov.in',
    10,
    '05:30',
    '19:30'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-555555555555',
    'Lasalgaon APMC (Asia Largest Onion Yard)',
    'APMC-LSG-05',
    'LIC-MH-LSG-2024-007',
    'Nashik',
    'Maharashtra',
    'Niphad Taluka, Lasalgaon 422306',
    20.1458,
    74.2287,
    'Dattatray Shinde',
    '+919822998877',
    'lasalgaon.apmc@kisanmitra.gov.in',
    12,
    '06:00',
    '18:00'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-666666666666',
    'Solapur Cotton & Pulse Yard',
    'APMC-SOL-06',
    'LIC-MH-SOL-2024-054',
    'Solapur',
    'Maharashtra',
    'Saat Rasta, Siddheshwar Peth, Solapur 413001',
    17.6599,
    75.9064,
    'Anil Kulkarni',
    '+919823334455',
    'solapur.apmc@kisanmitra.gov.in',
    6,
    '07:00',
    '18:00'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-777777777777',
    'Kolhapur Jaggery & Spice APMC',
    'APMC-KOL-07',
    'LIC-MH-KOL-2024-019',
    'Kolhapur',
    'Maharashtra',
    'Shahupuri, Near Old Palace, Kolhapur 416001',
    16.7050,
    74.2433,
    'Mahadev Bhosale',
    '+919823901234',
    'kolhapur.apmc@kisanmitra.gov.in',
    5,
    '06:30',
    '17:30'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-888888888888',
    'Nagpur Orange & Grain Yard',
    'APMC-NGP-08',
    'LIC-MH-NGP-2024-093',
    'Nagpur',
    'Maharashtra',
    'Kalamna Market, Central Avenue, Nagpur 440008',
    21.1685,
    79.1389,
    'Pravin Wankhede',
    '+919822887766',
    'nagpur.apmc@kisanmitra.gov.in',
    8,
    '06:00',
    '19:00'
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;


-- =====================================================================
-- POSTGRESQL ATOMIC FUNCTIONS & RPCs
-- =====================================================================

-- 1. Function: Promote next waitlisted farmer when a slot is vacated
CREATE OR REPLACE FUNCTION promote_next_waitlisted_farmer(
  p_mandi_id UUID,
  p_booking_date DATE,
  p_slot_start_time TIME
)
RETURNS UUID AS $$
DECLARE
  v_promoted_id UUID;
BEGIN
  SELECT id INTO v_promoted_id
  FROM slot_bookings
  WHERE mandi_id = p_mandi_id
    AND booking_date = p_booking_date
    AND slot_start_time = p_slot_start_time
    AND status = 'waitlisted'
  ORDER BY waitlist_position ASC NULLS LAST, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_promoted_id IS NOT NULL THEN
    UPDATE slot_bookings
    SET status = 'waiting',
        waitlist_position = NULL
    WHERE id = v_promoted_id;
  END IF;

  RETURN v_promoted_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger: Reassign freed slot on cancellation or no-show
CREATE OR REPLACE FUNCTION handle_slot_freed()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IN ('waiting', 'active') AND NEW.status IN ('cancelled', 'no-show')) THEN
    PERFORM promote_next_waitlisted_farmer(NEW.mandi_id, NEW.booking_date, NEW.slot_start_time);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reassign_freed_slot ON slot_bookings;
CREATE TRIGGER trigger_reassign_freed_slot
  AFTER UPDATE OF status ON slot_bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_slot_freed();

-- 3. Stored Procedure: Atomic Slot Booking with capacity check and sequential token generation
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

  -- 2. Reject past dates & past time slots
  IF p_booking_date < v_today_ist THEN
    RAISE EXCEPTION 'PAST_DATE: Cannot book a slot for a past date.';
  END IF;

  IF p_booking_date = v_today_ist AND p_slot_start_time < v_current_time_ist THEN
    RAISE EXCEPTION 'PAST_SLOT: Cannot book a time slot that has already passed today.';
  END IF;

  -- 3. Duplicate checks
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

  -- 4. Capacity check under lock
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

  -- 5. Sequential token number per mandi and date under lock
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

-- 4. Stored Procedure: Cancel Farmer Slot RPC
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

  IF v_booking.farmer_id IS NOT NULL AND auth.uid() IS NOT NULL AND v_booking.farmer_id <> auth.uid() THEN
    RAISE EXCEPTION 'UNAUTHORIZED: You cannot cancel another farmer''s booking.';
  END IF;

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

  v_today_ist := (now() AT TIME ZONE 'Asia/Kolkata')::date;
  IF v_booking.booking_date <= v_today_ist THEN
    RAISE EXCEPTION 'LATE_CANCELLATION: Cancellations are only allowed up to 1 day before the scheduled slot date.';
  END IF;

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

-- 5. Grant execute permissions to PostgREST roles
GRANT EXECUTE ON FUNCTION book_slot(UUID, UUID, TEXT, TEXT, TEXT, NUMERIC, TEXT, DATE, TIME, TIME, BOOLEAN) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION cancel_farmer_slot(UUID, TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION promote_next_waitlisted_farmer(UUID, DATE, TIME) TO authenticated, anon, service_role;

-- 6. Force reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
