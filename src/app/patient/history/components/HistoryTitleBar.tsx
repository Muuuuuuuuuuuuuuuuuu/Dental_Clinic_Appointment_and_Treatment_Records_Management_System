import React from "react";

interface HistoryTitleBarProps {
  total: number;
}

export default function HistoryTitleBar({ total }: HistoryTitleBarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          ประวัติการรักษา
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>
          บันทึกการเข้ารับบริการทั้งหมดของคุณ
        </p>
      </div>
      <div className="text-right">
        <div
          className="text-xl font-bold"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#FF8C9A" }}
        >
          ฿{total.toLocaleString()}
        </div>
        <div className="text-xs" style={{ color: "#4A6080" }}>
          ค่าใช้จ่ายรวม
        </div>
      </div>
    </div>
  );
}

