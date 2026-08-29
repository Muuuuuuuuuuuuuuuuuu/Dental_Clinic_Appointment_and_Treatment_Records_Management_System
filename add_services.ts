import { supabase } from './src/app/shared/supabaseApi';

async function updateServices() {
  const newServices = [
    { name: "อุดฟัน (1 ด้าน)", description: "อุดฟันด้วยวัสดุสีเหมือนฟัน 1 ด้าน", base_price: 500, category_id: 1, is_active: true, is_fixed_price: false },
    { name: "อุดฟัน (2 ด้าน)", description: "อุดฟันด้วยวัสดุสีเหมือนฟัน 2 ด้าน", base_price: 800, category_id: 1, is_active: true, is_fixed_price: false },
    { name: "อุดฟัน (3 ด้าน)", description: "อุดฟันด้วยวัสดุสีเหมือนฟัน 3 ด้านขึ้นไป", base_price: 1100, category_id: 1, is_active: true, is_fixed_price: false },
    { name: "ถอนฟันน้ำนม", description: "ถอนฟันสำหรับเด็ก", base_price: 300, category_id: 4, is_active: true, is_fixed_price: false },
    { name: "ถอนฟันแท้ (ปกติ)", description: "ถอนฟันแท้ทั่วไป", base_price: 500, category_id: 4, is_active: true, is_fixed_price: false },
    { name: "ถอนฟันแท้ (ยาก)", description: "ถอนฟันแท้ที่มีความยาก", base_price: 800, category_id: 4, is_active: true, is_fixed_price: false },
    { name: "ผ่าฟันคุด (ปกติ)", description: "ผ่าฟันคุดระดับทั่วไป", base_price: 1500, category_id: 4, is_active: true, is_fixed_price: false },
    { name: "ผ่าฟันคุด (ยาก/ลึก)", description: "ผ่าฟันคุดระดับยากหรือฝังลึก", base_price: 3000, category_id: 4, is_active: true, is_fixed_price: false },
  ];

  for (const s of newServices) {
    const { data, error } = await supabase.from('services').select('id').eq('name', s.name);
    if (data && data.length > 0) {
      console.log(`Service ${s.name} exists, skipping...`);
    } else {
      console.log(`Inserting ${s.name}...`);
      const { error: insertErr } = await supabase.from('services').insert([s]);
      if (insertErr) console.error("Error inserting:", insertErr);
    }
  }

  console.log("Done");
}

updateServices();
