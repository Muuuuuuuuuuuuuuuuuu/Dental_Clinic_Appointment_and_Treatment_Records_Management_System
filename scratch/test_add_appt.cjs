const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const { data, error } = await supabase
    .from('appointment')
    .insert({
      patient_id: 1,
      appointment_date: '2026-08-20',
      start_time: '10:00:00',
      end_time_est: '10:30:00',
      appointment_status: 'ยืนยันการจอง',
      channel: 'ออนไลน์',
      plan_id: null,
      note: null
    })
    .select()
    .single();
  console.log("Error:", error);
}
test();
