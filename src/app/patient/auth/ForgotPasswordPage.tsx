import { useState, useRef } from "react";
import {
  CheckCircle, ChevronLeft, Mail, Lock, Eye, EyeOff,
  AlertCircle, RefreshCw, ShieldCheck,
} from "lucide-react";
import AuthShell, { Field } from "./AuthShell";
import { inputCls, inputStyle } from "../types";
import {
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
} from "../../shared/supabaseApi";

type Step = "email" | "otp" | "reset" | "done";

export default function ForgotPasswordPage({ onBack }: { onBack: () => void }) {
  // ─── shared state ──────────────────────────────────────────────
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── OTP state ─────────────────────────────────────────────────
  const [demoOtp, setDemoOtp] = useState(""); // OTP ที่ระบบสร้างให้ (Demo)
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Reset password state ──────────────────────────────────────
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // ─── helpers ───────────────────────────────────────────────────
  const btnGradient = {
    background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)",
    boxShadow: "0 4px 20px rgba(255,140,154,0.4)",
  };

  // ═══════════════════════════════════════════════════════════════
  // Step 1: ส่ง OTP ไปเก็บใน Supabase + ส่งไปอีเมล
  // ═══════════════════════════════════════════════════════════════
  const sendOtp = async () => {
    setError("");
    if (!email) { setError("กรุณากรอกอีเมล"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("รูปแบบอีเมลไม่ถูกต้อง"); return; }

    setLoading(true);
    try {
      const result = await sendPasswordResetOTP(email);
      setDemoOtp(result.otp); // เก็บ OTP สำหรับแสดง Demo
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // Step 2: ยืนยัน OTP กับ Supabase
  // ═══════════════════════════════════════════════════════════════
  const handleDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    setError("");
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    setError("");
    const code = digits.join("");
    if (code.length < 6) { setError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก"); return; }

    setLoading(true);
    try {
      await verifyPasswordResetOTP(email, code);
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "รหัส OTP ไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setDigits(["", "", "", "", "", ""]);
    setError("");
    setResent(true);
    try {
      const result = await sendPasswordResetOTP(email);
      setDemoOtp(result.otp);
    } catch (err: any) {
      setError(err.message || "ไม่สามารถส่ง OTP ใหม่ได้");
    }
    setTimeout(() => setResent(false), 3000);
  };

  // ═══════════════════════════════════════════════════════════════
  // Step 3: เปลี่ยนรหัสผ่านใหม่ใน Supabase
  // ═══════════════════════════════════════════════════════════════
  const doResetPassword = async () => {
    setError("");
    if (!newPass) { setError("กรุณากรอกรหัสผ่านใหม่"); return; }
    if (newPass.length < 6) { setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    if (newPass !== confirmPass) { setError("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง"); return; }

    setLoading(true);
    try {
      await resetPassword(email, newPass);
      setStep("done");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // Step indicator (3 ขั้นตอน)
  // ═══════════════════════════════════════════════════════════════
  const stepLabels = ["กรอกอีเมล", "ยืนยัน OTP", "ตั้งรหัสผ่านใหม่"];
  const stepIndex = step === "email" ? 0 : step === "otp" ? 1 : 2;

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {stepLabels.map((label, i) => {
        const isDone = i < stepIndex || step === "done";
        const isActive = i === stepIndex && step !== "done";
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: isDone
                    ? "linear-gradient(135deg,#22C55E,#16A34A)"
                    : isActive
                    ? "linear-gradient(135deg,#FF8C9A,#FF6B7E)"
                    : "#E2E8F0",
                  color: isDone || isActive ? "white" : "#94A3B8",
                }}
              >
                {isDone ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span
                className="text-[10px] mt-1 font-medium whitespace-nowrap"
                style={{ color: isDone ? "#22C55E" : isActive ? "#FF8C9A" : "#94A3B8" }}
              >
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className="w-8 h-0.5 rounded mb-4"
                style={{ backgroundColor: i < stepIndex ? "#22C55E" : "#E2E8F0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // Error banner
  // ═══════════════════════════════════════════════════════════════
  const ErrorBanner = () =>
    error ? (
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4"
        style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}
      >
        <AlertCircle size={15} /> {error}
      </div>
    ) : null;

  // ═══════════════════════════════════════════════════════════════
  // Render by step
  // ═══════════════════════════════════════════════════════════════

  /* ── DONE ────────────────────────────────────────────────────── */
  if (step === "done") {
    return (
      <AuthShell title="เปลี่ยนรหัสผ่านสำเร็จ" sub="คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว">
        <div className="text-center py-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "#E8FFF0" }}
          >
            <CheckCircle size={40} style={{ color: "#22C55E" }} />
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}
          >
            เปลี่ยนรหัสผ่านเรียบร้อย!
          </h3>
          <p className="text-sm mb-6" style={{ color: "#4A6080" }}>
            ข้อมูลถูกบันทึกลง Supabase เรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
          </p>
          <button
            onClick={onBack}
            className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={btnGradient}
          >
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </AuthShell>
    );
  }

  /* ── STEP 1 — Email ──────────────────────────────────────────── */
  if (step === "email") {
    return (
      <AuthShell title="ลืมรหัสผ่าน" sub="กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งรหัส OTP ไปยังอีเมลของคุณ">
        <StepIndicator />
        <ErrorBanner />
        <Field label="อีเมล">
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="example@email.com"
              className={`${inputCls} pl-10`}
              style={inputStyle}
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
            />
          </div>
        </Field>
        <button
          onClick={sendOtp}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 mt-4"
          style={btnGradient}
        >
          {loading ? "กำลังส่ง OTP..." : "ส่งรหัส OTP"}
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm mt-5 hover:opacity-70 mx-auto"
          style={{ color: "#4A6080" }}
        >
          <ChevronLeft size={14} /> กลับ
        </button>
      </AuthShell>
    );
  }

  /* ── STEP 2 — OTP ────────────────────────────────────────────── */
  if (step === "otp") {
    return (
      <AuthShell title="ยืนยัน OTP" sub={`ระบบได้ส่งรหัส OTP 6 หลักไปยัง ${email}`}>
        <StepIndicator />

        {/* Demo OTP hint — แสดง OTP ที่สร้างจาก Supabase */}
        {demoOtp && (
          <div
            className="p-4 rounded-xl mb-6 text-sm text-center"
            style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}
          >
            🔑 Demo OTP (จาก Supabase): <strong>{demoOtp}</strong>
          </div>
        )}

        <ErrorBanner />

        <div className="flex gap-3 justify-center mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all focus:border-[#FF8C9A]"
              style={{
                borderColor: d ? "#FF8C9A" : "rgba(26,54,93,0.15)",
                backgroundColor: d ? "#FFF0F3" : "#F0F4F8",
                color: "#1A365D",
              }}
            />
          ))}
        </div>

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
          style={btnGradient}
        >
          {loading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
        </button>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => { setStep("email"); setError(""); setDigits(["", "", "", "", "", ""]); }}
            className="flex items-center gap-1 text-sm hover:opacity-70"
            style={{ color: "#4A6080" }}
          >
            <ChevronLeft size={14} /> ย้อนกลับ
          </button>
          <button
            onClick={resendOtp}
            className="flex items-center gap-1.5 text-sm hover:opacity-70"
            style={{ color: resent ? "#22C55E" : "#FF8C9A" }}
          >
            <RefreshCw size={13} /> {resent ? "ส่งแล้ว!" : "ส่ง OTP ใหม่"}
          </button>
        </div>
      </AuthShell>
    );
  }

  /* ── STEP 3 — Reset password ─────────────────────────────────── */
  return (
    <AuthShell title="ตั้งรหัสผ่านใหม่" sub="กรุณากรอกรหัสผ่านใหม่ที่คุณต้องการ">
      <StepIndicator />

      {/* Security badge */}
      <div
        className="flex items-center gap-2 p-3 rounded-xl mb-6 text-sm"
        style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}
      >
        <ShieldCheck size={16} />
        ยืนยันตัวตนสำเร็จ — กรุณาตั้งรหัสผ่านใหม่
      </div>

      <ErrorBanner />

      <div className="space-y-4">
        <Field label="รหัสผ่านใหม่">
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
            <input
              type={showNewPass ? "text" : "password"}
              value={newPass}
              onChange={(e) => { setNewPass(e.target.value); setError(""); }}
              placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
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
              value={confirmPass}
              onChange={(e) => { setConfirmPass(e.target.value); setError(""); }}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              className={`${inputCls} pl-10 pr-10`}
              style={inputStyle}
              onKeyDown={(e) => e.key === "Enter" && doResetPassword()}
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

        {/* Password match indicator */}
        {confirmPass && (
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: newPass === confirmPass ? "#22C55E" : "#EF4444" }}
          >
            {newPass === confirmPass ? (
              <><CheckCircle size={12} /> รหัสผ่านตรงกัน</>
            ) : (
              <><AlertCircle size={12} /> รหัสผ่านไม่ตรงกัน</>
            )}
          </div>
        )}
      </div>

      <button
        onClick={doResetPassword}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 mt-6"
        style={btnGradient}
      >
        {loading ? "กำลังเปลี่ยนรหัสผ่าน..." : "เปลี่ยนรหัสผ่าน"}
      </button>

      <button
        onClick={() => { setStep("otp"); setError(""); }}
        className="flex items-center gap-1.5 text-sm mt-5 hover:opacity-70 mx-auto"
        style={{ color: "#4A6080" }}
      >
        <ChevronLeft size={14} /> ย้อนกลับ
      </button>
    </AuthShell>
  );
}
