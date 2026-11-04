import { createClient } from '@supabase/supabase-js';

// ============================================================================
// กุญแจเชื่อมต่อระบบ Supabase (Client Connection Setup)
// อ่าน URL และ Anon Key จากตัวแปรแวดล้อม (.env.local)
// ============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
