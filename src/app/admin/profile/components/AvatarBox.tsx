import React from "react";
import { AdminInfo } from "@/app/shared/data";

interface AvatarBoxProps {
  user: AdminInfo | null;
}

/**
 * 👤 [LEFT CARD COMPONENT] รูปประจำตัว ชื่อ และบทบาทผู้ใช้งาน
 */
export default function AvatarBox({ user }: AvatarBoxProps) {
  const initial = user?.name ? user.name[0] : "ผ";

  return (
    <div className="flex flex-col items-center">
      {/* รูปโปรไฟล์วงกลม */}
      <div
        className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl text-white font-bold"
        style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
      >
        {initial}
      </div>

      {/* ชื่อและตำแหน่ง */}
      <h2 className="font-bold text-base text-[#1A365D]">
        {user?.name || "ผู้ดูแลระบบ"}
      </h2>
      <p className="text-xs font-medium mt-1 mb-2 text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full inline-block">
        ผู้ดูแลระบบ
      </p>
      {user?.email && (
        <p className="text-xs truncate text-[#4A6080]">
          {user.email}
        </p>
      )}
    </div>
  );
}
