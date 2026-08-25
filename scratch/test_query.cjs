const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const { data, error } = await supabase.from('appointment').select(`
    appointment_id,
    dentist_id,
    dentist ( users ( profile (first_name, last_name) ) )
  `).limit(1);
  console.log("Appointment with dentist:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}
test();
