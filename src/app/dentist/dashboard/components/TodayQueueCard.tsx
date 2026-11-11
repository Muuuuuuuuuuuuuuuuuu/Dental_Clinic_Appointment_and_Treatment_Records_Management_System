import React from "react";
import { AlertTriangle } from "lucide-react";
import { Appointment, STATUS_COLORS, hasHealthAlert } from "@/app/shared/data";

interface QueueItemProps {
  appointment: Appointment;
}

/**
 * 👤 รายการคนไข้ในคิว 1 แถว
 */
function QueueItem({ appointment: a }: QueueItemProps) {
  const sc = STATUS_COLORS[a.status] ?? { bg: "#F0F4F8", text: "#4A6080" };

  return (
    <div
      className="flex items-center justify-between py-2"
      style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #FF8C9A, #FF6B7E)" }}
        >
          {a.time}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "#1A365D" }}>
            {a.patientName}
          </p>
          <p className="text-xs" style={{ color: "#4A6080" }}>
            {a.service}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasHealthAlert(a.allergies, a.conditions) && (
          <AlertTriangle size={13} style={{ color: "#E65100" }} />
        )}
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: sc.bg, color: sc.text }}
        >
          {a.status}
        </span>
      </div>
    </div>
  );
}

interface TodayQueueCardProps {
  appointments: Appointment[];
  onViewAll: () => void;
}

/**
 * 📋 [CONTENT COMPONENT] การ์ดคิวของฉันวันนี้ (แสดง 5 คนแรก + ลิงก์ดูทั้งหมด)
 */
export default function TodayQueueCard({
  appointments,
  onViewAll,
}: TodayQueueCardProps) {
  return (
    <div
      className="lg:col-span-2 rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-base" style={{ color: "#1A365D" }}>
          คิวของฉันวันนี้
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs hover:opacity-70 font-semibold cursor-pointer"
          style={{ color: "#FF8C9A" }}
        >
          ดูทั้งหมด
        </button>
      </div>
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">ไม่มีคิวนัดหมายวันนี้</p>
        ) : (
          appointments.slice(0, 5).map((a) => <QueueItem key={a.id} appointment={a} />)
        )}
      </div>
    </div>
  );
}
