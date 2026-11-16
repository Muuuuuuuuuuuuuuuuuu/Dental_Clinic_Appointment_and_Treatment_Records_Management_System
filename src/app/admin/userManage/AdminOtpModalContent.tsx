import React from "react";
import { AlertCircle, ChevronLeft, Mail, RefreshCw } from "lucide-react";

interface AdminOtpModalContentProps {
  email: string;
  roleLabel: string;
  otp: string;
  setOtp: (val: string) => void;
  error: string;
  loading: boolean;
  resendCooldown: number;
  resendMsg: string;
  onBack: () => void;
  onResendOTP: () => void;
  onVerifyOTP: () => void;
}

/**
 * 🔐 [ADMIN OTP MODAL CONTENT]
 * หน้าจอยืนยันรหัส OTP 6 หลักทางอีเมลภายใน Modal สำหรับแอดมินตอนเพิ่มบุคลากรใหม่
 */
export default function AdminOtpModalContent({
  email,
  roleLabel,
  otp,
  setOtp,
  error,
  loading,
  resendCooldown,
  resendMsg,
  onBack,
  onResendOTP,
  onVerifyOTP,
}: AdminOtpModalContentProps) {
  return (
    <div className="py-2 max-w-md mx-auto w-full">
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm mb-5 hover:opacity-70 transition-opacity cursor-pointer"
        style={{ color: "#4A6080" }}
      >
        <ChevronLeft size={16} /> ย้อนกลับไปแก้ไขข้อมูล
      </button>

      <div className="text-center mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: "#F0F4F8" }}
        >
          <Mail size={28} style={{ color: "#FF8C9A" }} />
        </div>
        <h3
          className="text-lg font-bold mb-1"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          ยืนยันรหัส OTP ทางอีเมล ({roleLabel})
        </h3>
        <p className="text-sm font-bold" style={{ color: "#1A365D" }}>
          {email}
        </p>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs mb-4 font-medium border border-rose-200"
          style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}
        >
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4">
        <label
          className="block text-xs font-semibold mb-2 text-center"
          style={{ color: "#4A6080" }}
        >
          รหัส OTP 6 หลัก
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
          }}
          placeholder="XXXXXX"
          maxLength={6}
          autoFocus
          className="w-full px-4 py-3.5 rounded-xl border-2 text-center text-2xl tracking-[0.4em] font-bold outline-none transition-all"
          style={{
            borderColor:
              otp.length === 6 ? "rgba(34,197,94,0.5)" : "rgba(26,54,93,0.15)",
            backgroundColor: "#FAFAFA",
            color: "#1A365D",
          }}
        />
      </div>

      {resendMsg && (
        <div
          className="flex items-center justify-center text-xs py-2 px-3 rounded-xl mb-3"
          style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}
        >
          {resendMsg}
        </div>
      )}

      <button
        type="button"
        onClick={onResendOTP}
        disabled={resendCooldown > 0 || loading}
        className="flex items-center gap-1.5 text-xs mx-auto mb-5 transition-all hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        style={{
          color: resendCooldown > 0 ? "#94A3B8" : "#FF8C9A",
          display: "flex",
        }}
      >
        <RefreshCw size={13} />
        {resendCooldown > 0
          ? `ส่งรหัสใหม่ได้ในอีก ${resendCooldown} วินาที`
          : "ส่งรหัส OTP ใหม่อีกครั้ง"}
      </button>

      <div
        className="p-3 rounded-xl mb-5"
        style={{ backgroundColor: "#FFF3E0", border: "1px solid #FED7AA" }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
          ตรวจสอบอีเมลของ{roleLabel}: หากไม่พบใน Inbox ให้ตรวจสอบในโฟลเดอร์{" "}
          <strong>จดหมายขยะ (Spam / Junk)</strong>
        </p>
      </div>

      <button
        type="button"
        onClick={onVerifyOTP}
        disabled={loading || otp.length < 6}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        style={{
          background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)",
          boxShadow: "0 4px 20px rgba(255,140,154,0.35)",
        }}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            กำลังยืนยันและบันทึกข้อมูลลง Supabase...
          </>
        ) : (
          `ยืนยัน OTP และบันทึกข้อมูล${roleLabel}`
        )}
      </button>
    </div>
  );
}
