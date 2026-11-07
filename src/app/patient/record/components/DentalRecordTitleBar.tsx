import React from "react";

interface DentalRecordTitleBarProps {
  onBack?: () => void;
  lastUpdated: string;
}

export default function DentalRecordTitleBar({ lastUpdated }: DentalRecordTitleBarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          สุขภาพฟันของฉัน
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>
          อัปเดตล่าสุด: {lastUpdated}
        </p>
      </div>
    </div>
  );
}
