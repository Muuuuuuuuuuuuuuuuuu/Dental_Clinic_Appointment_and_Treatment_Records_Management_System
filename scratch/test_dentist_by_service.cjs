const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const { data, error } = await supabase
    .from('dentist_service')
    .select('dentist_id, dentist(dentist_id, title_name, specialization, image_url, years_of_experience, users(profile(first_name, last_name)))')
    .eq('service_id', 7);
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
