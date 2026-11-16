import { X, Calendar as CalendarIcon, XCircle, UserX, Clock } from "lucide-react";
import { Appointment } from "@/app/shared/data";

interface RescheduleModalProps {
  rescheduleAppt: Appointment | null;
  onClose: () => void;
  newDate: string;
  setNewDate: (d: string) => void;
  newTime: string;
  setNewTime: (t: string) => void;
  updateReason: string;
  setUpdateReason: (r: string) => void;
  onCancelAppt: (appt: Appointment) => void;
  onNoShowAppt: (appt: Appointment) => void;
  onSubmitReschedule: () => void;
}

/**
 * ⏰ [MODAL COMPONENT] หน้าต่างเลื่อนนัดหมายและยกเลิกนัด
 */
export default function RescheduleModal({
  rescheduleAppt,
  onClose,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  updateReason,
  setUpdateReason,
  onCancelAppt,
  onNoShowAppt,
  onSubmitReschedule,
}: RescheduleModalProps) {
  if (!rescheduleAppt) return null;

  const isRescheduleDisabled =
    !newDate ||
    !newTime ||
    (newDate === rescheduleAppt.date && newTime === rescheduleAppt.time);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            เลื่อน/ยกเลิกนัด
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200">
            <X size={16} style={{ color: "#4A6080" }} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-5 bg-orange-50 p-4 rounded-xl border border-orange-100">
            <p className="text-sm font-bold text-orange-900 mb-1">{rescheduleAppt.patientName}</p>
            <p className="text-xs text-orange-800">บริการ: {rescheduleAppt.service}</p>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-orange-700">
              <CalendarIcon size={14} /> คิวเดิม: {rescheduleAppt.date} | {rescheduleAppt.time} น.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#4A6080" }}>
                วันที่ใหม่
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#4A6080" }}>
                เวลาใหม่
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 text-sm font-medium"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" style={{ color: "#4A6080" }}>
              เหตุผล (เลื่อน/ยกเลิก)
            </label>
            <input
              type="text"
              value={updateReason}
              onChange={(e) => setUpdateReason(e.target.value)}
              placeholder="เช่น คนไข้ติดธุระ, รถติดมาไม่ทัน ฯลฯ"
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 text-sm"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={() => onCancelAppt(rescheduleAppt)}
                className="flex-[1] py-3.5 rounded-xl font-bold text-red-600 bg-red-50 border border-red-200 transition-all hover:bg-red-100 flex items-center justify-center gap-2"
              >
                <XCircle size={18} /> ยกเลิกนัด
              </button>
              <button
                onClick={() => onNoShowAppt(rescheduleAppt)}
                className="flex-[1] py-3.5 rounded-xl font-bold text-gray-700 bg-gray-100 border border-gray-300 transition-all hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <UserX size={18} /> ไม่มาตามนัด
              </button>
            </div>
            <button
              onClick={onSubmitReschedule}
              disabled={isRescheduleDisabled}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#F57F17",
                boxShadow: "0 4px 12px rgba(245, 127, 23, 0.2)",
              }}
            >
              <Clock size={18} /> ยืนยันเลื่อนนัด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

