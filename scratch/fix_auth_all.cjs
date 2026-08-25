const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw'
);

async function fixAuth() {
  console.log("Fetching mock users from public.users...");
  const { data: users, error: selectErr } = await supabase
    .from('users')
    .select('user_id, email')
    ;
    
  if (selectErr) {
    console.error("Error fetching users:", selectErr);
    return;
  }
  
  console.log(`Found ${users.length} mock users. Re-creating in Auth...`);

  for (const u of users) {
    // Attempt to delete if it exists to prevent errors
    await supabase.auth.admin.deleteUser(u.user_id);

    // Create user in Auth with the EXACT same UUID
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      id: u.user_id,
      email: u.email,
      password: '12345678',
      email_confirm: true
    });

    if (createErr) {
      console.error(`Failed to create ${u.email}:`, createErr.message);
    } else {
      console.log(`Successfully created ${u.email} (ID: ${u.user_id})`);
    }
  }

  // Cleanup test user
  await supabase.auth.admin.deleteUser('aaaa1111-aaaa-1111-aaaa-1111aaaa1111');
  
  console.log("DONE! You can now log in.");
}

fixAuth();
