import React from "react";
import { CheckCircle, Copy, Eye, EyeOff, Mail } from "lucide-react";
import { SuccessInfo } from "../hooks/usePatientRegister";

interface RegisterDoneStepProps {
  successInfo: SuccessInfo;
  showPass: boolean;
  setShowPass: React.Dispatch<React.SetStateAction<boolean>>;
  copied: "email" | "pass" | null;
  copyText: (text: string, type: "email" | "pass") => void;
  resetForm: () => void;
}

/**
 * 🎉 [REGISTER STEP - DONE] หน้าจอแสดงข้อมูลล็อกอินเมื่อลงทะเบียนสำเร็จ
 */
export function RegisterDoneStep({
  successInfo,
  showPass,
  setShowPass,
  copied,
  copyText,
  resetForm,
}: RegisterDoneStepProps) {
  return (
    <div className="max-w-lg mx-auto py-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
      <div
        className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg,#4ade80,#22c55e)" }}
      >
        <CheckCircle size={40} color="white" />
      </div>
      <h2
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        ลงทะเบียนสำเร็จ!
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        <strong className="text-gray-700">{successInfo.name}</strong>{" "}
        ถูกเพิ่มเข้าระบบและยืนยันอีเมลเรียบร้อยแล้ว
      </p>

      <div
        className="rounded-2xl p-5 mb-6 text-left space-y-4"
        style={{ backgroundColor: "#F8FAFC", border: "1.5px dashed #CBD5E1" }}
      >
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Mail size={16} style={{ color: "#FF8C9A" }} />
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "#1A365D" }}
          >
            ข้อมูลสำหรับเข้าสู่ระบบของคนไข้ (Login Credentials)
          </p>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: "#4A6080" }}>
          คนไข้จะใช้ <strong>อีเมล</strong> และ <strong>รหัสผ่าน</strong>{" "}
          ด้านล่างนี้ในการเข้าสู่ระบบที่หน้าเว็บ (ระบบใช้การเข้าสู่ระบบด้วยอีเมล ไม่ใช่เบอร์โทรศัพท์):
        </p>

        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>
            อีเมลเข้าสู่ระบบ (Username)
          </p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 text-sm font-mono font-semibold px-3 py-2 rounded-xl bg-white border"
              style={{
                borderColor: "#E2E8F0",
                color: "#1A365D",
                wordBreak: "break-all",
              }}
            >
              {successInfo.loginEmail}
            </code>
            <button
              onClick={() => copyText(successInfo.loginEmail, "email")}
              className="flex-shrink-0 p-2 rounded-xl transition-colors"
              title="คัดลอกอีเมล"
              style={{
                backgroundColor: copied === "email" ? "#DCFCE7" : "#F1F5F9",
                color: copied === "email" ? "#16A34A" : "#64748B",
              }}
            >
              {copied === "email" ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>
            รหัสผ่านเข้าสู่ระบบ (Password)
          </p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 text-sm font-mono font-semibold px-3 py-2 rounded-xl bg-white border"
              style={{ borderColor: "#E2E8F0", color: "#1A365D" }}
            >
              {showPass
                ? successInfo.loginPassword
                : "•".repeat(successInfo.loginPassword.length)}
            </code>
            <button
              onClick={() => setShowPass((p) => !p)}
              className="flex-shrink-0 p-2 rounded-xl transition-colors"
              title={showPass ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={() => copyText(successInfo.loginPassword, "pass")}
              className="flex-shrink-0 p-2 rounded-xl transition-colors"
              title="คัดลอกรหัสผ่าน"
              style={{
                backgroundColor: copied === "pass" ? "#DCFCE7" : "#F1F5F9",
                color: copied === "pass" ? "#16A34A" : "#64748B",
              }}
            >
              {copied === "pass" ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: "#94A3B8" }}>
            แจ้งให้คนไข้ทราบ: เข้าสู่ระบบด้วยอีเมลและรหัสผ่านเริ่มต้นนี้ เมื่อเข้าสู่ระบบครั้งแรก ระบบจะให้คนไข้เปลี่ยนรหัสผ่านใหม่ด้วยตนเอง
          </p>
        </div>
      </div>

      <button
        onClick={resetForm}
        className="w-full px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
      >
        เพิ่มคนไข้รายอื่น
      </button>
    </div>
  );
}

export default RegisterDoneStep;

