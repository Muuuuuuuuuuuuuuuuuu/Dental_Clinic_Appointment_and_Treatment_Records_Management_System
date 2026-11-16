import {
  Home,
  LogOut,
  Smile,
  Calendar,
  Clipboard,
  Users,
  Bell,
  ChevronRight,
} from "lucide-react";
import { AdminView, AdminInfo } from "@/app/shared/data";

export const ADMIN_NAV: { key: AdminView; label: string; icon: any }[] = [
  { key: "dashboard", label: "แดชบอร์ด", icon: Home },
  { key: "schedule-hub", label: "ตารางเวรและการลา", icon: Calendar },
  { key: "clinic-hub", label: "จัดการคลินิก", icon: Clipboard },
  { key: "users-hub", label: "จัดการผู้ใช้งาน", icon: Users },
];

interface AdminSidebarProps {
  view: AdminView;
  setView: (v: AdminView) => void;
  onLogout: () => void;
  pendingLeaves: number;
  adminInfo: AdminInfo | null;
}

/**
 * 🧭 [ADMIN LAYOUT] แถบนำทางด้านข้างของผู้ดูแลระบบ (Admin Sidebar)
 */
export function AdminSidebar({
  view,
  setView,
  onLogout,
  pendingLeaves,
  adminInfo,
}: AdminSidebarProps) {
  return (
    <div
      className="flex flex-col h-full py-6 px-4"
      style={{ backgroundColor: "#1A365D" }}
    >
      {/* โลโก้คลินิกด้านบนสุด */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
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
            ผู้ดูแลระบบ
          </div>
        </div>
      </div>

      {/* รายการเมนูงานหลัก (อยู่ชิดด้านบน ระดับสายตา) */}
      <nav
        className="flex-1 space-y-1.5 overflow-y-auto pr-1 mt-5"
        style={{ scrollbarWidth: "none" }}
      >
        {ADMIN_NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left relative"
            style={{
              backgroundColor: view === key ? "#FF8C9A" : "transparent",
              color: view === key ? "white" : "rgba(255,255,255,0.65)",
            }}
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            {key === "schedule-hub" && pendingLeaves > 0 && (
              <span
                className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    view === key ? "rgba(255,255,255,0.25)" : "#EF4444",
                  color: "white",
                }}
              >
                <Bell size={9} />
                {pendingLeaves}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* โซนโปรไฟล์ผู้ใช้และออกจากระบบ (วางไว้ล่างสุด คลิกเข้าโปรไฟล์ได้เหมือนปุ่ม) */}
      <div
        className="mt-4 pt-4 flex-shrink-0 space-y-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* ปุ่มโปรไฟล์ผู้ใช้งาน */}
        <button
          type="button"
          onClick={() => setView("profile")}
          title="คลิกเพื่อดูและแก้ไขข้อมูลส่วนตัว"
          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all group border ${
            view === "profile"
              ? "bg-[#FF8C9A] border-[#FF8C9A] text-white shadow-md"
              : "bg-white/[0.06] border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
              view === "profile"
                ? "bg-white text-[#FF8C9A]"
                : "bg-[#FF8C9A] text-white"
            }`}
          >
            {adminInfo?.name?.charAt(0) || "ผ"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">
              {adminInfo?.name || "ผู้ดูแลระบบ"}
            </p>
            <p
              className={`text-[11px] truncate mt-0.5 ${
                view === "profile" ? "text-white/80" : "text-white/50"
              }`}
            >
              {adminInfo?.email || "admin@clinic.com"}
            </p>
          </div>
          <ChevronRight
            size={16}
            className={`flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${
              view === "profile" ? "text-white" : "text-white/40 group-hover:text-white"
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

export default AdminSidebar;
