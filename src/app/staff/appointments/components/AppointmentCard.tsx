import { AlertTriangle, User, PhoneCall, CheckCircle, XCircle, ArrowRightLeft, Clock } from "lucide-react";
import { Appointment, STATUS_COLORS, hasHealthAlert } from "@/app/shared/data";
import { TabView } from "../hooks/useStaffAppointments";

interface AppointmentCardProps {
  appt: Appointment;
  activeTab: TabView;
  onConfirmAppt: (id: number) => void;
  onCancelAppt: (appt: Appointment) => void;
  onOpenTransfer: (appt: Appointment) => void;
  onOpenReschedule: (appt: Appointment) => void;
}

/**
 * 📋 [APPOINTMENT COMPONENT] การ์ดรายการนัดหมายแต่ละแถว
 */
export default function AppointmentCard({
  appt: a,
  activeTab,
  onConfirmAppt,
  onCancelAppt,
  onOpenTransfer,
  onOpenReschedule,
}: AppointmentCardProps) {
  return (
    <div
      className="rounded-2xl bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:shadow-md"
      style={{
        boxShadow: "0 2px 12px rgba(26,54,93,0.04)",
        borderLeft: activeTab === "risk" ? "4px solid #F57F17" : "none",
      }}
    >
      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        {/* กล่องแสดงวันและเวลา */}
        <div className="bg-gray-50 px-4 py-3 rounded-xl flex flex-col items-center justify-center min-w-[120px] border border-gray-100">
          <span className="text-xs font-bold mb-1" style={{ color: "#4A6080" }}>
            {a.date}
          </span>
          <span className="text-lg font-black" style={{ color: "#1A365D" }}>
            {a.time} น.
          </span>
        </div>

        {/* กล่องข้อมูลรายละเอียด */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-bold" style={{ color: "#1A365D" }}>
              {a.patientName}
            </p>
            {activeTab === "all" && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: STATUS_COLORS[a.status]?.bg || "#eee",
                  color: STATUS_COLORS[a.status]?.text || "#333",
                }}
              >
                {a.status}
              </span>
            )}
            {activeTab === "risk" && (hasHealthAlert(a.conditions) || hasHealthAlert(a.allergies)) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                มีความเสี่ยงสุขภาพ
              </span>
            )}
          </div>
          <p className="text-sm mb-2" style={{ color: "#4A6080" }}>
            <span className="font-semibold text-gray-700">บริการ:</span> {a.service}
          </p>
          {hasHealthAlert(a.conditions) && (
            <div className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg flex gap-1.5 items-start bg-red-50 text-red-700 border border-red-100 w-fit">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <span>เสี่ยงสุขภาพ: {a.conditions}</span>
            </div>
          )}
          {hasHealthAlert(a.allergies) && (
            <div className="mt-1 text-xs font-semibold px-3 py-1.5 rounded-lg flex gap-1.5 items-start bg-orange-50 text-orange-700 border border-orange-100 w-fit">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <span>แพ้ยา: {a.allergies}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-sm">
              <User size={14} style={{ color: "#1D6FA4" }} />
              <span className="font-medium" style={{ color: "#1D6FA4" }}>
                ทพ. {a.doctorName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <PhoneCall size={14} />
              {a.patientPhone}
            </div>
          </div>
        </div>
      </div>

      {/* ปุ่มดำเนินการตามหมวดหมู่ */}
      <div className="flex flex-col sm:flex-row gap-2 min-w-[160px] md:justify-end">
        {activeTab === "risk" && (
          <>
            {a.status === "รอการยืนยัน" && (
              <button
                onClick={() => onConfirmAppt(a.id)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                style={{
                  backgroundColor: "#22C55E",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                }}
              >
                <CheckCircle size={16} /> ยืนยันคิว
              </button>
            )}
            <button
              onClick={() => onCancelAppt(a)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all hover:bg-red-50"
              style={{ color: "#EF4444", border: "1px solid #FECACA" }}
            >
              <XCircle size={16} /> ปฏิเสธ/ยกเลิก
            </button>
          </>
        )}

        {activeTab === "transfer" && (
          <button
            onClick={() => onOpenTransfer(a)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg,#1D6FA4,#1A365D)",
              boxShadow: "0 4px 12px rgba(26,54,93,0.2)",
            }}
          >
            <ArrowRightLeft size={16} /> ย้ายเคส
          </button>
        )}

        {activeTab === "reschedule" && (
          <button
            onClick={() => onOpenReschedule(a)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 w-full sm:w-auto"
            style={{
              backgroundColor: "#F57F17",
              boxShadow: "0 4px 12px rgba(245, 127, 23, 0.2)",
            }}
          >
            <Clock size={16} /> เลื่อน/ยกเลิกนัด
          </button>
        )}
      </div>
    </div>
  );
}

