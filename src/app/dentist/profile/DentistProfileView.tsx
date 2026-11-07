import { useState, useEffect } from "react";
import { DentistInfo, ServiceInfo } from "@/app/shared/data";
import { getServices } from "@/app/shared/supabaseApi";
import { ChangePasswordModal, ChangeEmailModal } from "@/app/shared/components";
import {
  ProfileTitleBar,
  AvatarBox,
  PersonalInfoCard,
  ProfessionalInfoCard,
  EmploymentInfoCard,
} from "./components";

interface DoctorProfileProps {
  doctor: DentistInfo | null;
}

/**
 * 👤 [DENTIST PROFILE VIEW]
 * หน้าข้อมูลส่วนตัวทันตแพทย์ (Flat & Clean Architecture - ยึดการ์ดซ้ายตามหน้า Admin)
 */
export default function DentistProfileView({ doctor }: DoctorProfileProps) {
  const [allServices, setAllServices] = useState<ServiceInfo[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    getServices().then(setAllServices).catch(console.error);
  }, []);

  if (!doctor) return null;

  return (
    <div>
      {/* 1. ส่วนหัวหน้า */}
      <ProfileTitleBar />

      {/* 2. เนื้อหา: ซ้าย (รูป+ปุ่มความปลอดภัย) + ขวา (ข้อมูลวิชาชีพ+บริการ+ติดต่อ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-full">
          <div
            className="rounded-2xl bg-white p-6 text-center h-full"
            style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
          >
            <AvatarBox doctor={doctor} />

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

            {/* บริการที่รับรักษา (ย้ายมาไว้ใต้ปุ่มทางกล่องด้านซ้าย) */}
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

            {/* ข้อมูลติดต่อ (วางล่างสุดของกล่องด้านซ้าย) */}
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

        <div className="lg:col-span-2 space-y-4">
          <PersonalInfoCard doctor={doctor} />
          <ProfessionalInfoCard doctor={doctor} />
          <EmploymentInfoCard doctor={doctor} />
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
