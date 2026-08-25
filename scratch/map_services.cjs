const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const { data: dentists } = await supabase.from('dentist').select('*');
  console.log("Dentists:", dentists);
}
test();
