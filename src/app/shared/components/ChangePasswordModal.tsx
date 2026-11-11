import React, { useState } from "react";
import { X, Lock, KeyRound, ArrowLeft } from "lucide-react";
import {
  changePassword,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
} from "@/app/shared/api/authApi";
import { supabase } from "@/app/shared/api/supabaseClient";
import { getPasswordErrorMessage, PasswordChecklist } from "@/app/shared/utils/passwordPolicy";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

/**
 * 🔐 [SHARED COMPONENT] ป๊อปอัปเปลี่ยนรหัสผ่านผู้ใช้งาน (ใช้ร่วมกันทุกบทบาท: Admin, Dentist, Staff, Patient)
 * รองรับทั้ง:
 * 1. เปลี่ยนรหัสผ่านแบบปกติ (กรอกรหัสผ่านเดิม)
 * 2. ลืมรหัสผ่านเดิม (ขอรับรหัส OTP 6 หลักผ่านอีเมลที่ล็อกอินอยู่ได้ทันที ไม่ต้องสร้างระบบใหม่)
 */
export default function ChangePasswordModal({
  isOpen,
  onClose,
  title = "เปลี่ยนรหัสผ่าน",
}: ChangePasswordModalProps) {
  const [mode, setMode] = useState<"normal" | "otp">("normal");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [otpSentMsg, setOtpSentMsg] = useState("");

  if (!isOpen) return null;

  const handleResetState = () => {
    setMode("normal");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpCode("");
    setChangeError("");
    setOtpSentMsg("");
  };

  const handleClose = () => {
    handleResetState();
    onClose();
  };

  // 1. ส่งรหัส OTP ไปยังอีเมลของผู้ใช้งานที่ล็อกอินอยู่
  const handleRequestOtp = async () => {
    setIsChanging(true);
    setChangeError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("ไม่พบข้อมูลอีเมลของผู้ใช้งานที่ล็อกอินอยู่");
      setUserEmail(user.email);
      await sendPasswordResetOTP(user.email);
      setMode("otp");
      setOtpSentMsg(`ระบบส่งรหัส OTP 6 หลักไปยัง ${user.email} เรียบร้อยแล้ว`);
    } catch (err: any) {
      setChangeError(err.message || "ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsChanging(false);
    }
  };

  // 2. บันทึกรหัสผ่านใหม่ (รองรับทั้ง Normal Mode และ OTP Mode)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const pwError = getPasswordErrorMessage(newPassword);
    if (pwError) {
      setChangeError(pwError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setIsChanging(true);
    setChangeError("");

    try {
      if (mode === "normal") {
        if (!oldPassword) {
          setChangeError("กรุณากรอกรหัสผ่านเดิม");
          setIsChanging(false);
          return;
        }
        await changePassword(oldPassword, newPassword);
      } else {
        // โหมด OTP
        if (!otpCode || otpCode.trim().length !== 6) {
          setChangeError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
          setIsChanging(false);
          return;
        }
        await verifyPasswordResetOTP(userEmail, otpCode.trim());
        await resetPassword(userEmail, newPassword);
      }

      alert("เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว!");
      handleClose();
    } catch (err: any) {
      setChangeError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
        style={{ fontFamily: "Sarabun, sans-serif" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-[#FF8C9A]">
              {mode === "normal" ? <Lock size={16} /> : <KeyRound size={16} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A365D]">
                {mode === "normal" ? title : "รีเซ็ตรหัสผ่านด้วย OTP"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {changeError && (
          <div className="mb-3.5 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
            {changeError}
          </div>
        )}

        {otpSentMsg && mode === "otp" && (
          <div className="mb-3.5 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium border border-blue-100 leading-relaxed">
            {otpSentMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "normal" ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-700">
                  รหัสผ่านปัจจุบัน
                </label>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-[11px] text-[#FF8C9A] hover:underline font-semibold cursor-pointer"
                  title="กรณีจำรหัสผ่านเดิมไม่ได้ ให้ระบบส่ง OTP ไปที่อีเมล"
                >
                  ลืมรหัสผ่านเดิม?
                </button>
              </div>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-[#FF8C9A] focus:ring-2 focus:ring-[#FF8C9A]/20 transition-all bg-[#F8FAFC]"
                placeholder="••••••••"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                รหัส OTP 6 หลัก (จากอีเมล)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-base tracking-widest text-center font-bold font-mono focus:outline-hidden focus:border-[#FF8C9A] focus:ring-2 focus:ring-[#FF8C9A]/20 transition-all bg-[#F8FAFC]"
                placeholder="123456"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              รหัสผ่านใหม่
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setChangeError("");
              }}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-[#FF8C9A] focus:ring-2 focus:ring-[#FF8C9A]/20 transition-all bg-[#F8FAFC]"
              placeholder="ระบุรหัสผ่านอย่างน้อย 8 ตัว"
              required
            />
            <div className="mt-2">
              <PasswordChecklist password={newPassword} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-[#FF8C9A] focus:ring-2 focus:ring-[#FF8C9A]/20 transition-all bg-[#F8FAFC]"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            {mode === "otp" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("normal");
                  setChangeError("");
                }}
                disabled={isChanging}
                className="flex items-center justify-center gap-1 flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <ArrowLeft size={13} />
                <span>ใช้รหัสผ่านเดิม</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                disabled={isChanging}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                ยกเลิก
              </button>
            )}

            <button
              type="submit"
              disabled={isChanging}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity disabled:opacity-50 shadow-xs"
              style={{ backgroundColor: "#FF8C9A" }}
            >
              {isChanging ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
