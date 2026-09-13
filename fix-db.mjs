import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jggwuyqpcouziysxhaws.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAppointments() {
  console.log("Fetching appointments...");
  // Get all appointments
  const { data: appointments, error: apptErr } = await supabase.from('appointment').select('appointment_id');
  if (apptErr) { console.error("Error fetching appointments:", apptErr); return; }
  
  // Get all appointment_details
  const { data: details, error: detErr } = await supabase.from('appointment_detail').select('appointment_id');
  if (detErr) { console.error("Error fetching details:", detErr); return; }
  
  const detailedIds = new Set(details.map(d => d.appointment_id));
  
  const missingDetails = appointments.filter(a => !detailedIds.has(a.appointment_id));
  console.log(`Found ${missingDetails.length} appointments missing details.`);
  
  if (missingDetails.length === 0) {
    console.log("No fixes needed.");
    return;
  }
  
  const inserts = missingDetails.map(a => ({
    appointment_id: a.appointment_id,
    service_id: 1, // 1 = ตรวจสุขภาพช่องปาก (Assuming standard ID)
    price_at_booking: 200
  }));
  
  console.log("Inserting details:", inserts);
  
  const { error: insErr } = await supabase.from('appointment_detail').insert(inserts);
  if (insErr) {
    console.error("Error inserting details:", insErr);
  } else {
    console.log("Successfully fixed appointments!");
  }
}

fixAppointments();
