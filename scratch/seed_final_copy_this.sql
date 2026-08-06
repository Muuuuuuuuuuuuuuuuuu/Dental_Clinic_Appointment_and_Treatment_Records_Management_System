BEGIN;

-- ลบข้อมูลเก่าที่อาจซ้ำซ้อน
DELETE FROM treatment_detail WHERE treatment_id IN (SELECT treatment_id FROM treatment_record WHERE appointment_id >= 2000 AND appointment_id <= 2100);
DELETE FROM treatment_record WHERE appointment_id >= 2000 AND appointment_id <= 2100;
DELETE FROM appointment_detail WHERE appointment_id >= 2000 AND appointment_id <= 2100;
DELETE FROM queue WHERE appointment_id >= 2000 AND appointment_id <= 2100;
DELETE FROM appointment WHERE appointment_id >= 2000 AND appointment_id <= 2100;

-- ลบข้อมูลคนไข้จำลองเก่า
DELETE FROM public.patient WHERE user_id IN (SELECT user_id FROM public.users WHERE email LIKE 'patient_mock_%');
DELETE FROM public.profile WHERE citizen_id IN (SELECT citizen_id FROM public.users WHERE email LIKE 'patient_mock_%');
DELETE FROM public.users WHERE email LIKE 'patient_mock_%';
DELETE FROM auth.users WHERE email LIKE 'patient_mock_%';

-- สร้างข้อมูลคนไข้ 20 คน
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('f557098a-3a91-4914-8461-c0b78b2c3fe8'::uuid, 'authenticated', 'authenticated', 'patient_mock_1@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000000', 'สมชาย', 'รักดี', 'ชาย', '1990-01-01', '0891000000', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('f557098a-3a91-4914-8461-c0b78b2c3fe8'::uuid, '9990000000000', 'patient_mock_1@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2001, 'f557098a-3a91-4914-8461-c0b78b2c3fe8'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('eabf30bd-15a8-42d4-8bd3-2f7f69864119'::uuid, 'authenticated', 'authenticated', 'patient_mock_2@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000010', 'สมหญิง', 'ใจงาม', 'หญิง', '1990-01-01', '0891000001', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('eabf30bd-15a8-42d4-8bd3-2f7f69864119'::uuid, '9990000000010', 'patient_mock_2@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2002, 'eabf30bd-15a8-42d4-8bd3-2f7f69864119'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('d9d0aef2-6399-49ae-afe7-1556e7c06bb5'::uuid, 'authenticated', 'authenticated', 'patient_mock_3@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000020', 'ใจดี', 'มีบุญ', 'ชาย', '1990-01-01', '0891000002', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('d9d0aef2-6399-49ae-afe7-1556e7c06bb5'::uuid, '9990000000020', 'patient_mock_3@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2003, 'd9d0aef2-6399-49ae-afe7-1556e7c06bb5'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('afe4823e-4c72-4937-a162-fe6c8278f5b9'::uuid, 'authenticated', 'authenticated', 'patient_mock_4@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000030', 'มีสุข', 'พานิช', 'หญิง', '1990-01-01', '0891000003', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('afe4823e-4c72-4937-a162-fe6c8278f5b9'::uuid, '9990000000030', 'patient_mock_4@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2004, 'afe4823e-4c72-4937-a162-fe6c8278f5b9'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('fd416336-c0b0-4c10-967e-d219e834a057'::uuid, 'authenticated', 'authenticated', 'patient_mock_5@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000040', 'มานะ', 'มั่นคง', 'ชาย', '1990-01-01', '0891000004', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('fd416336-c0b0-4c10-967e-d219e834a057'::uuid, '9990000000040', 'patient_mock_5@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2005, 'fd416336-c0b0-4c10-967e-d219e834a057'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('8cd7b6ee-c2d4-4bd2-97ed-f31745cf8a2c'::uuid, 'authenticated', 'authenticated', 'patient_mock_6@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000050', 'ปิติ', 'เจริญ', 'หญิง', '1990-01-01', '0891000005', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('8cd7b6ee-c2d4-4bd2-97ed-f31745cf8a2c'::uuid, '9990000000050', 'patient_mock_6@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2006, '8cd7b6ee-c2d4-4bd2-97ed-f31745cf8a2c'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('83790a31-6858-47f8-b743-e8dd95da6df5'::uuid, 'authenticated', 'authenticated', 'patient_mock_7@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000060', 'ชูใจ', 'สุวรรณ', 'ชาย', '1990-01-01', '0891000006', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('83790a31-6858-47f8-b743-e8dd95da6df5'::uuid, '9990000000060', 'patient_mock_7@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2007, '83790a31-6858-47f8-b743-e8dd95da6df5'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('27e5a1b8-c9c9-4ff4-a588-13cfc76d09f7'::uuid, 'authenticated', 'authenticated', 'patient_mock_8@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000070', 'วีระ', 'ทองดี', 'หญิง', '1990-01-01', '0891000007', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('27e5a1b8-c9c9-4ff4-a588-13cfc76d09f7'::uuid, '9990000000070', 'patient_mock_8@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2008, '27e5a1b8-c9c9-4ff4-a588-13cfc76d09f7'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('78e6bdf4-3b3a-49bb-889e-2e54e3ccb895'::uuid, 'authenticated', 'authenticated', 'patient_mock_9@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000080', 'สมบูรณ์', 'ศิริ', 'ชาย', '1990-01-01', '0891000008', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('78e6bdf4-3b3a-49bb-889e-2e54e3ccb895'::uuid, '9990000000080', 'patient_mock_9@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2009, '78e6bdf4-3b3a-49bb-889e-2e54e3ccb895'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('eaba1509-a344-4e89-af5b-5fbfc13ba9b6'::uuid, 'authenticated', 'authenticated', 'patient_mock_10@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000090', 'วันชัย', 'นุกูล', 'หญิง', '1990-01-01', '0891000009', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('eaba1509-a344-4e89-af5b-5fbfc13ba9b6'::uuid, '9990000000090', 'patient_mock_10@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2010, 'eaba1509-a344-4e89-af5b-5fbfc13ba9b6'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('6083891b-d3b2-4065-9977-af2f653bcfb7'::uuid, 'authenticated', 'authenticated', 'patient_mock_11@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000100', 'สุชาติ', 'รักดี', 'ชาย', '1990-01-01', '0891000010', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('6083891b-d3b2-4065-9977-af2f653bcfb7'::uuid, '9990000000100', 'patient_mock_11@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2011, '6083891b-d3b2-4065-9977-af2f653bcfb7'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('737cba94-870b-4026-b0dc-ac017ed415fa'::uuid, 'authenticated', 'authenticated', 'patient_mock_12@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000110', 'นารี', 'ใจงาม', 'หญิง', '1990-01-01', '0891000011', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('737cba94-870b-4026-b0dc-ac017ed415fa'::uuid, '9990000000110', 'patient_mock_12@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2012, '737cba94-870b-4026-b0dc-ac017ed415fa'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('cca6e618-8356-4a75-8769-80e4f968c3cd'::uuid, 'authenticated', 'authenticated', 'patient_mock_13@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000120', 'รัตนา', 'มีบุญ', 'ชาย', '1990-01-01', '0891000012', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('cca6e618-8356-4a75-8769-80e4f968c3cd'::uuid, '9990000000120', 'patient_mock_13@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2013, 'cca6e618-8356-4a75-8769-80e4f968c3cd'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('c62f2774-cb1e-48c6-81ea-3c93c6ec8ea7'::uuid, 'authenticated', 'authenticated', 'patient_mock_14@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000130', 'กัลยา', 'พานิช', 'หญิง', '1990-01-01', '0891000013', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('c62f2774-cb1e-48c6-81ea-3c93c6ec8ea7'::uuid, '9990000000130', 'patient_mock_14@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2014, 'c62f2774-cb1e-48c6-81ea-3c93c6ec8ea7'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('67b2d906-9f3c-4239-814f-8c9f725c320b'::uuid, 'authenticated', 'authenticated', 'patient_mock_15@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000140', 'วิชัย', 'มั่นคง', 'ชาย', '1990-01-01', '0891000014', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('67b2d906-9f3c-4239-814f-8c9f725c320b'::uuid, '9990000000140', 'patient_mock_15@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2015, '67b2d906-9f3c-4239-814f-8c9f725c320b'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('1175a2f5-42f3-4ce3-a40f-8dafef367da2'::uuid, 'authenticated', 'authenticated', 'patient_mock_16@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000150', 'ประเสริฐ', 'เจริญ', 'หญิง', '1990-01-01', '0891000015', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('1175a2f5-42f3-4ce3-a40f-8dafef367da2'::uuid, '9990000000150', 'patient_mock_16@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2016, '1175a2f5-42f3-4ce3-a40f-8dafef367da2'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('55f936b1-7ef6-4425-b106-2169bef00589'::uuid, 'authenticated', 'authenticated', 'patient_mock_17@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000160', 'ปราณี', 'สุวรรณ', 'ชาย', '1990-01-01', '0891000016', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('55f936b1-7ef6-4425-b106-2169bef00589'::uuid, '9990000000160', 'patient_mock_17@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2017, '55f936b1-7ef6-4425-b106-2169bef00589'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('6cdefe23-799a-4d13-bdba-cc695eae79a7'::uuid, 'authenticated', 'authenticated', 'patient_mock_18@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000170', 'สุรศักดิ์', 'ทองดี', 'หญิง', '1990-01-01', '0891000017', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('6cdefe23-799a-4d13-bdba-cc695eae79a7'::uuid, '9990000000170', 'patient_mock_18@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2018, '6cdefe23-799a-4d13-bdba-cc695eae79a7'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('1ddd4372-12a5-435a-bfbf-220ee535b02c'::uuid, 'authenticated', 'authenticated', 'patient_mock_19@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000180', 'พรชัย', 'ศิริ', 'ชาย', '1990-01-01', '0891000018', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('1ddd4372-12a5-435a-bfbf-220ee535b02c'::uuid, '9990000000180', 'patient_mock_19@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2019, '1ddd4372-12a5-435a-bfbf-220ee535b02c'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('88b7e80e-68ff-4f47-9947-d974f7b10c26'::uuid, 'authenticated', 'authenticated', 'patient_mock_20@test.com', extensions.crypt('12345678', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());
INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('9990000000190', 'กิตติ', 'นุกูล', 'หญิง', '1990-01-01', '0891000019', '123 กทม.');
INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('88b7e80e-68ff-4f47-9947-d974f7b10c26'::uuid, '9990000000190', 'patient_mock_20@test.com', 'คนไข้', 'active');
INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (2020, '88b7e80e-68ff-4f47-9947-d974f7b10c26'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');

-- สร้างข้อมูลการจองคิว 30 คิว สำหรับคนไข้ 20 คนนี้
INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2000, 2001, '2026-08-05', '09:00:00', '09:30:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2000, 2000, 1);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2000, 2000, 1, 2001, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2001, 2002, '2026-08-05', '09:30:00', '10:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2001, 2001, 2);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2001, 2001, 2, 2002, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2002, 2003, '2026-08-05', '10:00:00', '10:30:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2002, 2002, 3);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2002, 2002, 3, 2003, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2003, 2004, '2026-08-05', '10:30:00', '11:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2003, 2003, 4);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2003, 2003, 4, 2004, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2004, 2005, '2026-08-05', '11:00:00', '11:30:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2004, 2004, 5);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2004, 2004, 5, 2005, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2005, 2006, '2026-08-05', '11:30:00', '12:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2005, 2005, 6);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2005, 2005, 1, 2006, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2006, 2007, '2026-08-05', '12:00:00', '12:30:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2006, 2006, 7);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2006, 2006, 2, 2007, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2007, 2008, '2026-08-05', '12:30:00', '13:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2007, 2007, 8);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2007, 2007, 3, 2008, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2008, 2009, '2026-08-05', '13:00:00', '13:30:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2008, 2008, 9);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2008, 2008, 4, 2009, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2009, 2010, '2026-08-05', '13:30:00', '14:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2009, 2009, 10);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2009, 2009, 5, 2010, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2010, 2011, '2026-08-06', '09:00:00', '10:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2010, 2010, 11);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2010, 2010, 1, 2011, '2026-08-06');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2011, 2012, '2026-08-06', '14:00:00', '15:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2011, 2011, 12);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2011, 2011, 2, 2012, '2026-08-06');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2012, 2013, '2026-08-07', '09:00:00', '10:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2012, 2012, 13);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2012, 2012, 3, 2013, '2026-08-07');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2013, 2014, '2026-08-07', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2013, 2013, 1);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2013, 2013, 4, 2014, '2026-08-07');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2014, 2015, '2026-08-08', '09:00:00', '10:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2014, 2014, 2);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2014, 2014, 5, 2015, '2026-08-08');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2015, 2016, '2026-08-08', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2015, 2015, 3);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2015, 2015, 1, 2016, '2026-08-08');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2016, 2017, '2026-08-09', '09:00:00', '10:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2016, 2016, 4);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2016, 2016, 2, 2017, '2026-08-09');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2017, 2018, '2026-08-09', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2017, 2017, 5);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2017, 2017, 3, 2018, '2026-08-09');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2018, 2019, '2026-08-10', '09:00:00', '10:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2018, 2018, 6);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2018, 2018, 4, 2019, '2026-08-10');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2019, 2020, '2026-08-10', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2019, 2019, 7);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2019, 2019, 5, 2020, '2026-08-10');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2020, 2001, '2026-08-11', '09:00:00', '10:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2020, 2020, 8);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2020, 2020, 1, 2001, '2026-08-11');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2021, 2002, '2026-08-11', '14:00:00', '15:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2021, 2021, 9);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2021, 2021, 2, 2002, '2026-08-11');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2022, 2003, '2026-08-12', '09:00:00', '10:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2022, 2022, 10);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2022, 2022, 3, 2003, '2026-08-12');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2023, 2004, '2026-08-12', '14:00:00', '15:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2023, 2023, 11);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2023, 2023, 4, 2004, '2026-08-12');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2024, 2005, '2026-08-13', '09:00:00', '10:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2024, 2024, 12);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2024, 2024, 5, 2005, '2026-08-13');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2025, 2006, '2026-08-13', '14:00:00', '15:00:00', 'รอการยืนยัน', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2025, 2025, 13);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2025, 2025, 1, 2006, '2026-08-13');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2026, 2007, '2026-08-14', '09:00:00', '10:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2026, 2026, 1);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2026, 2026, 2, 2007, '2026-08-14');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2027, 2008, '2026-08-14', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2027, 2027, 2);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2027, 2027, 3, 2008, '2026-08-14');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2028, 2009, '2026-08-15', '09:00:00', '10:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2028, 2028, 3);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2028, 2028, 4, 2009, '2026-08-15');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (2029, 2010, '2026-08-15', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'ออนไลน์');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (2029, 2029, 4);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (2029, 2029, 5, 2010, '2026-08-15');

SELECT setval('patient_patient_id_seq', (SELECT MAX(patient_id) FROM patient));
SELECT setval('appointment_appointment_id_seq', (SELECT MAX(appointment_id) FROM appointment));
SELECT setval('appointment_detail_app_detail_id_seq', (SELECT MAX(app_detail_id) FROM appointment_detail));
SELECT setval('treatment_record_treatment_id_seq', (SELECT MAX(treatment_id) FROM treatment_record));
COMMIT;
