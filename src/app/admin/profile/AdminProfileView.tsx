import React, { useState } from "react";
import { AdminInfo } from "@/app/shared/data";
import { ChangePasswordModal, ChangeEmailModal } from "@/app/auth/components";

interface AdminProfileProps {
  user: AdminInfo | null;
}

/**
 * 👤 [ADMIN PROFILE VIEW]
 * หน้าข้อมูลส่วนตัวของผู้ดูแลระบบ (Single-File Clean Architecture)
 * รวมโครงสร้างทั้งหมดในไฟล์เดียว: ข้อมูลโปรไฟล์, การจัดการบัญชี, ข้อมูลส่วนตัว, ข้อมูลการจ้างงาน
 */
export default function AdminProfileView({ user }: AdminProfileProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const initial = user?.name ? user.name[0] : "ผ";

  const personalFields = [
    ["เลขบัตรประชาชน", user?.citizenId || "-"],
    ["เพศ", user?.gender || "-"],
    ["วันเกิด", user?.birthDate || "-"],
  ];

  const employmentFields = [
    ["ตำแหน่ง", "ผู้ดูแลระบบ"],
    ["วันที่เริ่มงาน", user?.startDate || "-"],
    ["สถานะ", user?.employmentStatus || "ปฏิบัติงานปกติ"],
  ];

  return (
    <div>
      {/* 1. ส่วนหัวหน้า */}
      <h1 className="text-2xl font-bold mb-6 font-sans text-[#1A365D]">
        ข้อมูลส่วนตัว
      </h1>

      {/* 2. เนื้อหา: ซ้าย (รูป+ปุ่มความปลอดภัย+ติดต่อ) + ขวา (ข้อมูลส่วนตัว+การจ้างงาน) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* คอลัมน์ซ้าย: การ์ดโปรไฟล์และการตั้งค่าบัญชี */}
        <div className="lg:col-span-1 h-full">
          <div
            className="rounded-2xl bg-white p-6 text-center h-full flex flex-col"
            style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
          >
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

            {/* ปุ่มจัดการบัญชี */}
            <div className="w-full mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                เปลี่ยนอีเมล
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                เปลี่ยนรหัสผ่าน
              </button>
            </div>

            {/* ข้อมูลติดต่อ */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-left w-full">
              <h3 className="font-semibold mb-2.5 text-xs text-[#1A365D]">
                ข้อมูลติดต่อ
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#4A6080]">เบอร์โทรศัพท์</span>
                  <span className="font-medium text-[#1A365D]">{user?.phone || "-"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#4A6080]">ที่อยู่</span>
                  <span className="font-medium text-[#1A365D]">{user?.address || "คลินิก"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: ข้อมูลส่วนตัว + ข้อมูลการจ้างงาน */}
        <div className="lg:col-span-2 space-y-4">
          {/* การ์ดข้อมูลส่วนตัว */}
          <div
            className="rounded-2xl bg-white p-6"
            style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
          >
            <h3 className="font-semibold mb-4 text-sm text-[#1A365D]">
              ข้อมูลส่วนตัว (View Only)
            </h3>
            {personalFields.map(([k, v]) => (
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

          {/* การ์ดข้อมูลการจ้างงาน */}
          <div
            className="rounded-2xl bg-white p-6"
            style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
          >
            <h3 className="font-semibold mb-4 text-sm text-[#1A365D]">
              ข้อมูลการจ้างงาน
            </h3>
            {employmentFields.map(([k, v]) => (
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
        </div>
      </div>

      {/* 3. กล่องป๊อปอัปความปลอดภัย */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <ChangeEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </div>
  );
}
