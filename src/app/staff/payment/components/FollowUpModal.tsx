import { X } from "lucide-react";
import { Appointment } from "@/app/shared/data";
import { FollowUpTimeSlot } from "../hooks/usePaymentData";
import CalendarPicker from "@/app/staff/booking/components/ServiceSchedule/CalendarPicker";

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
  timeSlots: FollowUpTimeSlot[];
  isSubmitting: boolean;
  onSubmit: () => void;
  servicesList?: { id: number; name: string }[];
  onServiceChange?: (serviceName: string, serviceId?: number) => void;
  targetDate?: Date;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  firstDow?: number;
  daysInMonth?: number;
  year?: number;
  month?: number;
  dayStatus?: (d: number) => { status: "past" | "available"; reason?: string };
  fullyBookedDates?: Set<string>;
}

/**
 * 📅 [MODAL COMPONENT] หน้าต่างสร้างนัดหมายครั้งถัดไป
 * เจ้าหน้าที่เลือกวัน-เวลาและบริการให้คนไข้โดยตรง ใช้ตารางปฏิทินและเวลาที่เชื่อมกับระบบกลาง 100%
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
  targetDate = new Date(),
  onPrevMonth = () => {},
  onNextMonth = () => {},
  firstDow = 0,
  daysInMonth = 30,
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  dayStatus = () => ({ status: "available" as const }),
  fullyBookedDates,
}: FollowUpModalProps) {
  if (!followUp) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,54,93,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto relative">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
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

          <div className="bg-gray-50 rounded-xl p-3 mb-3.5 border border-gray-100 flex items-center justify-between">
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

          <div className="space-y-3 mb-5">
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
                  onChange={(e) => {
                    setIsBound(e.target.checked);
                    setFollowUpTime("");
                  }}
                  className="w-4 h-4 rounded mt-0.5 accent-emerald-600 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold block" style={{ color: "#1A365D" }}>
                    ตั้ง {followUp.doctorName} เป็นแพทย์ประจำเคส
                  </span>
                  <span className="text-[11px] text-gray-500">
                    คนไข้จะได้คิวเฉพาะวันที่หมอท่านนี้เข้าเวรและว่างเท่านั้น
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
                className="w-full px-3.5 py-2 rounded-xl text-xs font-medium outline-none border border-gray-200 bg-white text-gray-800 focus:border-[#E16076] transition-colors cursor-pointer"
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

            {/* ปฏิทินเลือกวัน (เชื่อมกับระบบตารางเวรและวันหยุด) */}
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: "#4A6080" }}>
                เลือกวันที่นัดหมาย
              </label>
              <CalendarPicker
                targetDate={targetDate}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
                firstDow={firstDow}
                daysInMonth={daysInMonth}
                year={year}
                month={month}
                dayStatus={dayStatus}
                fullyBookedDates={fullyBookedDates}
                selectedDate={followUpDate}
                onSelectDate={(dStr) => {
                  setFollowUpDate(dStr);
                  setFollowUpTime("");
                }}
              />
            </div>

            {/* เลือกเวลา */}
            {followUpDate && (
              <div className="p-3 rounded-xl border border-gray-200 bg-white">
                <label className="text-xs font-bold block mb-1.5" style={{ color: "#4A6080" }}>
                  เวลาที่ว่าง ({followUpDate})
                </label>
                {isLoadingSlots ? (
                  <div className="text-xs text-center py-3 text-gray-500">
                    กำลังตรวจสอบคิวว่าง...
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                    {timeSlots.map((s, i) => {
                      const isBooked = s.status === "booked" || s.status === "patient_booked";
                      const isPast = s.status === "past";
                      const isOutside = s.status === "outside_shift";
                      const notAvail = isBooked || isPast || isOutside || !s.canBook;
                      const isSelected = followUpTime === s.time;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={notAvail}
                          onClick={() => setFollowUpTime(s.time)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                            isSelected
                              ? "border-[#E16076] bg-[#E16076] text-white shadow-sm cursor-pointer"
                              : notAvail
                              ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60"
                              : "border-gray-200 bg-white text-[#1A365D] hover:border-[#E16076] cursor-pointer"
                          }`}
                        >
                          <div>{s.time}</div>
                          {isBooked && <div className="text-[9px] font-normal">จองแล้ว</div>}
                          {isPast && <div className="text-[9px] font-normal">เลยเวลา</div>}
                          {!isBooked && !isPast && !isOutside && !s.canBook && (
                            <div className="text-[9px] font-normal">เวลาไม่พอ</div>
                          )}
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
