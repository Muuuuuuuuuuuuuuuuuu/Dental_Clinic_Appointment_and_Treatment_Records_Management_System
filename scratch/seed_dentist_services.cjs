const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jggwuyqpcouziysxhaws.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw');

async function seed() {
  console.log("Clearing existing dentist_service mappings...");
  await supabase.from('dentist_service').delete().neq('dentist_service_id', 0); // Delete all

  const generalServices = [4, 6, 7, 22, 23, 25, 27];
  const allDentists = [1, 2, 3, 4, 5];
  
  let mappings = [];
  
  // General services to ALL dentists
  for (let d of allDentists) {
    for (let s of generalServices) {
      mappings.push({ dentist_id: d, service_id: s });
    }
  }

  // Dentist 1: Orthodontics
  const ortho = [2, 12, 13, 14];
  for (let s of ortho) mappings.push({ dentist_id: 1, service_id: s });

  // Dentist 2: Implants, Surgery, Endodontics
  const surgeryImplant = [3, 19, 8, 28, 9, 15, 16, 29];
  for (let s of surgeryImplant) mappings.push({ dentist_id: 2, service_id: s });

  // Dentist 3: Pediatric
  const pedo = [10, 11, 31];
  for (let s of pedo) mappings.push({ dentist_id: 3, service_id: s });

  // Dentist 4: Prosthodontics, Esthetics, some Endo
  const prostho = [17, 30, 21, 18, 20, 26, 15, 29];
  for (let s of prostho) mappings.push({ dentist_id: 4, service_id: s });

  // Dentist 5: Oral Surgery
  const oralSurgery = [8, 28, 9, 3, 19];
  for (let s of oralSurgery) mappings.push({ dentist_id: 5, service_id: s });

  console.log(`Inserting ${mappings.length} mappings...`);
  const { data, error } = await supabase.from('dentist_service').insert(mappings);
  
  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Successfully inserted realistic mappings!");
  }
}

seed();
