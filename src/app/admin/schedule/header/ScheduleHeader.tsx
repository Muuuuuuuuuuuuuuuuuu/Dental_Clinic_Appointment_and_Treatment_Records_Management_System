import { Save, AlertCircle } from "lucide-react";

interface ScheduleHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: "all" | "dentist" | "staff";
  onRoleFilterChange: (role: "all" | "dentist" | "staff") => void;
  pendingLeaveCount: number;
  onNavigateToSettings?: () => void;
  pendingChangesCount: number;
  onSaveAll: () => void;
}

/**
 * 🔲 [SCHEDULE HEADER]
 * แถบควบคุมด้านบน: หัวข้อและช่องค้นหาอยู่ฝั่งซ้าย ส่วนตัวกรองบทบาทชิดฝั่งขวา
 */
export default function ScheduleHeader({
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange,
  roleFilter: _roleFilter,
  onRoleFilterChange: _onRoleFilterChange,
  pendingLeaveCount,
  pendingChangesCount,
  onSaveAll,
}: ScheduleHeaderProps) {
  return (
    <div className="mb-2.5 grid grid-cols-1 xl:grid-cols-2 gap-3.5 items-end">
      {/* ฝั่งซ้าย: ครอบด้วยความกว้างพอดีกล่องด้านซ้าย (WeeklyTemplateCard) */}
      <div className="w-full min-w-0">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          ตารางเวรและการลา
        </h1>
        <div className="flex items-center gap-2.5 mt-0.5 w-full min-w-0">
          <p className="text-xs text-[#4A6080] shrink-0 whitespace-nowrap">
            จัดการตารางเวร ปฏิทินปฏิบัติงานจริง และคำขออนุมัติการลา
          </p>
         
        </div>
      </div>

     

      {/* ฝั่งขวา: แจ้งเตือนคำขอลาและปุ่มบันทึกชิดขวา */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 w-full">
        {/* ปุ่มรออนุมัติการลา */}
        {pendingLeaveCount > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            <AlertCircle size={13} className="text-amber-500 animate-pulse" />
            รออนุมัติ {pendingLeaveCount}
          </span>
        )}

        {/* ปุ่มบันทึกการเปลี่ยนแปลงทั้งหมด */}
        {pendingChangesCount > 0 && (
          <button
            onClick={onSaveAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-md transition-all animate-bounce cursor-pointer"
          >
            <Save size={13} />
            บันทึก ({pendingChangesCount})
          </button>
        )}
      </div>
    </div>
  );
}
