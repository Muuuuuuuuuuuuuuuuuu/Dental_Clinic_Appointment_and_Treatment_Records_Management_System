import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testSlots() {
  const date = '2026-11-16';

  // Let's check for all services:
  const { data: services } = await supabase.from('service').select('service_id, service_name, estimated_time');
  for (const s of services) {
    const { data: ds } = await supabase.from('dentist_service').select('dentist_id').eq('service_id', s.service_id);
    const docIds = (ds || []).map(x => x.dentist_id);
    console.log(`Service ${s.service_id} (${s.service_name}): docIds = [${docIds.join(', ')}]`);
  }
}

testSlots().catch(console.error);
