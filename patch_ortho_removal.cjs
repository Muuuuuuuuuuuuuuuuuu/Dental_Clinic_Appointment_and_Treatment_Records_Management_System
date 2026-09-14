const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' }); 

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("🚀 Starting database cleanup for Orthodontics & Treatment Plans...");

  const sqlQuery = `
-- ลบตารางที่เกี่ยวข้องกันตามลำดับ (ลบ Foreign Key ลูกก่อน)
DROP TABLE IF EXISTS installment CASCADE;
DROP TABLE IF EXISTS treatment_plan_item CASCADE;

-- ลบตารางแผนการรักษาและแพ็กเกจ
DROP TABLE IF EXISTS treatment_plan CASCADE;
DROP TABLE IF EXISTS treatment_package CASCADE;

-- ลบคอลัมน์ที่เชื่อมโยงกับ treatment_plan ออกจากตาราง appointment
ALTER TABLE appointment DROP COLUMN IF EXISTS treatment_plan_id;
  `;

  console.log("========== SQL SCRIPT ==========");
  console.log(sqlQuery);
  console.log("================================");
  console.log("คำแนะนำ: เนื่องจากการลบตาราง (DROP TABLE) ถือเป็นคำสั่ง DDL ซึ่ง Supabase JS API ไม่รองรับการรันผ่าน Client ปกติ");
  console.log("กรุณาคัดลอก SQL Script ด้านบน ไปวางและรันที่หน้าเว็บ Supabase Dashboard -> SQL Editor ครับ");
}

run();
