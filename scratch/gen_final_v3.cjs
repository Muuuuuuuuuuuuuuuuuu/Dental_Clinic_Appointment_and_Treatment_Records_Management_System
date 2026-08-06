const fs = require('fs');
const crypto = require('crypto');

let sql = 'BEGIN;\n\n';

sql += '-- 1. ลบข้อมูลเก่าที่อาจซ้ำซ้อน\n';
sql += `DELETE FROM treatment_detail WHERE treatment_id IN (SELECT treatment_id FROM treatment_record WHERE appointment_id >= 2000 AND appointment_id <= 2100);\n`;
sql += `DELETE FROM treatment_record WHERE appointment_id >= 2000 AND appointment_id <= 2100;\n`;
sql += `DELETE FROM appointment_detail WHERE appointment_id >= 2000 AND appointment_id <= 2100;\n`;
sql += `DELETE FROM queue WHERE appointment_id >= 2000 AND appointment_id <= 2100;\n`;
sql += `DELETE FROM appointment WHERE appointment_id >= 2000 AND appointment_id <= 2100;\n\n`;

sql += '-- ลบข้อมูลคนไข้จำลองเก่า\n';
sql += `DELETE FROM public.patient WHERE user_id IN (SELECT user_id FROM public.users WHERE email LIKE 'patient_mock_%');\n`;
sql += `DELETE FROM public.profile WHERE citizen_id IN (SELECT citizen_id FROM public.users WHERE email LIKE 'patient_mock_%');\n`;
sql += `DELETE FROM public.users WHERE email LIKE 'patient_mock_%';\n`;
sql += `DELETE FROM auth.identities WHERE identity_data->>'email' LIKE 'patient_mock_%';\n`;
sql += `DELETE FROM auth.users WHERE email LIKE 'patient_mock_%';\n\n`;

const firstNames = ['สมชาย', 'สมหญิง', 'ใจดี', 'มีสุข', 'มานะ', 'ปิติ', 'ชูใจ', 'วีระ', 'สมบูรณ์', 'วันชัย', 
                    'สุชาติ', 'นารี', 'รัตนา', 'กัลยา', 'วิชัย', 'ประเสริฐ', 'ปราณี', 'สุรศักดิ์', 'พรชัย', 'กิตติ'];
const lastNames = ['รักดี', 'ใจงาม', 'มีบุญ', 'พานิช', 'มั่นคง', 'เจริญ', 'สุวรรณ', 'ทองดี', 'ศิริ', 'นุกูล'];

let patients = [];
sql += '-- 2. สร้างข้อมูลคนไข้ 20 คน\n';

for(let i=0; i<20; i++) {
    const uid = crypto.randomUUID();
    const citizenId = '9990000000' + (i < 10 ? '0'+i : i) + '0';
    const email = `patient_mock_${i+1}@test.com`;
    const fname = firstNames[i];
    const lname = lastNames[i % 10];
    const phone = '089' + String(1000000 + i);
    const gender = i % 2 === 0 ? 'ชาย' : 'หญิง';
    const patId = 2001 + i;
    
    // สำคัญ: ต้องใช้ cost 10 สำหรับ bcrypt (bf, 10) เพื่อไม่ให้ Supabase GoTrue Error 500
    sql += `INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('${uid}'::uuid, 'authenticated', 'authenticated', '${email}', extensions.crypt('12345678', extensions.gen_salt('bf', 10)), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());\n`;
    
    sql += `INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
VALUES (gen_random_uuid(), '${uid}'::uuid, '${uid}', format('{"sub":"%s","email":"%s","email_verified":false,"phone_verified":false}', '${uid}', '${email}')::jsonb, 'email', NOW(), NOW());\n`;

    sql += `INSERT INTO public.profile (citizen_id, first_name, last_name, gender, birth_date, phone_number, current_address) 
VALUES ('${citizenId}', '${fname}', '${lname}', '${gender}', '1990-01-01', '${phone}', '123 กทม.');\n`;
    
    sql += `INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('${uid}'::uuid, '${citizenId}', '${email}', 'คนไข้', 'active');\n`;

    sql += `INSERT INTO public.patient (patient_id, user_id, allergy_history, underlying_disease, emergency_contact_name, emergency_contact_phone) 
VALUES (${patId}, '${uid}'::uuid, 'ไม่มี', 'ไม่มี', 'ญาติ', '0800000000');\n\n`;
    
    patients.push(patId);
}

sql += '-- 3. สร้างข้อมูลการจองคิว 30 คิว สำหรับคนไข้ 20 คนนี้\n';
let apptId = 2000;
const services = [1,2,3,4,5,6,7,8,9,10,11,12,13];

function addAppt(date, timeStart, timeEnd, dentist, service, patId) {
    const status = [8, 9, 10, 11, 12, 13].includes(service) ? 'รอการยืนยัน' : 'ยืนยันการจอง';
    sql += `INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (${apptId}, ${patId}, '${date}', '${timeStart}', '${timeEnd}', '${status}', 'ออนไลน์');\n`;
    sql += `INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (${apptId}, ${apptId}, ${service});\n`;
    sql += `INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (${apptId}, ${apptId}, ${dentist}, ${patId}, '${date}');\n\n`;
    apptId++;
}

for(let i=0; i<10; i++) {
    const pId = patients[i];
    const dentist = (i % 5) + 1;
    const s = services[i % services.length];
    const startH = 9 + Math.floor(i/2);
    const start = (startH < 10 ? '0'+startH : startH) + (i%2===0 ? ':00:00' : ':30:00');
    const endH = startH + (i%2===0 ? 0 : 1);
    const endM = i%2===0 ? ':30:00' : ':00:00';
    const end = (endH < 10 ? '0'+endH : endH) + endM;
    addAppt('2026-08-05', start, end, dentist, s, pId);
}

let day = 6;
for(let i=0; i<20; i++) {
    const d = day < 10 ? '0'+day : ''+day;
    const date = `2026-08-${d}`;
    const dentist = (i % 5) + 1;
    const s = services[(i+10) % services.length];
    const pId = patients[(i+10) % 20];
    
    let start, end;
    if (i % 2 === 0) {
       start = '09:00:00';
       end = '10:00:00';
    } else {
       start = '14:00:00';
       end = '15:00:00';
    }
    
    addAppt(date, start, end, dentist, s, pId);
    
    if (i % 2 !== 0) day++;
}

sql += `SELECT setval('patient_patient_id_seq', (SELECT MAX(patient_id) FROM patient));\n`;
sql += `SELECT setval('appointment_appointment_id_seq', (SELECT MAX(appointment_id) FROM appointment));\n`;
sql += `SELECT setval('appointment_detail_app_detail_id_seq', (SELECT MAX(app_detail_id) FROM appointment_detail));\n`;
sql += `SELECT setval('treatment_record_treatment_id_seq', (SELECT MAX(treatment_id) FROM treatment_record));\n`;

sql += 'COMMIT;\n';
fs.writeFileSync('C:/Users/Lenovo/.gemini/antigravity-ide/brain/fc41ac72-7780-4442-9546-cce7f16fbe22/seed_final_v3.sql', sql);
