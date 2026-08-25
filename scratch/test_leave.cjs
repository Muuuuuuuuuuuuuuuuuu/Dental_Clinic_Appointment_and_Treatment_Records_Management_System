const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const { data, error } = await supabase.from('leave_record').select(`
    *,
    users ( profile (first_name, last_name) )
  `);
  console.log("Leaves:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}
test();
