import React from "react";
import { DentistInfo } from "@/app/shared/data";

interface ProfessionalInfoCardProps {
  doctor: DentistInfo;
}

/**
 * 🎓 [RIGHT CARD COMPONENT] ข้อมูลวิชาชีพ (View Only)
 */
export default function ProfessionalInfoCard({ doctor }: ProfessionalInfoCardProps) {
  const fields = [
    ["ความเชี่ยวชาญ", doctor.specialty],
    ["เลขที่ใบอนุญาต", doctor.license],
    ["สถาบันการศึกษา", doctor.university || "-"],
    ["ประสบการณ์", doctor.experienceYears ? `${doctor.experienceYears} ปี` : "-"],
  ];

  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <h3 className="font-semibold mb-4 text-sm text-[#1A365D]">
        ข้อมูลวิชาชีพ (View Only)
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

