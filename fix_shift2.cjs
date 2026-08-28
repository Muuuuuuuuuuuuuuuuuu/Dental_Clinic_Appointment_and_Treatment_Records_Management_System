const fs = require('fs');
let file = fs.readFileSync('src/app/shared/supabaseApi.ts', 'utf8');

const updateShiftRegex = /export async function updateShift\([\s\S]*?if \(error\) throw error;\n}/;
file = file.replace(updateShiftRegex, `export async function updateShift(id: number, updates: Partial<Shift>) {
  const payload: any = {};
  if (updates.start_time !== undefined) payload.start_shift = updates.start_time;
  if (updates.end_time !== undefined) payload.end_shift = updates.end_time;
  if (updates.is_off !== undefined) payload.is_off = updates.is_off;

  const { data, error } = await supabase.from('schedule').update(payload).eq('schedule_id', id);

  if (error) throw error;
  return data;
}`);

const appendData = `
export async function addShift(shift: Omit<Shift, 'id'>) {
  let userId = null;
  if (shift.person_type === 'dentist') {
    const { data: d } = await supabase.from('dentist').select('user_id').eq('dentist_id', shift.person_id).single();
    userId = d?.user_id;
  } else {
    const { data: s } = await supabase.from('staff').select('user_id').eq('staff_id', shift.person_id).single();
    userId = s?.user_id;
  }
  if (!userId) throw new Error("User ID not found for person");
  
  const payload = {
    user_id: userId,
    day_of_week: shift.day_of_week,
    start_shift: shift.start_time,
    end_shift: shift.end_time,
    is_off: shift.is_off
  };

  const { data, error } = await supabase.from('schedule').insert(payload).select().single();
  if (error) throw error;
  
  return {
    id: data.schedule_id,
    person_id: shift.person_id,
    person_type: shift.person_type,
    day_of_week: data.day_of_week,
    start_time: data.start_shift,
    end_time: data.end_shift,
    is_off: data.is_off
  } as Shift;
}

export async function getBillingItems() {
  const { data, error } = await supabase.from('billing_item').select('*').order('item_name', { ascending: true });
  if (error || !data) return [];
  return data;
}
`;
fs.writeFileSync('src/app/shared/supabaseApi.ts', file + appendData);
