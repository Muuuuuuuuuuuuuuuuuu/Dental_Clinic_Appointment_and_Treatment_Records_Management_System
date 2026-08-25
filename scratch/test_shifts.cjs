const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const dayOfWeek = new Date().getDay();

  const { data: shifts, error } = await supabase.from('schedule')
    .select('users!inner(dentist(dentist_id)), start_shift, end_shift, is_off')
    .eq('day_of_week', dayOfWeek);
    
  console.log("Shifts:", JSON.stringify(shifts, null, 2));
  console.log("Error:", error);
}
test();
