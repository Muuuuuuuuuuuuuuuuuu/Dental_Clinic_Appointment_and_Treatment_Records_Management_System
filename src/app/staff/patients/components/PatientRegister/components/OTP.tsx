import React from "react";
import { AlertCircle, ChevronLeft, Mail, RefreshCw } from "lucide-react";

interface OTPProps {
  email: string;
  otp: string;
  setOtp: (val: string) => void;
  err: string;
  loading: boolean;
  resendCooldown: number;
  resendMsg: string;
  onBack: () => void;
  onResendOTP: () => void;
  onVerifyOTP: (code?: string) => void;
}

/**
 * [REGISTER STEP - OTP] หน้าจอยืนยันรหัส OTP ทางอีเมลคนไข้
 */
export function OTP({
  email,
  otp,
  setOtp,
  err,
  loading,
  resendCooldown,
  resendMsg,
  onBack,
  onResendOTP,
  onVerifyOTP,
}: OTPProps) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity"
        style={{ color: "#4A6080" }}
      >
        <ChevronLeft size={16} /> ย้อนกลับไปแก้ไขข้อมูล
      </button>

      <div className="text-center mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#F0F4F8" }}
        >
          <Mail size={28} style={{ color: "#FF8C9A" }} />
        </div>
        <h2
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          ยืนยันรหัส OTP ทางอีเมล
        </h2>
        <p className="text-base font-bold" style={{ color: "#1A365D" }}>
          {email}
        </p>
      </div>

      {err && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4"
          style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}
        >
          <AlertCircle size={15} /> {err}
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
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="XXXXXX"
          maxLength={6}
          autoFocus
          className="w-full px-4 py-4 rounded-xl border-2 text-center text-2xl tracking-[0.4em] font-bold outline-none transition-all"
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
        disabled={resendCooldown > 0}
        className="flex items-center gap-1.5 text-sm mx-auto mb-5 transition-all hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
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
        className="p-3.5 rounded-xl mb-5"
        style={{ backgroundColor: "#FFF3E0", border: "1px solid #FED7AA" }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
          ตรวจสอบอีเมล: หากไม่พบใน Inbox ให้ตรวจสอบในโฟลเดอร์{" "}
          <strong>จดหมายขยะ (Spam / Junk)</strong>
        </p>
      </div>

      <button
        type="button"
        onClick={() => onVerifyOTP()}
        disabled={loading || otp.length < 6}
        className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)",
          boxShadow: "0 4px 20px rgba(255,140,154,0.35)",
        }}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            กำลังตรวจสอบ...
          </>
        ) : (
          "ยืนยัน OTP และสร้างบัญชีคนไข้"
        )}
      </button>
    </div>
  );
}

export default OTP;

