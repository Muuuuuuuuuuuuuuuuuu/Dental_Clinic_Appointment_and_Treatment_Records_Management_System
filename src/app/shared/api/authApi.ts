import { createClient } from '@supabase/supabase-js';
import { getPatientProfileByUserId } from '../supabaseApi';
import { supabase } from '../utils/supabaseClient';
import { sendOTPEmail } from '../utils/emailService';
import { RegForm } from '../../patient/types';

/**
 * ?? Auth API Module
 * �Ѵ����к��׹�ѹ��ǵ�, ��͡�Թ, ��Ѥ���Ҫԡ, OTP, ������ʼ�ҹ
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  // 1. �֧ email �ͧ���������͡�Թ����
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error("��辺�����ż��������͡�Թ����");

  // 2. ���ͺ��͡�Թ�������ʼ�ҹ��������׹�ѹ��ǵ�
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });
  if (verifyErr) throw new Error("���ʼ�ҹ������١��ͧ");

  // 3. ����¹���ʼ�ҹ����������
  const { error: updateErr } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (updateErr) throw new Error("�������ö����¹���ʼ�ҹ��: " + updateErr.message);

  return true;
}

export async function changeEmail(currentPassword: string, newEmail: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error("��辺�����ż��������͡�Թ����");

  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });
  if (verifyErr) throw new Error("���ʼ�ҹ���١��ͧ");

  const { error: updateErr } = await supabase.auth.updateUser({
    email: newEmail
  });
  if (updateErr) throw new Error("�������ö����¹�������: " + updateErr.message);

  const { error: profileErr } = await supabase.from('patients').update({ email: newEmail }).eq('user_id', user.id);
  if (profileErr) console.warn("Failed to update email in patients table", profileErr);

  return true;
}

export async function loginPatient(email: string, pass: string) {
  // Use real Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: pass
  });

  if (authError || !authData.user) {
    throw new Error("������������ʼ�ҹ���١��ͧ");
  }

  // Get user profile using the authenticated user id
  const profile = await getPatientProfileByUserId(authData.user.id);
  if (!profile) {
    // If not a patient, they might be a staff/admin. We still return something so AuthShell knows login succeeded.
    // In a full implementation, we'd fetch staff profile here.
    return { email: authData.user.email };
  }
  return profile;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const { data } = await supabase.from('users').select('user_id').eq('email', email);
  return data !== null && data.length > 0;
}
export async function requestRegistrationOTP(form: RegForm) {
  // Use real Supabase Auth signup (sends confirmation email with OTP if configured)
  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
  });
  if (error) throw error;

  // Supabase returns an empty identities array if the user already exists
  // to prevent email enumeration, but in this case we want to tell the user
  if (data?.user?.identities && data.user.identities.length === 0) {
    throw new Error("อีเมลนี้ได้ลงทะเบียนไว้แล้ว โปรดเข้าสู่ระบบ หรือใช้อีเมลอื่น (หากกำลังทดสอบ โปรดลบยูสเซอร์เก่าใน Supabase ก่อน)");
  }

  return true;
}
export async function resendOTP(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email
  });
  if (error) {
    // Supabase Free Tier จำกัดการส่งอีเมล 2 ครั้ง/ชั่วโมง
    if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
      throw new Error('ส่งรหัสได้เกินกำหนดแล้ว (สูงสุด 2 ครั้ง/ชั่วโมง) กรุณารอสักครู่แล้วลองใหม่');
    }
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      throw new Error('ไม่พบบัญชีที่รอยืนยัน กรุณาเริ่มสมัครสมาชิกใหม่');
    }
    throw new Error(error.message || 'ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่อีกครั้ง');
  }
  return true;
}
export async function verifyOTP(email: string, otp: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'signup'
  });
  if (error) throw error;
  return true;
}

export async function cancelRegistration() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      const adminAuthClient = createClient(
        import.meta.env.VITE_SUPABASE_URL || '',
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      );
      await adminAuthClient.auth.admin.deleteUser(user.id);
    } catch (e) {
      console.error("Failed to delete user on cancel", e);
    }
  }
  await supabase.auth.signOut();
}

export async function savePatientData(form: RegForm) {
  // Get the authenticated user (since they just verified OTP)
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("ไม่พบข้อมูลผู้ใช้ที่ยืนยันตัวตนแล้ว กรุณาเข้าสู่ระบบใหม่");

  const userId = user.id;
  const cleanIdCard = form.idCard.replace(/-/g, "");

  // gender ต้องเป็น 'ชาย' หรือ 'หญิง' เท่านั้น (ตาม CHECK constraint)
  const validGender = (form.gender === 'ชาย' || form.gender === 'หญิง') ? form.gender : null;
  // Check if old user exists by citizen_id (for Account Linking)
  const { data: oldUser } = await supabase.from('users').select('user_id').eq('citizen_id', cleanIdCard).maybeSingle();

  // Upsert into Profile (handles case where trigger may have already created a record)
  const { error: pErr } = await supabase.from('profile').upsert({
    citizen_id: cleanIdCard,
    first_name: form.firstName,
    last_name: form.lastName,
    phone_number: form.phone || null,
    gender: validGender,
    birth_date: form.dob || null,
    current_address: form.address || null
  }, { onConflict: 'citizen_id' });
  if (pErr) throw new Error(`ข้อผิดพลาดบันทึกข้อมูลส่วนตัว: ${pErr.message}`);

  // Upsert into Users (handles case where auth trigger may have created the row)
  const { error: uErr } = await supabase.from('users').upsert({
    user_id: userId,
    citizen_id: cleanIdCard,
    email: form.email,
    role: 'คนไข้',
    account_status: 'active'
  }, { onConflict: 'user_id' });
  if (uErr) throw new Error(`ข้อผิดพลาดบันทึกข้อมูลบัญชี: ${uErr.message}`);

  let returnedPatientId: number;

  if (oldUser && oldUser.user_id !== userId) {
    // ACCOUNT LINKING: They walked in before (mock ID), now they registered online
    const { data: linkedPat } = await supabase.from('patient').update({ user_id: userId }).eq('user_id', oldUser.user_id).select('patient_id').maybeSingle();
    if (linkedPat) {
      returnedPatientId = linkedPat.patient_id;
    } else {
      const { data: patData } = await supabase.from('patient').insert({ user_id: userId }).select('patient_id').single();
      returnedPatientId = patData.patient_id;
    }
    // Keep db clean
    await supabase.from('users').delete().eq('user_id', oldUser.user_id);
  } else {
    // Normal Check if patient record already exists before inserting
    const { data: existingPatient } = await supabase
      .from('patient')
      .select('patient_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingPatient) {
      // Insert into Patient only if it doesn't exist yet
      const { data: patData, error: patErr } = await supabase.from('patient').insert({
        user_id: userId
      }).select('patient_id').single();

      if (patErr) throw new Error(`ข้อผิดพลาดบันทึกข้อมูลคนไข้: ${patErr.message}`);
      returnedPatientId = patData.patient_id;
    } else {
      // Patient already exists, we use its ID
      returnedPatientId = existingPatient.patient_id;
    }
  }

  // Update Emergency Contact
  if (form.emergencyName || form.emergencyPhone) {
    await supabase.from('emergency_contact').delete().eq('patient_id', returnedPatientId);
    await supabase.from('emergency_contact').insert({
      patient_id: returnedPatientId,
      contact_name: form.emergencyName || '-',
      contact_phone: form.emergencyPhone || '-',
      relationship: form.emergencyRelationship || 'ไม่ได้ระบุ'
    });
  }

  // Update Allergy & Disease
  if (form.allergies && form.allergies !== 'ไม่มี' && form.allergies !== 'ไม่มีประวัติ' && form.allergies !== '-') {
    await supabase.from('patient_allergy').delete().eq('patient_id', returnedPatientId);
    const allergies = form.allergies.split(',').map(s => s.trim()).filter(s => s);
    for (const a of allergies) {
      await supabase.from('patient_allergy').insert({ patient_id: returnedPatientId, allergy_name: a });
    }
  }

  if (form.conditions && form.conditions !== 'ไม่มี' && form.conditions !== 'ไม่มีประวัติ' && form.conditions !== '-') {
    await supabase.from('patient_disease').delete().eq('patient_id', returnedPatientId);
    const diseases = form.conditions.split(',').map(s => s.trim()).filter(s => s);
    for (const d of diseases) {
      await supabase.from('patient_disease').insert({ patient_id: returnedPatientId, disease_name: d });
    }
  }


  return returnedPatientId;
}

// --- Dentist History ---

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

