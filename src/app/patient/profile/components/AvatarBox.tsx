import { PatientUser } from "../../types";

interface AvatarBoxProps {
  user: PatientUser;
  onOpenEmailModal?: () => void;
  onOpenPasswordModal?: () => void;
}

/**
 * 👤 [LEFT CARD COMPONENT] รูปประจำตัว, ชื่อคนไข้, อีเมล และปุ่มจัดการความปลอดภัย (สอดคล้องกับแอดมิน)
 */
export default function AvatarBox({
  user,
  onOpenEmailModal,
  onOpenPasswordModal,
}: AvatarBoxProps) {
  return (
    <div
      className="rounded-2xl bg-white p-6 text-center h-full"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
        style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
      >
        {user.firstName ? user.firstName[0] : "?"}
      </div>
      <h2 className="font-bold text-base text-[#1A365D]">
        {user.firstName} {user.lastName}
      </h2>
      <p className="text-xs font-medium mt-1 mb-2 text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full inline-block">
        คนไข้
      </p>
      <p className="text-xs truncate text-[#4A6080]">
        {user.email}
      </p>

      {/* ปุ่มจัดการบัญชี / ความปลอดภัย */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
        {onOpenEmailModal && (
          <button
            type="button"
            onClick={onOpenEmailModal}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            เปลี่ยนอีเมล
          </button>
        )}
        {onOpenPasswordModal && (
          <button
            type="button"
            onClick={onOpenPasswordModal}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            เปลี่ยนรหัสผ่าน
          </button>
        )}
      </div>
    </div>
  );
}
