import React from "react";
import { CalendarDays, AlertTriangle } from "lucide-react";
import { Appointment, STATUS_COLORS, hasHealthAlert } from "@/app/shared/data";

interface AppointmentListProps {
  appts: Appointment[];
}

/**
 *[QUEUE COMPONENT] ตารางรายการนัดหมายทั้งหมด
 */
export default function AppointmentList({ appts }: AppointmentListProps) {
  if (appts.length === 0) {
    return (
      <div
        className="rounded-2xl bg-white p-12 text-center"
        style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
      >
        <CalendarDays size={48} style={{ color: "#CBD5E1" }} className="mx-auto mb-4" />
        <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>
          ไม่มีนัดหมายในวันนี้
        </p>
        <p className="text-xs mt-1" style={{ color: "#CBD5E1" }}>
          ยังไม่มีคิวที่จองไว้
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-white overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "rgba(26,54,93,0.06)", backgroundColor: "#F8F9FA" }}
      >
        <div className="grid grid-cols-5 gap-4 text-xs font-semibold" style={{ color: "#4A6080" }}>
          <span>เวลา</span>
          <span className="col-span-2">คนไข้ / บริการ</span>
          <span>ทันตแพทย์</span>
          <span>สถานะ</span>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: "rgba(26,54,93,0.04)" }}>
        {appts.map((a) => {
          const sc = STATUS_COLORS[a.status] ?? {
            bg: "#F0F4F8",
            text: "#4A6080",
            dot: "#ccc",
          };
          return (
            <div
              key={a.id}
              className="px-5 py-3.5 grid grid-cols-5 gap-4 items-center hover:bg-gray-50/50 transition-colors"
            >
              <span className="text-sm font-semibold" style={{ color: "#FF8C9A" }}>
                {a.time?.substring(0, 5)}
              </span>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: "#1A365D" }}>
                    {a.patientName}
                  </p>
                  {hasHealthAlert(a.allergies, a.conditions) && (
                    <AlertTriangle size={12} style={{ color: "#E65100" }} />
                  )}
                </div>
                <p className="text-xs" style={{ color: "#4A6080" }}>
                  {a.service}
                </p>
              </div>
              <p className="text-xs" style={{ color: "#4A6080" }}>
                {a.doctorName?.split(" ")[1] ?? a.doctorName ?? "-"}
              </p>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium justify-self-start"
                style={{ backgroundColor: sc.bg, color: sc.text }}
              >
                {a.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
