import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function checkAppt() {
  const { data, error } = await supabase.from('appointment').select('*').limit(5);
  console.log(data);
}
checkAppt();
