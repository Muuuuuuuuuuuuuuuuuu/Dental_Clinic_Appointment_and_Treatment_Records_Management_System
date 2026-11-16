import { createClient } from '@supabase/supabase-js';

// ============================================================================================
// กุญแจเชื่อมต่อระบบ Supabase (Client Connection Setup - Singleton)
// อ่าน URL, Anon Key และ Service Role Key จากตัวแปรแวดล้อม (.env.local)
// ============================================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// 1. Client ทั่วไปสำหรับงานในคลินิก (ใช้ Anon Key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Client สิทธิ์ผู้ดูแลระบบ สำหรับสร้างผู้ใช้ใหม่/จัดการ Auth (ใช้ Service Role Key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

