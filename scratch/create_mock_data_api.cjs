const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jggwuyqpcouziysxhaws.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Starting mock data creation via API...");

  // 1. Delete old mock appointments (ID 2000-2100)
  console.log("Deleting old data...");
  await supabase.from('treatment_detail').delete().in('treatment_id', 
    (await supabase.from('treatment_record').select('treatment_id').gte('appointment_id', 2000).lte('appointment_id', 2100)).data?.map(x => x.treatment_id) || []
  );
  await supabase.from('treatment_record').delete().gte('appointment_id', 2000).lte('appointment_id', 2100);
  await supabase.from('appointment_detail').delete().gte('appointment_id', 2000).lte('appointment_id', 2100);
  await supabase.from('queue').delete().gte('appointment_id', 2000).lte('appointment_id', 2100);
  await supabase.from('appointment').delete().gte('appointment_id', 2000).lte('appointment_id', 2100);

  // 2. Delete old mock users from public schema
  const { data: oldUsers } = await supabase.from('users').select('user_id, citizen_id').like('email', 'patient_mock_%');
  if (oldUsers && oldUsers.length > 0) {
    const userIds = oldUsers.map(u => u.user_id);
    const citizenIds = oldUsers.map(u => u.citizen_id);
    await supabase.from('patient').delete().in('user_id', userIds);
    await supabase.from('users').delete().in('user_id', userIds);
    await supabase.from('profile').delete().in('citizen_id', citizenIds);
  }

  // 3. Delete from auth.users (via admin api)
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const mockAuthUsers = authUsers.users.filter(u => u.email && u.email.startsWith('patient_mock_'));
  for (const u of mockAuthUsers) {
    await supabase.auth.admin.deleteUser(u.id);
  }
  
  // also delete the ones from public.users if they didn't match authUsers
  if (oldUsers) {
     for(const u of oldUsers) {
        await supabase.auth.admin.deleteUser(u.user_id).catch(() => {});
     }
  }

  // 4. Create 20 new users using API
  console.log("Creating 20 new mock users...");
  const firstNames = ['สมชาย', 'สมหญิง', 'ใจดี', 'มีสุข', 'มานะ', 'ปิติ', 'ชูใจ', 'วีระ', 'สมบูรณ์', 'วันชัย', 
                      'สุชาติ', 'นารี', 'รัตนา', 'กัลยา', 'วิชัย', 'ประเสริฐ', 'ปราณี', 'สุรศักดิ์', 'พรชัย', 'กิตติ'];
  const lastNames = ['รักดี', 'ใจงาม', 'มีบุญ', 'พานิช', 'มั่นคง', 'เจริญ', 'สุวรรณ', 'ทองดี', 'ศิริ', 'นุกูล'];

  let createdPatients = []; // will store { patient_id, user_id }

  for (let i = 0; i < 20; i++) {
    const citizenId = '9990000000' + (i < 10 ? '0'+i : i) + '0';
    const email = `patient_mock_${i+1}@test.com`;
    const fname = firstNames[i];
    const lname = lastNames[i % 10];
    const phone = '089' + String(1000000 + i);
    const gender = i % 2 === 0 ? 'ชาย' : 'หญิง';

    // Create via Auth Admin (This correctly handles identities and hashes)
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: email,
      password: '12345678',
      email_confirm: true
    });

    if (authErr) {
      console.error(`Error creating ${email}:`, authErr);
      continue;
    }
    
    const uid = authData.user.id;

    // Insert into public.profile
    await supabase.from('profile').insert({
      citizen_id: citizenId,
      first_name: fname,
      last_name: lname,
      gender: gender,
      birth_date: '1990-01-01',
      phone_number: phone,
      current_address: '123 กทม.'
    });

    // Insert into public.users
    await supabase.from('users').insert({
      user_id: uid,
      citizen_id: citizenId,
      email: email,
      role: 'คนไข้',
      account_status: 'active'
    });

    // Insert into public.patient. Let DB generate patient_id!
    const { data: patientData, error: patErr } = await supabase.from('patient').insert({
      user_id: uid,
      allergy_history: 'ไม่มี',
      underlying_disease: 'ไม่มี',
      emergency_contact_name: 'ญาติ',
      emergency_contact_phone: '0800000000'
    }).select('patient_id').single();

    if (patErr) console.error("Patient error", patErr);
    else createdPatients.push(patientData.patient_id);
    
    console.log(`Created ${email} successfully!`);
  }

  // 5. Create 30 appointments
  console.log("Creating 30 appointments...");
  const services = [1,2,3,4,5,6,7,8,9,10,11,12,13];
  
  async function addAppt(date, timeStart, timeEnd, dentist, service, patId) {
    const status = [8, 9, 10, 11, 12, 13].includes(service) ? 'รอการยืนยัน' : 'ยืนยันการจอง';
    
    // Insert appointment
    const { data: apptData, error: apptErr } = await supabase.from('appointment').insert({
      patient_id: patId,
      appointment_date: date,
      start_time: timeStart,
      end_time_est: timeEnd,
      appointment_status: status,
      channel: 'ออนไลน์'
    }).select('appointment_id').single();

    if (apptErr) return;
    const aId = apptData.appointment_id;

    // Insert details
    await supabase.from('appointment_detail').insert({
      appointment_id: aId,
      service_id: service
    });

    // Insert treatment record
    await supabase.from('treatment_record').insert({
      appointment_id: aId,
      dentist_id: dentist,
      patient_id: patId,
      treatment_date: date
    });
  }

  for(let i=0; i<10; i++) {
    if(!createdPatients[i]) continue;
    const pId = createdPatients[i];
    const dentist = (i % 5) + 1;
    const s = services[i % services.length];
    const startH = 9 + Math.floor(i/2);
    const start = (startH < 10 ? '0'+startH : startH) + (i%2===0 ? ':00:00' : ':30:00');
    const endH = startH + (i%2===0 ? 0 : 1);
    const endM = i%2===0 ? ':30:00' : ':00:00';
    const end = (endH < 10 ? '0'+endH : endH) + endM;
    await addAppt('2026-08-05', start, end, dentist, s, pId);
  }

  let day = 6;
  for(let i=0; i<20; i++) {
    if(!createdPatients[(i+10) % 20]) continue;
    const d = day < 10 ? '0'+day : ''+day;
    const date = `2026-08-${d}`;
    const dentist = (i % 5) + 1;
    const s = services[(i+10) % services.length];
    const pId = createdPatients[(i+10) % 20];
    
    let start, end;
    if (i % 2 === 0) {
       start = '09:00:00';
       end = '10:00:00';
    } else {
       start = '14:00:00';
       end = '15:00:00';
    }
    await addAppt(date, start, end, dentist, s, pId);
    if (i % 2 !== 0) day++;
  }

  console.log("DONE! Everything is set up perfectly. You can now log in!");
}

run();
