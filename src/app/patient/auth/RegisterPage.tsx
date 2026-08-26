import { useState, useMemo, useEffect, useCallback } from "react";
import { Check, AlertCircle, ChevronLeft, ArrowRight, Mail, Lock, Eye, EyeOff, RefreshCw } from "lucide-react";
import AuthShell, { Field } from "./AuthShell";
import { RegForm, REG_STEPS, calcAge, inputCls, inputStyle } from "../types";
import { requestRegistrationOTP, resendOTP, verifyOTP, savePatientData, cancelRegistration } from "../../shared/supabaseApi";

export default function RegisterPage({ onSuccess, onLogin, onBack }: { onSuccess: (email: string, formData?: RegForm) => void; onLogin: () => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegForm>({
    firstName: "", lastName: "", idCard: "", dob: "", gender: "",
    phone: "", emergencyName: "", emergencyPhone: "", emergencyRelationship: "",
    conditions: "", allergies: "",
    address: "",
    email: "", password: "", confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [hasConditions, setHasConditions] = useState(false);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState("");

  // Check if user is already authenticated
  useEffect(() => {
    import("../../shared/supabaseApi").then(({ supabase, getPatientProfileByUserId }) => {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user && user.email) {
          try {
            const profile = await getPatientProfileByUserId(user.id);
            if (profile && profile.firstName) {
              // User already has a complete profile. Prevent them from registering and overwriting it.
              await supabase.auth.signOut();
              window.location.reload();
            } else {
              // Logged in but incomplete profile
              setForm(f => ({ ...f, email: user.email! }));
              setStep(2); // Skip OTP and go straight to Personal Info
            }
          } catch (e) {
            setForm(f => ({ ...f, email: user.email! }));
            setStep(2);
          }
        }
      });
    });
  }, []);

  // Timeout for incomplete registration
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (step >= 2 && step <= 4) {
      timeout = setTimeout(async () => {
        alert("หมดเวลาทำรายการ (5 นาที) กรุณาทำรายการใหม่");
        await cancelRegistration();
        window.location.reload();
      }, 5 * 60 * 1000);
    }
    return () => clearTimeout(timeout);
  }, [step]);

  const set = (k: keyof RegForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    setErr("");
    // Step 0: ข้อมูลบัญชี (email, password, confirmPassword)
    if (step === 0) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
      if (!emailOk) { setErr("รูปแบบอีเมลไม่ถูกต้อง"); return false; }
      if (form.password.length < 8) { setErr("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return false; }
      if (form.password !== form.confirmPassword) { setErr("รหัสผ่านไม่ตรงกัน"); return false; }
    }
    // Step 1: OTP – validated in verify()
    // Step 2: ข้อมูลส่วนตัว
    if (step === 2) {
      if (!form.firstName || !form.lastName || !form.idCard || !form.dob || !form.gender) {
        setErr("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return false;
      }
      if (form.idCard.length !== 13) {
        setErr("เลขบัตรประชาชนต้องมี 13 หลัก");
        return false;
      }
    }
    // Step 3: ข้อมูลการติดต่อ
    if (step === 3) {
      if (!form.phone || !form.emergencyName || !form.emergencyPhone || !form.emergencyRelationship) {
        setErr("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return false;
      }
    }
    // Step 4: ข้อมูลสุขภาพ – no required fields
    return true;
  };

  const next = async () => {
    if (validate()) {
      if (step === 0) {
        // ข้อมูลบัญชี → ส่ง OTP แล้วไปหน้า OTP
        try {
          setLoading(true);
          await requestRegistrationOTP(form);
          setErr("");
          setStep(1);
          setResendCooldown(60);
        } catch (error: any) {
          setErr(error.message || "เกิดข้อผิดพลาดในการส่ง OTP");
        } finally {
          setLoading(false);
        }
      } else if (step === 4) {
        // ข้อมูลสุขภาพ (step สุดท้าย) → บันทึกข้อมูลทั้งหมด
        try {
          setLoading(true);
          await savePatientData(form);
          onSuccess(form.email, form);
        } catch (error: any) {
          setErr(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
          setLoading(false);
        }
      } else {
        // Step 2, 3 → ไปหน้าถัดไป
        setStep(s => s + 1);
      }
    }
  };

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // 5-Minute Inactivity Timeout (after OTP is verified)
  useEffect(() => {
    if (step >= 2 && step <= 4) {
      const timeout = setTimeout(async () => {
        await cancelRegistration();
        alert("หมดเวลาทำรายการ 5 นาที กรุณาเข้าสู่ระบบอีกครั้งเพื่อกรอกข้อมูลส่วนตัวต่อ");
        onLogin(); // Redirect to login page
      }, 5 * 60 * 1000);
      return () => clearTimeout(timeout);
    }
  }, [step, onLogin]);

  const handleResendOTP = useCallback(async () => {
    if (resendCooldown > 0) return;
    try {
      setResendMsg("");
      setErr("");
      await resendOTP(form.email);
      setResendMsg("ส่งรหัส OTP ใหม่เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ");
      setResendCooldown(60);
    } catch (error: any) {
      setErr(error.message || "ไม่สามารถส่งรหัส OTP ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    }
  }, [form.email, resendCooldown]);

  const verify = async () => {
    if (!otp) {
      setErr("กรุณากรอกรหัส OTP");
      return;
    }
    try {
      setLoading(true);
      // Verify OTP with Supabase
      await verifyOTP(form.email, otp);
      setErr("");
      // OTP verified → go to personal info step
      setStep(2);
    } catch (error: any) {
      setErr(error.message || "รหัส OTP ไม่ถูกต้อง หรือหมดอายุ");
    } finally {
      setLoading(false);
    }
  };

  const age = useMemo(() => calcAge(form.dob), [form.dob]);

  return (
    <AuthShell title="สมัครสมาชิก" sub="สร้างบัญชีเพื่อจัดการนัดหมายและติดตามสุขภาพช่องปากของคุณ">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {REG_STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                style={{
                  backgroundColor: i < step ? "#22C55E" : i === step ? "#FF8C9A" : "rgba(26,54,93,0.08)",
                  color: i <= step ? "white" : "#4A6080",
                }}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="text-xs hidden md:block" style={{ color: i === step ? "#1A365D" : "#4A6080", fontWeight: i === step ? 600 : 400 }}>
                {s}
              </span>
            </div>
            {i < REG_STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mb-5 mx-1 transition-all"
                style={{ backgroundColor: i < step ? "#22C55E" : "rgba(26,54,93,0.1)" }} />
            )}
          </div>
        ))}
      </div>

      {err && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}>
          <AlertCircle size={15} /> {err}
        </div>
      )}

      <div className="space-y-4">
        {/* Step 0: ข้อมูลบัญชี */}
        {step === 0 && (
          <>
            <Field label="อีเมล *">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
                <input type="email" name="email" autoComplete="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="example@email.com"
                  className={`${inputCls} pl-10`} style={inputStyle} />
              </div>
            </Field>
            <Field label="รหัสผ่าน * (อย่างน้อย 8 ตัวอักษร)">
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
                <input type={showPass ? "text" : "password"} name="password" autoComplete="new-password" value={form.password} onChange={e => set("password", e.target.value)}
                  placeholder="รหัสผ่าน" className={`${inputCls} pl-10 pr-10`} style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <Field label="ยืนยันรหัสผ่าน *">
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
                <input type={showConf ? "text" : "password"} name="confirmPassword" autoComplete="new-password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                  placeholder="ยืนยันรหัสผ่าน" className={`${inputCls} pl-10 pr-10`} style={inputStyle} />
                <button type="button" onClick={() => setShowConf(!showConf)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }}>
                  {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
          </>
        )}

        {/* Step 1: ยืนยัน OTP */}
        {step === 1 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "#F0F4F8" }}>
              <Mail size={28} style={{ color: "#FF8C9A" }} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: "#1A365D" }}>ยืนยันอีเมลของคุณ</h3>
            <p className="text-sm" style={{ color: "#4A6080" }}>
              ระบบได้ส่งรหัสยืนยัน OTP ไปที่อีเมล<br/>
              <strong style={{ color: "#1A365D" }}>{form.email}</strong><br/>
              กรุณานำรหัสมากรอกเพื่อยืนยันตัวตน
            </p>
            <div className="max-w-[200px] mx-auto pt-4">
              <input 
                type="text" 
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                placeholder="XXXXXX" 
                maxLength={6}
                className={`${inputCls} text-center text-2xl tracking-[0.3em] font-bold`} 
                style={inputStyle} 
              />
            </div>

            {/* Resend success message */}
            {resendMsg && (
              <div className="flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-xl mx-auto" 
                style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E", maxWidth: 320 }}>
                <Check size={13} /> {resendMsg}
              </div>
            )}

            {/* Resend OTP button */}
            <div className="pt-2">
              <button 
                type="button" 
                onClick={handleResendOTP}
                disabled={resendCooldown > 0}
                className="flex items-center gap-1.5 text-sm mx-auto transition-all hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: resendCooldown > 0 ? "#94A3B8" : "#FF8C9A" }}
              >
                <RefreshCw size={13} />
                {resendCooldown > 0 
                  ? `ส่งรหัสใหม่ได้ในอีก ${resendCooldown} วินาที` 
                  : "ไม่ได้รับรหัส? ส่ง OTP ใหม่"}
              </button>
            </div>

            {/* Tip */}
            <div className="text-xs px-4 py-2.5 rounded-xl" style={{ backgroundColor: "#FFF3E0", color: "#92400E" }}>
              💡 ตรวจสอบโฟลเดอร์สแปม / Junk Mail หากไม่พบอีเมลในกล่องจดหมายหลัก
            </div>
          </div>
        )}

        {/* Step 2: ข้อมูลส่วนตัว */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="ชื่อ *">
                <input name="firstName" autoComplete="given-name" value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="ชื่อ" className={inputCls} style={inputStyle} />
              </Field>
              <Field label="นามสกุล *">
                <input name="lastName" autoComplete="family-name" value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="นามสกุล" className={inputCls} style={inputStyle} />
              </Field>
            </div>
            <Field label="เลขบัตรประชาชน *">
              <input name="idCard" autoComplete="off" value={form.idCard} onChange={e => set("idCard", e.target.value.replace(/\D/g, ''))} placeholder="เลขบัตรประชาชน 13 หลัก" className={inputCls} style={inputStyle} maxLength={13} />
            </Field>
            <Field label="วันเดือนปีเกิด *">
              <input type="date" name="bday" autoComplete="bday" value={form.dob} onChange={e => set("dob", e.target.value)} className={inputCls} style={inputStyle} />
              {age && <p className="text-xs mt-1.5" style={{ color: "#FF8C9A" }}>อายุ: {age}</p>}
            </Field>
            <Field label="เพศ *">
              <div className="flex gap-3">
                {["ชาย", "หญิง", "ไม่ระบุ"].map(g => (
                  <button key={g} type="button" onClick={() => set("gender", g)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      backgroundColor: form.gender === g ? "#FF8C9A" : "#F0F4F8",
                      color: form.gender === g ? "white" : "#4A6080",
                      border: form.gender === g ? "none" : "1.5px solid rgba(26,54,93,0.12)",
                    }}>
                    {g}
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        {/* Step 3: ข้อมูลการติดต่อ */}
        {step === 3 && (
          <>
            <Field label="เบอร์โทรศัพท์ *">
              <input type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="0XX-XXX-XXXX" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="ที่อยู่ปัจจุบัน (ไม่บังคับ)">
              <textarea name="address" autoComplete="street-address" value={form.address} onChange={e => set("address", e.target.value)}
                placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                rows={2} className={`${inputCls} resize-none`} style={inputStyle} />
              <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>ใช้สำหรับออกใบกำกับภาษีและเอกสารทางการแพทย์ — กรอกภายหลังได้ในหน้าโปรไฟล์</p>
            </Field>
            <div className="border-t pt-4" style={{ borderColor: "rgba(26,54,93,0.08)" }}>
              <p className="text-sm font-medium mb-3" style={{ color: "#1A365D" }}>ผู้ติดต่อฉุกเฉิน</p>
              <div className="space-y-4">
                <Field label="ชื่อ-นามสกุล *">
                  <input name="emergencyName" autoComplete="off" value={form.emergencyName} onChange={e => set("emergencyName", e.target.value)} placeholder="ชื่อผู้ติดต่อฉุกเฉิน" className={inputCls} style={inputStyle} />
                </Field>
                <Field label="เบอร์โทรศัพท์ *">
                  <input type="tel" name="emergencyPhone" autoComplete="off" value={form.emergencyPhone} onChange={e => set("emergencyPhone", e.target.value)} placeholder="0XX-XXX-XXXX" className={inputCls} style={inputStyle} />
                </Field>
                <Field label="ความสัมพันธ์ *">
                  <input name="emergencyRelationship" autoComplete="off" value={form.emergencyRelationship} onChange={e => set("emergencyRelationship", e.target.value)} placeholder="เช่น พ่อ, แม่, ลูก, เพื่อน" className={inputCls} style={inputStyle} />
                </Field>
              </div>
            </div>
          </>
        )}

        {/* Step 4: ข้อมูลสุขภาพ */}
        {step === 4 && (
          <>
            <Field label="โรคประจำตัว">
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#1A365D" }}>
                  <input type="radio" name="hasConditions" checked={!hasConditions} onChange={() => { setHasConditions(false); set("conditions", "ไม่มี"); }} className="w-4 h-4 accent-[#FF8C9A]" />
                  ไม่มี
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#1A365D" }}>
                  <input type="radio" name="hasConditions" checked={hasConditions} onChange={() => { setHasConditions(true); set("conditions", ""); }} className="w-4 h-4 accent-[#FF8C9A]" />
                  มี (โปรดระบุ)
                </label>
              </div>
              {hasConditions && (
                <textarea value={form.conditions} onChange={e => set("conditions", e.target.value)}
                  placeholder="โปรดระบุโรคประจำตัว เช่น เบาหวาน ความดันโลหิตสูง"
                  rows={2} className={`${inputCls} resize-none`} style={inputStyle} />
              )}
            </Field>
            
            <Field label="ประวัติการแพ้ยา">
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#1A365D" }}>
                  <input type="radio" name="hasAllergies" checked={!hasAllergies} onChange={() => { setHasAllergies(false); set("allergies", "ไม่มี"); }} className="w-4 h-4 accent-[#FF8C9A]" />
                  ไม่มี
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#1A365D" }}>
                  <input type="radio" name="hasAllergies" checked={hasAllergies} onChange={() => { setHasAllergies(true); set("allergies", ""); }} className="w-4 h-4 accent-[#FF8C9A]" />
                  มี (โปรดระบุ)
                </label>
              </div>
              {hasAllergies && (
                <textarea value={form.allergies} onChange={e => set("allergies", e.target.value)}
                  placeholder="โปรดระบุยาที่แพ้ เช่น แพ้ยาเพนนิซิลิน"
                  rows={2} className={`${inputCls} resize-none`} style={inputStyle} />
              )}
            </Field>
            
            <div className="p-3 rounded-xl flex items-start gap-2" style={{ backgroundColor: "#FFF3E0" }}>
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#E65100" }} />
              <p className="text-xs" style={{ color: "#E65100" }}>ข้อมูลสุขภาพนี้จะถูกใช้โดยทันตแพทย์เพื่อความปลอดภัยในการรักษาของท่าน</p>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        {step > 0 && step !== 1 && (
          <button onClick={() => { setErr(""); setStep(s => s - 1); }}
            className="flex-1 py-3.5 rounded-xl font-medium transition-all hover:opacity-80"
            style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#1A365D" }}>
            <span className="flex items-center justify-center gap-1"><ChevronLeft size={14} /> ย้อนกลับ</span>
          </button>
        )}
        <button onClick={step === 1 ? verify : next} disabled={loading}
          className="flex-1 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 4px 20px rgba(255,140,154,0.4)" }}>
          {step === 0
            ? (loading ? "กำลังส่ง OTP..." : "ขอรหัส OTP")
            : step === 1
              ? (loading ? "กำลังยืนยัน..." : "ยืนยันรหัส OTP")
              : step === 4
                ? (loading ? "กำลังบันทึก..." : "สมัครสมาชิก")
                : <span className="flex items-center justify-center gap-1">ถัดไป <ArrowRight size={14} /></span>
          }
        </button>
      </div>

      <p className="text-center text-sm mt-6" style={{ color: "#4A6080" }}>
        มีบัญชีอยู่แล้ว?{" "}
        <button onClick={onLogin} className="font-semibold hover:opacity-70" style={{ color: "#FF8C9A" }}>เข้าสู่ระบบ</button>
      </p>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm mt-2 hover:opacity-70 transition-opacity mx-auto" style={{ color: "#4A6080" }}>
        <ChevronLeft size={14} /> กลับหน้าหลัก
      </button>
    </AuthShell>
  );
}
