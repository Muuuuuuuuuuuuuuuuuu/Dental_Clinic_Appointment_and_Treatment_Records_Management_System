import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ChevronLeft, KeyRound } from "lucide-react";
import AuthShell, { Field } from "./AuthShell";
import { inputCls, inputStyle } from "../types";
import { supabase } from "../../shared/supabaseApi";

interface FirstTimePasswordPageProps {
  userEmail?: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function FirstTimePasswordPage({
  userEmail,
  onSuccess,
  onBack,
}: FirstTimePasswordPageProps) {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // บันทึกการตั้งรหัสผ่านใหม่สำหรับการเข้าใช้งานครั้งแรก
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPass || !confirmPass) {
      setError("กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่านให้ครบถ้วน");
      return;
    }

    if (newPass.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPass === "123456789") {
      setError("กรุณาตั้งรหัสผ่านใหม่ที่ไม่ซ้ำกับรหัสผ่านเริ่มต้น (123456789)");
      return;
    }

    if (newPass !== confirmPass) {
      setError("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPass,
        data: {
          must_change_password: false,
          password_changed: true,
          password_changed_at: new Date().toISOString(),
        },
      });

      if (updateErr) {
        throw new Error("ไม่สามารถตั้งรหัสผ่านใหม่ได้: " + updateErr.message);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="เปลี่ยนรหัสผ่านสำหรับการเข้าใช้งานครั้งแรก"
      sub="กรุณาตั้งรหัสผ่านใหม่แทนรหัสผ่านเริ่มต้นเพื่อความปลอดภัยของบัญชี"
    >
      {/* ส่วนหัวแสดงไอคอนและคำแนะนำ */}
      <div className="flex flex-col items-center mb-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
          style={{ background: "linear-gradient(135deg, #FFF0F3 0%, #F0F4F8 100%)" }}
        >
          <KeyRound size={28} style={{ color: "#FF6B7E" }} />
        </div>
        <h3 className="text-base font-semibold text-center" style={{ color: "#1A365D" }}>
          กำหนดรหัสผ่านส่วนตัวของคุณ
        </h3>
        {userEmail && (
          <p className="text-xs mt-1" style={{ color: "#4A6080" }}>
            บัญชีผู้ใช้: <strong>{userEmail}</strong>
          </p>
        )}
      </div>

      <div
        className="p-3.5 rounded-xl mb-4 text-xs leading-relaxed"
        style={{ backgroundColor: "#F0F4F8", color: "#4A6080", border: "1px solid rgba(26,54,93,0.1)" }}
      >
        เนื่องจากคุณเข้าสู่ระบบด้วยรหัสผ่านเริ่มต้นที่พนักงานกำหนดให้ (123456789)
        ระบบจึงกำหนดให้คุณตั้งรหัสผ่านใหม่ด้วยตนเองก่อนเข้าใช้งานระบบ
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}
          >
            <AlertCircle size={15} className="flex-shrink-0" /> {error}
          </div>
        )}

        <Field label="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)">
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
            <input
              type={showNewPass ? "text" : "password"}
              placeholder="กรอกรหัสผ่านใหม่"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className={`${inputCls} pl-10 pr-10`}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "#4A6080" }}
            >
              {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <Field label="ยืนยันรหัสผ่านใหม่">
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
            <input
              type={showConfirmPass ? "text" : "password"}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className={`${inputCls} pl-10 pr-10`}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "#4A6080" }}
            >
              {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl font-medium transition-all hover:opacity-80"
            style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#1A365D" }}
          >
            <span className="flex items-center justify-center gap-1">
              <ChevronLeft size={14} /> ออกจากระบบ
            </span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)",
              boxShadow: "0 4px 20px rgba(255,140,154,0.4)",
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <CheckCircle2 size={15} />
              {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
            </span>
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

