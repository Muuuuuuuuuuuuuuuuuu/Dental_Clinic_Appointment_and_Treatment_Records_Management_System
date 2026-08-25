const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw'
);

async function run() {
  console.log('1. Setting weekly_off_days to [0] (Sunday)');
  const { error: setErr } = await supabase.from('clinic_settings').upsert({
    setting_key: 'weekly_off_days',
    setting_value: '[0]'
  }, { onConflict: 'setting_key' });
  if (setErr) console.error(setErr);

  console.log('2. Fetching all users (dentists and staff)');
  const { data: users, error: uErr } = await supabase.from('users').select('user_id, role');
  if (uErr) { console.error(uErr); return; }

  const dentistIds = users.filter(u => u.role === 'ทันตแพทย์').map(u => u.user_id);
  const staffIds = users.filter(u => u.role === 'พนักงาน').map(u => u.user_id);

  console.log(`Found ${dentistIds.length} dentists and ${staffIds.length} staff`);

  console.log('3. Deleting old schedules');
  await supabase.from('schedule').delete().neq('schedule_id', -1); // delete all

  console.log('4. Creating new schedules');
  const schedules = [];

  for (let day = 0; day <= 6; day++) {
    const isOff = day === 0; // Sunday off

    // Dentists: 09:00 - 20:00
    for (const dId of dentistIds) {
      schedules.push({
        user_id: dId,
        day_of_week: day,
        start_shift: isOff ? null : '09:00:00',
        end_shift: isOff ? null : '20:00:00',
        is_off: isOff
      });
    }

    // Staff: 08:30 - 20:30
    for (const sId of staffIds) {
      schedules.push({
        user_id: sId,
        day_of_week: day,
        start_shift: isOff ? null : '08:30:00',
        end_shift: isOff ? null : '20:30:00',
        is_off: isOff
      });
    }
  }

  // Insert in batches
  for (let i = 0; i < schedules.length; i += 100) {
    const batch = schedules.slice(i, i + 100);
    const { error: insErr } = await supabase.from('schedule').insert(batch);
    if (insErr) {
      console.error('Insert error', insErr);
    }
  }

  console.log('Done!');
}

run();
