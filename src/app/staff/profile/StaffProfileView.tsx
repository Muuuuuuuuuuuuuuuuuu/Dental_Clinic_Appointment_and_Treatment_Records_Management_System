import { StaffInfo } from "@/app/shared/data";
import { useStaffProfile } from "./hooks/useStaffProfile";
import { ChangePasswordModal, ChangeEmailModal } from "@/app/shared/components";
import {
  ProfileTitleBar,
  LeftProfileCard,
  PersonalInfoCard,
  EmploymentInfoCard,
} from "./components";

interface StaffProfileProps {
  user: StaffInfo | null;
}

/**
 * 👨‍💼 [STAFF PROFILE VIEW]
 * หน้าจัดการข้อมูลส่วนตัวของพนักงาน (Flat & Clean Architecture)
 */
export default function StaffProfileView({ user }: StaffProfileProps) {
  const profile = useStaffProfile(user);

  if (!user) return null;

  return (
    <div>
      {/* 1. ส่วนหัวหน้า */}
      <ProfileTitleBar />

      {/* 2. เนื้อหา: ซ้าย (รูป+ปุ่มความปลอดภัย) + ขวา (ข้อมูลส่วนตัว+การจ้างงาน) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-full">
          <LeftProfileCard
            user={user}
            onOpenEmailModal={() => profile.setShowEmailModal(true)}
            onOpenPasswordModal={() => profile.setShowPasswordModal(true)}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <PersonalInfoCard user={user} />
          <EmploymentInfoCard user={user} />
        </div>
      </div>

      {/* 3. ป๊อปอัปความปลอดภัยส่วนกลาง */}
      {profile.showPasswordModal && (
        <ChangePasswordModal
          isOpen={profile.showPasswordModal}
          onClose={() => profile.setShowPasswordModal(false)}
        />
      )}

      {profile.showEmailModal && (
        <ChangeEmailModal
          isOpen={profile.showEmailModal}
          onClose={() => profile.setShowEmailModal(false)}
        />
      )}
    </div>
  );
}
