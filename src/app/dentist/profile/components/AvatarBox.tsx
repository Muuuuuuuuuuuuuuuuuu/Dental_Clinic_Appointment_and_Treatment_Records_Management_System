import React from "react";
import { DentistInfo } from "@/app/shared/data";

interface AvatarBoxProps {
  doctor: DentistInfo;
}

/**
 * 👤 [LEFT CARD COMPONENT] รูปประจำตัว ชื่อ ความเชี่ยวชาญ และเลขใบอนุญาต
 */
export default function AvatarBox({ doctor }: AvatarBoxProps) {
  const cleanName = doctor.firstName?.trim() || doctor.name?.replace(/^(ทพญ\.|ทพ\.|นพ\.|พญ\.|ดร\.|นาย|นางสาว|นาง)\s*/i, "").trim();
  const initial = cleanName?.[0] || doctor.name?.[0] || "ท";

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl text-white font-bold"
        style={{ background: "linear-gradient(135deg, #FF8C9A, #FF6B7E)" }}
      >
        {initial}
      </div>
      <h2 className="font-bold text-base text-[#1A365D]">
        {doctor.name}
      </h2>
     
      {doctor.email && (
        <p className="text-xs truncate text-[#4A6080]">
          {doctor.email}
        </p>
      )}
    </div>
  );
}
