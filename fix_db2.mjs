import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jggwuyqpcouziysxhaws.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { error } = await supabase.from('treatment_product').insert({
    treatment_id: 40,
    product_id: 7, // Soft toothbrush
    quantity: 1,
    actual_price: 60
  });
  if (error) console.error('Insert error:', error);
  else console.log('Successfully inserted toothbrush for treatment 40!');
}
run();
