import React from "react";

/**
 * 🏷️ [HEADER COMPONENT] หัวข้อหลักของหน้าจองคิว Walk-in
 */
export default function TitleBar() {
  return (
    <div className="mb-6">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        จองคิว Walk-in
      </h1>
      <p className="text-sm" style={{ color: "#4A6080" }}>
        จองคิวสำหรับคนไข้ที่มาหน้าร้าน
      </p>
    </div>
  );
}

