const fs = require('fs');
let file = fs.readFileSync('src/app/shared/supabaseApi.ts', 'utf8');

file = file.replace(
  /if \(patientData\.allergy_history\) \{\s*allergies = patientData\.allergy_history;\s*\}\s*if \(patientData\.underlying_disease\) \{\s*conditions = patientData\.underlying_disease;\s*\}/,
  `const { data: alData } = await supabase.from('patient_allergy').select('allergy_name').eq('patient_id', patientData.patient_id);
    if (alData && alData.length > 0) {
      allergies = alData.map((a: any) => a.allergy_name).join(', ');
    }
    const { data: disData } = await supabase.from('patient_disease').select('disease_name').eq('patient_id', patientData.patient_id);
    if (disData && disData.length > 0) {
      conditions = disData.map((d: any) => d.disease_name).join(', ');
    }`
);

fs.writeFileSync('src/app/shared/supabaseApi.ts', file);
console.log('Fixed getPatientById queries');
