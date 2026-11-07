import { useState } from "react";
import { AdminInfo } from "@/app/shared/data";
import { ChangePasswordModal, ChangeEmailModal } from "@/app/shared/components";
import {
  ProfileHeader,
  AvatarBox,
  ProfileActions,
  PersonalInfoCard,
  EmploymentInfoCard,
} from "./components";

interface AdminProfileProps {
  user: AdminInfo | null;
}

/**
 * 👤 [ADMIN PROFILE VIEW]
 * หน้าข้อมูลส่วนตัวของผู้ดูแลระบบ (Flat & Clean Architecture)
 */
export default function AdminProfileView({ user }: AdminProfileProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <div>
      {/* 1. ส่วนหัวหน้า */}
      <ProfileHeader />

      {/* 2. เนื้อหา: ซ้าย (รูป+ปุ่มความปลอดภัย) + ขวา (ข้อมูลส่วนตัว+การจ้างงาน) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-full">
          <div
            className="rounded-2xl bg-white p-6 text-center h-full flex flex-col"
            style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
          >
            <AvatarBox user={user} />
            <ProfileActions
              onOpenEmailModal={() => setShowEmailModal(true)}
              onOpenPasswordModal={() => setShowPasswordModal(true)}
            />

            {/* ข้อมูลติดต่อ (วางล่างสุดของกล่องด้านซ้าย) */}
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

        <div className="lg:col-span-2 space-y-4">
          <PersonalInfoCard user={user} />
          <EmploymentInfoCard user={user} />
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
