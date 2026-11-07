import React from "react";

/**
 * 🏷️ [HEADER COMPONENT] หัวข้อปฏิทินและการลางานของทันตแพทย์
 */
export default function ScheduleTitleBar() {
  return (
    <div className="mb-4">
      <h1
        className="text-xl font-bold"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        ปฏิทินและการลางาน
      </h1>
      <p className="text-xs" style={{ color: "#4A6080" }}>
        ตรวจสอบตารางทำงานและส่งคำขอลางานได้ที่นี่
      </p>
    </div>
  );
}
