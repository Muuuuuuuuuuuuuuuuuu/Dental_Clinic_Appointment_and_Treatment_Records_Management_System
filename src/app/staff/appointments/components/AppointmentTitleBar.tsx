import { Search } from "lucide-react";
import { TabView } from "../hooks/useStaffAppointments";

interface TitleBarProps {
  activeTab: TabView;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

/**
 *[HEADER COMPONENT] หัวข้อและกล่องค้นหาของหน้าระบบนัดหมาย
 */
export default function TitleBar({
  activeTab,
  searchQuery,
  onSearchChange,
}: TitleBarProps) {
  const showSearch = activeTab === "all" || activeTab === "transfer" || activeTab === "reschedule";

  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          จัดการนัดหมาย
        </h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>
          คัดกรองเคสที่มีความเสี่ยงสุขภาพ, ย้ายเคส, เลื่อนคิว และยกเลิกนัดหมาย
        </p>
      </div>

      {showSearch && (
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาชื่อคนไข้, ชื่อหมอ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>
      )}
    </div>
  );
}

