import React, { useState } from "react";
import { Clock, History, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { LeaveRequest } from "@/app/shared/data";

interface ApprovalHeaderProps {
  pendingCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * 🏷️ ส่วนหัวของการ์ดอนุมัติการลา พร้อมปุ่มย่อ/ขยาย
 */
function ApprovalHeader({
  pendingCount,
  isCollapsed,
  onToggleCollapse,
}: ApprovalHeaderProps) {
  return (
    <div className="py-2.5 px-3.5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
       
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#1A365D]">คำขออนุมัติการลา</h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                รออนุมัติ {pendingCount}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500">
            พิจารณาคำขอลางานของทันตแพทย์และพนักงาน (เมื่ออนุมัติจะอัปเดตลงปฏิทินทันที)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors bg-white shadow-xs cursor-pointer"
          title={isCollapsed ? "ขยายส่วนการลา" : "ย่อส่วนการลา"}
        >
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
    </div>
  );
}

interface PendingLeavesListProps {
  leaves: LeaveRequest[];
  onAction: (id: number, status: string) => Promise<void>;
  updatingId: number | null;
}

/**
 * ⏳ รายการคำขอลางานที่รออนุมัติ พร้อมปุ่มอนุมัติ / ไม่อนุมัติ
 */
function PendingLeavesList({
  leaves,
  onAction,
  updatingId,
}: PendingLeavesListProps) {
  if (leaves.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-xs">
        ไม่มีคำขอลางานที่รออนุมัติในขณะนี้
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {leaves.map((l) => (
        <div
          key={l.id}
          className="rounded-xl bg-white p-2.5 border border-l-4 border-l-amber-500 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ backgroundColor: "#FF8C9A" }}
              >
                {l.doctorName.replace(/ทพญ\.|ทพ\./g, "").trim()[0] || "บ"}
              </div>
              <div>
                <p className="font-bold text-xs text-[#1A365D]">{l.doctorName}</p>
                <p className="text-[10px] text-gray-500">
                  ช่วงวันที่ลา:{" "}
                  <span className="font-semibold text-gray-700">
                    {l.startDate === l.endDate ? l.startDate : `${l.startDate} ถึง ${l.endDate}`}
                  </span>
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                    ลา{l.leaveType}
                  </span>
                  {l.reason && (
                    <span className="text-[10px] text-gray-600 truncate max-w-[180px]" title={l.reason}>
                      {l.reason}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              {l.status}
            </span>
          </div>

          {/* ปุ่มดำเนินการอนุมัติ / ไม่อนุมัติ */}
          <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-gray-100">
            <button
              disabled={updatingId === l.id}
              onClick={() => onAction(l.id, "อนุมัติแล้ว")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Check size={11} /> อนุมัติ
            </button>
            <button
              disabled={updatingId === l.id}
              onClick={() => onAction(l.id, "ไม่อนุมัติ")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X size={11} /> ไม่อนุมัติ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface HistoryLeavesListProps {
  leaves: LeaveRequest[];
}

/**
 * 📜 รายการประวัติคำขอลางานที่ดำเนินการไปแล้ว
 */
function HistoryLeavesList({ leaves }: HistoryLeavesListProps) {
  if (leaves.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-xs">
        ยังไม่มีประวัติการอนุมัติการลา
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
      {leaves.map((l) => {
        const isApproved = l.status === "อนุมัติแล้ว";
        return (
          <div
            key={l.id}
            className={`rounded-xl bg-white p-3 border border-l-4 ${
              isApproved ? "border-l-green-500" : "border-l-red-500"
            } shadow-xs flex items-start justify-between gap-3`}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ backgroundColor: isApproved ? "#10B981" : "#EF4444" }}
              >
                {l.doctorName.replace(/ทพญ\.|ทพ\./g, "").trim()[0] || "บ"}
              </div>
              <div>
                <p className="font-bold text-xs text-[#1A365D]">{l.doctorName}</p>
                <p className="text-[10px] text-gray-500">
                  {l.startDate === l.endDate ? l.startDate : `${l.startDate} ถึง ${l.endDate}`} • ลา
                  {l.leaveType}
                </p>
                {l.reason && <p className="text-[10px] text-gray-400 mt-0.5">เหตุผล: {l.reason}</p>}
              </div>
            </div>

            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                isApproved
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {l.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface LeaveApprovalsCardProps {
  leaves: LeaveRequest[];
  onUpdateStatus: (id: number, status: string) => Promise<void>;
  loading?: boolean;
}

type Tab = "pending" | "history";

/**
 * 📋 [LEAVE APPROVALS CARD]
 * จัดการและอนุมัติคำขอการลาของทันตแพทย์และเจ้าหน้าที่ (Self-Contained Component)
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
