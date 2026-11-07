import React from "react";

interface TitleBarProps {
  selectedDate?: Date;
}

/**
 * 🏷️ [HEADER COMPONENT] หัวข้อภาพรวมระบบ
 */
export default function TitleBar({ selectedDate }: TitleBarProps) {
  return (
    <div>
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
      >
        ภาพรวมระบบ
      </h1>
    </div>
  );
}
