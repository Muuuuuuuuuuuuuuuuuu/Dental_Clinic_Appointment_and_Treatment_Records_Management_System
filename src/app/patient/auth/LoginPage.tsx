import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ChevronLeft, RefreshCw, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemos, setShowDemos] = useState(false);

  // รวมบัญชีตัวอย่างจากทุกบทบาทเข้าด้วยกัน
  const allDemos = ROLE_TABS.flatMap(tab => tab.demos.map(demo => ({ ...demo, roleLabel: tab.label })));

  const fillDemo = (demo: {label: string, email: string, pass: string}) => {
    setEmail(demo.email);
    setPass(demo.pass);
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !pass) { setError("กรุณากรอกอีเมลและรหัสผ่าน"); return; }
    if (/^[0-9+\s-]{6,}$/.test(email.trim())) {
      setError("การเข้าสู่ระบบต้องใช้อีเมลเท่านั้น (เช่น example@email.com) ไม่สามารถใช้เบอร์โทรศัพท์ได้");
      return;
    }
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
      
      if (authError || !authData.user) {
        const msg = authError?.message || "";
        if (msg.includes("Email not confirmed"))
          throw new Error("อีเมลยังไม่ได้ยืนยัน กรุณาตรวจสอบอีเมลและกดลิงก์ยืนยันใน inbox");
        if (msg.includes("Invalid login credentials") || msg.includes("invalid"))
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        throw new Error(msg || "ไม่สามารถเข้าสู่ระบบได้");
      }

      // ตรวจสอบบทบาทผู้ใช้จากตาราง users (หากไม่พบให้เป็นคนไข้)
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      const role = userData?.role || "patient";
      // รองรับชื่อบทบาททั้งภาษาไทยและภาษาอังกฤษ
      const isPatient = role === "patient" || role === "คนไข้";

      if (isPatient) {
        // ดึงข้อมูลโปรไฟล์โดยใช้รหัสผู้ใช้ที่ยืนยันตัวตนแล้ว
        const { getPatientProfileByUserId } = await import("../../shared/supabaseApi");
        const profile = await getPatientProfileByUserId(authData.user.id) as any;
        
        if (!profile) {
          throw new Error("INCOMPLETE_PROFILE");
        }

        // หากคนไข้เข้าสู่ระบบด้วยรหัสผ่านเริ่มต้น 123456789 หรือมีสถานะต้องเปลี่ยนรหัสผ่านครั้งแรก
        const cleanEmail = email.trim().toLowerCase();
        if (pass === "123456789" || pass === "patient123" || authData.user.user_metadata?.must_change_password === true) {
          localStorage.setItem(`supat_must_change_pwd_${cleanEmail}`, "true");
          localStorage.removeItem(`supat_pwd_changed_${cleanEmail}`);
        }

        onLogin({
          patientId: profile?.patientId || null,
          idCard: profile?.idCard || "",
          firstName: profile?.firstName || "",
          lastName: profile?.lastName || "",
          dob: profile?.dob || "",
          gender: profile?.gender || "",
          phone: profile?.phone || "",
          email: email,
          emergencyName: profile?.emergencyName || "",
          emergencyPhone: profile?.emergencyPhone || "",
          emergencyRelationship: profile?.emergencyRelationship || "",
          conditions: profile?.conditions || "",
          allergies: profile?.allergies || ""
        });
      } else {
        let mappedRole: UserRole = "patient";
        if (role === "admin" || role === "ผู้ดูแลระบบ") mappedRole = "admin";
        else if (role === "dentist" || role === "doctor" || role === "ทันตแพทย์") mappedRole = "doctor";
        else if (role === "staff" || role === "พนักงาน") mappedRole = "staff";
        
        onLoginRole(mappedRole, email);
      }
    } catch (err: any) {
      if (err.message === "INCOMPLETE_PROFILE") {
        setError("คุณยังกรอกข้อมูลส่วนตัวไม่ครบถ้วน กรุณาสมัครสมาชิกใหม่อีกครั้ง");
        // เรียกฟังก์ชันกลับไปยังหน้าสมัครสมาชิก
        setTimeout(() => {
          onRegister();
        }, 2000);
      } else {
        setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="เข้าสู่ระบบ" sub="เข้าสู่ระบบคลินิกทันตกรรมสุภัทร">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <Field label="อีเมล (สำหรับเข้าสู่ระบบ)">
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
            <input type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)}
              className={`${inputCls} pl-10`} style={inputStyle} />
          </div>
          {/^[0-9+\s-]{4,}$/.test(email.trim()) && (
            <p className="text-xs mt-1.5 flex items-center gap-1 text-amber-600 font-medium">
              <AlertCircle size={13} className="flex-shrink-0" /> เข้าสู่ระบบด้วยอีเมลเท่านั้น ไม่สามารถใช้เบอร์โทรศัพท์ได้
            </p>
          )}
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
          <button type="button" onClick={onForgotPassword} className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "#FF8C9A" }}>
            ลืมรหัสผ่าน?
          </button>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 mt-2"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 4px 20px rgba(255,140,154,0.4)" }}>
          {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
        </button>

        {/* ส่วนแสดงบัญชีตัวอย่างสำหรับการทดสอบ (ซ่อนไว้เป็นค่าเริ่มต้น) */}
        <div className="mt-6 flex flex-col items-center">
          <button type="button" onClick={() => setShowDemos(!showDemos)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            {showDemos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showDemos ? "ซ่อนบัญชีตัวอย่าง" : "แสดงบัญชีตัวอย่างสำหรับการทดสอบ"}
          </button>
          
          {showDemos && (
            <div className="w-full flex flex-col gap-2 mt-3 p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px dashed #E2E8F0" }}>
              <p className="text-xs text-center font-medium mb-3" style={{ color: "#1A365D" }}>คลิกเพื่อกรอกข้อมูลอัตโนมัติ</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                {ROLE_TABS.map((tab, tIdx) => (
                  <div key={tIdx} className="flex flex-col gap-2">
                    <p className="text-[11px] font-bold text-slate-500 mb-1 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <tab.icon size={12} /> {tab.label}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {tab.demos.map((demo, idx) => (
                        <button key={idx} type="button" onClick={() => fillDemo(demo as any)}
                          className="py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all hover:bg-slate-100 flex items-center justify-start gap-2 border border-slate-200 bg-white text-slate-600 hover:border-slate-300 w-full text-left"
                          title={`${tab.label}`}>
                          <RefreshCw size={10} style={{ color: "#FF8C9A" }} />
                          <span className="truncate">{demo.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>

      <div className="mt-6 p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: "#F0F4F8", border: "1px solid rgba(26,54,93,0.1)" }}>
        <UserPlus size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#4A6080" }} />
        <p className="text-xs leading-relaxed" style={{ color: "#4A6080" }}>
          <span className="font-semibold" style={{ color: "#1A365D" }}>ยังไม่มีบัญชีในระบบ?</span><br />
          กรุณาติดต่อพนักงานที่เคาน์เตอร์คลินิก เพื่อให้พนักงานลงทะเบียนข้อมูลให้คุณในครั้งแรก
        </p>
      </div>

      <button onClick={onBack} className="flex items-center gap-1.5 text-sm mt-6 hover:opacity-70 transition-opacity mx-auto" style={{ color: "#4A6080" }}>
        <ChevronLeft size={14} /> กลับหน้าหลัก
      </button>
    </AuthShell>
  );
}
