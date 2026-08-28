const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jggwuyqpcouziysxhaws.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .in('email', ['admin@clinic.com', 'admin2@clinic.com']);
  console.log('Update result:', error || 'Success');
}
fix();
