const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const { data, error } = await supabase.from('appointment').select('*').limit(1);
  if (data && data.length > 0) {
     console.log(Object.keys(data[0]));
  } else {
     const { data: d2, error: e2 } = await supabase.from('appointment').insert({ patient_id: 1, appointment_date: '2026-08-20' }).select();
     console.log("insert:", d2 && d2[0] ? Object.keys(d2[0]) : e2);
  }
}
test();
