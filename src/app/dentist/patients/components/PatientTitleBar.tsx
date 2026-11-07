import React from "react";

/**
 * 🏷️ [HEADER COMPONENT] หัวข้อหน้าเวชระเบียนคนไข้
 */
export default function TitleBar() {
  return (
    <div className="mb-4">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        เวชระเบียนคนไข้
      </h1>
      <p className="text-sm" style={{ color: "#4A6080" }}>
        ค้นหาข้อมูลและประวัติสุขภาพคนไข้
      </p>
    </div>
  );
}

