import { useState } from "react";
import { CheckCircle, ChevronLeft, Mail } from "lucide-react";
import AuthShell, { Field } from "./AuthShell";
import { inputCls, inputStyle } from "../types";

export default function ForgotPasswordPage({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AuthShell title="ลืมรหัสผ่าน" sub="กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้คุณ">
      {sent ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#E8FFF0" }}>
            <CheckCircle size={32} style={{ color: "#22C55E" }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ส่งอีเมลแล้ว!</h3>
          <p className="text-sm mb-6" style={{ color: "#4A6080" }}>กรุณาตรวจสอบกล่องจดหมายของคุณและทำตามขั้นตอนที่ระบุ</p>
          <button onClick={onBack} className="font-semibold text-sm hover:opacity-70" style={{ color: "#FF8C9A" }}>
            กลับสู่หน้าเข้าสู่ระบบ
          </button>
        </div>
      ) : (
        <>
          <Field label="อีเมล">
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#4A6080" }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com"
                className={`${inputCls} pl-10`} style={inputStyle} />
            </div>
          </Field>
          <button onClick={() => email && setSent(true)}
            className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 mt-4"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 4px 20px rgba(255,140,154,0.4)" }}>
            ส่งลิงก์ตั้งรหัสผ่านใหม่
          </button>
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm mt-5 hover:opacity-70 mx-auto" style={{ color: "#4A6080" }}>
            <ChevronLeft size={14} /> กลับ
          </button>
        </>
      )}
    </AuthShell>
  );
}
