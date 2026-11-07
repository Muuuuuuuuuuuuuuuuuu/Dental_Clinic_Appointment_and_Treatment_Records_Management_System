import React from "react";
import { UserPlus, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { RegForm } from "../hooks/usePatientRegister";
import FormField, { inputCls, inputStyle } from "./FormField";

interface RegisterFormStepProps {
  form: RegForm;
  set: (k: keyof RegForm, v: string) => void;
  age: number;
  err: string;
  loading: boolean;
  showFormPass: boolean;
  setShowFormPass: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: () => void;
}

/**
 * 📝 [REGISTER STEP - FORM] ฟอร์มกรอกข้อมูลคนไข้ใหม่ โดยใช้ FormField Reusable Component
 */
export function RegisterFormStep({
  form,
  set,
  age,
  err,
  loading,
  showFormPass,
  setShowFormPass,
  onSubmit,
}: RegisterFormStepProps) {
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
      {/* Header ส่วนบน แบบกะทัดรัด */}
      <div className="flex items-center gap-3 mb-3.5 pb-2.5 border-b border-gray-100">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg,rgba(255,140,154,0.15),rgba(255,107,126,0.15))",
          }}
        >
          <UserPlus size={18} style={{ color: "#FF8C9A" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            ลงทะเบียนคนไข้ใหม่
          </h1>
          <p className="text-xs truncate" style={{ color: "#4A6080" }}>
            กรอกข้อมูลเพื่อสร้างประวัติในระบบ — พนักงานเป็นผู้ดำเนินการแทนคนไข้ พร้อมยืนยันอีเมลผ่าน OTP
          </p>
        </div>
      </div>

      {err && (
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs mb-3"
          style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}
        >
          <AlertCircle size={15} /> {err}
        </div>
      )}

      {/* เนื้อหาแบ่งเป็น 2 คอลัมน์บนจอใหญ่ เพื่อลดความสูงและไม่ต้องเลื่อนหน้าจอ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-3.5">
        {/* คอลัมน์ซ้าย: ข้อมูลส่วนตัว + ข้อมูลติดต่อ/บัญชี */}
        <div className="space-y-3">
          {/* ส่วนที่ 1: ข้อมูลส่วนตัว */}
          <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100/80">
            <h3
              className="text-xs font-bold mb-2 pb-1 border-b flex items-center gap-1.5"
              style={{ color: "#1A365D", borderColor: "rgba(26,54,93,0.08)" }}
            >
              <span className="w-1.5 h-3 rounded-full bg-[#FF8C9A]"></span>
              ข้อมูลส่วนตัว (Personal Information)
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                <FormField
                  label="ชื่อจริง"
                  required
                  value={form.firstName}
                  onChange={(v) => set("firstName", v)}
                  placeholder="ไม่ต้องใส่คำนำหน้า"
                />
                <FormField
                  label="นามสกุล"
                  required
                  value={form.lastName}
                  onChange={(v) => set("lastName", v)}
                  placeholder="นามสกุล"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6">
                  <FormField
                    label="เลขประจำตัวประชาชน"
                    required
                    value={form.idCard}
                    onChange={(v) =>
                      set("idCard", v.replace(/\D/g, "").slice(0, 13))
                    }
                    placeholder="13 หลัก ไม่ต้องใส่ขีด"
                    maxLength={13}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label
                    className="block text-xs font-semibold mb-1"
                    style={{ color: "#4A6080" }}
                  >
                    วันเกิด <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    style={inputStyle(form.dob)}
                    value={form.dob}
                    onChange={(e) => set("dob", e.target.value)}
                  />
                  {form.dob && (
                    <p className="text-[10px] mt-0.5 text-gray-400 text-right">
                      อายุ {age} ปี
                    </p>
                  )}
                </div>
                <div className="sm:col-span-3">
                  <label
                    className="block text-xs font-semibold mb-1"
                    style={{ color: "#4A6080" }}
                  >
                    เพศ <span className="text-red-400">*</span>
                  </label>
                  <select
                    className={inputCls}
                    style={inputStyle(form.gender)}
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                  >
                    <option value="">เลือกเพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ส่วนที่ 2: ข้อมูลการติดต่อและบัญชี */}
          <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100/80">
            <h3
              className="text-xs font-bold mb-2 pb-1 border-b flex items-center gap-1.5"
              style={{ color: "#1A365D", borderColor: "rgba(26,54,93,0.08)" }}
            >
              <span className="w-1.5 h-3 rounded-full bg-[#FF8C9A]"></span>
              ข้อมูลการติดต่อและบัญชีเข้าสู่ระบบ (Contact & Account)
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <FormField
                  label="เบอร์โทรศัพท์"
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(v) => set("phone", v.replace(/\D/g, "").slice(0, 10))}
                  placeholder="กรอกตัวเลข 10 หลัก"
                  maxLength={10}
                />
                <FormField
                  label="อีเมลสำหรับเข้าสู่ระบบ"
                  required
                  type="email"
                  value={form.email}
                  onChange={(v) => set("email", v.trim())}
                  placeholder="example@email.com"
                  sublabel="ระบบจะส่ง OTP 6 หลักเพื่อยืนยัน"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1"
                    style={{ color: "#4A6080" }}
                  >
                    รหัสผ่านเริ่มต้นสำหรับคนไข้
                  </label>
                  <div className="relative">
                    <input
                      type={showFormPass ? "text" : "password"}
                      className={inputCls}
                      style={inputStyle(form.password)}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPass((p) => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showFormPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[10px] mt-0.5 text-slate-400 truncate">
                    ค่าเริ่มต้น: 123456789 (เปลี่ยนได้ภายหลัง)
                  </p>
                </div>
                <FormField
                  label="ที่อยู่ปัจจุบัน"
                  value={form.address}
                  onChange={(v) => set("address", v)}
                  placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด"
                />
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: ผู้ติดต่อฉุกเฉิน + ข้อมูลสุขภาพ + ปุ่มดำเนินการต่อ */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            {/* ส่วนที่ 3: ผู้ติดต่อฉุกเฉิน */}
            <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100/80">
              <h3
                className="text-xs font-bold mb-2 pb-1 border-b flex items-center gap-1.5"
                style={{ color: "#1A365D", borderColor: "rgba(26,54,93,0.08)" }}
              >
                <span className="w-1.5 h-3 rounded-full bg-[#FF8C9A]"></span>
                ผู้ติดต่อฉุกเฉิน (Emergency Contact)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <FormField
                  label="ชื่อ-นามสกุล"
                  value={form.emergencyName}
                  onChange={(v) => set("emergencyName", v)}
                  placeholder="ชื่อผู้ติดต่อฉุกเฉิน"
                />
                <FormField
                  label="เบอร์โทรศัพท์"
                  type="tel"
                  value={form.emergencyPhone}
                  onChange={(v) =>
                    set("emergencyPhone", v.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="เบอร์ติดต่อ 10 หลัก"
                  maxLength={10}
                />
                <FormField
                  label="ความสัมพันธ์"
                  value={form.emergencyRelationship}
                  onChange={(v) => set("emergencyRelationship", v)}
                  placeholder="เช่น บิดา, มารดา, คู่สมรส"
                />
              </div>
            </div>

            {/* ส่วนที่ 4: ข้อมูลสุขภาพ */}
            <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100/80">
              <h3
                className="text-xs font-bold mb-2 pb-1 border-b flex items-center gap-1.5"
                style={{ color: "#1A365D", borderColor: "rgba(26,54,93,0.08)" }}
              >
                <span className="w-1.5 h-3 rounded-full bg-[#FF8C9A]"></span>
                ข้อมูลสุขภาพ (Health Information)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <FormField
                  label="ประวัติแพ้ยา / อาหาร / สารเคมี"
                  value={form.allergies}
                  onChange={(v) => set("allergies", v)}
                  placeholder="ระบุชื่อยา หรือพิมพ์ 'ไม่มี'"
                />
                <FormField
                  label="โรคประจำตัว / ภาวะสุขภาพ"
                  value={form.conditions}
                  onChange={(v) => set("conditions", v)}
                  placeholder="ระบุโรคประจำตัว หรือพิมพ์ 'ไม่มี'"
                />
              </div>
            </div>
          </div>

          {/* ปุ่มดำเนินการต่อ อยู่ด้านล่างคอลัมน์ขวา ลงตัวพอดี */}
          <div className="pt-1">
            <div className="flex items-center justify-between gap-3 bg-rose-50/50 border border-rose-100/80 rounded-xl p-2.5">
              <div className="text-[11px] text-[#4A6080] leading-snug hidden sm:block pl-1">
                <span className="text-red-400 font-semibold">*</span> ตรวจสอบข้อมูลให้ถูกต้องก่อนกดส่ง OTP
              </div>
              <button
                onClick={onSubmit}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white transition-all hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm ml-auto"
                style={{
                  background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)",
                  boxShadow: "0 4px 14px rgba(255,140,154,0.35)",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังส่ง OTP...
                  </>
                ) : (
                  <>
                    ดำเนินการต่อ (ส่ง OTP ไปที่อีเมล) <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterFormStep;

