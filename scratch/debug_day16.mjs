import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function debugDay16() {
  const { data: schedData } = await supabase.from('schedule').select('staff_id, day_of_week, start_shift, end_shift, is_off');
  const { data: dentists } = await supabase.from('dentist').select('dentist_id, staff_id');
  const doctorSchedules = (schedData || []).map((s) => {
    const d = dentists?.find((dent) => dent.staff_id && s.staff_id && dent.staff_id === s.staff_id);
    return {
      dentistId: d?.dentist_id,
      staffId: s.staff_id,
      dayOfWeek: s.day_of_week,
      isOff: s.is_off,
    };
  }).filter((s) => s.dentistId !== undefined);

  const { data: upcomingLeaves } = await supabase.from('leave_record')
    .select('staff_id, leave_date, leave_period')
    .eq('is_approved', true)
    .gte('leave_date', '2026-11-01');

  const { data: dsData } = await supabase
    .from('dentist_service')
    .select('dentist_id, dentist(dentist_id, staff_id, staff(user_id))')
    .eq('service_id', 1);

  const filteredDoctors = (dsData || []).map(r => ({
    id: r.dentist_id,
    staffId: r.dentist?.staff_id,
    userId: r.dentist?.staff?.user_id
  }));

  console.log('Upcoming leaves on 2026-11-16:', upcomingLeaves);
  console.log('Filtered doctors:', filteredDoctors);

  for (const fd of filteredDoctors) {
    const shift = doctorSchedules.find(s => s.dentistId === fd.id && s.dayOfWeek === 1);
    console.log(`\nDoctor ${fd.id} (staffId=${fd.staffId}, userId=${fd.userId}):`);
    console.log('  shift:', shift);
    const isShiftOff = shift && shift.isOff;
    console.log('  isShiftOff:', isShiftOff);

    const isFullLeave = upcomingLeaves.some(l => 
      l.user_id === fd.userId && l.leave_date === '2026-11-16' && l.leave_period === 'เต็มวัน'
    );
    console.log('  isFullLeave:', isFullLeave);
  }
}

debugDay16().catch(console.error);
