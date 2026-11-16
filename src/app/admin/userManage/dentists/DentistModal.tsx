import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { DentistInfo, ServiceInfo } from "@/app/shared/data";
import { uploadAvatar } from "@/app/shared/supabaseApi";
import { useAdminOtpFlow } from "../useAdminOtpFlow";
import AdminOtpModalContent from "../AdminOtpModalContent";

interface DentistModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: DentistInfo | null;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  allServices: ServiceInfo[];
  onSave: (verifiedUserId?: string) => Promise<void> | void;
}

export default function DentistModal({
  isOpen,
  onClose,
  editing,
  form,
  setForm,
  allServices,
  onSave,
}: DentistModalProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const otpFlow = useAdminOtpFlow();

  useEffect(() => {
    if (!isOpen) {
      otpFlow.resetOtpFlow();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleService = (sid: number) => {
    setForm((f: any) => ({
      ...f,
      serviceIds: f.serviceIds.includes(sid)
        ? f.serviceIds.filter((id: number) => id !== sid)
        : [...f.serviceIds, sid],
    }));
  };

  const validateDentistForm = (): boolean => {
    otpFlow.setError("");
    const missing: string[] = [];
    if (!form.firstName?.trim()) missing.push("ชื่อ");
    if (!form.lastName?.trim()) missing.push("นามสกุล");
    if (!form.citizenId?.trim()) missing.push("เลขบัตรประชาชน");
    if (!form.gender) missing.push("เพศ");
    if (!form.specialty?.trim()) missing.push("ความเชี่ยวชาญ");
    if (!form.license?.trim()) missing.push("เลขที่ใบอนุญาต");
    if (!form.birthDate) missing.push("วันเกิด");
    if (!form.phone?.trim()) missing.push("เบอร์โทรศัพท์");
    if (!form.email?.trim()) missing.push("อีเมล");

    if (missing.length > 0) {
      otpFlow.setError(`กรุณากรอกข้อมูลให้ครบถ้วน (ยังขาด: ${missing.join(", ")})`);
      return false;
    }
    if (form.citizenId.replace(/\D/g, "").length !== 13) {
      otpFlow.setError("เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก");
      return false;
    }
    if (form.license.replace(/\D/g, "").length !== 5) {
      otpFlow.setError("เลขที่ใบอนุญาตต้องเป็นตัวเลข 5 หลัก");
      return false;
    }
    if (form.phone.replace(/\D/g, "").length !== 10) {
      otpFlow.setError("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      otpFlow.setError("รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีเมลอีกครั้ง");
      return false;
    }
    if (form.password && form.password.length < 6) {
      otpFlow.setError("รหัสผ่านเริ่มต้นต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }
    return true;
  };

  const handlePrimaryClick = async () => {
    if (editing) {
      await onSave();
      return;
    }
    if (!validateDentistForm()) return;
    await otpFlow.sendOtp({
      email: form.email,
      password: form.password || "password123",
      firstName: form.firstName,
      lastName: form.lastName,
      citizenId: form.citizenId,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
            {editing ? "แก้ไขข้อมูลทันตแพทย์" : "เพิ่มทันตแพทย์ใหม่"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <X size={18} style={{ color: "#4A6080" }} />
          </button>
        </div>

        {!editing && otpFlow.step === "otp" ? (
          <div className="flex-1 overflow-y-auto pr-1">
            <AdminOtpModalContent
              email={form.email}
              roleLabel="ทันตแพทย์"
              otp={otpFlow.otp}
              setOtp={otpFlow.setOtp}
              error={otpFlow.error}
              loading={otpFlow.loading}
              resendCooldown={otpFlow.resendCooldown}
              resendMsg={otpFlow.resendMsg}
              onBack={otpFlow.backToForm}
              onResendOTP={() =>
                otpFlow.resendOtp({
                  email: form.email,
                  firstName: form.firstName,
                  lastName: form.lastName,
                })
              }
              onVerifyOTP={() =>
                otpFlow.verifyOtpAndSave(form.email, async (verifiedUserId) => {
                  await onSave(verifiedUserId);
                })
              }
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {otpFlow.error && (
                <div
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border border-rose-200"
                  style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{otpFlow.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>คำนำหน้า</label>
                  <select
                    value={form.titleName}
                    onChange={(e) => setForm((f: any) => ({ ...f, titleName: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  >
                    <option value="ทพ.">ทพ.</option>
                    <option value="ทญ.">ทญ.</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>
                    ชื่อ <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((f: any) => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>
                    นามสกุล <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((f: any) => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>
                    เลขบัตรประชาชน (13 หลัก) <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.citizenId}
                    onChange={(e) => setForm((f: any) => ({ ...f, citizenId: e.target.value.replace(/\D/g, "").slice(0, 13) }))}
                    maxLength={13}
                    placeholder="กรอกตัวเลข 13 หลัก"
                    disabled={!!editing}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${editing ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>
                    เพศ <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm((f: any) => ({ ...f, gender: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  >
                    <option value="">- เลือกเพศ -</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>
                    ความเชี่ยวชาญ <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.specialty}
                    onChange={(e) => setForm((f: any) => ({ ...f, specialty: e.target.value }))}
                    placeholder="เช่น ทันตกรรมทั่วไป, จัดฟัน"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>
                    เลขที่ใบอนุญาต (5 หลัก) <span className="text-red-400">*</span>
                  </label>
                  <div
                    className="flex items-center rounded-xl overflow-hidden"
                    style={{ backgroundColor: "#F0F4F8" }}
                  >
                    <span
                      className="pl-3 pr-1.5 py-2.5 text-sm font-semibold select-none"
                      style={{ color: "#4A6080" }}
                    >
                      ทป.
                    </span>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="กรอกตัวเลข 5 หลัก (เช่น 12345)"
                      value={form.license.replace(/\D/g, "").slice(0, 5)}
                      onChange={(e) =>
                        setForm((f: any) => ({
                          ...f,
                          license: e.target.value.replace(/\D/g, "").slice(0, 5),
                        }))
                      }
                      className="w-full pr-3 py-2.5 text-sm outline-none bg-transparent"
                      style={{ color: "#1A365D" }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>จบจากสถาบัน</label>
                  <input
                    value={form.university}
                    onChange={(e) => setForm((f: any) => ({ ...f, university: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ปีที่เรียนจบ (ค.ศ.)</label>
                  <input
                    type="number"
                    min={1950}
                    max={new Date().getFullYear()}
                    value={form.graduationYear}
                    onChange={(e) => {
                      const currentYear = new Date().getFullYear();
                      const val = parseInt(e.target.value);
                      setForm((f: any) => ({
                        ...f,
                        graduationYear: isNaN(val) ? currentYear : Math.min(currentYear, val),
                      }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>
                    วันเกิด <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm((f: any) => ({ ...f, birthDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>
                    เบอร์โทรศัพท์ <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="กรอกตัวเลข 10 หลัก"
                    value={form.phone}
                    onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>วันที่เริ่มงาน</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f: any) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>รูปโปรไฟล์ (อัปโหลด)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingImage(true);
                          const url = await uploadAvatar(file);
                          setForm((f: any) => ({ ...f, imageUrl: url }));
                        } catch (err) {
                          alert("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                      disabled={uploadingImage}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1A365D] file:text-white hover:file:bg-[#122847]"
                    />
                    {uploadingImage && <span className="text-xs text-slate-500 animate-pulse">กำลังอัปโหลด...</span>}
                  </div>
                  {form.imageUrl && (
                    <div className="mt-2 text-xs text-green-600 truncate">
                      อัปโหลดแล้ว: {form.imageUrl.substring(0, 30)}...
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ที่อยู่ปัจจุบัน</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f: any) => ({ ...f, address: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>
                    อีเมล <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f: any) => ({ ...f, email: e.target.value }))}
                    disabled={!!editing}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${editing ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                  />
                </div>
                {!editing && (
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ตั้งรหัสผ่าน (ปล่อยว่าง = password123)</label>
                    <input
                      type="text"
                      value={form.password}
                      onChange={(e) => setForm((f: any) => ({ ...f, password: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                      placeholder="password123"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "#4A6080" }}>บริการที่รับผิดชอบ</label>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-[150px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {allServices.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.serviceIds?.includes(s.id)}
                          onChange={() => toggleService(s.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm" style={{ color: "#1A365D" }}>{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {otpFlow.error && (
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border border-rose-200 mt-4 flex-shrink-0"
                style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{otpFlow.error}</span>
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={onClose}
                disabled={otpFlow.loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50 cursor-pointer"
                style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handlePrimaryClick}
                disabled={otpFlow.loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
              >
                {otpFlow.loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังส่ง OTP...
                  </>
                ) : editing ? (
                  "บันทึก"
                ) : (
                  "ส่งรหัส OTP และดำเนินการต่อ"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
