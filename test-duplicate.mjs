import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const targetPatientId = 1; // Assuming demo user
  const { data, error } = await supabase.from('appointment').select('appointment_id, appointment_date, start_time, appointment_status').eq('patient_id', targetPatientId);

  console.log("Error:", error);
  console.log("Data length:", data?.length);
  console.log("All Appointments for Patient 1:");
  console.log(JSON.stringify(data, null, 2));
}

test();
