import React, { useState, useEffect } from "react";
import { User, Settings, Edit3 } from "lucide-react";

import { DentistInfo, ServiceInfo } from "../../shared/data";
import { getDentists, changePassword, getServices } from "../../shared/supabaseApi";
import { supabase } from "../../shared/utils/supabaseClient";

export default function DoctorProfile({ doctor }: { doctor: DentistInfo | null }) {
  const [allServices, setAllServices] = useState<ServiceInfo[]>([]);
  
  // Change Password States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState("");

  useEffect(() => {
    getServices().then(setAllServices).catch(console.error);
  }, []);

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
          
          <div className="rounded-2xl bg-white p-6 mt-4" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: "#1A365D" }}>บริการที่รับรักษา</h3>
            {(!doctor.serviceIds || doctor.serviceIds.length === 0) ? (
              <p className="text-sm text-gray-500">ยังไม่มีข้อมูลบริการที่รับรักษา</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {doctor.serviceIds.map(sid => {
                  const srv = allServices.find(s => s.id === sid);
                  if (!srv) return null;
                  return (
                    <div key={sid} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      {srv.name}
                    </div>
                  );
                })}
              </div>
            )}
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
                <label className="text-xs font-medium block mb-1 text-gray-500">รหัสผ่านเดิม</label>
                <input 
                  type="password" 
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2"
                  style={{ borderColor: "rgba(26,54,93,0.1)", backgroundColor: "#F0F4F8", color: "#1A365D" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1 text-gray-500">รหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2"
                  style={{ borderColor: "rgba(26,54,93,0.1)", backgroundColor: "#F0F4F8", color: "#1A365D" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1 text-gray-500">ยืนยันรหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2"
                  style={{ borderColor: "rgba(26,54,93,0.1)", backgroundColor: "#F0F4F8", color: "#1A365D" }}
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

