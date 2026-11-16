import React from "react";
import { Edit3, AlertCircle } from "lucide-react";
import { PatientUser } from "../../types";

interface EditableContactCardProps {
  user: PatientUser;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  form: {
    phone: string;
    email: string;
    address: string;
    emergencyName: string;
    emergencyPhone: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      phone: string;
      email: string;
      address: string;
      emergencyName: string;
      emergencyPhone: string;
    }>
  >;
  saveLoading: boolean;
  saveErr: string;
  onSave: () => void;
  onCancel: () => void;
}

const InfoRow = ({ label, val }: { label: string; val: string }) => (
  <div
    className="flex py-2.5"
    style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}
  >
    <span className="text-xs w-36 font-medium flex-shrink-0 text-[#4A6080]">
      {label}
    </span>
    <span className="text-sm text-[#1A365D]">
      {val || "—"}
    </span>
  </div>
);

/**
 * 📝 [RIGHT CARD COMPONENT] ข้อมูลการติดต่อที่คนไข้สามารถแก้ไขได้เอง
 */
export default function EditableContactCard({
  user: _user,
  editing,
  setEditing,
  form,
  setForm,
  saveLoading,
  saveErr,
  onSave,
  onCancel,
}: EditableContactCardProps) {
  const fields = [
    { key: "phone", label: "เบอร์โทรศัพท์" },
    { key: "address", label: "ที่อยู่ปัจจุบัน" },
    { key: "emergencyName", label: "ผู้ติดต่อฉุกเฉิน (ชื่อ)" },
    { key: "emergencyPhone", label: "ผู้ติดต่อฉุกเฉิน (เบอร์)" },
  ] as const;

  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-[#1A365D]">
          ข้อมูลการติดต่อและที่อยู่
        </h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
            style={{ color: "#FF8C9A" }}
          >
            <Edit3 size={12} /> แก้ไข
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-50"
              style={{ border: "1px solid rgba(26,54,93,0.2)", color: "#4A6080" }}
            >
              ยกเลิก
            </button>
            <button
              onClick={onSave}
              disabled={saveLoading}
              className="text-xs px-3 py-1.5 rounded-lg text-white disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: "#FF8C9A" }}
            >
              {saveLoading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        )}
      </div>

      {saveErr && (
        <div
          className="flex items-center gap-1.5 mb-3 text-xs px-3 py-2 rounded-lg"
          style={{ backgroundColor: "#FFF0F3", color: "#C0392B" }}
        >
          <AlertCircle size={12} /> {saveErr}
        </div>
      )}

      {fields.map(({ key, label }) => {
        return editing ? (
          <div
            key={key}
            className="py-2"
            style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}
          >
            <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>
              {label}
            </label>
            {key === "address" ? (
              <textarea
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
              />
            ) : key === "phone" || key === "emergencyPhone" ? (
              <input
                type="tel"
                maxLength={10}
                placeholder="กรอกตัวเลข 10 หลัก"
                value={form[key]}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm((f) => ({ ...f, [key]: val }));
                }}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
              />
            ) : (
              <input
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
              />
            )}
          </div>
        ) : (
          <InfoRow key={key} label={label} val={form[key]} />
        );
      })}
    </div>
  );
}
