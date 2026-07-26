import React, { useState, useEffect } from "react";
import { User, Settings, Edit3 } from "lucide-react";

import { DentistInfo } from "../../shared/data";
import { getDentists, changePassword } from "../../shared/supabaseApi";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState<DentistInfo | null>(null);
  
  // Change Password States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState("");

  useEffect(() => {
    getDentists().then(d => setDoctor(d[0])).catch(console.error);
  }, []);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setChangeError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setIsChanging(true);
    setChangeError("");
    try {
      await changePassword(newPassword);
      alert("เปลี่ยนรหัสผ่านสำเร็จ!");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setChangeError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setIsChanging(false);
    }
  };

  if (!doctor) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ข้อมูลส่วนตัว</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white p-6 text-center" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
          <div className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white font-bold" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
            {doctor.name[4] || "ท"}
          </div>
          <h2 className="font-bold" style={{ color: "#1A365D" }}>{doctor.name}</h2>
          <p className="text-sm mt-0.5" style={{ color: "#FF8C9A" }}>{doctor.specialty}</p>
          <div className="mt-3 px-4 py-2 rounded-full text-xs font-medium mx-auto inline-block" style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>
            ใบอนุญาต: {doctor.license}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: "#1A365D" }}>ข้อมูลวิชาชีพ (View Only)</h3>
            {[
              ["ความเชี่ยวชาญ", doctor.specialty],
              ["เลขที่ใบอนุญาต", doctor.license],
              ["สถาบันการศึกษา", doctor.university],
              ["ประสบการณ์", "12 ปี"],
            ].map(([k, v]) => (
              <div key={k} className="flex py-2.5" style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                <span className="text-xs w-36 font-medium flex-shrink-0" style={{ color: "#4A6080" }}>{k}</span>
                <span className="text-sm" style={{ color: "#1A365D" }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: "#1A365D" }}>ข้อมูลติดต่อ</h3>
            {[["อีเมล", doctor.email], ["เบอร์โทร", doctor.phone]].map(([k, v]) => (
              <div key={k} className="flex py-2.5" style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                <span className="text-xs w-36 font-medium flex-shrink-0" style={{ color: "#4A6080" }}>{k}</span>
                <span className="text-sm" style={{ color: "#1A365D" }}>{v}</span>
              </div>
            ))}
            
            <div className="pt-4 mt-2">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-gray-50 border"
                style={{ borderColor: "#E2E8F0", color: "#1A365D" }}
              >
                <Settings size={16} /> เปลี่ยนรหัสผ่านเข้าใช้งาน
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>เปลี่ยนรหัสผ่านใหม่</h3>
            
            {changeError && <p className="text-red-500 text-xs mb-3">{changeError}</p>}
            
            <div className="space-y-4">
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
    </div>
  );
}

