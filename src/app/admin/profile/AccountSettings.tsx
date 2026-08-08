import React, { useState } from "react";
import { Lock, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { supabase } from "../../shared/supabaseApi";

export default function AccountSettings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setMessage({ type: "error", text: "กรุณากรอกรหัสผ่านใหม่" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "รหัสผ่านไม่ตรงกัน กรุณาลองใหม่" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      setMessage({ type: "success", text: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      setEmailMessage({ type: "error", text: "กรุณากรอกอีเมลให้ถูกต้อง" });
      return;
    }

    try {
      setEmailLoading(true);
      setEmailMessage(null);
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;
      
      setEmailMessage({ type: "success", text: "ส่งลิงก์ยืนยันไปที่อีเมลใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยัน" });
      setNewEmail("");
    } catch (err: any) {
      console.error(err);
      setEmailMessage({ type: "error", text: err.message || "เกิดข้อผิดพลาดในการเปลี่ยนอีเมล" });
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ตั้งค่าบัญชี</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>เปลี่ยนอีเมลและรหัสผ่านสำหรับการเข้าสู่ระบบ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Email Change Section */}
        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#3B82F6,#60A5FA)" }}>
              <Mail size={20} color="white" />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: "#1A365D" }}>เปลี่ยนอีเมล</h2>
              <p className="text-xs" style={{ color: "#4A6080" }}>อัปเดตอีเมลที่ใช้สำหรับเข้าระบบและรับข่าวสาร</p>
            </div>
          </div>

          {emailMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-6 text-sm ${emailMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {emailMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {emailMessage.text}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: "#4A6080" }}>อีเมลใหม่</label>
              <input 
                type="email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl outline-none transition-all" 
                style={{ backgroundColor: "#F8F9FA", border: "1px solid #E2E8F0", color: "#1A365D" }}
                placeholder="กรอกอีเมลใหม่ของคุณ"
              />
            </div>

            <button 
              type="submit" 
              disabled={emailLoading}
              className="w-full py-3 rounded-xl text-white font-semibold mt-6 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#3B82F6,#60A5FA)" }}
            >
              {emailLoading ? "กำลังส่งลิงก์ยืนยัน..." : "เปลี่ยนอีเมล"}
            </button>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
            <Lock size={20} color="white" />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: "#1A365D" }}>เปลี่ยนรหัสผ่าน</h2>
            <p className="text-xs" style={{ color: "#4A6080" }}>อัปเดตรหัสผ่านใหม่เพื่อความปลอดภัย</p>
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-6 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "#4A6080" }}>รหัสผ่านใหม่</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none transition-all" 
              style={{ backgroundColor: "#F8F9FA", border: "1px solid #E2E8F0", color: "#1A365D" }}
              placeholder="กรอกรหัสผ่านใหม่"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "#4A6080" }}>ยืนยันรหัสผ่านใหม่</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none transition-all" 
              style={{ backgroundColor: "#F8F9FA", border: "1px solid #E2E8F0", color: "#1A365D" }}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold mt-6 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
          >
            {loading ? "กำลังบันทึก..." : "อัปเดตรหัสผ่าน"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
