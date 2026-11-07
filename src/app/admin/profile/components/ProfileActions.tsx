import React from "react";

interface ProfileActionsProps {
  onOpenEmailModal: () => void;
  onOpenPasswordModal: () => void;
}

/**
 * ⚙️ [LEFT CARD COMPONENT] ปุ่มการจัดการบัญชี (เปลี่ยนอีเมล / เปลี่ยนรหัสผ่าน)
 */
export default function ProfileActions({
  onOpenEmailModal,
  onOpenPasswordModal,
}: ProfileActionsProps) {
  return (
    <div className="w-full mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
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
  );
}

