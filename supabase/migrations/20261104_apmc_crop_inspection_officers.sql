-- =====================================================================
-- Migration: 20261104_apmc_crop_inspection_officers.sql
-- Description: APMC Crop Inspection Officers table, Row Level Security,
--              and 10 seeded inspection officers with Supabase Auth credentials.
-- Shared Demo Password for seeded officers: Demo@12345
-- =====================================================================

-- Ensure pgcrypto extension is available for bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ---------------------------------------------------------------------
-- 1. APMC INSPECTION OFFICERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.officers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  officer_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL UNIQUE,
  batch_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for high-speed batch and officer lookup
CREATE INDEX IF NOT EXISTS idx_officers_batch_id ON public.officers(batch_id);
CREATE INDEX IF NOT EXISTS idx_officers_officer_id ON public.officers(officer_id);
CREATE INDEX IF NOT EXISTS idx_officers_contact ON public.officers(contact_number);

-- ---------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running migration to avoid conflict errors
DROP POLICY IF EXISTS "Officers can read own profile" ON public.officers;
DROP POLICY IF EXISTS "Officers can update own profile" ON public.officers;
DROP POLICY IF EXISTS "Admins can view all officers" ON public.officers;
DROP POLICY IF EXISTS "Service role has full access" ON public.officers;

-- Policy 1: Authenticated officer can read their own profile
CREATE POLICY "Officers can read own profile"
  ON public.officers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Authenticated officer can update their own profile contact details
CREATE POLICY "Officers can update own profile"
  ON public.officers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Admins can view all officer profiles
-- Checks JWT app_metadata role='admin'
CREATE POLICY "Admins can view all officers"
  ON public.officers
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Policy 4: Supabase Service Role has unrestricted access (for secure server API routes)
CREATE POLICY "Service role has full access"
  ON public.officers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Explicit grants
GRANT SELECT, UPDATE ON public.officers TO authenticated;
GRANT ALL ON public.officers TO service_role;

-- ---------------------------------------------------------------------
-- 3. SEED 10 APMC CROP INSPECTION OFFICERS
-- Credentials:
--   Email: officer001@apmc-demo.local ... officer010@apmc-demo.local
--   Password: Demo@12345
-- ---------------------------------------------------------------------
DO $$
DECLARE
  v_demo_password_hash TEXT;
  v_officer RECORD;
BEGIN
  -- Compute bcrypt hash of shared demo password 'Demo@12345'
  v_demo_password_hash := extensions.crypt('Demo@12345', extensions.gen_salt('bf', 10));

  -- Temporary table of 10 realistic fictional APMC crop inspection officers
  CREATE TEMP TABLE temp_seed_officers (
    id UUID,
    officer_id TEXT,
    full_name TEXT,
    contact_number TEXT,
    batch_id TEXT,
    email TEXT
  ) ON COMMIT DROP;

  INSERT INTO temp_seed_officers (id, officer_id, full_name, contact_number, batch_id, email)
  VALUES
    ('00000000-0000-0000-0000-000000000101', 'OFF-001', 'Suresh M. Deshmukh',  '+91 98220 01001', 'APMC-B01', 'officer001@apmc-demo.local'),
    ('00000000-0000-0000-0000-000000000102', 'OFF-002', 'Anita R. Shinde',      '+91 98220 01002', 'APMC-B02', 'officer002@apmc-demo.local'),
    ('00000000-0000-0000-0000-000000000103', 'OFF-003', 'Vikram P. Jadhav',     '+91 98220 01003', 'APMC-B03', 'officer003@apmc-demo.local'),
    ('00000000-0000-0000-0000-000000000104', 'OFF-004', 'Meena K. Patil',       '+91 98220 01004', 'APMC-B04', 'officer004@apmc-demo.local'),
    ('00000000-0000-0000-0000-000000000105', 'OFF-005', 'Rajesh V. Kulkarni',   '+91 98220 01005', 'APMC-B05', 'officer005@apmc-demo.local'),
    ('00000000-0000-0000-0000-000000000106', 'OFF-006', 'Sunita B. Chavan',     '+91 98220 01006', 'APMC-B06', 'officer006@apmc-demo.local'),
    ('00000000-0000-0000-0000-000000000107', 'OFF-007', 'Deepak N. Pawar',      '+91 98220 01007', 'APMC-B07', 'officer007@apmc-demo.local'),
    ('00000000-0000-0000-0000-000000000108', 'OFF-008', 'Kavita S. Gaikwad',    '+91 98220 01008', 'APMC-B08', 'officer008@apmc-demo.local'),
    ('00000000-0000-0000-0000-000000000109', 'OFF-009', 'Santosh G. More',      '+91 98220 01009', 'APMC-B09', 'officer009@apmc-demo.local'),
    ('00000000-0000-0000-0000-000000000110', 'OFF-010', 'Archana T. Jagtap',    '+91 98220 01010', 'APMC-B10', 'officer010@apmc-demo.local');

  FOR v_officer IN SELECT * FROM temp_seed_officers LOOP
    -- Step A: Insert into auth.users if not already registered
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_officer.id OR email = v_officer.email) THEN
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_officer.id,
        'authenticated',
        'authenticated',
        v_officer.email,
        v_demo_password_hash,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object(
          'officer_id', v_officer.officer_id,
          'full_name', v_officer.full_name,
          'contact_number', v_officer.contact_number,
          'batch_id', v_officer.batch_id
        ),
        false,
        NOW(),
        NOW()
      );
    ELSE
      -- Ensure password matches Demo@12345 if user already existed
      UPDATE auth.users
      SET encrypted_password = v_demo_password_hash,
          email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
          updated_at = NOW()
      WHERE id = v_officer.id OR email = v_officer.email;
    END IF;

    -- Step B: Insert or update auth.identities for email provider login
    INSERT INTO auth.identities (
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      v_officer.id,
      jsonb_build_object('sub', v_officer.id::text, 'email', lower(v_officer.email)),
      'email',
      v_officer.id::text,
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (provider, provider_id) DO UPDATE SET
      identity_data = EXCLUDED.identity_data,
      updated_at = NOW();

    -- Step C: Insert into public.officers profile table
    INSERT INTO public.officers (
      id,
      officer_id,
      full_name,
      contact_number,
      batch_id,
      created_at
    )
    VALUES (
      v_officer.id,
      v_officer.officer_id,
      v_officer.full_name,
      v_officer.contact_number,
      v_officer.batch_id,
      NOW()
    )
    ON CONFLICT (officer_id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        contact_number = EXCLUDED.contact_number,
        batch_id = EXCLUDED.batch_id;
  END LOOP;
END $$;

