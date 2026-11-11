import React, { useState, useEffect } from "react";
import { getClinicStatus, ClinicStatus } from "@/app/shared/data";
import {
  getWeeklyOffDays,
  getClinicClosures,
  getClinicSettings,
  getDailyHours,
} from "@/app/shared/supabaseApi";
import { getSimulatedNow } from "@/app/shared/utils/timeSimulation";

/**
 * 🏥 [DENTIST STATUS BANNER]
 * แถบแจ้งเตือนสถานะทำการของคลินิกและวันที่สำหรับทันตแพทย์
 */
export default function DentistStatusBanner() {
  const [s, setS] = useState<ClinicStatus | null>(null);

  useEffect(() => {
    const now = getSimulatedNow();
    Promise.all([
      getWeeklyOffDays(),
      getClinicClosures(),
      getClinicSettings(),
      getDailyHours(),
    ])
      .then(([offDays, closures, settings, dh]) => {
        setS(getClinicStatus(now, closures, offDays, settings, dh));
      })
      .catch(console.error);
  }, []);

  const now = getSimulatedNow();
  const thaiDate = now.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Bangkok",
  });

  return (
    <div className="px-5 lg:px-8 pt-4">
      <div
        className="rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
        style={{
          backgroundColor:
            s?.type === "special"
              ? "#FFF3E0"
              : s?.type === "open"
              ? "#F0FDF4"
              : "#F1F5F9",
          border: `1px solid ${
            s?.type === "special"
              ? "#FED7AA"
              : s?.type === "open"
              ? "#BBF7D0"
              : "#E2E8F0"
          }`,
        }}
      >
        {/* ฝั่งซ้าย: สถานะการเปิด-ปิดคลินิก */}
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: s?.dotColor || "#64748B" }}
          />
          <span
            className="font-medium"
            style={{
              color:
                s?.type === "special"
                  ? "#92400E"
                  : s?.type === "open"
                  ? "#15803D"
                  : "#475569",
            }}
          >
            {s?.label || "กำลังตรวจสอบสถานะคลินิก..."}
          </span>
          {s?.sublabel && (
            <span
              className="text-xs"
              style={{
                color:
                  s?.type === "special"
                    ? "#B45309"
                    : s?.type === "open"
                    ? "#16A34A"
                    : "#64748B",
              }}
            >
              — {s.sublabel}
            </span>
          )}
        </div>

        {/* ฝั่งขวา: วันที่ปัจจุบัน แสดงตลอดเวลา (ตัดเวลาทำการออก) */}
        <div className="text-xs sm:text-sm font-medium text-[#4A6080] flex-shrink-0">
          {thaiDate}
        </div>
      </div>
    </div>
  );
}
