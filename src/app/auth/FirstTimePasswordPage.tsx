import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, ChevronLeft, Check } from "lucide-react";
import AuthShell, { Field, inputCls, inputStyle } from "./AuthShell";
import { supabase } from "@/app/shared/supabaseApi";
import { getPasswordErrorMessage, PasswordChecklist } from "@/app/shared/utils/passwordPolicy";

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

    const pwError = getPasswordErrorMessage(newPass);
    if (pwError) {
      setError(pwError);
      return;
    }

    const defaultPasswords = ["123456789", "patient123", "password123", "admin123", "staff123"];
    if (defaultPasswords.includes(newPass)) {
      setError("กรุณาตั้งรหัสผ่านใหม่ที่ไม่ซ้ำกับรหัสผ่านเริ่มต้นของระบบ");
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
      title="ตั้งรหัสผ่านใหม่"
      sub={
        userEmail
          ? `สำหรับการเข้าใช้งานครั้งแรก (${userEmail})`
          : "กรุณาตั้งรหัสผ่านใหม่แทนรหัสผ่านเริ่มต้นเพื่อความปลอดภัยของบัญชี"
      }
    >

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}
          >
            <AlertCircle size={15} className="flex-shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-2">
          <Field label="รหัสผ่านใหม่">
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
              <input
                type={showNewPass ? "text" : "password"}
                placeholder="ระบุรหัสผ่านอย่างน้อย 8 ตัว"
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

          <PasswordChecklist password={newPass} />
        </div>

        <div className="space-y-2">
          <Field label="ยืนยันรหัสผ่าน">
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
              <input
                type={showConfirmPass ? "text" : "password"}
                placeholder="ระบุรหัสผ่านอีกครั้ง"
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

          <div className="pt-1 pb-0.5">
            <div
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{
                color: !confirmPass
                  ? "#64748B"
                  : newPass === confirmPass
                    ? "#16A34A"
                    : "#EF4444",
              }}
            >
              {!confirmPass ? (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mx-0.5"
                  style={{ backgroundColor: "#CBD5E1" }}
                />
              ) : newPass === confirmPass ? (
                <Check size={12} strokeWidth={2.5} className="flex-shrink-0" />
              ) : (
                <AlertCircle size={12} className="flex-shrink-0" />
              )}
              <span>
                {!confirmPass || newPass === confirmPass
                  ? "รหัสผ่านตรงกัน"
                  : "รหัสผ่านไม่ตรงกัน"}
              </span>
            </div>
          </div>
        </div>

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
            {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

