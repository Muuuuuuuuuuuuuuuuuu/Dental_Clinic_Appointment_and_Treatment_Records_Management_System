const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const { data, error } = await supabase.from('appointment').select('*');
  console.log("Appointments:", data ? data.map(d => d.appointment_id) : [], "Error:", error);
}
test();
