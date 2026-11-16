import { Clock, RefreshCw } from "lucide-react";
import { Appointment } from "@/app/shared/data";
import { patientStatusColor as statusColor } from "../../types";
import { getNow, thDate } from "../hooks/usePatientAppointments";

interface AppointmentCardProps {
  appt: Appointment;
  isExpiring: boolean;
  cancelId: number | null;
  onSetCancelId: (id: number | null) => void;
  onDoCancel: (id: number) => void;
  onBookFollowUp?: (serviceId: number, doctorId: number, openTicketId?: number) => void;
}

export default function AppointmentCard({
  appt: a,
  isExpiring,
  cancelId,
  onSetCancelId,
  onDoCancel,
  onBookFollowUp,
}: AppointmentCardProps) {
  const sc = statusColor[a.status] ?? { bg: "#F0F4F8", text: "#4A6080" };
  const isDone =
    a.status === "เสร็จสิ้น" || a.status === "ยกเลิก" || a.status === "ไม่มาตามนัด";
  const isPending = !isDone;
  const isFollowUpCase =
    a.service === "ตัดไหม" ||
    Boolean(
      a.note &&
      (a.note.includes("แพทย์ประจำเคส") ||
        a.note.includes("นัดตัดไหม") ||
        a.note.includes("เคสต่อเนื่อง"))
    ) ||
    (a as any).source === "doctor";
  const canCancel = isPending && (!isFollowUpCase || Boolean(a.date));

  let isWithin12Hours = false;
  if (a.date && a.time) {
    const apptDate = new Date(`${a.date}T${a.time}:00`);
    const now = getNow();
    const diffMs = apptDate.getTime() - now.getTime();
    if (diffMs <= 12 * 60 * 60 * 1000) {
      isWithin12Hours = true;
    }
  }

  return (
    <div
      className={`rounded-2xl bg-white p-5 transition-all ${isExpiring ? "opacity-50 pointer-events-none" : ""
        }`}
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      {isExpiring && (
        <div
          className="flex items-center gap-1.5 text-xs mb-2"
          style={{ color: "#E74C3C" }}
        >
          <RefreshCw size={11} className="animate-spin" />
          กำลังบันทึกว่า "ไม่มาตามนัด" อัตโนมัติ...
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
            style={{
              background: isPending
                ? "#FF8C9A"
                : "linear-gradient(135deg,#4ade80,#22c55e)",
            }}
          >
            <span className="text-xs font-bold text-white leading-none">
              {a.date ? new Date(a.date).getDate() : "-"}
            </span>
            <span className="text-xs text-white opacity-80">
              {a.date
                ? new Date(a.date).toLocaleDateString("th-TH", { month: "short" })
                : "-"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>
                {a.service}
              </p>
              {(a as any).source === "doctor" && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "#F3E8FF", color: "#7C3AED" }}
                >
                  นัดโดยทันตแพทย์
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
              {a.doctorName || (a as any).doctor}
            </p>
            <p
              className="text-xs mt-1 flex items-center gap-1"
              style={{ color: "#4A6080" }}
            >
              <Clock size={10} />{" "}
              {a.date ? `${a.time} น. • ${thDate(a.date)}` : "รอการระบุวัน-เวลา"}
            </p>
            {(a.note || (a as any).source === "doctor") && (
              <div
                className="mt-2 p-2.5 rounded-lg text-xs"
                style={{ backgroundColor: "#F8F9FA" }}
              >
                {a.note && <p style={{ color: "#DB2777" }}>หมายเหตุ: {a.note}</p>}
                {(a as any).source === "doctor" && (
                  <p style={{ color: "#7C3AED" }}>
                    นัดนี้ถูกสร้างโดยทันตแพทย์หลังการรักษา
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
          style={{ backgroundColor: sc.bg, color: sc.text }}
        >
          {a.status}
        </span>
      </div>

      <div
        className="mt-4 pt-3 flex items-center justify-between gap-2"
        style={{ borderTop: "1px solid rgba(26,54,93,0.06)" }}
      >
        <div className="flex items-center gap-2">
          {isFollowUpCase && !a.date ? (
            <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>
              สามารถเลือกวันนัดหมายเมื่อสะดวก
            </p>
          ) : (
            canCancel &&
            (isWithin12Hours ? (
              <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                ยกเลิกไม่ได้ (น้อยกว่า 12 ชม.)
              </p>
            ) : cancelId === a.id ? (
              <>
                <p className="text-xs flex-1" style={{ color: "#E65100" }}>
                  {isFollowUpCase
                    ? "ยกเลิกเฉพาะวันนัดนี้? (เก็บใบนัดไว้ระบุวันทีหลัง)"
                    : "ยืนยันการยกเลิกนัดหมาย?"}
                </p>
                <button
                  onClick={() => onDoCancel(a.id)}
                  className="text-xs px-3 py-1.5 rounded-lg text-white cursor-pointer"
                  style={{ backgroundColor: "#E74C3C" }}
                >
                  {isFollowUpCase ? "ยืนยันยกเลิกวันนัด" : "ยืนยันยกเลิก"}
                </button>
                <button
                  onClick={() => onSetCancelId(null)}
                  className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                  style={{
                    border: "1px solid rgba(26,54,93,0.15)",
                    color: "#4A6080",
                  }}
                >
                  ไม่ยกเลิก
                </button>
              </>
            ) : (
              <button
                onClick={() => onSetCancelId(a.id)}
                className="text-xs font-medium hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: "#E74C3C" }}
              >
                ยกเลิกนัดหมาย
              </button>
            ))
          )}
        </div>
        {!a.date && isPending && onBookFollowUp && (
          <button
            onClick={() => {
              onBookFollowUp(a.serviceId || 1, a.doctorId || 0, a.id);
            }}
            className="text-xs px-4 py-2 rounded-xl font-bold text-white transition-all hover:opacity-90 shadow-sm cursor-pointer"
            style={{ backgroundColor: "#E16076" }}
          >
            ระบุวันนัดหมาย
          </button>
        )}
        {a.date && isPending && !isWithin12Hours && onBookFollowUp && (
          <button
            onClick={() => {
              onBookFollowUp(a.serviceId || 1, a.doctorId || 0, a.id);
            }}
            className="text-xs px-4 py-2 rounded-xl font-bold text-white transition-all hover:opacity-90 shadow-sm cursor-pointer"
            style={{ backgroundColor: "#E16076" }}
          >
            เปลี่ยนวันนัดหมาย
          </button>
        )}
      </div>
    </div>
  );
}
