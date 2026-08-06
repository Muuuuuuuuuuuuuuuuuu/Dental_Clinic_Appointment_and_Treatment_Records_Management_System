const fs = require('fs');
let sql = '';
let apptId = 1000;
let trmId = 1000;
let detId = 1000;
const services = [1,2,3,4,5,6,7,8,9,10,11,12,13];

function addAppt(date, timeStart, timeEnd, dentist, service) {
    const pId = (apptId % 2) + 1; // Alternate patients 1 and 2
    const status = [8, 9, 10, 11, 12, 13].includes(service) ? 'รอการยืนยัน' : 'ยืนยันการจอง';
    sql += `INSERT INTO appointment (appointment_id, patient_id, appointment_date, start_time, end_time_est, appointment_status, channel) VALUES (${apptId}, ${pId}, '${date}', '${timeStart}', '${timeEnd}', '${status}', 'Walk-in');\n`;
    sql += `INSERT INTO appointment_detail (app_detail_id, appointment_id, service_id) VALUES (${detId}, ${apptId}, ${service});\n`;
    sql += `INSERT INTO treatment_record (treatment_id, appointment_id, dentist_id, patient_id, treatment_date) VALUES (${trmId}, ${apptId}, ${dentist}, ${pId}, '${date}');\n\n`;
    apptId++;
    detId++;
    trmId++;
}

sql += 'BEGIN;\n\n';

// 10 appointments for today (2026-08-05)
addAppt('2026-08-05', '09:00:00', '09:30:00', 1, 1);
addAppt('2026-08-05', '10:00:00', '10:30:00', 1, 2);
addAppt('2026-08-05', '09:00:00', '09:30:00', 2, 3);
addAppt('2026-08-05', '11:00:00', '11:30:00', 2, 4);
addAppt('2026-08-05', '09:00:00', '09:30:00', 3, 5);
addAppt('2026-08-05', '13:00:00', '13:30:00', 3, 6);
addAppt('2026-08-05', '10:00:00', '11:00:00', 4, 7);
addAppt('2026-08-05', '14:00:00', '15:00:00', 4, 8);
addAppt('2026-08-05', '09:30:00', '10:30:00', 5, 9);
addAppt('2026-08-05', '15:00:00', '16:00:00', 5, 10);

// 20 appointments spread across Aug 6 to Aug 31
let day = 6;
let sIdx = 10;
for(let i=0; i<20; i++) {
    const d = day < 10 ? '0'+day : ''+day;
    const date = `2026-08-${d}`;
    const dentist = (i % 5) + 1;
    const s = services[sIdx % services.length];
    
    let start, end;
    if (i % 2 === 0) {
       start = '09:00:00';
       end = '10:00:00';
    } else {
       start = '14:00:00';
       end = '15:00:00';
    }
    
    addAppt(date, start, end, dentist, s);
    
    sIdx++;
    if (i % 2 !== 0) day++; // advance day every 2 appointments
}

sql += 'COMMIT;\n';
fs.writeFileSync('scratch/seed.sql', sql);
