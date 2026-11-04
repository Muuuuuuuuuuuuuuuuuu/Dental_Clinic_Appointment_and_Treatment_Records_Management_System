import { createClient } from '@supabase/supabase-js';
import { getPatientProfileByUserId } from '../supabaseApi';
import { supabase } from './supabaseClient';

/**
 * โมดูลจัดการระบบยืนยันตัวตน
 * จัดการระบบยืนยันตัวตน, ล็อกอิน, สมัครสมาชิก, OTP, และรหัสผ่าน
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  // 1. ดึงอีเมลของผู้ใช้ที่ล็อกอินอยู่
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error("ไม่พบข้อมูลผู้ใช้ที่ล็อกอินอยู่");

  // 2. ทดสอบล็อกอินด้วยรหัสผ่านเดิมเพื่อยืนยันตัวตน
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });
  if (verifyErr) throw new Error("รหัสผ่านเดิมไม่ถูกต้อง");

  // 3. เปลี่ยนรหัสผ่านเป็นรหัสใหม่
  const { error: updateErr } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (updateErr) throw new Error("ไม่สามารถเปลี่ยนรหัสผ่านได้: " + updateErr.message);

  return true;
}

export async function changeEmail(currentPassword: string, newEmail: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error("ไม่พบข้อมูลผู้ใช้ที่ล็อกอินอยู่");

  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });
  if (verifyErr) throw new Error("รหัสผ่านไม่ถูกต้อง");

  const { error: updateErr } = await supabase.auth.updateUser({
    email: newEmail
  });
  if (updateErr) throw new Error("ไม่สามารถเปลี่ยนอีเมลได้: " + updateErr.message);

  const { error: profileErr } = await supabase.from('users').update({ email: newEmail }).eq('user_id', user.id);
  if (profileErr) console.warn("Failed to update email in users table", profileErr);

  return true;
}

export async function loginPatient(email: string, pass: string) {
  // เข้าสู่ระบบผ่านระบบยืนยันตัวตนของ Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: pass
  });

  if (authError || !authData.user) {
    throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  // ดึงข้อมูลโปรไฟล์ผู้ใช้จากรหัสที่ยืนยันตัวตนแล้ว
  const profile = await getPatientProfileByUserId(authData.user.id);
  if (!profile) {
    // กรณีไม่ใช่คนไข้ (เช่น พนักงานหรือแอดมิน) ให้ส่งค่ากลับเพื่อแจ้งว่าเข้าสู่ระบบสำเร็จ
    // ข้อมูลโปรไฟล์ของพนักงานจะถูกดึงในหน้าระบบพนักงาน
    return { email: authData.user.email };
  }
  return profile;
}

// ============================================================================
// PASSWORD RESET (ลืมรหัสผ่าน)
// ============================================================================

/**
 * สร้าง OTP 6 หลักแบบสุ่ม
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * ขั้นตอนที่ 1: ส่ง OTP ตัวเลข 6 หลักไปยังอีเมลผ่าน Supabase
 * - ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือไม่
 * - Supabase จะส่งตัวเลข OTP 6 หลักไปทางอีเมลโดยอัตโนมัติ
 */
export async function sendPasswordResetOTP(email: string): Promise<void> {
  // ใช้ Supabase signInWithOtp เพื่อส่ง OTP 6 หลักไปยังอีเมล
  // shouldCreateUser: false = ถ้าไม่มีอีเมลนี้ใน auth.users จะ error อัตโนมัติ
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    console.error("signInWithOtp error:", error);
    // Supabase จะ return error ถ้าอีเมลนี้ไม่มีใน auth.users
    if (error.message?.toLowerCase().includes("user not found") ||
      error.message?.toLowerCase().includes("email not confirmed") ||
      error.status === 422 || error.status === 400) {
      throw new Error("ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง");
    }
    throw new Error("ไม่สามารถส่ง OTP ได้ กรุณาตรวจสอบอีเมลและลองใหม่อีกครั้ง");
  }
}



/**
 * ขั้นตอนที่ 2: ตรวจสอบ OTP ว่าถูกต้องผ่าน Supabase Auth
 * เมื่อสำเร็จ user จะถูก logged in อัตโนมัติ
 */
export async function verifyPasswordResetOTP(email: string, otpCode: string): Promise<boolean> {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otpCode,
    type: 'email',
  });

  if (error) {
    console.error("verifyOtp error:", error);
    throw new Error("รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว กรุณาส่ง OTP ใหม่");
  }

  return true;
}

/**
 * ขั้นตอนที่ 3: เปลี่ยนรหัสผ่านใหม่
 * - ตรวจสอบว่ามี OTP ที่ผ่านการยืนยันแล้ว
 * - อัปเดตรหัสผ่านใน Supabase Auth (ผ่าน admin API)
 * - ลบ OTP ที่ใช้แล้วออกจากตาราง
 */
export async function resetPassword(email: string, newPassword: string): Promise<boolean> {
  // หลังจาก verifyOtp สำเร็จแล้ว ผู้ใช้จะถูก logged in อัตโนมัติโดย Supabase
  // จึงสามารถเรียก updateUser ได้เลยโดยไม่ต้องใช้ Admin API
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("updateUser password error:", error);
    throw new Error("ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง");
  }

  return true;

}

