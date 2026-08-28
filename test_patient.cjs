const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw');

async function test() {
  const { data: profile } = await supabase.from('profile').select('*').eq('first_name', 'ภัทรจาริน');
  console.log('Profile:', profile);

  if (profile && profile.length > 0) {
    const { data: user } = await supabase.from('users').select('*').eq('citizen_id', profile[0].citizen_id);
    console.log('User:', user);
    
    if (user && user.length > 0) {
      const { data: patient } = await supabase.from('patient').select('*').eq('user_id', user[0].user_id);
      console.log('Patient:', patient);
      
      if (patient && patient.length > 0) {
        const { data: appt } = await supabase.from('appointment').select('*').eq('patient_id', patient[0].patient_id);
        console.log('Appointments for patient:', appt);
        
        const { data: tr } = await supabase.from('treatment_record').select(`
          *,
          appointment!inner(*)
        `).eq('appointment.patient_id', patient[0].patient_id);
        console.log('Treatment Records for patient:', tr);
      }
    }
  }
}
test();
