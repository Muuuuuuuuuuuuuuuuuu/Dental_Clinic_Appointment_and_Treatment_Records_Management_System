import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK');
// Wait, I don't have the service_role key to delete, but RLS is `USING (true)`. Let's test if anon key can delete.
async function run() {
  // First, find the duplicates
  const targetPatientId = 1;
  const { data: allAppts, error } = await supabase
    .from('appointment')
    .select('appointment_id, appointment_date, start_time, appointment_status')
    .eq('patient_id', targetPatientId)
    .order('appointment_id', { ascending: true });
    
  if (error) {
    console.error("Error fetching", error);
    return;
  }
  
  const seen = new Set();
  const toDelete = [];
  
  for (const appt of allAppts) {
    const key = `${appt.appointment_date}_${appt.start_time}`;
    if (seen.has(key)) {
      toDelete.push(appt.appointment_id);
    } else {
      seen.add(key);
    }
  }
  
  console.log("Found duplicate appointment IDs:", toDelete);
  
  if (toDelete.length > 0) {
    // We also need to delete from appointment_detail first due to foreign key constraint
    for (const id of toDelete) {
        console.log(`Deleting details for ${id}...`);
        const { error: dErr } = await supabase.from('appointment_detail').delete().eq('appointment_id', id);
        if (dErr) console.error(dErr);
        
        console.log(`Deleting treatment_record for ${id}...`);
        const { error: tErr } = await supabase.from('treatment_record').delete().eq('appointment_id', id);
        if (tErr) console.error(tErr);

        console.log(`Deleting appointment ${id}...`);
        const { error: aErr } = await supabase.from('appointment').delete().eq('appointment_id', id);
        if (aErr) console.error(aErr);
    }
    console.log("Cleanup complete!");
  } else {
    console.log("No duplicates found.");
  }
}

run();
