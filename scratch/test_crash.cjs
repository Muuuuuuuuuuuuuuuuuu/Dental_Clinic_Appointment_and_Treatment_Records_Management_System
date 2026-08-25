const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function test() {
  const { data, error } = await supabase.from('leave_record').select(`*, users ( profile (first_name, last_name) )`);
  const mapped = data.map((d) => {
    const p = d.users?.profile;
    return {
      id: d.leave_id,
      doctorId: d.user_id, 
      doctorName: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      startDate: d.leave_date,
      endDate: d.leave_date,
      leavePeriod: d.leave_period || 'เต็มวัน',
      reason: d.leave_type,
      status: d.is_approved === true ? 'อนุมัติแล้ว' : d.is_approved === false ? 'ปฏิเสธ' : 'รอการอนุมัติ',
      createdAt: d.leave_date
    };
  });
  console.log("Mapped:", mapped);
  
  // test the crash
  try {
    mapped.forEach(l => {
      console.log(l.doctorName.replace(/ทพญ\.|ทพ\./g, '').trim()[0] || "พ");
    });
  } catch(e) {
    console.error("Crash!", e);
  }
}
test();
