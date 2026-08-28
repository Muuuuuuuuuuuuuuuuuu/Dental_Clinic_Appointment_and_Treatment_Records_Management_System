const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw');

async function test() {
  const { error: err2 } = await supabase.from('treatment_record').select(`
    *,
    odontogram_data,
    appointment!inner(start_time, appointment_status, dentist ( users ( profile (first_name, last_name) ) ), appointment_detail ( service (service_name) )),
    dentist ( users ( profile (first_name, last_name) ) ),
    payment (total_amount)
  `).eq('appointment.appointment_status', 'เสร็จสิ้น').limit(1);
  console.log('getPatientTreatmentRecords error:', err2);
}
test();
