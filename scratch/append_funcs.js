const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/app/shared/supabaseApi.ts');
let content = fs.readFileSync(file, 'utf8');

content += `
export async function addShift(dentistId: number, dayOfWeek: number, startShift: string, endShift: string, isOff: boolean) {
  const { data, error } = await supabase.from('schedule').insert({
    user_id: dentistId, day_of_week: dayOfWeek, start_shift: startShift, end_shift: endShift, is_off: isOff
  });
  if (error) throw error;
  return data;
}

export async function uploadDentistImage(file: any) {
  // dummy for now
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

export async function updateStaffNote(userId: string, note: string) {
  const { data, error } = await supabase.from('profile').update({ emergency_name: note }).eq('user_id', userId);
  if (error) throw error;
  return data;
}
`;

fs.writeFileSync(file, content);
console.log('Appended missing functions');
