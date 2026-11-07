import React from "react";
import { Phone, MapPin } from "lucide-react";
import { DayHours } from "@/app/shared/supabaseApi";

interface ClinicInfoCardProps {
  dailyHours?: Record<string, DayHours>;
  weeklyOffDays?: number[];
}

/**
 * 🏥 [DASHBOARD COMPONENT] การ์ดเวลาทำการและข้อมูลติดต่อคลินิก
 */
export default function ClinicInfoCard({
  dailyHours = {},
  weeklyOffDays = [],
}: ClinicInfoCardProps) {
  const days = [
    { day: "จันทร์", idx: 1 },
    { day: "อังคาร", idx: 2 },
    { day: "พุธ", idx: 3 },
    { day: "พฤหัสบดี", idx: 4 },
    { day: "ศุกร์", idx: 5 },
    { day: "เสาร์", idx: 6 },
    { day: "อาทิตย์", idx: 0 },
  ];

  return (
    <div className="space-y-4">
      {/* เวลาทำการ */}
      <div
        className="rounded-2xl bg-white p-5"
        style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
      >
        <h2 className="text-base font-semibold mb-3" style={{ color: "#1A365D" }}>
          เวลาทำการ
        </h2>
        {days.map((h) => {
          const isOff = (weeklyOffDays || []).includes(h.idx);
          const hrs = dailyHours?.[h.idx.toString()];
          const t = isOff || !hrs ? "ปิดทำการ" : `${hrs.open} – ${hrs.close} น.`;
          return (
            <div
              key={h.day}
              className="flex justify-between py-2 text-sm"
              style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}
            >
              <span style={{ color: "#4A6080" }}>{h.day}</span>
              <span
                style={{
                  color: t === "ปิดทำการ" ? "#999" : "#FF8C9A",
                  fontWeight: 500,
                }}
              >
                {t}
              </span>
            </div>
          );
        })}
      </div>

      {/* ติดต่อเรา */}
      <div
        className="rounded-2xl bg-white p-5"
        style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
      >
        <h2 className="text-base font-semibold mb-3" style={{ color: "#1A365D" }}>
          ติดต่อเรา
        </h2>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm" style={{ color: "#4A6080" }}>
            <Phone size={14} style={{ color: "#FF8C9A" }} /> 02-345-6987
          </div>
          <div className="flex items-start gap-2.5 text-sm" style={{ color: "#4A6080" }}>
            <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#FF8C9A" }} />
            <span>หน้ามอเกษตรกำแพงแสน อำเภอกำแพงแสน จังหวัดนครปฐม</span>
          </div>
        </div>
      </div>
    </div>
  );
}
