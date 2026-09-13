import React, { useState } from "react";
import { User, Lock, Edit3, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

import { PatientUser, inputStyle, inputCls } from "../types";

const calcAge = (dob: string) => {
  const diff = Date.now() - new Date(dob).getTime();
  return new Date(diff).getUTCFullYear() - 1970;
};

const thDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
};

export default function ProfileView({ user, setUser }: { user: PatientUser; setUser: (u: PatientUser) => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: user.phone, email: user.email, address: user.address ?? "", emergencyName: user.emergencyName, emergencyPhone: user.emergencyPhone });
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [pwMode, setPwMode] = useState(false);
  const [emailMode, setEmailMode] = useState(false);
  const [emailForm, setEmailForm] = useState({ oldPw: "", newEmail: "" });
  const [emailErr, setEmailErr] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [pw, setPw] = useState({ old: "", newPw: "", confirm: "" });
  const [pwErr, setPwErr] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);

  const saveProfile = async () => {
    setSaveErr("");
    setSaveLoading(true);
    try {
      const { supabase, updatePatientProfile } = await import("../../shared/supabaseApi");
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("ไม่พบข้อมูลผู้ใช้");
      await updatePatientProfile(authUser.id, form);
      setUser({ ...user, ...form });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveErr(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaveLoading(false);
    }
  };

  const saveEmail = async () => {
    setEmailErr("");
    if (!emailForm.oldPw) { setEmailErr("กรุณากรอกรหัสผ่านเพื่อยืนยัน"); return; }
    if (!emailForm.newEmail || !emailForm.newEmail.includes('@')) { setEmailErr("อีเมลไม่ถูกต้อง"); return; }

    setEmailLoading(true);
    try {
      const { changeEmail } = await import("../../shared/api/authApi");
      await changeEmail(emailForm.oldPw, emailForm.newEmail);
      setUser({ ...user, email: emailForm.newEmail });
      setEmailMode(false);
      setEmailForm({ oldPw: "", newEmail: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      alert("เปลี่ยนอีเมลสำเร็จ กรุณาตรวจสอบอีเมลใหม่เพื่อยืนยัน (ถ้ามี)");
    } catch (err: any) {
      setEmailErr(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนอีเมล");
    } finally {
      setEmailLoading(false);
    }
  };

  const savePw = async () => {
    setPwErr("");
    if (!pw.old) { setPwErr("กรุณากรอกรหัสผ่านเดิม"); return; }
    if (pw.newPw.length < 8) { setPwErr("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    if (pw.newPw !== pw.confirm) { setPwErr("รหัสผ่านใหม่ไม่ตรงกัน"); return; }

    setPwLoading(true);
    try {
      const { changePassword } = await import("../../shared/supabaseApi");
      await changePassword(pw.old, pw.newPw);
      setPwMode(false);
      setPw({ old: "", newPw: "", confirm: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setPwErr(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setPwLoading(false);
    }
  };

  const InfoRow = ({ label, val }: { label: string; val: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3" style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}>
      <span className="text-xs font-medium w-40 mb-1 sm:mb-0 flex-shrink-0" style={{ color: "#4A6080" }}>{label}</span>
      <span className="text-sm" style={{ color: "#1A365D" }}>{val || "—"}</span>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ข้อมูลส่วนตัว</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>จัดการและตรวจสอบข้อมูลส่วนตัวของคุณ</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}>
            <CheckCircle size={14} /> บันทึกสำเร็จ
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Avatar card */}
        <div className="rounded-2xl bg-white p-6 text-center" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
            {user.firstName[0]}
          </div>
          <h2 className="font-bold text-base" style={{ color: "#1A365D" }}>{user.firstName} {user.lastName}</h2>
          <p className="text-sm mt-0.5" style={{ color: "#4A6080" }}>{user.email}</p>
          <div className="mt-4 pt-4 space-y-2" style={{ borderTop: "1px solid rgba(26,54,93,0.06)" }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: "#4A6080" }}>เพศ</span>
              <span style={{ color: "#1A365D" }}>{user.gender}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "#4A6080" }}>อายุ</span>
              <span style={{ color: "#1A365D" }}>{calcAge(user.dob)}</span>
            </div>
          </div>
        </div>

        {/* Detail cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* View-only */}
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: "#1A365D" }}>ข้อมูลระบุตัวตน (View Only)</h3>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F0F4F8", color: "#4A6080" }}>
                แก้ไขโดยเจ้าหน้าที่เท่านั้น
              </span>
            </div>
            <InfoRow label="เลขบัตรประชาชน" val={user.idCard} />
            <InfoRow label="วันเกิด" val={thDate(user.dob)} />
            <InfoRow label="โรคประจำตัว" val={user.conditions} />
            <InfoRow label="ประวัติแพ้ยา" val={user.allergies} />
          </div>

          {/* Editable */}
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: "#1A365D" }}>ข้อมูลที่แก้ไขได้</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: "#FF8C9A" }}>
                  <Edit3 size={12} /> แก้ไข
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(false); setSaveErr(""); setForm({ phone: user.phone, email: user.email, address: user.address ?? "", emergencyName: user.emergencyName, emergencyPhone: user.emergencyPhone }); }}
                    className="text-xs px-3 py-1.5 rounded-lg" style={{ border: "1px solid rgba(26,54,93,0.2)", color: "#4A6080" }}>
                    ยกเลิก
                  </button>
                  <button onClick={saveProfile} disabled={saveLoading}
                    className="text-xs px-3 py-1.5 rounded-lg text-white disabled:opacity-60" style={{ backgroundColor: "#FF8C9A" }}>
                    {saveLoading ? "กำลังบันทึก..." : "บันทึก"}
                  </button>
                </div>
              )}
              {saveErr && (
                <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "#C0392B" }}>
                  <AlertCircle size={12} /> {saveErr}
                </div>
              )}
            </div>
            {["phone", "address", "emergencyName", "emergencyPhone"].map(k => {
              const labels: Record<string, string> = { phone: "เบอร์โทรศัพท์", email: "อีเมล", address: "ที่อยู่ปัจจุบัน", emergencyName: "ผู้ติดต่อฉุกเฉิน (ชื่อ)", emergencyPhone: "ผู้ติดต่อฉุกเฉิน (เบอร์)" };
              return editing ? (
                <div key={k} className="py-2" style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>{labels[k]}</label>
                  {k === "address" ? (
                    <textarea value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                  ) : (
                    <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                  )}
                </div>
              ) : (
                <InfoRow key={k} label={labels[k]} val={(form as any)[k]} />
              );
            })}
          </div>

          {/* Security */}
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: "#1A365D" }}>การจัดการความปลอดภัย (Security)</h3>
            </div>
            
            {/* Email Edit */}
            <div className="py-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "#4A6080" }}>อีเมล (Email)</span>
                <button onClick={() => { setEmailMode(!emailMode); setPwMode(false); }} className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: "#FF8C9A" }}>
                  <Edit3 size={12} /> {emailMode ? "ยกเลิก" : "เปลี่ยนอีเมล"}
                </button>
              </div>
              {!emailMode ? (
                <p className="text-sm" style={{ color: "#1A365D" }}>{user.email}</p>
              ) : (
                <div className="space-y-3 mt-3">
                  {emailErr && <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}><AlertCircle size={13} /> {emailErr}</div>}
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>อีเมลใหม่</label>
                    <input type="email" value={emailForm.newEmail} onChange={e => setEmailForm(p => ({ ...p, newEmail: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>รหัสผ่านปัจจุบัน (เพื่อยืนยันตัวตน)</label>
                    <input type="password" value={emailForm.oldPw} onChange={e => setEmailForm(p => ({ ...p, oldPw: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEmail} disabled={emailLoading}
                      className="text-sm px-5 py-2 rounded-xl text-white font-medium disabled:opacity-50 transition-all"
                      style={{ backgroundColor: "#FF8C9A" }}>
                      {emailLoading ? "กำลังบันทึก..." : "ยืนยันเปลี่ยนอีเมล"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password Edit */}
            <div className="py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "#4A6080" }}>รหัสผ่าน (Password)</span>
                <button onClick={() => { setPwMode(!pwMode); setEmailMode(false); }} className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: "#FF8C9A" }}>
                  <Lock size={12} /> {pwMode ? "ยกเลิก" : "เปลี่ยนรหัสผ่าน"}
                </button>
              </div>
              {!pwMode ? (
                <p className="text-sm" style={{ color: "#1A365D" }}>????????</p>
              ) : (
                <div className="space-y-3 mt-3">
                  {pwErr && <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}><AlertCircle size={13} /> {pwErr}</div>}
                  {[
                    { k: "old",    label: "รหัสผ่านเดิม" },
                    { k: "newPw",  label: "รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)" },
                    { k: "confirm",label: "ยืนยันรหัสผ่านใหม่" },
                  ].map(f => (
                    <div key={f.k}>
                      <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>{f.label}</label>
                      <input type="password" value={(pw as any)[f.k]} onChange={e => setPw(p => ({ ...p, [f.k]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button onClick={savePw} disabled={pwLoading}
                      className="text-sm px-5 py-2 rounded-xl text-white font-medium disabled:opacity-50 transition-all"
                      style={{ backgroundColor: "#FF8C9A" }}>
                      {pwLoading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

