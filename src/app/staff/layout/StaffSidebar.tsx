import {
  Home,
  Users,
  LogOut,
  Smile,
  CheckCircle,
  CreditCard,
  Plus,
  CalendarX,
  Lock,
  ChevronRight,
} from "lucide-react";
import { StaffView } from "@/app/shared/data";

export const STAFF_NAV = [
  { key: "queue" as StaffView, label: "คิวงาน", icon: Home, isOperational: true },
  { key: "appointments" as StaffView, label: "จัดการนัดหมาย", icon: CheckCircle, isOperational: true },
  { key: "patients" as StaffView, label: "จัดการคนไข้", icon: Users, isOperational: true },
  { key: "walkin" as StaffView, label: "จองคิว Walk-in", icon: Plus, isOperational: true },
  { key: "payment" as StaffView, label: "รับชำระเงิน", icon: CreditCard, isOperational: true },
  { key: "leave" as StaffView, label: "ปฏิทินและการลางาน", icon: CalendarX, isOperational: false },
];

interface StaffSidebarProps {
  view: StaffView;
  setView: (v: StaffView) => void;
  onLogout: () => void;
  isClockedIn: boolean;
  staffName?: string;
  staffRole?: string;
  staffInitial?: string;
}

/**
 *[STAFF LAYOUT] แถบนำทางด้านข้างของพนักงาน (Sidebar)
 */
export function StaffSidebar({
  view,
  setView,
  onLogout,
  isClockedIn,
  staffName,
  staffRole,
  staffInitial,
}: StaffSidebarProps) {
  return (
    <div
      className="flex flex-col h-full py-6 px-4"
      style={{ backgroundColor: "#1A365D" }}
    >
      {/* โลโก้คลินิกด้านบนสุด */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
        >
          <Smile size={16} color="white" />
        </div>
        <div>
          <div
            className="font-bold text-sm text-white"
            style={{ fontFamily: "Sarabun, sans-serif" }}
          >
            คลินิกสุภัทร
          </div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            พนักงานต้อนรับ
          </div>
        </div>
      </div>

      {/* รายการเมนูงานหลัก (อยู่ชิดด้านบน ระดับสายตา) */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 mt-5" style={{ scrollbarWidth: "none" }}>
        {STAFF_NAV.map(({ key, label, icon: Icon, isOperational }) => {
          const isLocked = isOperational && !isClockedIn;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group"
              style={{
                backgroundColor:
                  view === key
                    ? isLocked
                      ? "rgba(255,140,154,0.2)"
                      : "#FF8C9A"
                    : "transparent",
                color:
                  view === key
                    ? isLocked
                      ? "#FF8C9A"
                      : "white"
                    : "rgba(255,255,255,0.65)",
              }}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} className={isLocked ? "opacity-50" : ""} />
                <span className={isLocked ? "opacity-70" : ""}>{label}</span>
              </div>
              {isLocked && (
                <Lock
                  size={14}
                  className="opacity-40 group-hover:opacity-70 transition-opacity"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* โซนโปรไฟล์พนักงานและออกจากระบบ (วางไว้ล่างสุด คลิกเข้าโปรไฟล์ได้เหมือนปุ่ม) */}
      <div
        className="mt-4 pt-4 flex-shrink-0 space-y-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* ปุ่มโปรไฟล์พนักงาน */}
        <button
          type="button"
          onClick={() => setView("profile")}
          title="คลิกเพื่อดูและแก้ไขข้อมูลส่วนตัว"
          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all group border cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ring-0 ${view === "profile"
              ? "bg-[#FF8C9A] border-[#FF8C9A] text-white shadow-md"
              : "bg-white/[0.06] border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${view === "profile"
                ? "bg-white text-[#FF8C9A]"
                : "bg-gradient-to-br from-[#FF8C9A] to-[#FF6B7E] text-white"
              }`}
          >
            {staffInitial || "ร"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">
              {staffName || "พนักงาน"}
            </p>
            <p
              className={`text-[11px] truncate mt-0.5 ${view === "profile" ? "text-white/80" : "text-white/50"
                }`}
            >
              {staffRole || "พนักงานต้อนรับ"}
            </p>
          </div>
          <ChevronRight
            size={16}
            className={`flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${view === "profile" ? "text-white" : "text-white/40 group-hover:text-white"
              }`}
          />
        </button>

        {/* ปุ่มออกจากระบบ */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={15} /> ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

export default StaffSidebar;
