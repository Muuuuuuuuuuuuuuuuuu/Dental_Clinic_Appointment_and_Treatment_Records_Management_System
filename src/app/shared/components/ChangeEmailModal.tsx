import React, { useState } from "react";
import { X, Mail } from "lucide-react";
import { changeEmail } from "@/app/shared/api/authApi";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 📧 [SHARED COMPONENT] ป๊อปอัปเปลี่ยนอีเมลผู้ใช้งาน (ใช้ร่วมกันทุกบทบาท: Admin, Dentist, Staff, Patient)
 */
export default function ChangeEmailModal({ isOpen, onClose }: ChangeEmailModalProps) {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentPassword) {
      setEmailMessage({ type: "error", text: "กรุณากรอกรหัสผ่านปัจจุบันเพื่อความปลอดภัย" });
      return;
    }
    if (!newEmail || !newEmail.includes("@")) {
      setEmailMessage({ type: "error", text: "กรุณากรอกอีเมลให้ถูกต้อง" });
      return;
    }

    try {
      setEmailLoading(true);
      setEmailMessage(null);

      await changeEmail(currentPassword, newEmail);

      setEmailMessage({
        type: "success",
        text: "ระบบได้ส่งลิงก์ยืนยันไปที่อีเมลใหม่และอีเมลเดิมแล้ว กรุณาคลิกยืนยันเพื่อเสร็จสิ้นขั้นตอน",
      });
      setTimeout(() => {
        onClose();
        setNewEmail("");
        setCurrentPassword("");
        setEmailMessage(null);
      }, 3000);
    } catch (err: any) {
      setEmailMessage({
        type: "error",
        text: err.message || "เกิดข้อผิดพลาดในการเปลี่ยนอีเมล",
      });
    } finally {
      setEmailLoading(false);
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
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2B6CB0]">
              <Mail size={16} />
            </div>
            <h3 className="text-base font-bold text-[#1A365D]">เปลี่ยนอีเมล</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {emailMessage && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-medium border ${
              emailMessage.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {emailMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              รหัสผ่านปัจจุบัน
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-[#FF8C9A] focus:ring-2 focus:ring-[#FF8C9A]/20 transition-all bg-[#F8FAFC]"
              placeholder="กรอกรหัสผ่านเพื่อยืนยันตัวตน"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              อีเมลใหม่
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-[#FF8C9A] focus:ring-2 focus:ring-[#FF8C9A]/20 transition-all bg-[#F8FAFC]"
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={emailLoading}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={emailLoading}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity disabled:opacity-50 shadow-xs"
              style={{ backgroundColor: "#FF8C9A" }}
            >
              {emailLoading ? "กำลังส่งคำขอ..." : "ยืนยัน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

