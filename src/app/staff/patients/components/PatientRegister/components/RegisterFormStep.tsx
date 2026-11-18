import React from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { RegForm, getDobError, MAX_PATIENT_AGE } from "../hooks/usePatientRegister";
import FormField, { inputCls, inputStyle } from "./FormField";

// ช่วงวันเกิดที่เลือกได้ในปฏิทิน: ไม่เกินวันนี้ และย้อนหลังไม่เกิน MAX_PATIENT_AGE ปี
const toLocalYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const _today = new Date();
const dobMax = toLocalYmd(_today);
const dobMin = toLocalYmd(
  new Date(_today.getFullYear() - MAX_PATIENT_AGE, _today.getMonth(), _today.getDate())
);

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

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50/60 rounded-xl border border-rose-100/80 overflow-hidden">
      <h3
        className="text-sm font-bold px-3.5 py-2 text-white"
        style={{ backgroundColor: "#E16076" }}
      >
        {title}
      </h3>
      <div className="p-3">{children}</div>
    </div>
  );
}

/**
 * [REGISTER STEP - FORM] ฟอร์มกรอกข้อมูลคนไข้ใหม่ โดยใช้ FormField Reusable Component
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
      <div className="mb-3.5 pb-2.5 border-b border-gray-100">
        <div className="min-w-0">
          <h1
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            ลงทะเบียนคนไข้ใหม่
          </h1>
          <p className="text-xs truncate" style={{ color: "#4A6080" }}>
            กรอกข้อมูลเพื่อสร้างประวัติในระบบ
          </p>
        </div>
      </div>

      {err && (
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs mb-3 font-medium border border-rose-200"
          style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{err}</span>
        </div>
      )}

      {/* เนื้อหาแบ่งเป็น 2 คอลัมน์บนจอใหญ่ เพื่อลดความสูงและไม่ต้องเลื่อนหน้าจอ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-3.5">
        {/* คอลัมน์ซ้าย: ข้อมูลส่วนตัว + ข้อมูลติดต่อ/บัญชี */}
        <div className="space-y-3">
          {/* ส่วนที่ 1: ข้อมูลส่วนตัว */}
          <FormSection title="ข้อมูลส่วนตัว">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                <FormField
                  label="ชื่อจริง"
                  required
                  value={form.firstName}
                  onChange={(v) => set("firstName", v)}
                  placeholder="ไม่ต้องใส่คำนำหน้า"
                  hasError={Boolean(err && !form.firstName?.trim())}
                />
                <FormField
                  label="นามสกุล"
                  required
                  value={form.lastName}
                  onChange={(v) => set("lastName", v)}
                  placeholder="นามสกุล"
                  hasError={Boolean(err && !form.lastName?.trim())}
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
                    hasError={Boolean(
                      err &&
                      (!form.idCard?.trim() ||
                        form.idCard.replace(/\D/g, "").length !== 13)
                    )}
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
                    style={inputStyle(
                      form.dob,
                      Boolean((err && !form.dob) || getDobError(form.dob))
                    )}
                    value={form.dob}
                    min={dobMin}
                    max={dobMax}
                    onChange={(e) => set("dob", e.target.value)}
                  />
                  {form.dob && getDobError(form.dob) ? (
                    <p className="text-[10px] mt-0.5 text-red-500 text-right">
                      {getDobError(form.dob)}
                    </p>
                  ) : form.dob ? (
                    <p className="text-[10px] mt-0.5 text-gray-400 text-right">
                      อายุ {age} ปี
                    </p>
                  ) : null}
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
                    style={inputStyle(form.gender, Boolean(err && !form.gender))}
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
          </FormSection>

          {/* ส่วนที่ 2: ข้อมูลการติดต่อและบัญชี */}
          <FormSection title="ข้อมูลการติดต่อและบัญชีเข้าสู่ระบบ">
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
                  hasError={Boolean(
                    err &&
                    (!form.phone?.trim() ||
                      form.phone.replace(/\D/g, "").length !== 10)
                  )}
                />
                <FormField
                  label="อีเมลสำหรับเข้าสู่ระบบ"
                  required
                  type="email"
                  value={form.email}
                  onChange={(v) => set("email", v.trim())}
                  placeholder="example@email.com"
                  hasError={Boolean(
                    err &&
                    (!form.email?.trim() ||
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
                  )}
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
          </FormSection>
        </div>

        {/* คอลัมน์ขวา: ผู้ติดต่อฉุกเฉิน + ข้อมูลสุขภาพ + ปุ่มดำเนินการต่อ */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            {/* ส่วนที่ 3: ผู้ติดต่อฉุกเฉิน */}
            <FormSection title="ผู้ติดต่อฉุกเฉิน">
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
            </FormSection>

            {/* ส่วนที่ 4: ข้อมูลสุขภาพ */}
            <FormSection title="ข้อมูลสุขภาพ">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <FormField
                  label="ประวัติแพ้ยา / อาหาร / สารเคมี"
                  required
                  value={form.allergies}
                  onChange={(v) => set("allergies", v)}
                  placeholder="ระบุชื่อยา หรือพิมพ์ 'ไม่มี'"
                  hasError={Boolean(err && !form.allergies?.trim())}
                />
                <FormField
                  label="โรคประจำตัว / ภาวะสุขภาพ"
                  required
                  value={form.conditions}
                  onChange={(v) => set("conditions", v)}
                  placeholder="ระบุโรคประจำตัว หรือพิมพ์ 'ไม่มี'"
                  hasError={Boolean(err && !form.conditions?.trim())}
                />
              </div>
            </FormSection>
          </div>

          {/* ปุ่มดำเนินการต่อ */}
          <div className="pt-1">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: "#E16076" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังส่ง OTP...
                </>
              ) : (
                "ดำเนินการต่อ"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterFormStep;

