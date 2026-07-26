import { useState, useRef } from "react";
import { AlertCircle, ChevronLeft, RefreshCw } from "lucide-react";
import AuthShell from "./AuthShell";

export default function OTPPage({ email, onSuccess, onBack }: { email: string; onSuccess: () => void; onBack: () => void }) {
  const DEMO_OTP = "847291";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const verify = () => {
    const code = digits.join("");
    if (code.length < 6) { setErr("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก"); return; }
    if (code !== DEMO_OTP) { setErr("รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่"); return; }
    onSuccess();
  };

  return (
    <AuthShell title="ยืนยันตัวตน" sub={`ระบบได้ส่งรหัส OTP 6 หลักไปยัง ${email}`}>
      <div className="p-4 rounded-xl mb-6 text-sm text-center" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
        Demo OTP: <strong>{DEMO_OTP}</strong>
      </div>
      {err && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}>
          <AlertCircle size={15} /> {err}
        </div>
      )}

      <div className="flex gap-3 justify-center mb-6">
        {digits.map((d, i) => (
          <input key={i} ref={el => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) inputRefs.current[i - 1]?.focus(); }}
            className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all focus:border-[#FF8C9A]"
            style={{
              borderColor: d ? "#FF8C9A" : "rgba(26,54,93,0.15)",
              backgroundColor: d ? "#FFF0F3" : "#F0F4F8",
              color: "#1A365D",
            }} />
        ))}
      </div>

      <button onClick={verify}
        className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 4px 20px rgba(255,140,154,0.4)" }}>
        ยืนยัน OTP
      </button>

      <div className="flex items-center justify-between mt-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm hover:opacity-70" style={{ color: "#4A6080" }}>
          <ChevronLeft size={14} /> ย้อนกลับ
        </button>
        <button onClick={() => setResent(true)} className="flex items-center gap-1.5 text-sm hover:opacity-70" style={{ color: resent ? "#22C55E" : "#FF8C9A" }}>
          <RefreshCw size={13} /> {resent ? "ส่งแล้ว!" : "ส่ง OTP ใหม่"}
        </button>
      </div>
    </AuthShell>
  );
}
