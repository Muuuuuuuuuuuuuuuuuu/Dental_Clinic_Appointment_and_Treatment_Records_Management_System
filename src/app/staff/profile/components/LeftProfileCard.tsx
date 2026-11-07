import React from "react";
import { StaffInfo } from "@/app/shared/data";

interface LeftProfileCardProps {
  user: StaffInfo;
  onOpenEmailModal: () => void;
  onOpenPasswordModal: () => void;
}

/**
 * 👤 [CONTENT COMPONENT - LEFT] การ์ดรูปโปรไฟล์ ชื่อ ตำแหน่ง และปุ่มเปิดตั้งค่าความปลอดภัย
 */
export default function LeftProfileCard({
  user,
  onOpenEmailModal,
  onOpenPasswordModal,
}: LeftProfileCardProps) {
  const initial = user.firstName?.[0] || user.name?.[0] || "พ";
  const fullName = user.firstName
    ? `${user.firstName} ${user.lastName}`
    : user.name;

  return (
    <div
      className="rounded-2xl bg-white p-6 text-center h-full"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div
        className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl text-white font-bold"
        style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
      >
        {initial}
      </div>
      <h2 className="font-bold text-base" style={{ color: "#1A365D" }}>
        {fullName}
      </h2>
      <p className="text-xs font-medium mt-1 mb-2 text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full inline-block">
        {user.role || "พนักงาน"}
      </p>
      {user.email && (
        <p className="text-xs truncate" style={{ color: "#4A6080" }}>
          {user.email}
        </p>
      )}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
        <button
          type="button"
          onClick={onOpenEmailModal}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          เปลี่ยนอีเมล
        </button>
        <button
          type="button"
          onClick={onOpenPasswordModal}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          เปลี่ยนรหัสผ่าน
        </button>
      </div>

      {/* ข้อมูลติดต่อ (วางล่างสุดของกล่องด้านซ้าย) */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-left w-full">
        <h3 className="font-semibold mb-2.5 text-xs text-[#1A365D]">
          ข้อมูลติดต่อ
        </h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between py-1.5 border-b border-gray-50">
            <span className="text-[#4A6080]">เบอร์โทรศัพท์</span>
            <span className="font-medium text-[#1A365D]">{user.phone || "-"}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-[#4A6080]">ที่อยู่</span>
            <span className="font-medium text-[#1A365D]">{user.address || "คลินิก"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
