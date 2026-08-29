import { supabase } from './app/shared/supabaseApi';

async function run() {
  console.log("Inserting services...");
  const services = [
    { service_name: 'อุดฟัน (1 ด้าน)', description: 'อุดฟัน 1 ด้าน', base_price: 500, category_id: 2, is_active: true, is_fixed_price: false },
    { service_name: 'อุดฟัน (2 ด้าน)', description: 'อุดฟัน 2 ด้าน', base_price: 800, category_id: 2, is_active: true, is_fixed_price: false },
    { service_name: 'อุดฟัน (3 ด้าน)', description: 'อุดฟัน 3 ด้านขึ้นไป', base_price: 1200, category_id: 2, is_active: true, is_fixed_price: false },
    { service_name: 'อุดฟัน (3 ด้านขึ้นไป)', description: 'อุดฟัน 3 ด้านขึ้นไป', base_price: 1200, category_id: 2, is_active: true, is_fixed_price: false },
    { service_name: 'ถอนฟันน้ำนม', description: 'ถอนฟันน้ำนม', base_price: 400, category_id: 1, is_active: true, is_fixed_price: false },
    { service_name: 'ถอนฟันแท้ (ปกติ)', description: 'ถอนฟันแท้ (ปกติ)', base_price: 600, category_id: 1, is_active: true, is_fixed_price: false },
    { service_name: 'ถอนฟันแท้ (ยาก)', description: 'ถอนฟันแท้ (ยาก)', base_price: 900, category_id: 1, is_active: true, is_fixed_price: false },
    { service_name: 'ผ่าฟันคุด (ปกติ)', description: 'ผ่าฟันคุดระดับทั่วไป', base_price: 2500, category_id: 1, is_active: true, is_fixed_price: false },
    { service_name: 'ผ่าฟันคุด (ยาก/ลึก)', description: 'ผ่าฟันคุดระดับยากหรือลึก', base_price: 4500, category_id: 1, is_active: true, is_fixed_price: false }
  ];

  for (const svc of services) {
    const { data: existing } = await supabase.from('service').select('service_id').eq('service_name', svc.service_name).single();
    if (!existing) {
      console.log("Inserting", svc.service_name);
      await supabase.from('service').insert(svc);
    } else {
      console.log("Already exists", svc.service_name);
    }
  }
  console.log("Done.");
}

run();
