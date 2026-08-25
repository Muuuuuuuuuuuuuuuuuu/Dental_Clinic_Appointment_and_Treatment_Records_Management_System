const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jggwuyqpcouziysxhaws.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Updating patient 4 (ศรีวรรณ) to have pregnancy...");
  await supabase.from('patient').update({ underlying_disease: 'สำหรับสุภาพสตรี: กำลังตั้งครรภ์ หรือ ให้นมบุตร' }).eq('patient_id', 4);

  console.log("Updating patient 3 (สมศักดิ์) to have heart disease...");
  await supabase.from('patient').update({ underlying_disease: 'กลุ่มเลือดและหัวใจ: ทานยาละลายลิ่มเลือด / โรคหัวใจ / ความดันโลหิตสูง / เคยทำบอลลูนหัวใจ' }).eq('patient_id', 3);

  console.log("Done!");
}

run();
