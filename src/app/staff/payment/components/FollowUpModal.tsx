import React from "react";
import { X, Calendar } from "lucide-react";
import { Appointment } from "@/app/shared/data";
import { TimeSlotStatus } from "@/app/shared/supabaseApi";

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

function formatThaiDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;
  const thaiYear = y + 543;
  const dayStr = String(d).padStart(2, "0");
  const monthStr = String(m + 1).padStart(2, "0");
  return `${dayStr}/${monthStr}/${thaiYear} (${d} ${THAI_MONTHS_SHORT[m]} ${thaiYear})`;
}

interface FollowUpModalProps {
  followUp: Appointment | null;
  onClose: () => void;
  isBound: boolean;
  setIsBound: (val: boolean) => void;
  followUpDate: string;
  setFollowUpDate: (val: string) => void;
  followUpTime: string;
  setFollowUpTime: (val: string) => void;
  isLoadingSlots: boolean;
  timeSlots: TimeSlotStatus[];
  isSubmitting: boolean;
  onSubmit: () => void;
  servicesList?: { id: number; name: string }[];
  onServiceChange?: (serviceName: string, serviceId?: number) => void;
}

/**
 * 📅 [MODAL COMPONENT] หน้าต่างสร้างนัดหมายครั้งถัดไป
 * เจ้าหน้าที่เลือกวัน-เวลาและบริการให้คนไข้โดยตรง หากคนไข้ไม่สะดวกสามารถยกเลิกเองได้ภายหลัง
 */
export default function FollowUpModal({
  followUp,
  onClose,
  isBound,
  setIsBound,
  followUpDate,
  setFollowUpDate,
  followUpTime,
  setFollowUpTime,
  isLoadingSlots,
  timeSlots,
  isSubmitting,
  onSubmit,
  servicesList = [],
  onServiceChange,
}: FollowUpModalProps) {
  if (!followUp) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(26,54,93,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden relative">
        <div className="p-7">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
            >
              สร้างนัดหมายครั้งถัดไป
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X size={16} style={{ color: "#4A6080" }} />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-3.5 mb-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[11px]" style={{ color: "#4A6080" }}>
                สำหรับคนไข้
              </p>
              <p className="font-bold text-sm" style={{ color: "#1A365D" }}>
                {followUp.patientName}
              </p>
            </div>
            {followUp.hn && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-700 font-mono font-medium">
                {followUp.hn}
              </span>
            )}
          </div>

          <div className="space-y-3.5 mb-6">
            {/* การผูกเคสรักษาต่อเนื่องกับทันตแพทย์ */}
            {followUp.doctorName && (
              <label
                className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl border transition-all"
                style={{
                  backgroundColor: isBound ? "#F0FDF4" : "#F8FAFC",
                  borderColor: isBound ? "#22C55E" : "#E2E8F0",
                }}
              >
                <input
                  type="checkbox"
                  checked={isBound}
                  onChange={(e) => setIsBound(e.target.checked)}
                  className="w-4 h-4 rounded mt-0.5 accent-emerald-600 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold block" style={{ color: "#1A365D" }}>
                    ตั้ง {followUp.doctorName} เป็นแพทย์ประจำเคส
                  </span>
                  <span className="text-[11px] text-gray-500">
                    คนไข้จะได้คิวเฉพาะวันที่หมอท่านนี้เข้าเวรเท่านั้น
                  </span>
                </div>
              </label>
            )}

            {/* เลือกบริการที่ต้องการนัด */}
            <div>
              <label className="text-xs font-bold block mb-1" style={{ color: "#4A6080" }}>
                บริการที่ต้องการนัด *
              </label>
              <select
                value={followUp.service || ""}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const match = servicesList.find((s) => s.name === selectedName);
                  onServiceChange?.(selectedName, match?.id);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium outline-none border border-gray-200 bg-white text-gray-800 focus:border-[#E16076] transition-colors cursor-pointer"
              >
                {!servicesList.some((s) => s.name === followUp.service) && followUp.service && (
                  <option value={followUp.service}>{followUp.service}</option>
                )}
                {servicesList.map((s) => (
                  <option key={`${s.id}-${s.name}`} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* เลือกวันและเวลา */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: "#4A6080" }}>
                  วันที่นัด (วัน/เดือน/ปี)
                </label>
                <div className="relative">
                  <div className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-xs flex items-center justify-between pointer-events-none transition-colors">
                    <span className={followUpDate ? "font-semibold text-[#1A365D]" : "text-gray-400"}>
                      {followUpDate
                        ? formatThaiDate(followUpDate)
                        : "เลือกวันที่ (วัน/เดือน/ปี)"}
                    </span>
                    <Calendar size={15} style={{ color: "#E16076" }} />
                  </div>
                  <input
                    type="date"
                    value={followUpDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setFollowUpDate(e.target.value);
                      setFollowUpTime("");
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
              </div>

              {followUpDate && (
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: "#4A6080" }}>
                    เวลาที่ว่าง
                  </label>
                  {isLoadingSlots ? (
                    <div className="text-xs text-center py-3 text-gray-500">
                      กำลังตรวจสอบคิวว่าง...
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[135px] overflow-y-auto pr-1">
                      {timeSlots.map((s, i) => {
                        const isAvail = s.status === "available";
                        const isSelected = followUpTime === s.time;
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={!isAvail}
                            onClick={() => setFollowUpTime(s.time)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border transition-all cursor-pointer ${isSelected
                                ? "border-[#E16076] bg-[#FFF0F2] text-[#E16076] shadow-sm"
                                : !isAvail
                                  ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                                  : "border-gray-200 bg-gray-50 text-[#1A365D] hover:border-[#E16076] hover:bg-white"
                              }`}
                          >
                            {s.time}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-center py-3 text-red-500 bg-red-50 rounded-lg border border-red-100">
                      ไม่มีคิวว่างในวันนี้ หรือหมอไม่ได้เข้าเวร
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/3 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-xs disabled:opacity-50 cursor-pointer"
            >
              กลับไปหน้าใบเสร็จ
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || !followUpDate || !followUpTime}
              className="w-2/3 py-2.5 rounded-xl font-bold text-white text-xs transition-all hover:bg-[#D14D64] bg-[#E16076] disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer shadow-sm flex justify-center items-center gap-2"
            >
              {isSubmitting ? "กำลังบันทึกนัด..." : "ยืนยันการนัดหมาย"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
