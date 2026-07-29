import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function updateService() {
  // Update existing ID 7 to just "อุดฟัน"
  const { error: updateErr } = await supabase
    .from('service')
    .update({ 
      service_name: 'อุดฟัน', 
      description: 'อุดฟันด้วยเทคนิคใหม่และวัสดุคุณภาพสูง สีเหมือนฟันจริง'
    })
    .eq('service_id', 7);
    
  if (updateErr) {
    console.error("Update error:", updateErr);
  } else {
    console.log("Updated ID 7 to อุดฟัน");
  }

  // Insert "ถอนฟัน"
  const { error: insertErr } = await supabase
    .from('service')
    .insert({
      service_name: 'ถอนฟัน',
      base_price: 800,
      estimated_time: 30,
      service_category: 'ทั่วไป',
      icon_name: 'Heart',
      color_code: '#F3E8FF',
      service_type: 'variable',
      description: 'ถอนฟันด้วยเทคนิคเฉพาะ ลดอาการเจ็บปวด ปลอดภัย',
      is_fixed_price: false
    });
    
  if (insertErr) {
    console.error("Insert error:", insertErr);
  } else {
    console.log("Inserted ถอนฟัน");
  }
}

updateService();
