import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const targetPatientId = 1; // Testing with patient_id 1
  const { data, error } = await supabase.from('appointment').select(`
    *,
    patient (
      *,
      users ( profile (first_name, last_name, phone_number) )
    ),
    appointment_detail ( service (service_name) ),
    treatment_record ( dentist_id, doctor_note, payment (total_amount, payment_status), dentist ( users ( profile (first_name, last_name) ) ) )
  `).eq('patient_id', targetPatientId);

  console.log("Error:", error);
  console.log("Data length:", data?.length);
  if (data && data.length > 0) {
    console.log("Sample Data:", JSON.stringify(data[0], null, 2));
  } else {
    console.log("No data returned");
  }
}

test();
