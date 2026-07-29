import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ChevronLeft, RefreshCw, UserPlus } from "lucide-react";
import AuthShell, { Field } from "./AuthShell";
import { UserRole, PatientUser, ROLE_TABS, inputCls, inputStyle } from "../types";
import { loginPatient, supabase } from "../../shared/supabaseApi";

export default function LoginPage({
  onLogin, onLoginRole, onRegister, onForgotPassword, onBack,
}: {
  onLogin: (u: PatientUser) => void;
  onLoginRole: (role: UserRole, email?: string) => void;
  onRegister: () => void;
  onForgotPassword: () => void;
  onBack: () => void;
}) {
  const [activeRole, setActiveRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentTab = ROLE_TABS.find(t => t.key === activeRole)!;

  const fillDemo = (demo: {label: string, email: string, pass: string}) => {
    setEmail(demo.email);
    setPass(demo.pass);
    setError("");
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    setEmail("");
    setPass("");
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !pass) { setError("กรุณากรอกอีเมลและรหัสผ่าน"); return; }
    setLoading(true);

    // 1. ลอง Login กับ Database
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
      
      if (authError || !authData.user) {
        throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }

      if (activeRole === "patient") {
        const profile = await loginPatient(email, pass) as any;
        // แปลงกลับเป็น PatientUser format (สำหรับ UI เก่า)
        onLogin({
          patientId: profile.patientId,
          idCard: profile.idCard,
          firstName: profile.firstName,
          lastName: profile.lastName,
          dob: profile.dob,
          gender: profile.gender,
          phone: profile.phone,
          email: email,
          emergencyName: profile.emergencyName,
          emergencyPhone: profile.emergencyPhone,
          conditions: profile.conditions,
          allergies: profile.allergies
        });
      } else {
        // สำหรับ Role อื่นๆ ผ่าน auth แล้ว ก็เปลี่ยนหน้าได้เลย
        onLoginRole(activeRole, email);
      }
    } catch (err: any) {
      setError(err.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="เข้าสู่ระบบ" sub="เลือกประเภทผู้ใช้งานและกรอกข้อมูลเพื่อเข้าสู่ระบบ">
      {/* Role tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl mb-6" style={{ backgroundColor: "#F0F4F8" }}>
        {ROLE_TABS.map(tab => {
          const active = tab.key === activeRole;
          return (
            <button key={tab.key} type="button" onClick={() => switchRole(tab.key)}
              className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: active ? "white" : "transparent",
                color: active ? "#1A365D" : "#4A6080",
                boxShadow: active ? "0 1px 6px rgba(26,54,93,0.1)" : "none",
              }}>
              <tab.icon size={16} style={{ color: active ? "#FF8C9A" : "#4A6080" }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <Field label="อีเมล">
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
            <input type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)}
              className={`${inputCls} pl-10`} style={inputStyle} />
          </div>
        </Field>
        <Field label="รหัสผ่าน">
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
            <input type={showPass ? "text" : "password"} placeholder="กรอกรหัสผ่าน" value={pass} onChange={e => setPass(e.target.value)}
              className={`${inputCls} pl-10 pr-10`} style={inputStyle} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#4A6080" }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
              className="w-4 h-4 rounded" style={{ accentColor: "#FF8C9A" }} />
            จดจำการเข้าสู่ระบบ
          </label>
          {activeRole === "patient" && (
            <button type="button" onClick={onForgotPassword} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "#FF8C9A" }}>
              ลืมรหัสผ่าน?
            </button>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 mt-2"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 4px 20px rgba(255,140,154,0.4)" }}>
          {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
        </button>

        {/* Demo credentials hint */}
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-xs text-center text-gray-500 mb-1">ลองใช้งานด้วยบัญชีตัวอย่าง (คลิกเพื่อกรอกอัตโนมัติ)</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {currentTab.demos.map((demo, idx) => (
              <button key={idx} type="button" onClick={() => fillDemo(demo)}
                className="py-1.5 px-3 rounded-full text-xs transition-all hover:opacity-80 flex items-center gap-1.5"
                style={{ backgroundColor: "#F0F4F8", color: "#4A6080", border: "1px solid #E2E8F0" }}>
                <RefreshCw size={11} />
                {demo.label}
              </button>
            ))}
          </div>
        </div>
      </form>

      {activeRole === "patient" && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "rgba(26,54,93,0.1)" }} /></div>
            <div className="relative flex justify-center"><span className="text-xs px-3 bg-white" style={{ color: "#4A6080" }}>ยังไม่มีบัญชี?</span></div>
          </div>
          <button onClick={onRegister}
            className="w-full py-3.5 rounded-xl font-semibold transition-all hover:opacity-80"
            style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#1A365D" }}>
            <span className="flex items-center justify-center gap-2"><UserPlus size={16} /> สมัครสมาชิกใหม่</span>
          </button>
        </>
      )}

      <button onClick={onBack} className="flex items-center gap-1.5 text-sm mt-6 hover:opacity-70 transition-opacity mx-auto" style={{ color: "#4A6080" }}>
        <ChevronLeft size={14} /> กลับหน้าหลัก
      </button>
    </AuthShell>
  );
}
