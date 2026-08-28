const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw');

async function test() {
  const { data: patient } = await supabase.from('patient').select('*').eq('user_id', '5b9ec792-7019-49b2-932e-fa4b776a67d5');
  console.log('Patient 2:', patient);
  
  if (patient && patient.length > 0) {
    const { data: appt } = await supabase.from('appointment').select('*').eq('patient_id', patient[0].patient_id);
    console.log('Appointments 2:', appt);
  }
}
test();
