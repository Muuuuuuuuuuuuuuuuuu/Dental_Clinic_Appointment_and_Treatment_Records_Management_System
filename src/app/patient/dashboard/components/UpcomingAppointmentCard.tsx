import { Calendar } from "lucide-react";
import { Appointment } from "@/app/shared/data";
import { View, patientStatusColor as statusColor } from "../../types";

interface UpcomingAppointmentCardProps {
  upcoming: Appointment | undefined;
  onNavigate: (v: View) => void;
}

/**
 * 📅 [DASHBOARD COMPONENT] การ์ดนัดหมายถัดไปของคนไข้ พร้อมปุ่มทางลัด
 */
export default function UpcomingAppointmentCard({
  upcoming,
  onNavigate,
}: UpcomingAppointmentCardProps) {
  return (
    <div
      className="lg:col-span-2 rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: "#1A365D" }}>
          นัดหมายถัดไป
        </h2>
        <button
          onClick={() => onNavigate("appointments")}
          className="text-xs hover:opacity-70 transition-opacity"
          style={{ color: "#FF8C9A" }}
        >
          ดูทั้งหมด
        </button>
      </div>

      {upcoming ? (
        <div
          className="flex items-start gap-4 p-4 rounded-xl"
          style={{ backgroundColor: "#F0F4F8" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
          >
            <span className="text-xs font-bold text-white leading-none">
              {upcoming.date ? new Date(upcoming.date).getDate() : "-"}
            </span>
            <span className="text-xs text-white opacity-80">
              {upcoming.date
                ? new Date(upcoming.date).toLocaleDateString("th-TH", { month: "short" })
                : "-"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>
              {upcoming.service}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
              {upcoming.doctorName || (upcoming as any).doctor}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
              {upcoming.time ? `เวลา ${upcoming.time} น.` : "รอระบุเวลา"}
            </p>
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
            style={{
              backgroundColor: statusColor[upcoming.status]?.bg,
              color: statusColor[upcoming.status]?.text,
            }}
          >
            {upcoming.status}
          </span>
        </div>
      ) : (
        <div className="text-center py-8" style={{ color: "#4A6080" }}>
          <Calendar size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">ยังไม่มีนัดหมายที่กำลังจะมาถึง</p>
        </div>
      )}

      {/* ปุ่มทางลัด */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={() => onNavigate("booking")}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
        >
          จองนัดหมายใหม่
        </button>
        <button
          onClick={() => onNavigate("appointments")}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{
            border: "1.5px solid rgba(26,54,93,0.15)",
            color: "#1A365D",
          }}
        >
          รายการนัดหมาย
        </button>
      </div>
    </div>
  );
}
