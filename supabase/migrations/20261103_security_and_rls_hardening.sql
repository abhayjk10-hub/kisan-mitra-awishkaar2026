-- =====================================================================
-- KISAN MITRA MIGRATION: SECURITY & RLS HARDENING (C6, C7, M2)
-- Idempotent: safe to run multiple times using IF NOT EXISTS and DROP POLICY IF EXISTS
-- =====================================================================

-- 1. MANDI STAFF LINK TABLE
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

-- 2. MANDIS TABLE VERIFICATION COLUMN & UPDATED_AT
ALTER TABLE mandis ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

-- Keep seed/demo mandis active & verified for discovery
UPDATE mandis SET is_verified = true WHERE is_active = true AND is_verified = false;

-- 3. SLOT BOOKINGS UPDATED_AT & TRIGGER (H8)
ALTER TABLE slot_bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_slot_bookings_farmer_id ON slot_bookings(farmer_id);

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_slot_bookings_updated_at ON slot_bookings;
CREATE TRIGGER trigger_slot_bookings_updated_at
  BEFORE UPDATE ON slot_bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_timestamp();

-- 4. ENABLE RLS ON ALL TABLES
ALTER TABLE mandis ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandi_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_delays ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- 5. DROP PERMISSIVE "USING (true)" POLICIES
DROP POLICY IF EXISTS "Public can view active mandis" ON mandis;
DROP POLICY IF EXISTS "Anyone can insert mandi" ON mandis;
DROP POLICY IF EXISTS "Anyone can update mandi" ON mandis;
DROP POLICY IF EXISTS "Public can read slot bookings" ON slot_bookings;
DROP POLICY IF EXISTS "Public can insert slot bookings" ON slot_bookings;
DROP POLICY IF EXISTS "Public can update slot bookings" ON slot_bookings;
DROP POLICY IF EXISTS "Public can read farmer delays" ON farmer_delays;
DROP POLICY IF EXISTS "Public can insert farmer delays" ON farmer_delays;
DROP POLICY IF EXISTS "Public can view farmers" ON farmers;
DROP POLICY IF EXISTS "Public can insert farmers" ON farmers;
DROP POLICY IF EXISTS "Public can update farmers" ON farmers;

-- 6. REAL OWNERSHIP RLS: MANDIS
CREATE POLICY "Public can view active verified mandis"
  ON mandis FOR SELECT
  USING (is_active = true AND is_verified = true);

CREATE POLICY "Mandi staff can view own mandi"
  ON mandis FOR SELECT
  TO authenticated
  USING (id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert mandi"
  ON mandis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Mandi staff can update own mandi"
  ON mandis FOR UPDATE
  TO authenticated
  USING (id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));

-- 7. REAL OWNERSHIP RLS: MANDI STAFF
DROP POLICY IF EXISTS "Staff can view own link" ON mandi_staff;
CREATE POLICY "Staff can view own link"
  ON mandi_staff FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can insert own link" ON mandi_staff;
CREATE POLICY "Staff can insert own link"
  ON mandi_staff FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 8. REAL OWNERSHIP RLS: FARMERS PROFILE
CREATE POLICY "Farmers can view own profile"
  ON farmers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert own profile"
  ON farmers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can update own profile"
  ON farmers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 9. REAL OWNERSHIP RLS: SLOT BOOKINGS
CREATE POLICY "Farmers can view own bookings"
  ON slot_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = farmer_id);

CREATE POLICY "Mandi staff can view mandi bookings"
  ON slot_bookings FOR SELECT
  TO authenticated
  USING (mandi_id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));

CREATE POLICY "Farmers can insert own bookings"
  ON slot_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can cancel own bookings"
  ON slot_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id AND status = 'cancelled');

CREATE POLICY "Mandi staff can update mandi bookings"
  ON slot_bookings FOR UPDATE
  TO authenticated
  USING (mandi_id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));

-- 10. REAL OWNERSHIP RLS: FARMER DELAYS
CREATE POLICY "Mandi staff can view mandi delays"
  ON farmer_delays FOR SELECT
  TO authenticated
  USING (mandi_id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));

CREATE POLICY "Mandi staff can insert delays"
  ON farmer_delays FOR INSERT
  TO authenticated
  WITH CHECK (mandi_id IN (SELECT mandi_id FROM mandi_staff WHERE user_id = auth.uid()));

CREATE POLICY "Farmers can view own delays"
  ON farmer_delays FOR SELECT
  TO authenticated
  USING (farmer_phone IN (SELECT mobile_number FROM farmers WHERE user_id = auth.uid()));

-- 11. SECURE MASKED PHONE VIEW FOR MANDI SCREENS
CREATE OR REPLACE VIEW mandi_queue_masked_view AS
SELECT
  id,
  token_number,
  mandi_id,
  mandi_name,
  farmer_id,
  farmer_name,
  CASE
    WHEN farmer_phone IS NULL THEN NULL
    WHEN length(farmer_phone) >= 10 THEN CONCAT('******', RIGHT(farmer_phone, 4))
    ELSE '**********'
  END AS masked_farmer_phone,
  crop_name,
  quantity_quintals,
  vehicle_number,
  booking_date,
  slot_start_time,
  slot_end_time,
  status,
  waitlist_position,
  is_walkin,
  arrival_time,
  completion_time,
  delay_minutes,
  created_at,
  updated_at
FROM slot_bookings;

