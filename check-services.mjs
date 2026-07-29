import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function checkServices() {
  const { data, error } = await supabase.from('service').select('*');
  console.log(data);
}
checkServices();
