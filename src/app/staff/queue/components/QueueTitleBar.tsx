import React from "react";

/**
 * [HEADER COMPONENT] หัวข้อหน้าคิวงานและคำอธิบาย
 */
export default function TitleBar() {
  return (
    <div>
      <h1
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        คิวงาน
      </h1>
      <p className="text-sm" style={{ color: "#4A6080" }}>
        จัดการนัดหมายและติดตามสถานะการรักษา
      </p>
    </div>
  );
}

