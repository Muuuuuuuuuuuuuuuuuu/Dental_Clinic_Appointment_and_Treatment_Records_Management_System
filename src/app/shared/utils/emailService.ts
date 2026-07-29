// ============================================================================
// EmailJS Service — ส่งอีเมลจริงผ่าน EmailJS
// ============================================================================
import emailjs from '@emailjs/browser';

// อ่าน config จาก .env.local
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

/**
 * ส่ง OTP ไปยังอีเมลจริงผ่าน EmailJS
 * @param toEmail - อีเมลผู้รับ
 * @param otpCode - รหัส OTP 6 หลัก
 */
export async function sendOTPEmail(toEmail: string, otpCode: string): Promise<void> {
  // ตรวจสอบว่ามี config ครบหรือไม่
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error("EmailJS config missing! กรุณาตั้งค่า VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY ใน .env.local");
    throw new Error("ระบบส่งอีเมลยังไม่ได้ตั้งค่า กรุณาติดต่อผู้ดูแลระบบ");
  }

  try {
    // ส่งอีเมลผ่าน EmailJS
    // ตัวแปรใน template: {{to_email}}, {{otp_code}}, {{clinic_name}}
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: toEmail,
      otp_code: otpCode,
      clinic_name: "คลินิกสุภัทร (Suphat Clinic)",
      message: `รหัส OTP สำหรับรีเซ็ตรหัสผ่านของคุณคือ: ${otpCode} (หมดอายุใน 10 นาที)`,
    }, PUBLIC_KEY);

    console.log("EmailJS sent successfully:", result.status, result.text);
  } catch (err: any) {
    console.error("EmailJS send error:", err);
    throw new Error("ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง");
  }
}
