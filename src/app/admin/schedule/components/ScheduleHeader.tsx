import { Search, Save, AlertCircle } from "lucide-react";

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
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
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
          {/* ช่องค้นหา - ปรับขยายกว้างสุดให้พอดีกับขนาดขอบกล่องด้านซ้าย */}
          <div className="relative flex-1 min-w-0">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อบุคลากร..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-7 pr-2.5 py-1 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF8C9A] w-full bg-white shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: แถบปุ่มกรองบทบาทและปุ่มบันทึก ชิดขวา พอดีขอบเขตกล่องด้านขวา */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 w-full">
        {/* ปุ่มกรองบทบาท (ทั้งหมด, ทันตแพทย์, พนักงาน) ขนาดและสไตล์เดียวกับกล่องเลือกเดือน */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-0.5 shadow-xs">
          <button
            onClick={() => onRoleFilterChange("all")}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
              roleFilter === "all"
                ? "bg-white text-[#1A365D] shadow-xs font-bold"
                : "text-gray-500 hover:text-gray-900 font-medium"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => onRoleFilterChange("dentist")}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
              roleFilter === "dentist"
                ? "bg-white text-[#FF8C9A] shadow-xs font-bold"
                : "text-gray-500 hover:text-gray-900 font-medium"
            }`}
          >
            ทันตแพทย์
          </button>
          <button
            onClick={() => onRoleFilterChange("staff")}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
              roleFilter === "staff"
                ? "bg-white text-[#059669] shadow-xs font-bold"
                : "text-gray-500 hover:text-gray-900 font-medium"
            }`}
          >
            พนักงาน
          </button>
        </div>

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
