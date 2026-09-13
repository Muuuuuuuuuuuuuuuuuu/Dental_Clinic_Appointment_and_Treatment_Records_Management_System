const fs = require('fs');
let apiFile = fs.readFileSync('src/app/shared/api/treatmentApi.ts', 'utf8');
if (!apiFile.includes('export async function getTreatmentPackages')) {
  const patchCode = `
export async function getTreatmentPackages() {
  const { data, error } = await supabase.from('treatment_package')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error getTreatmentPackages:", error);
    return [];
  }
  return data;
}
`;
  fs.writeFileSync('src/app/shared/api/treatmentApi.ts', apiFile + "\n" + patchCode);
}
