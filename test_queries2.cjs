const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw');

async function test() {
  const { error: err3 } = await supabase.from('appointment').select(`
    *,
    patient (
      *,
      users ( profile (first_name, last_name, phone_number) ),
      patient_allergy (allergy_name),
      patient_disease (disease_name)
    ),
    dentist ( users ( profile (first_name, last_name) ) ),
    appointment_detail ( service (service_name) ),
    treatment_record ( attending_dentist_id, doctor_note, odontogram_data, payment (total_amount, payment_status), attending_dentist:dentist ( users ( profile (first_name, last_name) ) ) )
  `).limit(1);
  console.log('getAppointments error:', err3);
}
test();
