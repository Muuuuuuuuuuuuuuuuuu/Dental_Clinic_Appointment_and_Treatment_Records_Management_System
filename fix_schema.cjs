const fs = require('fs');
let file = fs.readFileSync('src/app/shared/supabaseApi.ts', 'utf8');

// 1. getPatients
file = file.replace(
  '      users ( profile (first_name, last_name, phone_number, citizen_id) ),\n      patient_allergy (allergy_name),\n      patient_disease (disease_name)\n    `).order',
  '      users ( profile (first_name, last_name, phone_number, citizen_id) )\n    `).order'
);
file = file.replace(
  'const allergies = d.patient_allergy && d.patient_allergy.length > 0 \n      ? d.patient_allergy.map((a: any) => a.allergy_name).join(\', \') \n      : \'-\';',
  'const allergies = d.allergy_history || \'-\';'
);
file = file.replace(
  'const diseases = d.patient_disease && d.patient_disease.length > 0 \n      ? d.patient_disease.map((a: any) => a.disease_name).join(\', \') \n      : \'-\';',
  'const diseases = d.underlying_disease || \'-\';'
);

// 2. addPatient
file = file.replace(
  /const \{ data: patData, error: patError \} = await supabase.from\('patient'\).insert\(\{[\s\S]*?\}\)\.select\(\)\.single\(\);[\s\S]*?\/\/ 4\. Insert conditions[\s\S]*?if \(patient\.underlyingDiseases && patient\.underlyingDiseases\.length > 0\) \{[\s\S]*?\}[\s\S]*?\}/,
  (match) => {
    return `const { data: patData, error: patError } = await supabase.from('patient').insert({
      user_id: realUserId,
      allergy_history: (patient.allergies && patient.allergies.length > 0) ? patient.allergies.join(', ') : null,
      underlying_disease: (patient.underlyingDiseases && patient.underlyingDiseases.length > 0) ? patient.underlyingDiseases.join(', ') : null,
      emergency_contact_name: patient.emergencyContact || null,
      emergency_contact_phone: patient.emergencyPhone || null
    }).select().single();`;
  }
);

// 3. getPatientById
file = file.replace(
  /const \{ data: alData \} = await supabase.from\('patient_allergy'\).select\('allergy_name'\).eq\('patient_id', patientData\.patient_id\);[\s\S]*?const \{ data: disData \} = await supabase.from\('patient_disease'\).select\('disease_name'\).eq\('patient_id', patientData\.patient_id\);/,
  ''
);
file = file.replace(
  /allergies: alData \? alData\.map\(\(a: any\) => a\.allergy_name\) : \[\],[\s\S]*?underlyingDiseases: disData \? disData\.map\(\(d: any\) => d\.disease_name\) : \[\]/,
  `allergies: patientData.allergy_history ? patientData.allergy_history.split(', ').filter(Boolean) : [],
    underlyingDiseases: patientData.underlying_disease ? patientData.underlying_disease.split(', ').filter(Boolean) : []`
);

// 4. getAppointments
file = file.replace(
  '      users ( profile (first_name, last_name, phone_number) ),\n      patient_allergy (allergy_name),\n      patient_disease (disease_name)\n    ),\n    appointment_detail ( service (service_name) ),',
  '      users ( profile (first_name, last_name, phone_number) )\n    ),\n    appointment_detail ( service (service_name) ),'
);
file = file.replace(
  'allergies: d.patient?.patient_allergy && d.patient.patient_allergy.length > 0 \n        ? d.patient.patient_allergy.map((a: any) => a.allergy_name).join(\', \') \n        : \'-\',\n      diseases: d.patient?.patient_disease && d.patient.patient_disease.length > 0 \n        ? d.patient.patient_disease.map((a: any) => a.disease_name).join(\', \') \n        : \'-\'',
  'allergies: d.patient?.allergy_history || \'-\',\n      diseases: d.patient?.underlying_disease || \'-\''
);

// 5. getAppointmentQueue
file = file.replace(
  '      users ( profile (first_name, last_name, phone_number) ),\n      patient_allergy (allergy_name),\n      patient_disease (disease_name)\n    ),\n    appointment_detail ( service (service_name) ),',
  '      users ( profile (first_name, last_name, phone_number) )\n    ),\n    appointment_detail ( service (service_name) ),'
);
file = file.replace(
  'allergies: d.patient?.patient_allergy && d.patient.patient_allergy.length > 0 \n        ? d.patient.patient_allergy.map((a: any) => a.allergy_name).join(\', \') \n        : \'-\',\n      diseases: d.patient?.patient_disease && d.patient.patient_disease.length > 0 \n        ? d.patient.patient_disease.map((a: any) => a.disease_name).join(\', \') \n        : \'-\'',
  'allergies: d.patient?.allergy_history || \'-\',\n      diseases: d.patient?.underlying_disease || \'-\''
);

// 6. updatePatient
file = file.replace(
  /await supabase.from\('patient'\).update\(patientUpdates\).eq\('patient_id', id\);[\s\S]*?await supabase.from\('patient_disease'\).insert\(\{ patient_id: id, disease_name: d \}\);\n      \}\n    \}\n  \}/,
  (match) => {
    return `if (updates.allergies !== undefined) {
    patientUpdates.allergy_history = updates.allergies.length > 0 ? updates.allergies.join(', ') : null;
  }
  if (updates.underlyingDiseases !== undefined) {
    patientUpdates.underlying_disease = updates.underlyingDiseases.length > 0 ? updates.underlyingDiseases.join(', ') : null;
  }
  
  if (Object.keys(patientUpdates).length > 0) {
    await supabase.from('patient').update(patientUpdates).eq('patient_id', id);
  }`;
  }
);

// 7. addAppointment (new patient logic)
file = file.replace(
  /await supabase.from\('patient_allergy'\).delete\(\).eq\('patient_id', finalPatientId\);[\s\S]*?await supabase.from\('patient_disease'\).insert\(\{ patient_id: finalPatientId, disease_name: d \}\);\n      \}\n    \}/,
  (match) => {
    return `await supabase.from('patient').update({
      allergy_history: apptData.patientDetails?.allergies && apptData.patientDetails.allergies.length > 0 ? apptData.patientDetails.allergies.join(', ') : null,
      underlying_disease: apptData.patientDetails?.underlyingDiseases && apptData.patientDetails.underlyingDiseases.length > 0 ? apptData.patientDetails.underlyingDiseases.join(', ') : null
    }).eq('patient_id', finalPatientId);`;
  }
);

file = file.replace(
  /await supabase.from\('patient_allergy'\).delete\(\).eq\('patient_id', returnedPatientId\);[\s\S]*?await supabase.from\('patient_disease'\).insert\(\{ patient_id: returnedPatientId, disease_name: d \}\);\n      \}\n    \}/,
  (match) => {
    return `await supabase.from('patient').update({
      allergy_history: apptData.patientDetails?.allergies && apptData.patientDetails.allergies.length > 0 ? apptData.patientDetails.allergies.join(', ') : null,
      underlying_disease: apptData.patientDetails?.underlyingDiseases && apptData.patientDetails.underlyingDiseases.length > 0 ? apptData.patientDetails.underlyingDiseases.join(', ') : null
    }).eq('patient_id', returnedPatientId);`;
  }
);

fs.writeFileSync('src/app/shared/supabaseApi.ts', file);
console.log('Fixed schema mismatch.');
