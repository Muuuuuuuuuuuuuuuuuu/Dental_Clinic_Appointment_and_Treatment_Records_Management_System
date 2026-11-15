import React from "react";
import { PatientUser } from "../../types";
import { thDate, calcAge } from "../hooks/usePatientProfile";

interface IdentificationCardProps {
  user: PatientUser;
}

const InfoRow = ({ label, val }: { label: string; val: string }) => (
  <div
    className="flex py-2.5"
    style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}
  >
    <span className="text-xs w-36 font-medium flex-shrink-0 text-[#4A6080]">
      {label}
    </span>
    <span className="text-sm text-[#1A365D]">
      {val || "—"}
    </span>
  </div>
);

/**
 * 🪪 [RIGHT CARD COMPONENT] ข้อมูลส่วนตัว (View Only — แก้ไขโดยเจ้าหน้าที่เท่านั้น)
 */
export default function IdentificationCard({ user }: IdentificationCardProps) {
  const age = calcAge(user.dob);

  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-[#1A365D]">
          ข้อมูลส่วนตัว
        </h3>
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "#F0F4F8", color: "#4A6080" }}
        >
          แก้ไขโดยเจ้าหน้าที่เท่านั้น
        </span>
      </div>

      <InfoRow label="เลขบัตรประชาชน" val={user.idCard} />
      <InfoRow label="เพศ" val={user.gender} />
      <InfoRow label="วันเกิด" val={thDate(user.dob)} />
      <InfoRow label="อายุ" val={age > 0 ? `${age} ปี` : "—"} />
    </div>



  );
}
