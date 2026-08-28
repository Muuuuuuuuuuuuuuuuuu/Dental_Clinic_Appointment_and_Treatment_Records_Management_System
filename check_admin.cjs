const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jggwuyqpcouziysxhaws.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const targetUser = authUsers?.users?.find(u => u.email === 'admin@clinic.com');
  console.log('auth.users:', targetUser);

  if (targetUser) {
    const { data: publicUsers } = await supabase.from('users').select('*').eq('email', 'admin@clinic.com');
    console.log('public.users:', publicUsers);
  }
}
check();
