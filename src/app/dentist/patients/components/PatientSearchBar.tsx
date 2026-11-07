import React from "react";

interface PatientSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * 🔍 [HEADER COMPONENT] ช่องค้นหาคนไข้ด้วยชื่อหรือหมายเลข HN
 */
export default function PatientSearchBar({ value, onChange }: PatientSearchBarProps) {
  return (
    <div className="max-w-md mb-6">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ค้นหาด้วยชื่อหรือหมายเลข HN..."
        className="w-full px-4 py-3 rounded-xl text-sm outline-hidden"
        style={{
          backgroundColor: "white",
          border: "1.5px solid rgba(26,54,93,0.12)",
          color: "#1A365D",
          boxShadow: "0 2px 8px rgba(26,54,93,0.06)",
        }}
      />
    </div>
  );
}

