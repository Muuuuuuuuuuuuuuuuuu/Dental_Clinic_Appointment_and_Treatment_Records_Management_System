-- =====================================================================================
-- ชุดข้อมูล Mock Data สำหรับจำลองสถานการณ์ 5 แบบที่คุณต้องการ
-- นำโค้ดนี้ไปรันใน Supabase > SQL Editor ได้เลยครับ
-- (หมายเหตุ: ใช้ patient_id = 1 และ 2 ซึ่งมีอยู่แล้วในไฟล์ mock เดิมของคุณ)
-- =====================================================================================

-- 1. การจองนัดจากคนไข้ (จองปกติ สำเร็จและรอเข้ารับการรักษา)
-- สมมติ: คนไข้ id = 1 นัดคิวมาทางออนไลน์ สถานะเป็น "ยืนยันการจอง"
INSERT INTO appointment (patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) 
VALUES (1, '2026-08-01', '10:00:00', '10:30:00', 'ยืนยันการจอง', 'ออนไลน์');
-- นัดหมายนี้ทำอะไร? (ใส่รายละเอียดการนัด: service_id = 1 คือ ตรวจฟันและขูดหินปูน)
INSERT INTO appointment_detail (appointment_id, service_id) 
VALUES ((SELECT MAX(appointment_id) FROM appointment), 1);


-- 2. การขอลาหยุดของบุคลากร (เช่น หมอขอลาพักร้อน)
-- สมมติ: ทพญ. อรนุช (user_id = 11111111-1111-1111-1111-111111111111) ขอลาพักร้อน
INSERT INTO leave_record (user_id, leave_date, leave_period, leave_type, is_approved, reason)
VALUES ('11111111-1111-1111-1111-111111111111', '2026-08-15', 'เต็มวัน', 'ลาพักร้อน', true, 'พาครอบครัวไปพักผ่อนต่างจังหวัด');


-- 3. การทำโปรโมชั่น (เพิ่มลงในตาราง promotions)
INSERT INTO promotions (title, original_price, sale_price, valid_until, tag) 
VALUES 
('โปรโมชั่นต้อนรับวันแม่: จัดฟันใส แถมฟอกสีฟันฟรี', 150000.00, 119000.00, '2026-08-31', 'Hot Deal!'),
('ส่วนลดนักศึกษา: อุดฟันลด 20%', 800.00, 640.00, '2026-12-31', 'สำหรับนักศึกษา');


-- 4. การจองเลื่อน (ยกเลิกคิวเดิม แล้วจองคิวใหม่)
-- 4.1 คิวเดิมที่ถูกเลื่อน (สถานะเปลี่ยนเป็น "ยกเลิก")
INSERT INTO appointment (patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) 
VALUES (2, '2026-08-05', '13:00:00', '14:00:00', 'ยกเลิก', 'Walk-in');
-- 4.2 คิวใหม่ที่ตกลงเลื่อนมาเป็นวันนี้แทน (สถานะเป็น "ยืนยันการจอง")
INSERT INTO appointment (patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) 
VALUES (2, '2026-08-10', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'Walk-in');
-- นัดใบนี้มาทำอะไร? (service_id = 4 คือ รากฟันเทียม)
INSERT INTO appointment_detail (appointment_id, service_id) 
VALUES ((SELECT MAX(appointment_id) FROM appointment), 4);


-- 5. การจองนัดเคสพิเศษ (รอพนักงานอนุมัติ)
-- เคสที่ต้องการการคอนเฟิร์มจากพนักงานก่อนถึงจะได้คิว เช่น เคสผ่าตัดใหญ่ หรือคนไข้รีเควสต์หมอเฉพาะทาง
-- สถานะจึงเป็น "รอการยืนยัน"
INSERT INTO appointment (patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) 
VALUES (1, '2026-08-20', '15:00:00', '17:00:00', 'รอการยืนยัน', 'ออนไลน์');
-- นัดเคสพิเศษ (service_id = 3 คือ จัดฟัน)
INSERT INTO appointment_detail (appointment_id, service_id) 
VALUES ((SELECT MAX(appointment_id) FROM appointment), 3);
