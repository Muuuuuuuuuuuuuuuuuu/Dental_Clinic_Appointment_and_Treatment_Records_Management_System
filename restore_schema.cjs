const fs = require('fs');
let file = fs.readFileSync('src/app/shared/supabaseApi.ts', 'utf8');

// 1. getPatients
file = file.replace(
  '      users ( profile (first_name, last_name, phone_number, citizen_id) )\n    `).order',
  '      users ( profile (first_name, last_name, phone_number, citizen_id) ),\n      patient_allergy (allergy_name),\n      patient_disease (disease_name)\n    `).order'
);
file = file.replace(
  'const allergies = d.allergy_history || \'-\';',
  'const allergies = d.patient_allergy && d.patient_allergy.length > 0 \n      ? d.patient_allergy.map((a: any) => a.allergy_name).join(\', \') \n      : \'-\';'
);
file = file.replace(
  'const diseases = d.underlying_disease || \'-\';',
  'const diseases = d.patient_disease && d.patient_disease.length > 0 \n      ? d.patient_disease.map((a: any) => a.disease_name).join(\', \') \n      : \'-\';'
);

// 2. addPatient
file = file.replace(
  /const \{ data: patData, error: patError \} = await supabase.from\('patient'\).insert\(\{[\s\S]*?\}\)\.select\(\)\.single\(\);/,
  `const { data: patData, error: patError } = await supabase.from('patient').insert({
      user_id: realUserId,
      emergency_contact_name: patient.emergencyContact || null,
      emergency_contact_phone: patient.emergencyPhone || null
    }).select().single();
    
    if (patError) {
      console.error("addPatient patient error:", patError);
      return false;
    }

    // 4. Insert conditions
    if (patient.allergies && patient.allergies.length > 0) {
      for (const a of patient.allergies) {
        await supabase.from('patient_allergy').insert({ patient_id: patData.patient_id, allergy_name: a });
      }
    }
    if (patient.underlyingDiseases && patient.underlyingDiseases.length > 0) {
      for (const d of patient.underlyingDiseases) {
        await supabase.from('patient_disease').insert({ patient_id: patData.patient_id, disease_name: d });
      }
    }`
);

// 3. getPatientById
file = file.replace(
  `allergies: patientData.allergy_history ? patientData.allergy_history.split(', ').filter(Boolean) : [],
    underlyingDiseases: patientData.underlying_disease ? patientData.underlying_disease.split(', ').filter(Boolean) : []`,
  `allergies: [],
    underlyingDiseases: []` // We will manually insert the queries below
);

// Insert the queries for getPatientById
file = file.replace(
  `const { data: ec } = await supabase.from('emergency_contact').select('*').eq('patient_id', patientData.patient_id).maybeSingle();
    ecData = ec;
    if (patientData.allergy_history) {
      allergies = patientData.allergy_history;
    }
    if (patientData.underlying_disease) {
      conditions = patientData.underlying_disease;
    }`,
  `const { data: ec } = await supabase.from('emergency_contact').select('*').eq('patient_id', patientData.patient_id).maybeSingle();
    ecData = ec;
    
    const { data: alData } = await supabase.from('patient_allergy').select('allergy_name').eq('patient_id', patientData.patient_id);
    if (alData && alData.length > 0) {
      allergies = alData.map((a: any) => a.allergy_name).join(', ');
    }
    
    const { data: disData } = await supabase.from('patient_disease').select('disease_name').eq('patient_id', patientData.patient_id);
    if (disData && disData.length > 0) {
      conditions = disData.map((d: any) => d.disease_name).join(', ');
    }`
);

// 4 & 5. getAppointments and getAppointmentQueue
file = file.replace(
  /users \( profile \(first_name, last_name, phone_number\) \)\n    \),\n    appointment_detail \( service \(service_name\) \),/g,
  'users ( profile (first_name, last_name, phone_number) ),\n      patient_allergy (allergy_name),\n      patient_disease (disease_name)\n    ),\n    appointment_detail ( service (service_name) ),'
);
file = file.replace(
  /allergies: d\.patient\?\.allergy_history \|\| '-',\n      diseases: d\.patient\?\.underlying_disease \|\| '-'/g,
  `allergies: d.patient?.patient_allergy && d.patient.patient_allergy.length > 0 
        ? d.patient.patient_allergy.map((a: any) => a.allergy_name).join(', ') 
        : '-',
      diseases: d.patient?.patient_disease && d.patient.patient_disease.length > 0 
        ? d.patient.patient_disease.map((a: any) => a.disease_name).join(', ') 
        : '-'`
);

// 6. updatePatient
file = file.replace(
  `if (updates.allergies !== undefined) {
    patientUpdates.allergy_history = updates.allergies.length > 0 ? updates.allergies.join(', ') : null;
  }
  if (updates.underlyingDiseases !== undefined) {
    patientUpdates.underlying_disease = updates.underlyingDiseases.length > 0 ? updates.underlyingDiseases.join(', ') : null;
  }
  
  if (Object.keys(patientUpdates).length > 0) {
    await supabase.from('patient').update(patientUpdates).eq('patient_id', id);
  }`,
  `if (Object.keys(patientUpdates).length > 0) {
    await supabase.from('patient').update(patientUpdates).eq('patient_id', id);
  }

  if (updates.allergies !== undefined) {
    await supabase.from('patient_allergy').delete().eq('patient_id', id);
    if (updates.allergies.length > 0) {
      for (const a of updates.allergies) {
        await supabase.from('patient_allergy').insert({ patient_id: id, allergy_name: a });
      }
    }
  }
  
  if (updates.underlyingDiseases !== undefined) {
    await supabase.from('patient_disease').delete().eq('patient_id', id);
    if (updates.underlyingDiseases.length > 0) {
      for (const d of updates.underlyingDiseases) {
        await supabase.from('patient_disease').insert({ patient_id: id, disease_name: d });
      }
    }
  }`
);

// 7. addAppointment
file = file.replace(
  /await supabase.from\('patient'\).update\(\{[\s\S]*?\}\).eq\('patient_id', finalPatientId\);/g,
  `await supabase.from('patient_allergy').delete().eq('patient_id', finalPatientId);
    if (apptData.patientDetails?.allergies && apptData.patientDetails.allergies.length > 0) {
      for (const a of apptData.patientDetails.allergies) {
        await supabase.from('patient_allergy').insert({ patient_id: finalPatientId, allergy_name: a });
      }
    }
    
    await supabase.from('patient_disease').delete().eq('patient_id', finalPatientId);
    if (apptData.patientDetails?.underlyingDiseases && apptData.patientDetails.underlyingDiseases.length > 0) {
      for (const d of apptData.patientDetails.underlyingDiseases) {
        await supabase.from('patient_disease').insert({ patient_id: finalPatientId, disease_name: d });
      }
    }`
);
file = file.replace(
  /await supabase.from\('patient'\).update\(\{[\s\S]*?\}\).eq\('patient_id', returnedPatientId\);/g,
  `await supabase.from('patient_allergy').delete().eq('patient_id', returnedPatientId);
    if (apptData.patientDetails?.allergies && apptData.patientDetails.allergies.length > 0) {
      for (const a of apptData.patientDetails.allergies) {
        await supabase.from('patient_allergy').insert({ patient_id: returnedPatientId, allergy_name: a });
      }
    }
    
    await supabase.from('patient_disease').delete().eq('patient_id', returnedPatientId);
    if (apptData.patientDetails?.underlyingDiseases && apptData.patientDetails.underlyingDiseases.length > 0) {
      for (const d of apptData.patientDetails.underlyingDiseases) {
        await supabase.from('patient_disease').insert({ patient_id: returnedPatientId, disease_name: d });
      }
    }`
);

fs.writeFileSync('src/app/shared/supabaseApi.ts', file);
console.log('Restored schema mismatch.');
