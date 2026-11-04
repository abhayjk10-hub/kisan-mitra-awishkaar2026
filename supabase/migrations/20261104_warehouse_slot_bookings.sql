-- =====================================================================
-- KISAN MITRA MIGRATION: WAREHOUSE SLOT BOOKINGS & MANDI LINKAGE
-- Idempotent: safe to run multiple times
-- =====================================================================

CREATE TABLE IF NOT EXISTS warehouse_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  warehouse_id TEXT NOT NULL,
  warehouse_name TEXT NOT NULL,
  warehouse_type TEXT NOT NULL DEFAULT 'cold_storage',
  warehouse_address TEXT NOT NULL,
  nearest_apmc_mandi TEXT NOT NULL,
  mandi_id UUID REFERENCES mandis(id) ON DELETE SET NULL,
  farmer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  quantity_quintals NUMERIC(10, 2) NOT NULL,
  rate_per_quintal_month NUMERIC(10, 2) NOT NULL DEFAULT 110,
  estimated_monthly_charge NUMERIC(10, 2) NOT NULL,
  storage_duration_months INTEGER NOT NULL DEFAULT 1,
  temperature_range TEXT,
  humidity_range TEXT,
  manager_name TEXT NOT NULL,
  manager_phone TEXT NOT NULL,
  manager_email TEXT,
  license_no TEXT,
  status TEXT NOT NULL DEFAULT 'done' CHECK (status IN ('done', 'active', 'released', 'cancelled')),
  booked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_wh_bookings_mandi_id ON warehouse_bookings(mandi_id);
CREATE INDEX IF NOT EXISTS idx_wh_bookings_nearest_apmc ON warehouse_bookings(nearest_apmc_mandi);
CREATE INDEX IF NOT EXISTS idx_wh_bookings_farmer_phone ON warehouse_bookings(farmer_phone);
CREATE INDEX IF NOT EXISTS idx_wh_bookings_warehouse_id ON warehouse_bookings(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_wh_bookings_status ON warehouse_bookings(status);

-- Enable RLS
ALTER TABLE warehouse_bookings ENABLE ROW LEVEL SECURITY;

-- Allow public / farmers to create bookings
CREATE POLICY "Allow public insert to warehouse_bookings"
  ON warehouse_bookings FOR INSERT
  WITH CHECK (true);

-- Allow public and mandi operators to view warehouse bookings
CREATE POLICY "Allow public select from warehouse_bookings"
  ON warehouse_bookings FOR SELECT
  USING (true);

-- Allow authenticated updates
CREATE POLICY "Allow update to warehouse_bookings"
  ON warehouse_bookings FOR UPDATE
  USING (true);

-- Seed Initial Realistic Bookings:
-- 1. Pune Agro Cold Chain & CA Store (Near Pune APMC Market Yard)
INSERT INTO warehouse_bookings (
  id,
  ticket_number,
  warehouse_id,
  warehouse_name,
  warehouse_type,
  warehouse_address,
  nearest_apmc_mandi,
  mandi_id,
  farmer_name,
  farmer_phone,
  crop_name,
  quantity_quintals,
  rate_per_quintal_month,
  estimated_monthly_charge,
  storage_duration_months,
  temperature_range,
  humidity_range,
  manager_name,
  manager_phone,
  manager_email,
  license_no,
  status,
  booked_at
) VALUES (
  'b1111111-2222-3333-4444-555555555001',
  'WH-PUN-20261104-1001',
  'cs-pun-01',
  'Pune Agro Cold Chain & CA Store',
  'cold_storage',
  'Near Gultekdi APMC Gate 4, Market Yard, Pune 411037',
  'Pune APMC (Gultekdi Market Yard)',
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'Anagha Katkar',
  '8928909642',
  'Tomato',
  20,
  110,
  2200,
  1,
  '0°C to 4°C',
  '90% - 95% RH',
  'Suresh More',
  '+919822451122',
  'pune.coldchain@agristorage.in',
  'WDRA-MH-PUN-2023-018',
  'done',
  now() - INTERVAL '2 hours'
) ON CONFLICT (ticket_number) DO NOTHING;

-- 2. MSWC Godown 12 (Near Pune APMC Market Yard)
INSERT INTO warehouse_bookings (
  id,
  ticket_number,
  warehouse_id,
  warehouse_name,
  warehouse_type,
  warehouse_address,
  nearest_apmc_mandi,
  mandi_id,
  farmer_name,
  farmer_phone,
  crop_name,
  quantity_quintals,
  rate_per_quintal_month,
  estimated_monthly_charge,
  storage_duration_months,
  temperature_range,
  humidity_range,
  manager_name,
  manager_phone,
  manager_email,
  license_no,
  status,
  booked_at
) VALUES (
  'b1111111-2222-3333-4444-555555555002',
  'WH-PUN-20261104-1002',
  'wh-pun-02',
  'Maharashtra State Warehousing Corp (MSWC) Godown 12',
  'dry_warehouse',
  'Hadapsar Industrial Estate, Near Gadital, Pune 411028',
  'Pune APMC (Gultekdi Market Yard)',
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'Dnyaneshwar Shinde',
  '9822114455',
  'Soyabean',
  60,
  32,
  1920,
  1,
  'Ambient (18°C - 32°C)',
  '< 65% RH',
  'Anil Kulkarni',
  '+919822340099',
  'mswc.hadapsar@maawarehouse.com',
  'WDRA-MH-PUN-2022-004',
  'done',
  now() - INTERVAL '5 hours'
) ON CONFLICT (ticket_number) DO NOTHING;

-- 3. Nashik Agro Pre-Cooling & Cold Logistics (Near Nashik APMC Panchavati)
INSERT INTO warehouse_bookings (
  id,
  ticket_number,
  warehouse_id,
  warehouse_name,
  warehouse_type,
  warehouse_address,
  nearest_apmc_mandi,
  mandi_id,
  farmer_name,
  farmer_phone,
  crop_name,
  quantity_quintals,
  rate_per_quintal_month,
  estimated_monthly_charge,
  storage_duration_months,
  temperature_range,
  humidity_range,
  manager_name,
  manager_phone,
  manager_email,
  license_no,
  status,
  booked_at
) VALUES (
  'b1111111-2222-3333-4444-555555555003',
  'WH-NSK-20261104-2001',
  'cs-nsk-01',
  'Nashik Agro Pre-Cooling & Cold Logistics',
  'cold_storage',
  'Panchavati APMC Agro Zone, Dindori Road, Nashik 422003',
  'Nashik APMC (Panchavati Grain & Veg Yard)',
  'a1b2c3d4-e5f6-7890-abcd-444444444444',
  'Balu Eknath Wagh',
  '9822336699',
  'Grapes',
  35,
  120,
  4200,
  1,
  '-0.5°C to 2°C',
  '92% - 96% RH',
  'Sachin Gaikwad',
  '+919823112233',
  'nashik.agrofreezer@agristorage.in',
  'NHB-MH-NSK-2023-092',
  'done',
  now() - INTERVAL '1 day'
) ON CONFLICT (ticket_number) DO NOTHING;

