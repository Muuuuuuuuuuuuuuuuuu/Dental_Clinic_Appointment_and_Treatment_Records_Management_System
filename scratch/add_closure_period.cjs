const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw'
);

async function run() {
  // Test if column exists by trying to select it
  const { data, error } = await supabase.from('clinic_holiday').select('closure_period').limit(1);
  
  if (!error) {
    console.log('Column closure_period already exists.');
    return;
  }
  
  console.log('Column does not exist, need to add it via Supabase SQL editor.');
  console.log('Please run this SQL in your Supabase dashboard SQL editor:');
  console.log('');
  console.log('ALTER TABLE clinic_holiday ADD COLUMN IF NOT EXISTS closure_period TEXT DEFAULT \'ทั้งวัน\' CHECK (closure_period IN (\'ทั้งวัน\', \'ครึ่งวันเช้า\', \'ครึ่งวันบ่าย\'));');
}

run();
