import { Home, Calendar, Users, FileText, LogOut, Smile, ClipboardList, ChevronRight } from "lucide-react";
import { DocView, DentistInfo } from "@/app/shared/data";

const DOC_NAV = [
  { key: "dashboard" as DocView, label: "แดชบอร์ด", icon: Home },
  { key: "queue" as DocView, label: "คิวการรักษา", icon: Users },
  { key: "records" as DocView, label: "เวชระเบียน", icon: FileText },
  { key: "history" as DocView, label: "ประวัติการทำงาน", icon: ClipboardList },
  { key: "calendar" as DocView, label: "ปฏิทินและการลางาน", icon: Calendar },
];

interface DentistSidebarProps {
  view: DocView;
  setView: (v: DocView) => void;
  onLogout: () => void;
  doctor: DentistInfo | null;
}

/**
 * 🦷 [DENTIST SIDEBAR]
 * เมนูนำทางด้านข้างของทันตแพทย์
 */
export default function DentistSidebar({
  view,
  setView,
  onLogout,
  doctor,
}: DentistSidebarProps) {
  return (
    <div className="flex flex-col h-full py-6 px-4" style={{ backgroundColor: "#1A365D" }}>
      {/* โลโก้คลินิกด้านบนสุด */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
        >
          <Smile size={16} color="white" />
        </div>
        <div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Sarabun, sans-serif" }}>
            คลินิกสุภัทร
          </div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>
            DENTAL CLINIC
          </div>
        </div>
      </div>

      {/* เมนูงานหลัก (อยู่ชิดด้านบน ระดับสายตา) */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 mt-5" style={{ scrollbarWidth: "none" }}>
        {DOC_NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer"
            style={{
              backgroundColor: view === key ? "#FF8C9A" : "transparent",
              color: view === key ? "white" : "rgba(255,255,255,0.65)",
            }}
          >
            <Icon size={17} /> {label}
          </button>
        ))}
      </nav>

      {/* โซนโปรไฟล์ทันตแพทย์และออกจากระบบ (วางไว้ล่างสุด คลิกเข้าโปรไฟล์ได้เหมือนปุ่ม) */}
      <div className="mt-4 pt-4 flex-shrink-0 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {/* ปุ่มโปรไฟล์ทันตแพทย์ */}
        <button
          type="button"
          onClick={() => setView("profile")}
          title="คลิกเพื่อดูและแก้ไขข้อมูลส่วนตัว"
          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all group border cursor-pointer ${
            view === "profile"
              ? "bg-[#FF8C9A] border-[#FF8C9A] text-white shadow-md"
              : "bg-white/[0.06] border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
              view === "profile"
                ? "bg-white text-[#FF8C9A]"
                : "bg-gradient-to-br from-[#FF8C9A] to-[#FF6B7E] text-white"
            }`}
          >
            {doctor?.name ? doctor.name.replace(/^(ทพ\.|ทพญ\.|นาย|นาง|นางสาว)\s*/, "").charAt(0) || "ท" : "ท"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">
              {doctor?.name || "กำลังโหลด..."}
            </p>
            <p
              className={`text-[11px] truncate mt-0.5 ${
                view === "profile" ? "text-white/80" : "text-[#FFB3BC]"
              }`}
            >
              {doctor?.specialty || "ทันตแพทย์"}
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
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut size={15} /> ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

