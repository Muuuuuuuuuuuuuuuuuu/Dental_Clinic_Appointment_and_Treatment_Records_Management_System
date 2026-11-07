import React from "react";
import { Edit3, AlertCircle } from "lucide-react";
import { PatientUser } from "../../types";

interface EditableHealthCardProps {
  user: PatientUser;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  form: {
    conditions: string;
    allergies: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      conditions: string;
      allergies: string;
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
      {val || "ไม่มี"}
    </span>
  </div>
);

/**
 * 🩺 [RIGHT CARD COMPONENT] ข้อมูลสุขภาพ (โรคประจำตัว และ ประวัติการแพ้ยา) ที่คนไข้สามารถแก้ไขได้เอง
 */
export default function EditableHealthCard({
  user,
  editing,
  setEditing,
  form,
  setForm,
  saveLoading,
  saveErr,
  onSave,
  onCancel,
}: EditableHealthCardProps) {
  const fields = [
    {
      key: "conditions" as const,
      label: "โรคประจำตัว",
      placeholder: "เช่น ความดันโลหิตสูง, เบาหวาน (หากไม่มีให้ระบุ 'ไม่มี')",
    },
    {
      key: "allergies" as const,
      label: "ประวัติการแพ้ยา",
      placeholder: "เช่น เพนิซิลลิน, แอสไพริน (หากไม่มีให้ระบุ 'ไม่มี')",
    },
  ];

  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-[#1A365D]">
          ข้อมูลสุขภาพ
        </h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: "#FF8C9A" }}
          >
            <Edit3 size={12} /> แก้ไข
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-50 cursor-pointer"
              style={{ border: "1px solid rgba(26,54,93,0.2)", color: "#4A6080" }}
            >
              ยกเลิก
            </button>
            <button
              onClick={onSave}
              disabled={saveLoading}
              className="text-xs px-3 py-1.5 rounded-lg text-white disabled:opacity-60 transition-opacity cursor-pointer"
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

      {fields.map(({ key, label, placeholder }) => {
        return editing ? (
          <div
            key={key}
            className="py-2"
            style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium block" style={{ color: "#4A6080" }}>
                {label}
              </label>
              <span className="text-[11px] text-slate-400">คั่นด้วยเครื่องหมายจุลภาค (,) หากมีหลายรายการ</span>
            </div>
            <input
              value={form[key]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [key]: e.target.value }))
              }
              placeholder={placeholder}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border border-transparent focus:border-[#FF8C9A]"
              style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
            />
          </div>
        ) : (
          <InfoRow
            key={key}
            label={label}
            val={user[key === "conditions" ? "conditions" : "allergies"] || "ไม่มี"}
          />
        );
      })}
    </div>
  );
}

