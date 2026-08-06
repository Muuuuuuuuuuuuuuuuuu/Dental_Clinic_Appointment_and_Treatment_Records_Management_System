BEGIN;

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1000, 1, '2026-08-05', '09:00:00', '09:30:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1000, 1000, 1);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1000, 1000, 1, 1, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1001, 2, '2026-08-05', '10:00:00', '10:30:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1001, 1001, 2);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1001, 1001, 1, 2, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1002, 1, '2026-08-05', '09:00:00', '09:30:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1002, 1002, 3);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1002, 1002, 2, 1, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1003, 2, '2026-08-05', '11:00:00', '11:30:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1003, 1003, 4);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1003, 1003, 2, 2, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1004, 1, '2026-08-05', '09:00:00', '09:30:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1004, 1004, 5);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1004, 1004, 3, 1, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1005, 2, '2026-08-05', '13:00:00', '13:30:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1005, 1005, 6);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1005, 1005, 3, 2, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1006, 1, '2026-08-05', '10:00:00', '11:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1006, 1006, 7);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1006, 1006, 4, 1, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1007, 2, '2026-08-05', '14:00:00', '15:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1007, 1007, 8);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1007, 1007, 4, 2, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1008, 1, '2026-08-05', '09:30:00', '10:30:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1008, 1008, 9);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1008, 1008, 5, 1, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1009, 2, '2026-08-05', '15:00:00', '16:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1009, 1009, 10);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1009, 1009, 5, 2, '2026-08-05');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1010, 1, '2026-08-06', '09:00:00', '10:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1010, 1010, 11);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1010, 1010, 1, 1, '2026-08-06');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1011, 2, '2026-08-06', '14:00:00', '15:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1011, 1011, 12);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1011, 1011, 2, 2, '2026-08-06');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1012, 1, '2026-08-07', '09:00:00', '10:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1012, 1012, 13);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1012, 1012, 3, 1, '2026-08-07');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1013, 2, '2026-08-07', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1013, 1013, 1);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1013, 1013, 4, 2, '2026-08-07');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1014, 1, '2026-08-08', '09:00:00', '10:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1014, 1014, 2);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1014, 1014, 5, 1, '2026-08-08');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1015, 2, '2026-08-08', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1015, 1015, 3);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1015, 1015, 1, 2, '2026-08-08');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1016, 1, '2026-08-09', '09:00:00', '10:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1016, 1016, 4);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1016, 1016, 2, 1, '2026-08-09');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1017, 2, '2026-08-09', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1017, 1017, 5);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1017, 1017, 3, 2, '2026-08-09');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1018, 1, '2026-08-10', '09:00:00', '10:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1018, 1018, 6);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1018, 1018, 4, 1, '2026-08-10');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1019, 2, '2026-08-10', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1019, 1019, 7);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1019, 1019, 5, 2, '2026-08-10');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1020, 1, '2026-08-11', '09:00:00', '10:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1020, 1020, 8);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1020, 1020, 1, 1, '2026-08-11');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1021, 2, '2026-08-11', '14:00:00', '15:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1021, 1021, 9);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1021, 1021, 2, 2, '2026-08-11');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1022, 1, '2026-08-12', '09:00:00', '10:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1022, 1022, 10);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1022, 1022, 3, 1, '2026-08-12');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1023, 2, '2026-08-12', '14:00:00', '15:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1023, 1023, 11);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1023, 1023, 4, 2, '2026-08-12');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1024, 1, '2026-08-13', '09:00:00', '10:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1024, 1024, 12);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1024, 1024, 5, 1, '2026-08-13');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1025, 2, '2026-08-13', '14:00:00', '15:00:00', 'รอการยืนยัน', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1025, 1025, 13);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1025, 1025, 1, 2, '2026-08-13');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1026, 1, '2026-08-14', '09:00:00', '10:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1026, 1026, 1);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1026, 1026, 2, 1, '2026-08-14');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1027, 2, '2026-08-14', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1027, 1027, 2);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1027, 1027, 3, 2, '2026-08-14');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1028, 1, '2026-08-15', '09:00:00', '10:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1028, 1028, 3);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1028, 1028, 4, 1, '2026-08-15');

INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (1029, 2, '2026-08-15', '14:00:00', '15:00:00', 'ยืนยันการจอง', 'Walk-in');
INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (1029, 1029, 4);
INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (1029, 1029, 5, 2, '2026-08-15');

COMMIT;
