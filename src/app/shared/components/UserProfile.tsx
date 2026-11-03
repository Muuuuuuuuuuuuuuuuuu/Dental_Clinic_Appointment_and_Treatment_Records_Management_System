import React, { useState } from "react";
import { AdminInfo, StaffInfo } from "../data";
import { changePassword, supabase } from "../supabaseApi";

export default function UserProfile({ 
  user, 
  type 
}: { 
  user: AdminInfo | StaffInfo | null; 
  type: "admin" | "staff";
}) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState("");

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleChangePassword = async () => {
    if (!oldPassword) {
      setChangeError("กรุณากรอกรหัสผ่านเดิม");
      return;
    }
    if (newPassword.length < 6) {
      setChangeError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setIsChanging(true);
    setChangeError("");
    try {
      await changePassword(oldPassword, newPassword);
      alert("เปลี่ยนรหัสผ่านสำเร็จ!");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setChangeError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setIsChanging(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!currentPassword) {
      setEmailMessage({ type: "error", text: "กรุณากรอกรหัสผ่านปัจจุบันเพื่อความปลอดภัย" });
      return;
    }
    if (!newEmail || !newEmail.includes("@")) {
      setEmailMessage({ type: "error", text: "กรุณากรอกอีเมลให้ถูกต้อง" });
      return;
    }

    try {
      setEmailLoading(true);
      setEmailMessage(null);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.email) throw new Error("ไม่พบข้อมูลผู้ใช้");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword
      });

      if (signInError) throw new Error("รหัสผ่านปัจจุบันไม่ถูกต้อง");

      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;
      
      setEmailMessage({ type: "success", text: "ส่งลิงก์ยืนยันไปที่อีเมลใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยัน" });
      setNewEmail("");
      setCurrentPassword("");
    } catch (err: any) {
      console.error(err);
      setEmailMessage({ type: "error", text: err.message || "เกิดข้อผิดพลาดในการเปลี่ยนอีเมล" });
    } finally {
      setEmailLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>ข้อมูลส่วนตัว</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white p-6 text-center" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
          <div className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white font-bold" 
               style={{ background: type === 'admin' ? "#FF8C9A" : "linear-gradient(135deg,#1D6FA4,#1A365D)" }}>
            {user.firstName?.[0] || user.name?.[0] || (type === "admin" ? "อ" : "พ")}
          </div>
          <h2 className="font-bold" style={{ color: "#1A365D" }}>{user.firstName ? `${user.firstName} ${user.lastName}` : user.name}</h2>
          <p className="text-sm mt-0.5" style={{ color: type === 'admin' ? "#FF8C9A" : "#1D6FA4" }}>
            {type === "admin" ? "ผู้ดูแลระบบ" : (user as StaffInfo).role || "พนักงาน"}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
            <button 
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium border text-gray-700 hover:bg-gray-50 transition-colors w-full"
            >
              เปลี่ยนอีเมล
            </button>
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium border text-gray-700 hover:bg-gray-50 transition-colors w-full"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: "#1A365D" }}>ข้อมูลส่วนตัว (View Only)</h3>
            {[
              ["เลขบัตรประชาชน", user.citizenId || "-"],
              ["เพศ", user.gender || "-"],
              ["วันเกิด", user.birthDate || "-"],
              ["ที่อยู่", user.address || "-"],
              ["เบอร์โทรศัพท์", user.phone || "-"],
              ["อีเมล", user.email || "-"],
            ].map(([k, v]) => (
              <div key={k} className="flex py-2.5" style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                <span className="text-xs w-36 font-medium flex-shrink-0" style={{ color: "#4A6080" }}>{k}</span>
                <span className="text-sm" style={{ color: "#1A365D" }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-6 mt-4" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: "#1A365D" }}>ข้อมูลการจ้างงาน</h3>
            {[
              ["ตำแหน่ง", type === "admin" ? "ผู้ดูแลระบบ" : (user as StaffInfo).role],
              ["วันที่เริ่มงาน", user.startDate || "-"],
              ["สถานะ", user.employmentStatus || "-"],
            ].map(([k, v]) => (
              <div key={k} className="flex py-2.5" style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                <span className="text-xs w-36 font-medium flex-shrink-0" style={{ color: "#4A6080" }}>{k}</span>
                <span className="text-sm" style={{ color: "#1A365D" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>เปลี่ยนรหัสผ่านใหม่</h3>
            
            {changeError && <p className="text-red-500 text-xs mb-3">{changeError}</p>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">รหัสผ่านเดิม</label>
                <input 
                  type="password" 
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">รหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="พิมพ์ให้ตรงกันอีกครั้ง"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => { setShowPasswordModal(false); setChangeError(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold border text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleChangePassword}
                disabled={isChanging}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #1D6FA4, #1A365D)" }}
              >
                {isChanging ? "กำลังบันทึก..." : "บันทึกรหัสผ่าน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>เปลี่ยนอีเมล</h3>
            
            {emailMessage && (
              <p className={`text-xs mb-3 ${emailMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                {emailMessage.text}
              </p>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">รหัสผ่านปัจจุบัน (เพื่อยืนยันตัวตน)</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">อีเมลใหม่</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="อีเมลใหม่ที่ต้องการใช้"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => { setShowEmailModal(false); setEmailMessage(null); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold border text-gray-600 hover:bg-gray-50"
              >
                ปิด
              </button>
              <button 
                onClick={handleEmailSubmit}
                disabled={emailLoading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #3B82F6, #60A5FA)" }}
              >
                {emailLoading ? "กำลังดำเนินการ..." : "ยืนยันการเปลี่ยน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
