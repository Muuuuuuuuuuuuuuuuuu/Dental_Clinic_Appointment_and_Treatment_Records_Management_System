import React from "react";
import { X } from "lucide-react";
import { AdminInfo } from "@/app/shared/data";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: AdminInfo | null;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
}

export default function AdminModal({
  isOpen,
  onClose,
  editing,
  form,
  setForm,
  onSave,
}: AdminModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
            {editing ? "แก้ไขผู้ดูแลระบบ" : "เพิ่มผู้ดูแลระบบใหม่"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <X size={18} style={{ color: "#4A6080" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ชื่อ</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((f: any) => ({ ...f, firstName: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>นามสกุล</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((f: any) => ({ ...f, lastName: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เลขบัตรประชาชน (13 หลัก)</label>
              <input
                type="text"
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
              <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เพศ</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>วันเกิด</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm((f: any) => ({ ...f, birthDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>เบอร์โทรศัพท์</label>
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

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ที่อยู่ปัจจุบัน</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm((f: any) => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>อีเมล</label>
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
                <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>รหัสผ่านเริ่มต้น</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f: any) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>ตำแหน่ง</label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm((f: any) => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>สถานะการทำงาน</label>
              <select
                value={form.employmentStatus}
                onChange={(e) => setForm((f: any) => ({ ...f, employmentStatus: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
              >
                <option value="ปฏิบัติงานปกติ">ปฏิบัติงานปกติ</option>
                <option value="พักงาน">พักงาน</option>
                <option value="ลาออก">ลาออก</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50 cursor-pointer"
            style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}
          >
            ยกเลิก
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

