-- 1. อัพเดต instance_id ให้กับ users ที่เราสร้างขึ้นเอง (Supabase บางเวอร์ชั่นต้องการค่านี้)
UPDATE auth.users 
SET instance_id = '00000000-0000-0000-0000-000000000000' 
WHERE email LIKE 'patient_mock_%' AND instance_id IS NULL;

-- 2. สร้าง Identity ให้กับผู้ใช้ (Supabase ยุคใหม่ต้องมี Identity ไม่งั้นจะล็อกอินไม่ผ่าน)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    id,
    id::text,
    format('{"sub":"%s","email":"%s"}', id, email)::jsonb,
    'email',
    NOW(),
    NOW()
FROM auth.users
WHERE email LIKE 'patient_mock_%'
ON CONFLICT DO NOTHING;
