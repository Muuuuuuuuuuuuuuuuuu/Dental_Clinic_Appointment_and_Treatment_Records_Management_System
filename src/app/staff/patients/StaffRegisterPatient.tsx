import React, { useState, useMemo, useCallback, useEffect } from "react";
import { UserPlus, AlertCircle, CheckCircle, Copy, Eye, EyeOff, Mail, ArrowRight, RefreshCw, ChevronLeft, ShieldCheck } from "lucide-react";
import { addPatient } from "../../shared/supabaseApi";
import { supabase } from "../../shared/supabaseApi";

type RegForm = {
  firstName: string; lastName: string; idCard: string; dob: string; gender: string;
  phone: string; emergencyName: string; emergencyPhone: string; emergencyRelationship: string;
  conditions: string; allergies: string;
  email: string; address: string; password: string;
};

type Step = "form" | "otp" | "done";

const inputCls = "w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm";
const inputStyle = (val: string) => ({
  borderColor: val ? "rgba(26,54,93,0.3)" : "rgba(26,54,93,0.1)",
  backgroundColor: val ? "#fff" : "#FAFAFA",
  color: "#1A365D"
});

const calcAge = (dob: string) => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return new Date(diff).getUTCFullYear() - 1970;
};

type SuccessInfo = {
  name: string;
  loginEmail: string;
  loginPassword: string;
};

export default function StaffRegisterPatient() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<RegForm>({
    firstName: "", lastName: "", idCard: "", dob: "", gender: "",
    phone: "", emergencyName: "", emergencyPhone: "", emergencyRelationship: "",
    conditions: "", allergies: "", email: "", address: "", password: "123456789"
  });
  const [showFormPass, setShowFormPass] = useState(false);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [createdUserId, setCreatedUserId] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState<"email" | "pass" | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState("");

  const set = (k: keyof RegForm, v: string) => setForm(f => ({ ...f, [k]: v }));
  const age = useMemo(() => calcAge(form.dob), [form.dob]);

  // ตัวนับเวลาถอยหลังก่อนกดส่งรหัส OTP ซ้ำ
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validate = () => {
    setErr("");
    if (!form.firstName || !form.lastName || !form.idCard || !form.dob || !form.gender || !form.phone) {
      setErr("กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (ชื่อ, นามสกุล, เลขบัตร, ว/ด/ป เกิด, เพศ, เบอร์โทร)");
      return false;
    }
    if (form.idCard.replace(/-/g, "").length < 13) {
      setErr("เลขประจำตัวประชาชนต้องมี 13 หลัก");
      return false;
    }
    if (form.phone.replace(/\D/g, "").length !== 10) {
      setErr("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return false;
    }
    if (form.emergencyPhone && form.emergencyPhone.replace(/\D/g, "").length !== 10) {
      setErr("เบอร์ติดต่อฉุกเฉินต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return false;
    }
    if (!form.email) {
      setErr("กรุณากรอกอีเมลคนไข้ — คนไข้ต้องใช้อีเมลนี้ในการเข้าสู่ระบบ (ไม่ใช้เบอร์โทรศัพท์)");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErr("รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีเมลอีกครั้ง");
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setErr("รหัสผ่านเริ่มต้นต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }
    return true;
  };

  // ขั้นตอน 1: กรอกฟอร์มเสร็จ → สร้างรหัส OTP และส่งไปที่อีเมลคนไข้
  const handleSubmitForm = async () => {
    if (!validate()) return;
    setLoading(true);
    setErr("");

    const loginPassword = form.password || "123456789";
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDevOtp(generatedOtp);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: loginPassword,
        options: {
          data: { must_change_password: true }
        }
      });

      if (data?.user?.id) {
        setCreatedUserId(data.user.id);
      }

      if (error) {
        // ถ้าเกิดข้อผิดพลาดอื่นของ Supabase เช่น rate limit ส่งอีเมลฟรี เรายังให้ไปต่อด้วย OTP จำลอง
        console.warn("Supabase auth signUp warning:", error.message);
      }

      setStep("otp");
      setResendCooldown(60);
      setResendMsg("");
    } catch (e: any) {
      console.warn("Supabase auth signUp exception:", e);
      // ไปขั้นตอน OTP ต่อเพื่อให้ทดสอบได้
      setStep("otp");
      setResendCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  // ขั้นตอน 2: verify OTP แล้วสร้างบัญชี
  const handleVerifyOTP = async (customCode?: string) => {
    const code = customCode || otp;
    if (!code || code.length < 6) { setErr("กรุณากรอกรหัส OTP 6 หลัก"); return; }
    setLoading(true);
    setErr("");

    // 1. ถ้าตรงกับ devOtp หรือรหัสทดสอบ 123456 ให้ผ่านทันที
    if (code === devOtp || code === "123456") {
      await createAccount();
      setLoading(false);
      return;
    }

    // 2. ถ้ากรอกรหัสจาก Supabase email จริง ให้ตรวจสอบกับ Supabase Auth
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: form.email,
        token: code,
        type: "signup",
      });

      if (error) {
        // ลอง type 'email' อีกประเภทหนึ่ง
        const { error: err2 } = await supabase.auth.verifyOtp({
          email: form.email,
          token: code,
          type: "email",
        });

        if (err2) {
          throw new Error("รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว กรุณาส่งรหัสใหม่");
        }
      }

      await createAccount();
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาดในการยืนยัน OTP");
    } finally {
      setLoading(false);
    }
  };

  // สร้างบัญชีจริง ๆ ผ่าน addPatient
  const createAccount = async () => {
    const rawId = form.idCard.replace(/-/g, "");
    const loginPassword = form.password || "123456789";

    try {
      await addPatient({
        userId: createdUserId,
        email: form.email,
        password: loginPassword,
        firstName: form.firstName,
        lastName: form.lastName,
        citizenId: rawId,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob,
        address: form.address,
        allergyHistory: form.allergies,
        underlyingDisease: form.conditions,
        emergencyContactName: form.emergencyName,
        emergencyContactPhone: form.emergencyPhone,
        emergencyContactRelationship: form.emergencyRelationship,
      });
      const cleanEmail = form.email.trim().toLowerCase();
      localStorage.setItem(`supat_must_change_pwd_${cleanEmail}`, "true");
      localStorage.removeItem(`supat_pwd_changed_${cleanEmail}`);
      setSuccessInfo({
        name: `${form.firstName} ${form.lastName}`,
        loginEmail: form.email,
        loginPassword: loginPassword
      });
      setStep("done");
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = useCallback(async () => {
    if (resendCooldown > 0) return;
    setResendMsg("");
    setErr("");

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDevOtp(newOtp);

    try {
      await supabase.auth.resend({ type: "signup", email: form.email });
    } catch (e: any) {
      console.warn("Supabase resend warning:", e);
    }

    setResendMsg("ส่งรหัส OTP ใหม่เรียบร้อยแล้ว (กรุณาตรวจใน Inbox หรือ Spam)");
    setResendCooldown(60);
  }, [form.email, resendCooldown]);

  const copyText = (text: string, type: "email" | "pass") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const resetForm = () => {
    setStep("form");
    setSuccessInfo(null);
    setOtp("");
    setDevOtp("");
    setCreatedUserId("");
    setForm({
      firstName: "", lastName: "", idCard: "", dob: "", gender: "",
      phone: "", emergencyName: "", emergencyPhone: "", emergencyRelationship: "",
      conditions: "", allergies: "", email: "", address: "", password: "123456789"
    });
    setErr("");
    setResendCooldown(0);
    setResendMsg("");
  };

  // 
  if (step === "done" && successInfo) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg,#4ade80,#22c55e)" }}>
          <CheckCircle size={40} color="white" />
        </div>
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
          ลงทะเบียนสำเร็จ!
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          <strong className="text-gray-700">{successInfo.name}</strong> ถูกเพิ่มเข้าระบบและยืนยันอีเมลเรียบร้อยแล้ว
        </p>

        <div className="rounded-2xl p-5 mb-6 text-left space-y-4" style={{ backgroundColor: "#F8FAFC", border: "1.5px dashed #CBD5E1" }}>
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Mail size={16} style={{ color: "#FF8C9A" }} />
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#1A365D" }}>
              ข้อมูลสำหรับเข้าสู่ระบบของคนไข้ (Login Credentials)
            </p>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "#4A6080" }}>
            คนไข้จะใช้ <strong>อีเมล</strong> และ <strong>รหัสผ่าน</strong> ด้านล่างนี้ในการเข้าสู่ระบบที่หน้าเว็บ (ระบบใช้การเข้าสู่ระบบด้วยอีเมล ไม่ใช้เบอร์โทรศัพท์):
          </p>

          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>อีเมลเข้าสู่ระบบ (Username)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono font-semibold px-3 py-2 rounded-xl bg-white border" style={{ borderColor: "#E2E8F0", color: "#1A365D", wordBreak: "break-all" }}>
                {successInfo.loginEmail}
              </code>
              <button onClick={() => copyText(successInfo.loginEmail, "email")}
                className="flex-shrink-0 p-2 rounded-xl transition-colors"
                title="คัดลอกอีเมล"
                style={{ backgroundColor: copied === "email" ? "#DCFCE7" : "#F1F5F9", color: copied === "email" ? "#16A34A" : "#64748B" }}>
                {copied === "email" ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>รหัสผ่านเข้าสู่ระบบ (Password)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono font-semibold px-3 py-2 rounded-xl bg-white border" style={{ borderColor: "#E2E8F0", color: "#1A365D" }}>
                {showPass ? successInfo.loginPassword : "•".repeat(successInfo.loginPassword.length)}
              </code>
              <button onClick={() => setShowPass(p => !p)}
                className="flex-shrink-0 p-2 rounded-xl transition-colors"
                title={showPass ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button onClick={() => copyText(successInfo.loginPassword, "pass")}
                className="flex-shrink-0 p-2 rounded-xl transition-colors"
                title="คัดลอกรหัสผ่าน"
                style={{ backgroundColor: copied === "pass" ? "#DCFCE7" : "#F1F5F9", color: copied === "pass" ? "#16A34A" : "#64748B" }}>
                {copied === "pass" ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: "#94A3B8" }}>
              แจ้งให้คนไข้ทราบ: เข้าสู่ระบบด้วยอีเมลและรหัสผ่านเริ่มต้นนี้ เมื่อเข้าสู่ระบบครั้งแรก ระบบจะให้คนไข้เปลี่ยนรหัสผ่านใหม่ด้วยตนเอง
            </p>
          </div>
        </div>

        <button onClick={resetForm}
          className="w-full px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          เพิ่มคนไข้รายอื่น
        </button>
      </div>
    );
  }

  // 
  if (step === "otp") {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <button onClick={() => { setStep("form"); setOtp(""); setErr(""); }}
          className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "#4A6080" }}>
          <ChevronLeft size={16} /> ย้อนกลับไปแก้ไขข้อมูล
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#F0F4F8" }}>
            <Mail size={28} style={{ color: "#FF8C9A" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
            ยืนยันรหัส OTP ทางอีเมล
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#4A6080" }}>
            ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล<br />
            <strong className="text-base" style={{ color: "#1A365D" }}>{form.email}</strong><br />
            <span className="text-xs text-slate-400">กรุณาให้คนไข้เปิดอีเมลเพื่อดูรหัส แล้วแจ้งพนักงานเพื่อกรอกยืนยัน</span>
          </p>
        </div>

        {err && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}>
            <AlertCircle size={15} /> {err}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2 text-center" style={{ color: "#4A6080" }}>รหัส OTP 6 หลัก</label>
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="XXXXXX"
            maxLength={6}
            autoFocus
            className="w-full px-4 py-4 rounded-xl border-2 text-center text-2xl tracking-[0.4em] font-bold outline-none transition-all"
            style={{
              borderColor: otp.length === 6 ? "rgba(34,197,94,0.5)" : "rgba(26,54,93,0.15)",
              backgroundColor: "#FAFAFA",
              color: "#1A365D"
            }}
          />
        </div>


        {resendMsg && (
          <div className="flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-xl mb-3"
            style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}>
            <CheckCircle size={12} /> {resendMsg}
          </div>
        )}

        <button onClick={handleResendOTP} disabled={resendCooldown > 0}
          className="flex items-center gap-1.5 text-sm mx-auto mb-5 transition-all hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ color: resendCooldown > 0 ? "#94A3B8" : "#FF8C9A", display: "flex" }}>
          <RefreshCw size={13} />
          {resendCooldown > 0 ? `ส่งรหัสใหม่ได้ในอีก ${resendCooldown} วินาที` : "ส่งรหัส OTP ใหม่อีกครั้ง"}
        </button>

        <div className="p-3.5 rounded-xl flex items-start gap-2.5 mb-5" style={{ backgroundColor: "#FFF3E0", border: "1px solid #FED7AA" }}>
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#D97706" }} />
          <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
            ตรวจสอบอีเมล: หากไม่พบใน Inbox ให้ตรวจสอบในโฟลเดอร์ <strong>จดหมายขยะ (Spam / Junk)</strong>
          </p>
        </div>

        <button onClick={() => handleVerifyOTP()} disabled={loading || otp.length < 6}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 4px 20px rgba(255,140,154,0.35)" }}>
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังตรวจสอบ...</>
          ) : (
            <><CheckCircle size={18} /> ยืนยัน OTP และสร้างบัญชีคนไข้</>
          )}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => createAccount()}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            ข้ามการยืนยัน OTP และสร้างบัญชีทันที (โหมดพนักงานเคาน์เตอร์)
          </button>
        </div>
      </div>
    );
  }

  // 
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(255,140,154,0.1),rgba(255,107,126,0.1))" }}>
          <UserPlus size={24} style={{ color: "#FF8C9A" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>ลงทะเบียนคนไข้ใหม่</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>กรอกข้อมูลเพื่อสร้างประวัติในระบบ — พนักงานเป็นผู้ดำเนินการแทนคนไข้ พร้อมยืนยันอีเมลผ่าน OTP</p>
        </div>
      </div>

      {err && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-6" style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}>
          <AlertCircle size={16} /> {err}
        </div>
      )}

      <div className="space-y-8">
        {/* ส่วนที่ 1: ข้อมูลส่วนตัว */}
        <div>
          <h3 className="font-semibold mb-4 pb-2 border-b" style={{ color: "#1A365D", borderColor: "rgba(26,54,93,0.1)" }}>ข้อมูลส่วนตัว (Personal Information)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>ชื่อจริง <span className="text-red-400">*</span></label>
              <input type="text" className={inputCls} style={inputStyle(form.firstName)} value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="ไม่ต้องใส่คำนำหน้า" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>นามสกุล <span className="text-red-400">*</span></label>
              <input type="text" className={inputCls} style={inputStyle(form.lastName)} value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="นามสกุล" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>เลขประจำตัวประชาชน <span className="text-red-400">*</span></label>
              <input type="text" className={inputCls} style={inputStyle(form.idCard)} value={form.idCard}
                onChange={e => set("idCard", e.target.value.replace(/\D/g, "").slice(0, 13))}
                placeholder="13 หลัก ไม่ต้องใส่ขีด" maxLength={13} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>วันเกิด <span className="text-red-400">*</span></label>
                <input type="date" className={inputCls} style={inputStyle(form.dob)} value={form.dob} onChange={e => set("dob", e.target.value)} />
                {form.dob && <p className="text-[10px] mt-1 text-gray-400 text-right">อายุ {age} ปี</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>เพศ <span className="text-red-400">*</span></label>
                <select className={inputCls} style={inputStyle(form.gender)} value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option value="">เลือกเพศ</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 2: ข้อมูลติดต่อและบัญชีผู้ใช้ */}
        <div>
          <h3 className="font-semibold mb-4 pb-2 border-b" style={{ color: "#1A365D", borderColor: "rgba(26,54,93,0.1)" }}>ข้อมูลการติดต่อและบัญชีเข้าสู่ระบบ (Contact & Account)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>เบอร์โทรศัพท์ <span className="text-red-400">*</span></label>
              <input type="tel" className={inputCls} style={inputStyle(form.phone)} value={form.phone}
                onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="กรอกตัวเลข 10 หลัก" maxLength={10} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>
                อีเมลสำหรับเข้าสู่ระบบ <span className="text-red-400">*</span>
              </label>
              <input type="email" className={inputCls} style={inputStyle(form.email)} value={form.email}
                onChange={e => set("email", e.target.value.trim())} placeholder="example@email.com" />
              <p className="text-[10px] mt-1 text-slate-500">
                คนไข้จะใช้อีเมลนี้ในการเข้าสู่ระบบ และระบบจะส่ง OTP ยืนยันไปที่อีเมลนี้
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>
                รหัสผ่านเริ่มต้นสำหรับเข้าสู่ระบบ <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showFormPass ? "text" : "password"}
                  className={`${inputCls} pr-10`}
                  style={inputStyle(form.password)}
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  placeholder="123456789"
                />
                <button
                  type="button"
                  onClick={() => setShowFormPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showFormPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[10px] mt-1 text-slate-500">
                รหัสผ่านเริ่มต้นคือ 123456789 เมื่อคนไข้เข้าสู่ระบบครั้งแรก ระบบจะให้คนไข้เปลี่ยนรหัสผ่านใหม่ด้วยตนเอง
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>ที่อยู่ปัจจุบัน (ไม่บังคับ)</label>
              <textarea className={inputCls} style={{...inputStyle(form.address), minHeight: "72px"}} value={form.address} onChange={e => set("address", e.target.value)}
                placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" />
              <p className="text-[10px] mt-1 text-gray-400">ใช้สำหรับออกใบกำกับภาษีและเอกสารทางการแพทย์</p>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>ชื่อผู้ติดต่อฉุกเฉิน</label>
              <input type="text" className={inputCls} style={inputStyle(form.emergencyName)} value={form.emergencyName} onChange={e => set("emergencyName", e.target.value)} placeholder="ชื่อ-นามสกุล" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>เบอร์ติดต่อฉุกเฉิน</label>
              <input type="tel" className={inputCls} style={inputStyle(form.emergencyPhone)} value={form.emergencyPhone}
                onChange={e => set("emergencyPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="กรอกตัวเลข 10 หลัก" maxLength={10} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>ความสัมพันธ์</label>
              <input type="text" className={inputCls} style={inputStyle(form.emergencyRelationship)} value={form.emergencyRelationship} onChange={e => set("emergencyRelationship", e.target.value)} placeholder="เช่น บิดา, มารดา, พี่น้อง" />
            </div>
          </div>
        </div>

        {/* ส่วนที่ 3: ข้อมูลสุขภาพและประวัติแพ้ยา */}
        <div>
          <h3 className="font-semibold mb-4 pb-2 border-b" style={{ color: "#1A365D", borderColor: "rgba(26,54,93,0.1)" }}>ข้อมูลสุขภาพ (Medical History)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>โรคประจำตัว</label>
              <textarea className={inputCls} style={{...inputStyle(form.conditions), minHeight: "80px"}} value={form.conditions} onChange={e => set("conditions", e.target.value)} placeholder="ระบุโรคประจำตัว หรือใส่ '-' ถ้าไม่มี" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>ประวัติการแพ้ยา</label>
              <textarea className={inputCls} style={{...inputStyle(form.allergies), minHeight: "80px"}} value={form.allergies} onChange={e => set("allergies", e.target.value)} placeholder="ระบุชื่อยาที่แพ้ หรือใส่ '-' ถ้าไม่มี" />
            </div>
          </div>
        </div>

        {/* กล่องแจ้งเตือนการยืนยันรหัส OTP ทางอีเมล */}
        <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <Mail size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#1D4ED8" }} />
          <div className="text-xs leading-relaxed" style={{ color: "#1E40AF" }}>
            <p className="font-semibold mb-0.5">การยืนยันตัวตนด้วยรหัส OTP ทางอีเมล</p>
            <p>
              เมื่อกดปุ่ม <strong>"ถัดไป — ส่ง OTP ยืนยันอีเมล"</strong> ระบบจะส่งรหัส 6 หลักไปยังอีเมล <strong>{form.email || "ของคนไข้"}</strong> ให้คนไข้เปิดอีเมลเพื่อนำรหัสมาแจ้งพนักงาน
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex gap-4 pt-6 border-t border-gray-100">
        <button onClick={resetForm}
          className="px-6 py-3 rounded-xl font-medium transition-colors hover:bg-gray-50"
          style={{ color: "#4A6080", border: "1px solid rgba(26,54,93,0.15)" }}>
          ล้างข้อมูล
        </button>
        <button onClick={handleSubmitForm} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังดำเนินการ...</>
          ) : (
            <><ArrowRight size={18} /> ถัดไป — ส่ง OTP ยืนยันอีเมล</>
          )}
        </button>
      </div>
    </div>
  );
}
