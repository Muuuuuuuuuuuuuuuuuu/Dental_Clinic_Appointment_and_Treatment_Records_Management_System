import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jggwuyqpcouziysxhaws.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: payments } = await supabase.from('payment').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Recent payments:', JSON.stringify(payments, null, 2));
}
run();
