import React from "react";

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  leaveType: "ลาป่วย" | "ลากิจ" | "ลาพักร้อน";
  onLeaveTypeChange: (type: "ลาป่วย" | "ลากิจ" | "ลาพักร้อน") => void;
  leaveReason: string;
  onLeaveReasonChange: (reason: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * 📝 [MODAL COMPONENT] ฟอร์มหน้าต่างป๊อปอัปส่งคำขอลางาน
 */
export default function LeaveRequestModal({
  isOpen,
  onClose,
  selectedDate,
  leaveType,
  onLeaveTypeChange,
  leaveReason,
  onLeaveReasonChange,
  onSubmit,
}: LeaveRequestModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-1">ขอลางาน</h3>
        <p className="text-sm text-gray-500 mb-6">
          วันที่:{" "}
          {selectedDate
            ? new Date(selectedDate).toLocaleDateString("th-TH", { dateStyle: "long" })
            : "-"}
        </p>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทการลา</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={leaveType === "ลาป่วย"}
                  onChange={() => onLeaveTypeChange("ลาป่วย")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">ลาป่วย</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={leaveType === "ลากิจ"}
                  onChange={() => onLeaveTypeChange("ลากิจ")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">ลากิจ</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={leaveType === "ลาพักร้อน"}
                  onChange={() => onLeaveTypeChange("ลาพักร้อน")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">ลาพักร้อน</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เหตุผลการลา <span className="text-red-500">*</span>
            </label>
            <textarea
              value={leaveReason}
              onChange={(e) => onLeaveReasonChange(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="ระบุเหตุผลการลาให้ชัดเจน"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
            >
              ส่งคำขอ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

