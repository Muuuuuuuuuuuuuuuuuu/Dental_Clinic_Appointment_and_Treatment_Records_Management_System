const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw'
);

async function run() {
  console.log('Fetching all doctors');
  const { data: users, error: uErr } = await supabase.from('users').select('user_id').eq('role', 'ทันตแพทย์');
  if (uErr) { console.error(uErr); return; }

  const dentistIds = users.map(u => u.user_id);
  
  if (dentistIds.length < 2) {
    console.log("Not enough doctors to split shifts.");
    return;
  }

  // 2 doctors for afternoon (13:00 - 17:00)
  const afternoonDocs = dentistIds.slice(0, 2); 
  // the rest for morning (09:00 - 13:00)
  const morningDocs = dentistIds.slice(2);

  console.log(`Setting Saturday (day_of_week = 6) shifts...`);
  
  for (const docId of morningDocs) {
    console.log(`Setting ${docId} to morning (09:00-13:00)`);
    await supabase.from('schedule')
      .update({ start_shift: '09:00:00', end_shift: '13:00:00', is_off: false })
      .eq('user_id', docId)
      .eq('day_of_week', 6);
  }

  for (const docId of afternoonDocs) {
    console.log(`Setting ${docId} to afternoon (13:00-17:00)`);
    await supabase.from('schedule')
      .update({ start_shift: '13:00:00', end_shift: '17:00:00', is_off: false })
      .eq('user_id', docId)
      .eq('day_of_week', 6);
  }

  console.log('Saturday shifts updated successfully.');
}

run();
