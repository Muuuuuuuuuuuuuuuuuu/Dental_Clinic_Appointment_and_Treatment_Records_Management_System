'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// We must use the service role key to use the admin API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create supabase client with service role key (only for local dev syncing)
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export default function SeedAuthPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
    console.log(msg);
  };

  const handleSync = async () => {
    setLoading(true);
    setLogs([]);
    addLog('🚀 เริ่มต้นการสร้างบัญชี Auth...');

    try {
      // 1. ดึงข้อมูลผู้ใช้จาก public.users
      addLog('กำลังดึงข้อมูลจากตาราง public.users...');
      const { data: publicUsers, error: fetchError } = await supabase
        .from('users')
        .select('user_id, email, role, profile(first_name, last_name)');

      if (fetchError) throw fetchError;
      
      addLog(`พบข้อมูลผู้ใช้ทั้งหมด ${publicUsers.length} คน`);

      // 2. ลูปสร้างบัญชี
      for (const u of publicUsers) {
        let password = 'password123';
        if (u.role === 'คนไข้') password = 'patient123';
        if (u.role === 'ทันตแพทย์') password = 'doctor123';
        if (u.role === 'พนักงาน') password = 'staff123';
        if (u.role === 'admin') password = 'admin123';

        addLog(`⏳ กำลังแก้ไขรหัสผ่านให้ ${u.email}...`);

        const { error: authError } = await supabase.auth.admin.updateUserById(u.user_id, {
          password: password,
          email_confirm: true,
          user_metadata: { role: u.role }
        });

        if (authError) {
          addLog(`❌ แก้ไข ${u.email} ไม่สำเร็จ: ${authError.message}`);
        } else {
          addLog(`✅ แก้ไขรหัสผ่าน ${u.email} สำเร็จ!`);
        }
      }

      addLog('🎉 เสร็จสิ้นกระบวนการ! คุณสามารถไปที่หน้าล็อกอินได้เลยครับ');
    } catch (err: any) {
      addLog(`❌ เกิดข้อผิดพลาดร้ายแรง: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-5 text-blue-800">เครื่องมือสร้างบัญชี Auth จำลอง</h1>
      <p className="mb-5 text-gray-600">
        กดปุ่มด้านล่างเพื่อทำการดึงรายชื่อจากตาราง <code className="bg-gray-100 p-1 rounded">public.users</code> และสร้างบัญชีสำหรับล็อกอินในระบบ <code className="bg-gray-100 p-1 rounded">auth.users</code> อย่างถูกต้องตามมาตรฐานของ Supabase
      </p>
      
      <button 
        onClick={handleSync} 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow disabled:opacity-50 transition-all"
      >
        {loading ? 'กำลังทำงาน...' : 'เริ่มสร้างบัญชีล็อกอินทั้งหมด'}
      </button>

      <div className="mt-8 bg-black text-green-400 p-6 rounded-lg font-mono text-sm h-96 overflow-y-auto">
        {logs.length === 0 ? <span className="text-gray-500">รอคำสั่ง...</span> : null}
        {logs.map((log, i) => (
          <div key={i} className="mb-1">{log}</div>
        ))}
      </div>
    </div>
  );
}
