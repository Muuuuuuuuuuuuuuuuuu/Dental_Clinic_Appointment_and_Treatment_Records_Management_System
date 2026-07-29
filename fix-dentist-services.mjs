import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');

async function fixDentistServices() {
  const { data: dentists, error } = await supabase.from('dentist_service').select('*').eq('service_id', 7);
  if (error) {
    console.error(error);
    return;
  }
  
  // Find the ID of the newly inserted "ถอนฟัน"
  const { data: newSrv } = await supabase.from('service').select('service_id').eq('service_name', 'ถอนฟัน').single();
  if (!newSrv) {
    console.error("Could not find ถอนฟัน");
    return;
  }
  
  const newId = newSrv.service_id;
  console.log(`New service ID is ${newId}. Dentists with ID 7:`, dentists.map(d => d.dentist_id));
  
  for (const ds of dentists) {
    // Add the new service for the same dentist
    await supabase.from('dentist_service').insert({
      dentist_id: ds.dentist_id,
      service_id: newId
    });
  }
  console.log("Assigned ถอนฟัน to dentists who do อุดฟัน!");
}

fixDentistServices();
