import React, { useState, useEffect } from "react";
import { DentistInfo, ServiceInfo } from "@/app/shared/data";
import { getServices } from "@/app/shared/supabaseApi";
import { ChangePasswordModal, ChangeEmailModal } from "@/app/auth/components";

interface DoctorProfileProps {
  doctor: DentistInfo | null;
}

/**
 * 👤 [DENTIST PROFILE VIEW]
 * หน้าข้อมูลส่วนตัวทันตแพทย์ (Single-File Clean Architecture)
 * รวมโครงสร้างทั้งหมดในไฟล์เดียว: ข้อมูลโปรไฟล์, บริการที่รับรักษา, การจัดการบัญชี, และข้อมูลวิชาชีพ
 */
export default function DentistProfileView({ doctor }: DoctorProfileProps) {
  const [allServices, setAllServices] = useState<ServiceInfo[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    getServices().then(setAllServices).catch(console.error);
  }, []);

  if (!doctor) return null;

  const cleanName =
    doctor.firstName?.trim() ||
    doctor.name
      ?.replace(/^(ทพญ\.|ทพ\.|นพ\.|พญ\.|ดร\.|นาย|นางสาว|นาง)\s*/i, "")
      .trim();
  const initial = cleanName?.[0] || doctor.name?.[0] || "ท";

  const personalFields = [
    ["เลขบัตรประชาชน", doctor.citizenId || "1000000000002"],
    ["เพศ", doctor.gender || "หญิง"],
    ["วันเกิด", doctor.birthDate || "1995-05-10"],
  ];

  const professionalFields = [
    ["ความเชี่ยวชาญ", doctor.specialty],
    ["เลขที่ใบอนุญาต", doctor.license],
    ["สถาบันการศึกษา", doctor.university || "-"],
    ["ประสบการณ์", doctor.experienceYears ? `${doctor.experienceYears} ปี` : "-"],
  ];

  const employmentFields = [
    ["ตำแหน่ง", "ทันตแพทย์"],
    ["วันที่เริ่มงาน", doctor.startDate || "2026-01-01"],
    ["สถานะ", "ปฏิบัติงานปกติ"],
  ];

  return (
    <div>
      {/* 1. ส่วนหัวหน้า */}
      <h1 className="text-2xl font-bold mb-6 font-sans text-[#1A365D]">
        ข้อมูลส่วนตัว
      </h1>

      {/* 2. เนื้อหา: ซ้าย (รูป+ปุ่มความปลอดภัย+บริการ+ติดต่อ) + ขวา (ข้อมูลส่วนตัว+วิชาชีพ+การจ้างงาน) */}
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
              style={{ background: "linear-gradient(135deg, #FF8C9A, #FF6B7E)" }}
            >
              {initial}
            </div>

            {/* ชื่อและอีเมล */}
            <h2 className="font-bold text-base text-[#1A365D]">
              {doctor.name}
            </h2>
            <p className="text-xs font-medium mt-1 mb-2 text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full inline-block">
              {doctor.specialty || "ทันตแพทย์"}
            </p>
            {doctor.email && (
              <p className="text-xs truncate text-[#4A6080]">
                {doctor.email}
              </p>
            )}

            {/* ปุ่มเปลี่ยนอีเมลและรหัสผ่าน */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
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

            {/* บริการที่รับรักษา */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-left">
              <h3 className="font-semibold mb-3 text-xs text-[#1A365D]">
                บริการที่รับรักษา
              </h3>
              {!doctor.serviceIds || doctor.serviceIds.length === 0 ? (
                <p className="text-xs text-gray-400">ยังไม่มีข้อมูลบริการที่รับรักษา</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {doctor.serviceIds.map((sid) => {
                    const srv = allServices.find((s) => s.id === sid);
                    if (!srv) return null;
                    return (
                      <span
                        key={sid}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        {srv.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ข้อมูลติดต่อ */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-left w-full">
              <h3 className="font-semibold mb-2.5 text-xs text-[#1A365D]">
                ข้อมูลติดต่อ
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-[#4A6080]">เบอร์โทรศัพท์</span>
                  <span className="font-medium text-[#1A365D]">{doctor.phone || "0899999993"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#4A6080]">ที่อยู่</span>
                  <span className="font-medium text-[#1A365D]">{doctor.address || "คลินิก"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: ข้อมูลส่วนตัว + ข้อมูลวิชาชีพ + ข้อมูลการจ้างงาน */}
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
                <span className="text-sm text-[#1A365D]">{v}</span>
              </div>
            ))}
          </div>

          {/* การ์ดข้อมูลวิชาชีพ */}
          <div
            className="rounded-2xl bg-white p-6"
            style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
          >
            <h3 className="font-semibold mb-4 text-sm text-[#1A365D]">
              ข้อมูลวิชาชีพ (View Only)
            </h3>
            {professionalFields.map(([k, v]) => (
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
                <span className="text-sm text-[#1A365D]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. ป๊อปอัปความปลอดภัย (ใช้คอมโพเนนต์กลางจาก shared) */}
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
