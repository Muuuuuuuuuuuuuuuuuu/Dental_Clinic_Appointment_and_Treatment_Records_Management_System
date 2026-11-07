import React from "react";
import { AlertTriangle } from "lucide-react";
import { Appointment, STATUS_COLORS, hasHealthAlert } from "@/app/shared/data";

interface QueueItemProps {
  appointment: Appointment;
}

/**
 * 👤 [QUEUE COMPONENT] รายการคนไข้ในคิว 1 แถว
 */
export default function QueueItem({ appointment: a }: QueueItemProps) {
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

