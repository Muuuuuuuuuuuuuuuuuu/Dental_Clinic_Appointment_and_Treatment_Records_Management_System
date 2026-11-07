import React from "react";
import { DentistInfo } from "@/app/shared/data";

interface PersonalInfoCardProps {
  doctor: DentistInfo;
}

/**
 * 🪪 [RIGHT CARD COMPONENT] ข้อมูลส่วนตัว (View Only) สำหรับทันตแพทย์
 */
export default function PersonalInfoCard({ doctor }: PersonalInfoCardProps) {
  const fields = [
    ["เลขบัตรประชาชน", doctor.citizenId || "1000000000002"],
    ["เพศ", doctor.gender || "หญิง"],
    ["วันเกิด", doctor.birthDate || "1995-05-10"],
  ];

  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <h3 className="font-semibold mb-4 text-sm text-[#1A365D]">
        ข้อมูลส่วนตัว (View Only)
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
          <span className="text-sm text-[#1A365D]">{v}</span>
        </div>
      ))}
    </div>
  );
}

