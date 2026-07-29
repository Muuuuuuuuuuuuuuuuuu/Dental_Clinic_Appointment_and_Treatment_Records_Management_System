const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function main() {
  console.log("Fetching all mock users...");
  const { data: users, error } = await supabase.from('users').select('user_id, email, role');
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  console.log(`Found ${users.length} users. Registering them in Auth...`);
  
  for (const user of users) {
    if (!user.email) continue;
    let pass = "demo1234";
    if (user.role === 'ทันตแพทย์') pass = "doctor123";
    if (user.role === 'พนักงาน') pass = "staff123";
    if (user.role === 'admin') pass = "admin123";

    console.log(`Signing up ${user.email} ...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: pass
    });
    
    // Ignore error if user already exists
    if (authError && !authError.message.includes('already registered')) {
      console.error(`Error signing up ${user.email}:`, authError.message);
    } else {
      console.log(`Successfully configured ${user.email}`);
      // Update mock_password in users table
      await supabase.from('users').update({ mock_password: pass }).eq('user_id', user.user_id);
    }
  }
  console.log("Done seeding users.");
}

main();
