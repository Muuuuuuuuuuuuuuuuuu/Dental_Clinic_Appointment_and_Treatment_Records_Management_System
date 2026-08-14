import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nxprzfqysdakgkequole.supabase.co';
const supabaseAnonKey = 'sb_publishable_BRzxitvWks04R5s-u6n-tQ_r-aCP1x-';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Attempting login...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'manee@example.com',
    password: 'patient123'
  });
  if (error) {
    console.error('Login Error:', error);
  } else {
    console.log('Login Success:', data.user.id);
  }
}

testLogin();
