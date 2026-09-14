import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const fileContent = fs.readFileSync('c:\\Users\\Lenovo\\Documents\\GitHub\\icemu\\src\\app\\shared\\utils\\supabaseClient.ts', 'utf-8');
const urlMatch = fileContent.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = fileContent.match(/supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);

if (!urlMatch || !keyMatch) {
  console.error("Could not find supabaseUrl or supabaseAnonKey in supabaseClient.ts");
  process.exit(1);
}

const supabaseUrl = urlMatch[1];
const supabaseAnonKey = keyMatch[1];
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.rpc('get_table_schema', { table_name: 'treatment_plan_item' });
  if (error) {
    console.error("RPC failed, trying raw query...", error.message);
    const { data: d2, error: e2 } = await supabase.from('treatment_plan_item').select('*').limit(1);
    console.log("Data (to see columns):", d2);
    console.log("Error:", e2);
  } else {
    console.log("Schema:", data);
  }
}

check();
