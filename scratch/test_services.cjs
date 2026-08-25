const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const { data: s } = await supabase.from('service').select('service_id, service_name');
  const { data: ds } = await supabase.from('dentist_service').select('*');
  console.log("Services:", s);
  console.log("Dentist Services:", ds);
}
test();
