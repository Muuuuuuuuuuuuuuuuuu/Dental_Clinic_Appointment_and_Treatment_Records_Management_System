import React, { useState, useMemo } from "react";
import { UserPlus, Save, AlertCircle, CheckCircle } from "lucide-react";

type RegForm = {
  firstName: string; lastName: string; idCard: string; dob: string; gender: string;
  phone: string; emergencyName: string; emergencyPhone: string;
  conditions: string; allergies: string;
  email: string;
};

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

export default function StaffRegisterPatient() {
  const [form, setForm] = useState<RegForm>({
    firstName: "", lastName: "", idCard: "", dob: "", gender: "",
    phone: "", emergencyName: "", emergencyPhone: "",
    conditions: "", allergies: "", email: ""
  });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k: keyof RegForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const age = useMemo(() => calcAge(form.dob), [form.dob]);

  const validate = () => {
    setErr("");
    if (!form.firstName || !form.lastName || !form.idCard || !form.dob || !form.gender || !form.phone) {
      setErr("กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (ชื่อ, นามสกุล, เลขบัตร, ว/ด/ป เกิด, เพศ, เบอร์โทร)");
      return false;
    }
    if (form.idCard.replace(/-/g, "").length < 13) {
      setErr("เลขบัตรประชาชนไม่ถูกต้อง");
      return false;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErr("รูปแบบอีเมลไม่ถูกต้อง");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (validate()) {
      // API Call goes here
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg,#4ade80,#22c55e)" }}>
          <CheckCircle size={40} color="white" />
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ลงทะเบียนคนไข้ใหม่สำเร็จ</h2>
        <p className="text-gray-600 mb-8">รหัสผ่านเริ่มต้นของคนไข้ถูกตั้งค่าเป็น <strong className="text-gray-800 bg-gray-100 px-2 py-1 rounded">{form.phone || form.idCard.slice(-4)}</strong></p>
        <button onClick={() => {
          setSuccess(false);
          setForm({
            firstName: "", lastName: "", idCard: "", dob: "", gender: "",
            phone: "", emergencyName: "", emergencyPhone: "",
            conditions: "", allergies: "", email: ""
          });
        }} className="px-6 py-3 rounded-xl font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          เพิ่มคนไข้รายอื่น
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(255,140,154,0.1),rgba(255,107,126,0.1))" }}>
          <UserPlus size={24} style={{ color: "#FF8C9A" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ลงทะเบียนคนไข้ใหม่</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>กรอกข้อมูลเพื่อสร้างประวัติในระบบ</p>
        </div>
      </div>

      {err && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-6" style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}>
          <AlertCircle size={16} /> {err}
        </div>
      )}

      <div className="space-y-8">
        {/* Section 1: Personal Info */}
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
              <input type="text" className={inputCls} style={inputStyle(form.idCard)} value={form.idCard} onChange={e => set("idCard", e.target.value)} placeholder="x-xxxx-xxxxx-xx-x" maxLength={13} />
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

        {/* Section 2: Contact Info */}
        <div>
          <h3 className="font-semibold mb-4 pb-2 border-b" style={{ color: "#1A365D", borderColor: "rgba(26,54,93,0.1)" }}>ข้อมูลการติดต่อ (Contact Info)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>เบอร์โทรศัพท์ <span className="text-red-400">*</span></label>
              <input type="tel" className={inputCls} style={inputStyle(form.phone)} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="08x-xxx-xxxx" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>อีเมล (ถ้ามี)</label>
              <input type="email" className={inputCls} style={inputStyle(form.email)} value={form.email} onChange={e => set("email", e.target.value)} placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>ชื่อผู้ติดต่อฉุกเฉิน</label>
              <input type="text" className={inputCls} style={inputStyle(form.emergencyName)} value={form.emergencyName} onChange={e => set("emergencyName", e.target.value)} placeholder="ชื่อ-นามสกุล หรือ ความสัมพันธ์" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#4A6080" }}>เบอร์ติดต่อฉุกเฉิน</label>
              <input type="tel" className={inputCls} style={inputStyle(form.emergencyPhone)} value={form.emergencyPhone} onChange={e => set("emergencyPhone", e.target.value)} placeholder="08x-xxx-xxxx" />
            </div>
          </div>
        </div>

        {/* Section 3: Medical Info */}
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
      </div>

      <div className="mt-10 flex gap-4 pt-6 border-t border-gray-100">
        <button onClick={() => {
            setForm({
              firstName: "", lastName: "", idCard: "", dob: "", gender: "",
              phone: "", emergencyName: "", emergencyPhone: "",
              conditions: "", allergies: "", email: ""
            });
            setErr("");
          }} 
          className="px-6 py-3 rounded-xl font-medium transition-colors hover:bg-gray-50"
          style={{ color: "#4A6080", border: "1px solid rgba(26,54,93,0.15)" }}>
          ล้างข้อมูล
        </button>
        <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Save size={18} /> บันทึกและสร้างบัญชีคนไข้
        </button>
      </div>
    </div>
  );
}
