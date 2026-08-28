const fs = require('fs');
let file = fs.readFileSync('src/app/shared/supabaseApi.ts', 'utf8');

// 1. Restore uploadDentistImage
const uploadDentistImageCode = `
export async function uploadDentistImage(file: File, dentistId: string | number): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${dentistId}_\${Date.now()}.\${fileExt}\`;
  const filePath = \`\${fileName}\`;

  const { error: uploadError } = await supabase.storage
    .from('dentist_profiles')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('dentist_profiles')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
`;

if (!file.includes('uploadDentistImage')) {
  file = file.replace(
    `export async function deleteDentist(id: number): Promise<void> {\n  // 1. Delete associated profile first (using real user_id from dentists if possible)\n  await supabase.from('dentist').delete().eq('dentist_id', id);\n}`,
    `export async function deleteDentist(id: number): Promise<void> {\n  // 1. Delete associated profile first (using real user_id from dentists if possible)\n  await supabase.from('dentist').delete().eq('dentist_id', id);\n}\n${uploadDentistImageCode}`
  );
}

// 2. Restore updateDentist
const updateDentistRegex = /export async function updateDentist\(id: number, updates: Partial<DentistInfo>\): Promise<DentistInfo> {[\s\S]*?if \(Object\.keys\(dentistUpdates\)\.length > 0\)/;
file = file.replace(updateDentistRegex, `export async function updateDentist(id: number, updates: Partial<DentistInfo>): Promise<DentistInfo> {
  const dentistUpdates: any = {};
  if (updates.specialty !== undefined) dentistUpdates.specialization = updates.specialty;
  if (updates.license !== undefined) dentistUpdates.license_number = updates.license;
  if (updates.titleName !== undefined) dentistUpdates.title_name = updates.titleName;
  if (updates.experienceYears !== undefined) dentistUpdates.experience_years = updates.experienceYears;
  if (updates.university !== undefined) dentistUpdates.university = updates.university;
  if (updates.imageUrl !== undefined) dentistUpdates.image_url = updates.imageUrl;
  if (updates.startDate !== undefined) dentistUpdates.start_date = updates.startDate;

  if (Object.keys(dentistUpdates).length > 0)`);

// 3. Restore processPaymentApi
const processPaymentRegex = /export async function processPaymentApi\(apptId: number, finalCost: number, method: string\) {[\s\S]*?if \(payData\) {/;
file = file.replace(processPaymentRegex, `export async function processPaymentApi(apptId: number, finalCost: number, method: string, treatmentDetails?: any[]) {
  // 1. Update appointment status to เสร็จสิ้น
  const { error: apptError } = await supabase.from('appointment').update({ appointment_status: 'เสร็จสิ้น' }).eq('appointment_id', apptId);
  if (apptError) throw apptError;

  // 2. Get Treatment ID
  const { data: trData } = await supabase.from('treatment_record').select('treatment_id').eq('appointment_id', apptId).maybeSingle();
  let treatmentId = trData?.treatment_id;

  if (!treatmentId) {
    const { data: apptData } = await supabase.from('appointment').select('dentist_id, patient_id').eq('appointment_id', apptId).single();
    const { data: newTr, error: trErr } = await supabase.from('treatment_record').insert({
      appointment_id: apptId,
      attending_dentist_id: apptData?.dentist_id || null,
      patient_id: apptData?.patient_id || null,
      status: 'เสร็จสิ้น'
    }).select('treatment_id').single();
    
    if (trErr) throw trErr;
    treatmentId = newTr.treatment_id;
  }

  // 3. Update or Insert treatment_detail
  if (treatmentId && treatmentDetails && treatmentDetails.length > 0) {
    await supabase.from('treatment_detail').delete().eq('treatment_id', treatmentId);
    const detailsToInsert = treatmentDetails.map(d => ({
      treatment_id: treatmentId,
      location_code: d.location_code || null,
      billing_item_id: d.item_id || d.billing_item_id,
      actual_price: d.actual_price || null
    }));
    const { error: tdErr } = await supabase.from('treatment_detail').insert(detailsToInsert);
    if (tdErr) console.error("Error inserting treatment_detail:", tdErr);
  }

  // 4. Update or Insert payment record
  if (treatmentId) {
    const { data: payData } = await supabase.from('payment').select('payment_id').eq('treatment_id', treatmentId).maybeSingle();
    if (payData) {`);

fs.writeFileSync('src/app/shared/supabaseApi.ts', file);
