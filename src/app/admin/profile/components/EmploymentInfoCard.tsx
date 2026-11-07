import React from "react";
import { AdminInfo } from "@/app/shared/data";

interface EmploymentInfoCardProps {
  user: AdminInfo | null;
}

/**
 * 💼 [RIGHT CARD COMPONENT] ข้อมูลการจ้างงาน
 */
export default function EmploymentInfoCard({ user }: EmploymentInfoCardProps) {
  const fields = [
    ["ตำแหน่ง", "ผู้ดูแลระบบ"],
    ["วันที่เริ่มงาน", user?.startDate || "-"],
    ["สถานะ", user?.employmentStatus || "ปฏิบัติงานปกติ"],
  ];

  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <h3 className="font-semibold mb-4 text-sm text-[#1A365D]">
        ข้อมูลการจ้างงาน
      </h3>
      {fields.map(([k, v]) => (
        <div
          key={k}
          className="flex py-2.5"
          style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}
        >
          <span className="text-xs w-36 font-medium flex-shrink-0 text-[#4A6080]">
            {k}
          </span>
          <span className="text-sm text-[#1A365D]">
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}

