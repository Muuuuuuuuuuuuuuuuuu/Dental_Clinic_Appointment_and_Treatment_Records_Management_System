import React from "react";

/**
 * ⏰ [CONTENT COMPONENT] การ์ดเวลาออกตรวจวันนี้
 */
export default function TodayDutyCard() {
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, #1A365D, #2A507A)",
          boxShadow: "0 4px 20px rgba(26,54,93,0.2)",
        }}
      >
        <p
          className="text-xs font-medium mb-1"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          เวลาออกตรวจวันนี้
        </p>
        <p
          className="text-3xl font-bold text-white"
          style={{ fontFamily: "Sarabun, sans-serif" }}
        >
          09:00
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          ถึง 17:00 น.
        </p>
      </div>
    </div>
  );
}

