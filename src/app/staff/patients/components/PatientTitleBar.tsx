import React from "react";

/**
 * 🏷️ [HEADER COMPONENT] หัวข้อหลักของหน้าจัดการคนไข้
 */
export default function TitleBar() {
  return (
    <div className="mb-2 flex flex-col md:flex-row md:items-end justify-between gap-2">
      <div>
        <h1
          className="text-xl font-bold mb-0.5"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          จัดการคนไข้
        </h1>
        <p className="text-xs" style={{ color: "#4A6080" }}>
          ค้นหาประวัติ หรือ ลงทะเบียนคนไข้ใหม่
        </p>
      </div>
    </div>
  );
}

