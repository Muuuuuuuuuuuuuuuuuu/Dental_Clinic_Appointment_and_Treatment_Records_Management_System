import { useState } from "react";
import { Clock, History } from "lucide-react";
import { LeaveRequest } from "@/app/shared/data";
import ApprovalHeader from "./ApprovalHeader";
import PendingLeavesList from "./PendingLeavesList";
import HistoryLeavesList from "./HistoryLeavesList";

interface LeaveApprovalsCardProps {
  leaves: LeaveRequest[];
  onUpdateStatus: (id: number, status: string) => Promise<void>;
  loading?: boolean;
}

type Tab = "pending" | "history";

/**
 * 📋 [LEAVE APPROVALS CARD]
 * จัดการและอนุมัติคำขอการลาของทันตแพทย์และเจ้าหน้าที่
 */
export default function LeaveApprovalsCard({
  leaves,
  onUpdateStatus,
}: LeaveApprovalsCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const pendingLeaves = leaves.filter((l) => l.status === "รออนุมัติ");
  const historyLeaves = leaves.filter((l) => l.status !== "รออนุมัติ");

  const handleAction = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div
      id="leave-approvals-section"
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* 1. ส่วนหัวของการ์ด */}
      <ApprovalHeader
        pendingCount={pendingLeaves.length}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* 2. เนื้อหาการ์ด */}
      {!isCollapsed && (
        <div className="p-3.5">
          {/* แท็บสลับ รออนุมัติ / ประวัติ */}
          <div className="flex border-b border-gray-100 mb-3">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold transition-all border-b-2 -mb-px cursor-pointer ${
                activeTab === "pending"
                  ? "border-[#1A365D] text-[#1A365D]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Clock size={14} />
              รออนุมัติ
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "pending"
                    ? "bg-[#1A365D] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {pendingLeaves.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold transition-all border-b-2 -mb-px cursor-pointer ${
                activeTab === "history"
                  ? "border-[#1A365D] text-[#1A365D]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <History size={14} />
              ประวัติการอนุมัติ
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "history"
                    ? "bg-[#1A365D] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {historyLeaves.length}
              </span>
            </button>
          </div>

          {/* แสดงผลตามแท็บที่เลือก */}
          <div className="max-h-[220px] overflow-y-auto pr-1">
            {activeTab === "pending" ? (
              <PendingLeavesList
                leaves={pendingLeaves}
                onAction={handleAction}
                updatingId={updatingId}
              />
            ) : (
              <HistoryLeavesList leaves={historyLeaves} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
