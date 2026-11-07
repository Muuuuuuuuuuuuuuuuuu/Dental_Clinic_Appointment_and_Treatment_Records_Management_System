import React from "react";
import { Pill, X, Check, Plus } from "lucide-react";
import { PrescribedMed } from "../types";
import { COMMON_MEDS } from "../hooks/useTreatmentQueue";

interface MedicineModalProps {
  isOpen: boolean;
  medList: PrescribedMed[];
  onClose: () => void;
  onAddMed: (med: PrescribedMed) => void;
  onRemoveMed: (idx: number) => void;
  onApply: () => void;
}

export default function MedicineModal({
  isOpen,
  medList,
  onClose,
  onAddMed,
  onRemoveMed,
  onApply,
}: MedicineModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "#1A365D" }}>
            <Pill size={16} className="text-purple-600" /> สั่งยาสำหรับคนไข้
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100">
            <X size={14} />
          </button>
        </div>

        <p className="text-xs font-medium mb-2" style={{ color: "#4A6080" }}>เลือกยาที่ต้องการสั่ง (click เพื่อเพิ่ม)</p>
        <div className="grid grid-cols-1 gap-2 mb-4">
          {COMMON_MEDS.map((med, i) => {
            const selected = !!medList.find(m => m.name === med.name);
            return (
              <button
                key={i}
                type="button"
                onClick={() => selected ? onRemoveMed(medList.findIndex(m => m.name === med.name)) : onAddMed(med)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-all border"
                style={{
                  backgroundColor: selected ? "#F3E8FF" : "#F8FAFC",
                  borderColor: selected ? "#A855F7" : "#E2E8F0",
                  color: selected ? "#6B21A8" : "#1A365D",
                }}
              >
                <div>
                  <p className="font-semibold text-xs">{med.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: selected ? "#7E22CE" : "#4A6080" }}>{med.freq} • {med.days} วัน</p>
                </div>
                {selected ? <Check size={14} className="text-purple-600 shrink-0" /> : <Plus size={14} className="text-gray-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {medList.length > 0 && (
          <div className="bg-purple-50 rounded-xl p-3 mb-4 border border-purple-100">
            <p className="text-xs font-bold text-purple-800 mb-2">ยาที่เลือกแล้ว ({medList.length} รายการ)</p>
            {medList.map((m, i) => (
              <div key={i} className="flex justify-between items-center text-xs text-purple-700 py-1">
                <span>• {m.name}</span>
                <button type="button" onClick={() => onRemoveMed(i)} className="text-red-400 hover:text-red-600 ml-2">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onApply}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#9333EA,#7C3AED)" }}
          >
            ใส่ลงในบันทึกการรักษา
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200"
            style={{ color: "#4A6080" }}
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}

