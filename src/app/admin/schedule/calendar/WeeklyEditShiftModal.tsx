import React from "react";
import { X, AlertCircle } from "lucide-react";
import { Shift } from "@/app/shared/data";

const DAY_TH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

interface WeeklyEditShiftModalProps {
  editingShift: {
    shift: Shift | undefined;
    personId: number;
    personType: string;
    personName: string;
    dayNum: number;
    userId: string;
  };
  onClose: () => void;
  onShiftFieldChange: (field: "start_time" | "end_time" | "is_off", value: any) => void;
  onSave: () => Promise<void>;
}

/**
 * 🪟 [WEEKLY EDIT SHIFT MODAL]
 * ป๊อปอัปตั้งค่าเวลาเข้าเวร/วันหยุด (เปิดเมื่อคลิกช่องตารางใน WeeklyTemplateCard)
 */
export default function WeeklyEditShiftModal({
  editingShift,
  onClose,
  onShiftFieldChange,
  onSave,
}: WeeklyEditShiftModalProps) {
  const isOff = editingShift.shift ? editingShift.shift.is_off : true;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/80">
          <div>
            <h3 className="text-sm font-bold text-[#1A365D]">ตั้งค่าเวลาเข้าเวร</h3>
            <p className="text-xs text-gray-500">
              {editingShift.personName} ({DAY_TH[editingShift.dayNum]})
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* สวิตช์ตั้งเป็นวันหยุด */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs font-bold text-gray-700">สถานะปฏิบัติงาน</span>
            <button
              onClick={() => onShiftFieldChange("is_off", !isOff)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                isOff
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              }`}
            >
              {isOff ? "วันหยุด (Off)" : "ปฏิบัติงาน (On)"}
            </button>
          </div>

          {!isOff && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                  เวลาเริ่มเข้าเวร
                </label>
                <input
                  type="time"
                  value={editingShift.shift?.start_time?.substring(0, 5) || "09:00"}
                  onChange={(e) => onShiftFieldChange("start_time", e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                  เวลาสิ้นสุดเวร
                </label>
                <input
                  type="time"
                  value={editingShift.shift?.end_time?.substring(0, 5) || "20:00"}
                  onChange={(e) => onShiftFieldChange("end_time", e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100">
            <AlertCircle size={13} className="shrink-0" />
            <span>ระบบจะบันทึกการแก้ไขทันทีเมื่อกดยืนยัน</span>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              ยืนยันการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

