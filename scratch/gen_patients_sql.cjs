const fs = require('fs');

let sql = 'BEGIN;\n\n';

// 1. Delete previous mock appointments
sql += '-- ลบข้อมูลเก่า (เพื่อไม่ให้ซ้ำซ้อน)\n';
sql += `DELETE FROM treatment_detail WHERE treatment_id IN (SELECT treatment_id FROM treatment_record WHERE appointment_id >= 2000 AND appointment_id <= 2100);\n`;
sql += `DELETE FROM treatment_record WHERE appointment_id >= 2000 AND appointment_id <= 2100;\n`;
sql += `DELETE FROM appointment_detail WHERE appointment_id >= 2000 AND appointment_id <= 2100;\n`;
sql += `DELETE FROM queue WHERE appointment_id >= 2000 AND appointment_id <= 2100;\n`;
sql += `DELETE FROM appointment WHERE appointment_id >= 2000 AND appointment_id <= 2100;\n\n`;

sql += '-- ลบข้อมูลคนไข้จำลองเก่า (อิงจากอีเมล patient_mock_%)\n';
sql += `DELETE FROM public.patient WHERE user_id IN (SELECT user_id FROM public.users WHERE email LIKE 'patient_mock_%');\n`;
sql += `DELETE FROM public.profile WHERE citizen_id IN (SELECT citizen_id FROM public.users WHERE email LIKE 'patient_mock_%');\n`;
sql += `DELETE FROM public.users WHERE email LIKE 'patient_mock_%';\n`;
sql += `DELETE FROM auth.users WHERE email LIKE 'patient_mock_%';\n\n`;

// 2. Generate 20 patients
const firstNames = ['สมชาย', 'สมหญิง', 'ใจดี', 'มีสุข', 'มานะ', 'ปิติ', 'ชูใจ', 'วีระ', 'สมบูรณ์', 'วันชัย', 
                    'สุชาติ', 'นารี', 'รัตนา', 'กัลยา', 'วิชัย', 'ประเสริฐ', 'ปราณี', 'สุรศักดิ์', 'พรชัย', 'กิตติ'];
const lastNames = ['รักดี', 'ใจงาม', 'มีบุญ', 'พานิช', 'มั่นคง', 'เจริญ', 'สุวรรณ', 'ทองดี', 'ศิริ', 'นุกูล'];

let patients = [];
sql += '-- สร้างข้อมูลคนไข้ 20 คน (รหัสผ่าน 12345678)\n';

for(let i=0; i<20; i++) {
    const crypto = require('crypto');
    const uid = crypto.randomUUID();
    const citizenId = '1' + String(100000000000 + i);
    const email = `patient_mock_${i+1}@test.com`;
    const fname = firstNames[i];
    const lname = lastNames[i % 10];
    const phone = '08' + String(10000000 + i);
    
    // Insert into auth.users
    sql += `INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('${uid}', 'authenticated', 'authenticated', '${email}', crypt('12345678', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW());\n`;
    
    // Insert into public.profile
    sql += `INSERT INTO public.profile (citizen_id, first_name, last_name, phone_number, gender, date_of_birth) 
VALUES ('${citizenId}', '${fname}', '${lname}', '${phone}', '${i%2===0?'Male':'Female'}', '1990-01-01');\n`;
    
    // Insert into public.users
    sql += `INSERT INTO public.users (user_id, citizen_id, email, role, account_status) 
VALUES ('${uid}', '${citizenId}', '${email}', 'คนไข้', 'active');\n`;

    const patId = 2001 + i;
    sql += `INSERT INTO public.patient (patient_id, user_id) VALUES (${patId}, '${uid}');\n\n`;
    
    patients.push(patId);
}

// 3. Generate 30 Appointments using these 20 patients
sql += '-- สร้างข้อมูลการจองคิว 30 คิว สำหรับคนไข้ 20 คนนี้\n';
let apptId = 2000;
const services = [1,2,3,4,5,6,7,8,9,10,11,12,13];

function addAppt(date, timeStart, timeEnd, dentist, service, patId) {
    const status = [8, 9, 10, 11, 12, 13].includes(service) ? 'รอการยืนยัน' : 'ยืนยันการจอง';
    sql += `INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (${apptId}, ${patId}, '${date}', '${timeStart}', '${timeEnd}', '${status}', 'ออนไลน์');\n`;
    sql += `INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (${apptId}, ${apptId}, ${service});\n`;
    sql += `INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (${apptId}, ${apptId}, ${dentist}, ${patId}, '${date}');\n\n`;
    apptId++;
}

// First 10 appointments today
for(let i=0; i<10; i++) {
    const pId = patients[i];
    const dentist = (i % 5) + 1;
    const s = services[i % services.length];
    const startH = 9 + Math.floor(i/2); // 9 to 13
    const start = (startH < 10 ? '0'+startH : startH) + (i%2===0 ? ':00:00' : ':30:00');
    const endH = startH + (i%2===0 ? 0 : 1);
    const endM = i%2===0 ? ':30:00' : ':00:00';
    const end = (endH < 10 ? '0'+endH : endH) + endM;
    addAppt('2026-08-05', start, end, dentist, s, pId);
}

// 20 appointments spread across Aug 6 to Aug 31
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
    
    if (i % 2 !== 0) day++; // advance day every 2 appointments
}

// Adjust sequence to avoid conflicts later
sql += `SELECT setval('patient_patient_id_seq', (SELECT MAX(patient_id) FROM patient));\n`;
sql += `SELECT setval('appointment_appointment_id_seq', (SELECT MAX(appointment_id) FROM appointment));\n`;
sql += `SELECT setval('appointment_detail_app_detail_id_seq', (SELECT MAX(app_detail_id) FROM appointment_detail));\n`;
sql += `SELECT setval('treatment_record_treatment_id_seq', (SELECT MAX(treatment_id) FROM treatment_record));\n`;

sql += 'COMMIT;\n';
fs.writeFileSync('C:/Users/Lenovo/.gemini/antigravity-ide/brain/fc41ac72-7780-4442-9546-cce7f16fbe22/seed_patients_appointments.sql', sql);
