-- Supabase Auth backed APMC register seed.
-- All rows in this seed are inferred state/UT portal placeholders, not verified
-- physical yards. Each row is idempotently upserted by its yard code.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH state_mandis(code, name, district, state, address, latitude, longitude, email, region) AS (
  VALUES
    ('APMC-AP-01', 'Andhra Pradesh State APMC Yard', 'Vijayawada', 'Andhra Pradesh', 'Vijayawada, Andhra Pradesh, India', 16.5062, 80.6480, 'ap.apmc@kisanmitra.gov.in', 'AP'),
    ('APMC-ARP-01', 'Arunachal Pradesh State APMC Yard', 'Itanagar', 'Arunachal Pradesh', 'Itanagar, Arunachal Pradesh, India', 27.0844, 93.6053, 'arp.apmc@kisanmitra.gov.in', 'ARP'),
    ('APMC-ASM-01', 'Assam State APMC Yard', 'Guwahati', 'Assam', 'Guwahati, Assam, India', 26.1445, 91.7362, 'asm.apmc@kisanmitra.gov.in', 'ASM'),
    ('APMC-BIH-01', 'Bihar State APMC Yard', 'Patna', 'Bihar', 'Patna, Bihar, India', 25.5941, 85.1376, 'bih.apmc@kisanmitra.gov.in', 'BIH'),
    ('APMC-CHG-01', 'Chhattisgarh State APMC Yard', 'Raipur', 'Chhattisgarh', 'Raipur, Chhattisgarh, India', 21.2514, 81.6296, 'chg.apmc@kisanmitra.gov.in', 'CHG'),
    ('APMC-GOA-01', 'Goa State APMC Yard', 'Panaji', 'Goa', 'Panaji, Goa, India', 15.4909, 73.8278, 'goa.apmc@kisanmitra.gov.in', 'GOA'),
    ('APMC-GUJ-01', 'Gujarat State APMC Yard', 'Gandhinagar', 'Gujarat', 'Gandhinagar, Gujarat, India', 23.2156, 72.6369, 'guj.apmc@kisanmitra.gov.in', 'GUJ'),
    ('APMC-HAR-01', 'Haryana State APMC Yard', 'Chandigarh', 'Haryana', 'Chandigarh, Haryana, India', 30.7333, 76.7794, 'har.apmc@kisanmitra.gov.in', 'HAR'),
    ('APMC-HPR-01', 'Himachal Pradesh State APMC Yard', 'Shimla', 'Himachal Pradesh', 'Shimla, Himachal Pradesh, India', 31.1048, 77.1734, 'hpr.apmc@kisanmitra.gov.in', 'HPR'),
    ('APMC-JHA-01', 'Jharkhand State APMC Yard', 'Ranchi', 'Jharkhand', 'Ranchi, Jharkhand, India', 23.3441, 85.3096, 'jha.apmc@kisanmitra.gov.in', 'JHA'),
    ('APMC-KAR-01', 'Karnataka State APMC Yard', 'Bengaluru', 'Karnataka', 'Bengaluru, Karnataka, India', 12.9716, 77.5946, 'kar.apmc@kisanmitra.gov.in', 'KAR'),
    ('APMC-KER-01', 'Kerala State APMC Yard', 'Thiruvananthapuram', 'Kerala', 'Thiruvananthapuram, Kerala, India', 8.5241, 76.9366, 'ker.apmc@kisanmitra.gov.in', 'KER'),
    ('APMC-MP-01', 'Madhya Pradesh State APMC Yard', 'Bhopal', 'Madhya Pradesh', 'Bhopal, Madhya Pradesh, India', 23.2599, 77.4126, 'mp.apmc@kisanmitra.gov.in', 'MP'),
    ('APMC-MAH-01', 'Maharashtra State APMC Yard', 'Mumbai', 'Maharashtra', 'Mumbai, Maharashtra, India', 19.0760, 72.8777, 'mah.apmc@kisanmitra.gov.in', 'MAH'),
    ('APMC-MAN-01', 'Manipur State APMC Yard', 'Imphal', 'Manipur', 'Imphal, Manipur, India', 24.8170, 93.9368, 'man.apmc@kisanmitra.gov.in', 'MAN'),
    ('APMC-MEG-01', 'Meghalaya State APMC Yard', 'Shillong', 'Meghalaya', 'Shillong, Meghalaya, India', 25.5788, 91.8933, 'meg.apmc@kisanmitra.gov.in', 'MEG'),
    ('APMC-MIZ-01', 'Mizoram State APMC Yard', 'Aizawl', 'Mizoram', 'Aizawl, Mizoram, India', 23.7271, 92.7176, 'miz.apmc@kisanmitra.gov.in', 'MIZ'),
    ('APMC-NAG-01', 'Nagaland State APMC Yard', 'Kohima', 'Nagaland', 'Kohima, Nagaland, India', 25.6751, 94.1086, 'nag.apmc@kisanmitra.gov.in', 'NAG'),
    ('APMC-ODI-01', 'Odisha State APMC Yard', 'Bhubaneswar', 'Odisha', 'Bhubaneswar, Odisha, India', 20.2961, 85.8245, 'odi.apmc@kisanmitra.gov.in', 'ODI'),
    ('APMC-PUN-02', 'Punjab State APMC Yard', 'Chandigarh', 'Punjab', 'Chandigarh, Punjab, India', 30.7333, 76.7794, 'pun.apmc@kisanmitra.gov.in', 'PUN'),
    ('APMC-RAJ-01', 'Rajasthan State APMC Yard', 'Jaipur', 'Rajasthan', 'Jaipur, Rajasthan, India', 26.9124, 75.7873, 'raj.apmc@kisanmitra.gov.in', 'RAJ'),
    ('APMC-SIK-01', 'Sikkim State APMC Yard', 'Gangtok', 'Sikkim', 'Gangtok, Sikkim, India', 27.3314, 88.6138, 'sik.apmc@kisanmitra.gov.in', 'SIK'),
    ('APMC-TN-01', 'Tamil Nadu State APMC Yard', 'Chennai', 'Tamil Nadu', 'Chennai, Tamil Nadu, India', 13.0827, 80.2707, 'tn.apmc@kisanmitra.gov.in', 'TN'),
    ('APMC-TEL-01', 'Telangana State APMC Yard', 'Hyderabad', 'Telangana', 'Hyderabad, Telangana, India', 17.3850, 78.4867, 'tel.apmc@kisanmitra.gov.in', 'TEL'),
    ('APMC-TRI-01', 'Tripura State APMC Yard', 'Agartala', 'Tripura', 'Agartala, Tripura, India', 23.8315, 91.2868, 'tri.apmc@kisanmitra.gov.in', 'TRI'),
    ('APMC-UP-01', 'Uttar Pradesh State APMC Yard', 'Lucknow', 'Uttar Pradesh', 'Lucknow, Uttar Pradesh, India', 26.8467, 80.9462, 'up.apmc@kisanmitra.gov.in', 'UP'),
    ('APMC-UK-01', 'Uttarakhand State APMC Yard', 'Dehradun', 'Uttarakhand', 'Dehradun, Uttarakhand, India', 30.3165, 78.0322, 'uk.apmc@kisanmitra.gov.in', 'UK'),
    ('APMC-WB-01', 'West Bengal State APMC Yard', 'Kolkata', 'West Bengal', 'Kolkata, West Bengal, India', 22.5726, 88.3639, 'wb.apmc@kisanmitra.gov.in', 'WB'),
    ('APMC-ANP-01', 'Andaman and Nicobar Islands APMC Yard', 'Port Blair', 'Andaman and Nicobar Islands', 'Port Blair, Andaman and Nicobar Islands, India', 11.6234, 92.7265, 'anp.apmc@kisanmitra.gov.in', 'ANP'),
    ('APMC-CHD-01', 'Chandigarh APMC Yard', 'Chandigarh', 'Chandigarh', 'Chandigarh, India', 30.7333, 76.7794, 'chd.apmc@kisanmitra.gov.in', 'CHD'),
    ('APMC-DNH-01', 'Dadra and Nagar Haveli and Daman and Diu APMC Yard', 'Daman', 'Dadra and Nagar Haveli and Daman and Diu', 'Daman, India', 20.3974, 72.8328, 'dnh.apmc@kisanmitra.gov.in', 'DNH'),
    ('APMC-DLH-01', 'Delhi APMC Yard', 'New Delhi', 'Delhi', 'New Delhi, Delhi, India', 28.6139, 77.2090, 'dlh.apmc@kisanmitra.gov.in', 'DLH'),
    ('APMC-JK-01', 'Jammu and Kashmir APMC Yard', 'Srinagar', 'Jammu and Kashmir', 'Srinagar, Jammu and Kashmir, India', 34.0837, 74.7973, 'jk.apmc@kisanmitra.gov.in', 'JK'),
    ('APMC-LAD-01', 'Ladakh APMC Yard', 'Leh', 'Ladakh', 'Leh, Ladakh, India', 34.1526, 77.5770, 'lad.apmc@kisanmitra.gov.in', 'LAD'),
    ('APMC-LAK-01', 'Lakshadweep APMC Yard', 'Kavaratti', 'Lakshadweep', 'Kavaratti, Lakshadweep, India', 10.5667, 72.6420, 'lak.apmc@kisanmitra.gov.in', 'LAK'),
    ('APMC-PUD-01', 'Puducherry APMC Yard', 'Puducherry', 'Puducherry', 'Puducherry, India', 11.9416, 79.8083, 'pud.apmc@kisanmitra.gov.in', 'PUD')
)
INSERT INTO mandis (
  name, code, district, state, address, latitude, longitude, contact_email,
  contact_person, slot_capacity, opening_time, closing_time, is_active, is_verified
)
SELECT
  name, code, district, state, address, latitude, longitude, email,
  'State Register Office', 5, '06:00', '18:00', true, true
FROM state_mandis
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  district = EXCLUDED.district,
  state = EXCLUDED.state,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  contact_email = EXCLUDED.contact_email,
  is_active = true,
  is_verified = true;

-- Create or update the shared-password Supabase Auth identity for each register email.
DO $$
DECLARE
  shared_hash text := '$2b$12$umjOnQ/SUCSCDFeZGgbkhu1Wr5i2AdTuzGcWmRmZkvcyMPEh4ui0i';
  mandi_record record;
BEGIN
  FOR mandi_record IN
    SELECT contact_email
    FROM mandis
    WHERE code LIKE 'APMC-%'
      AND contact_email IS NOT NULL
  LOOP
    UPDATE auth.users
    SET encrypted_password = shared_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE lower(email) = lower(mandi_record.contact_email);

    IF NOT FOUND THEN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, is_sso_user
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        lower(mandi_record.contact_email),
        shared_hash,
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now(),
        false
      );
    END IF;

    INSERT INTO auth.identities (
      user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    )
    SELECT
      u.id,
      jsonb_build_object('sub', u.id::text, 'email', lower(u.email)),
      'email',
      u.id::text,
      now(),
      now(),
      now()
    FROM auth.users u
    WHERE lower(u.email) = lower(mandi_record.contact_email)
    ON CONFLICT (provider, provider_id) DO UPDATE SET
      identity_data = EXCLUDED.identity_data,
      updated_at = now();
  END LOOP;
END;
$$;

-- Link every email-authenticated user to its matching mandi.
INSERT INTO mandi_staff (user_id, mandi_id, role)
SELECT u.id, m.id, 'operator'
FROM mandis m
JOIN auth.users u ON lower(u.email) = lower(m.contact_email)
WHERE m.code LIKE 'APMC-%'
ON CONFLICT (user_id, mandi_id) DO UPDATE SET role = EXCLUDED.role;
