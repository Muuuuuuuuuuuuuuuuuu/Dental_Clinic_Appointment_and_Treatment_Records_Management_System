import { supabase } from './src/app/shared/utils/supabaseClient';

async function syncServices() {
  console.log("Syncing services...");
  
  // 1. Delete all existing services (we'll ignore error if constrained, but we should be fine)
  const { error: delError } = await supabase.from('service').delete().neq('service_id', -1);
  if (delError) {
    console.error("Delete error:", delError);
  } else {
    console.log("Deleted old services.");
  }

  // 2. Insert the 6 new ones
  const services = [
    { service_name: 'ตรวจฟันและขูดหินปูน', base_price: 500, estimated_time: 30, service_category: 'ทั่วไป' },
    { service_name: 'ฟอกสีฟัน', base_price: 3500, estimated_time: 60, service_category: 'ทั่วไป' },
    { service_name: 'จัดฟัน (Orthodontics)', base_price: 35000, estimated_time: 45, service_category: 'จัดฟัน' },
    { service_name: 'รากฟันเทียม (Implant)', base_price: 35000, estimated_time: 60, service_category: 'ศัลยกรรม' },
    { service_name: 'อุดฟัน / ถอนฟัน', base_price: 800, estimated_time: 30, service_category: 'ทั่วไป' },
    { service_name: 'ทันตกรรมเด็ก', base_price: 400, estimated_time: 45, service_category: 'ทั่วไป' },
  ];

  const { data, error: insError } = await supabase.from('service').insert(services).select();
  if (insError) {
    console.error("Insert error:", insError);
  } else {
    console.log("Inserted new services.");
  }
}

syncServices();
