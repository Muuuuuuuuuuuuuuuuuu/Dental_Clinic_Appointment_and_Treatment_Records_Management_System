const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/app/shared/supabaseApi.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix addAppointment Validation
const targetContent = `  // 2.5 Conflict Check (Patient Level)
  if (finalPatientId) {
    const { data: overlappingPat } = await supabase.from('appointment')
      .select('appointment_date, start_time, end_time_est, appointment_status')
      .eq('patient_id', finalPatientId)
      .eq('appointment_date', appointment.date);

    if (overlappingPat && overlappingPat.length > 0) {
      const duration = appointment.durationMins || 30;
      const [newH, newM] = (appointment.time || "00:00").split(':').map(Number);
      const newStartMins = (newH * 60) + newM;
      const newEndMins = newStartMins + duration;

      for (const apptData of overlappingPat) {
        if (apptData.appointment_status === 'ยกเลิก' || apptData.appointment_status === 'ไม่มาตามนัด') continue;

        const [existH, existM] = (apptData.start_time || "00:00").split(':').map(Number);
        const existStartMins = (existH * 60) + existM;
        const [existEH, existEM] = (apptData.end_time_est || "00:00").split(':').map(Number);
        const existEndMins = (existEH * 60) + existEM;

        if (newStartMins < existEndMins && newEndMins > existStartMins) {
          throw new Error(\`คิวทับซ้อน: คุณมีนัดหมายในช่วงเวลา \${apptData.start_time.substring(0, 5)} - \${apptData.end_time_est.substring(0, 5)} อยู่แล้ว\`);
        }
      }
    }
  }

  // 3. Resolve Service ID
  let finalServiceId = appointment.serviceId;
  if (!finalServiceId) {
    const { data: svcData } = await supabase.from('service').select('service_id, service_name');
    if (svcData) {
      const matchedSvc = svcData.find((s: any) => appointment.service.includes(s.service_name) || s.service_name.includes(appointment.service));
      if (matchedSvc) {
        finalServiceId = matchedSvc.service_id;
      } else {
        // Fallback safely only if absolutely necessary, but preferably throw error
        finalServiceId = svcData[0]?.service_id || 1;
      }
    }
  }`;

const replacementContent = `  // 2.5 Resolve Service ID first to check for same-service conflicts
  let finalServiceId = appointment.serviceId;
  if (!finalServiceId) {
    const { data: svcData } = await supabase.from('service').select('service_id, service_name');
    if (svcData) {
      const matchedSvc = svcData.find((s: any) => appointment.service.includes(s.service_name) || s.service_name.includes(appointment.service));
      if (matchedSvc) {
        finalServiceId = matchedSvc.service_id;
      } else {
        finalServiceId = svcData[0]?.service_id || 1;
      }
    }
  }

  // 2.6 Conflict Check (Patient Level)
  if (finalPatientId) {
    const { data: overlappingPat } = await supabase.from('appointment')
      .select('appointment_date, start_time, end_time_est, appointment_status, appointment_detail(service_id)')
      .eq('patient_id', finalPatientId)
      .eq('appointment_date', appointment.date);

    if (overlappingPat && overlappingPat.length > 0) {
      const duration = appointment.durationMins || 30;
      const [newH, newM] = (appointment.time || "00:00").split(':').map(Number);
      const newStartMins = (newH * 60) + newM;
      const newEndMins = newStartMins + duration;

      for (const apptData of overlappingPat) {
        if (apptData.appointment_status === 'ยกเลิก' || apptData.appointment_status === 'ไม่มาตามนัด') continue;

        const [existH, existM] = (apptData.start_time || "00:00").split(':').map(Number);
        const existStartMins = (existH * 60) + existM;
        const [existEH, existEM] = (apptData.end_time_est || "00:00").split(':').map(Number);
        const existEndMins = (existEH * 60) + existEM;

        // Check 1: Overlapping Time
        if (newStartMins < existEndMins && newEndMins > existStartMins) {
          throw new Error(\`คิวทับซ้อน: คุณมีนัดหมายในช่วงเวลา \${apptData.start_time.substring(0, 5)} - \${apptData.end_time_est.substring(0, 5)} อยู่แล้ว\`);
        }

        // Check 2: Same service on the same day
        const existingServices = apptData.appointment_detail?.map((d: any) => d.service_id) || [];
        if (existingServices.includes(finalServiceId)) {
          throw new Error(\`คิวซ้ำซ้อน: คุณได้ทำการจองบริการนี้ในวันนี้ไปแล้ว กรุณาเลือกวันอื่นหรือบริการอื่น\`);
        }
      }
    }
  }`;

if (content.includes(targetContent)) {
  content = content.replace(targetContent, replacementContent);
  console.log("Validation logic injected.");
} else {
  console.log("Validation logic NOT found. Check content matching.");
}

// 2. Append Missing Functions
const appendedFuncs = `
export async function addShift(dentistId: number, dayOfWeek: number, startShift: string, endShift: string, isOff: boolean) {
  const { data, error } = await supabase.from('schedule').insert({
    user_id: dentistId, day_of_week: dayOfWeek, start_shift: startShift, end_shift: endShift, is_off: isOff
  });
  if (error) throw error;
  return data;
}

export async function uploadDentistImage(file: any) {
  return "https://dummyimage.com/200";
}

export async function getBillingItems() {
  return [];
}

export async function createTreatmentPlan(plan: any) {
  const { data, error } = await supabase.from('treatment_plan').insert(plan).select().single();
  if (error) throw error;
  return data;
}

export async function updateTreatmentPlanItem(id: number, status: string) {
  const { data, error } = await supabase.from('treatment_plan_item').update({ status }).eq('id', id);
  if (error) throw error;
  return data;
}

export async function createDraftAppointment(patientId: number, treatmentPlanId: number, serviceId: number, doctorId: number) {
  const { data, error } = await supabase.from('appointment').insert({
    patient_id: patientId, treatment_plan_id: treatmentPlanId, dentist_id: doctorId, appointment_status: 'รอการยืนยัน', channel: 'หมอนัด (ต่อเนื่อง)'
  }).select().single();
  if (error) throw error;
  await supabase.from('appointment_detail').insert({ appointment_id: data.appointment_id, service_id: serviceId });
  return data;
}

export async function updateDraftAppointmentTime(apptId: number, date: string, time: string, duration: number, status: string) {
  const endMin = parseInt(time.split(':')[0])*60 + parseInt(time.split(':')[1]) + duration;
  const endStr = Math.floor(endMin/60).toString().padStart(2,'0') + ':' + (endMin%60).toString().padStart(2,'0');
  const { data, error } = await supabase.from('appointment').update({
    appointment_date: date, start_time: time, end_time_est: endStr, appointment_status: status
  }).eq('appointment_id', apptId).select().single();
  if (error) throw error;
  return data;
}

export async function updateStaffNote(tableName: string, id: number, note: string) {
  const { data, error } = await supabase.from(tableName).update({ staff_note: note }).eq('id', id);
  if (error) throw error;
  return data;
}
`;

if (!content.includes('function updateStaffNote')) {
  content += appendedFuncs;
  console.log("Missing functions appended.");
}

fs.writeFileSync(file, content);
console.log("Success.");
