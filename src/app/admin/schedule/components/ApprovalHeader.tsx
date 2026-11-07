import React from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

interface ApprovalHeaderProps {
  pendingCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ApprovalHeader({
  pendingCount,
  isCollapsed,
  onToggleCollapse,
}: ApprovalHeaderProps) {
  return (
    <div className="py-2.5 px-3.5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <FileText size={15} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#1A365D]">คำขออนุมัติการลา (Leave Approvals)</h2>
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
