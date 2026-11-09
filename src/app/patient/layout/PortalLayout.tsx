import { useState } from "react";
import { Menu, Smile, LogOut, Home, ChevronRight } from "lucide-react";
import { PatientUser, View, NAV_ITEMS } from "../types";
import { PatientStatusBanner } from "./PatientStatusBanner";

function SidebarContent({ user, view, setView, onLogout, onMainSite }:
  { user: PatientUser; view: View; setView: (v: View) => void; onLogout: () => void; onMainSite: () => void }) {
  return (
    <div className="flex flex-col h-full py-6 px-4">
      {/* โลโก้คลินิกด้านบนสุด */}
      <div className="flex items-center gap-3 px-2 ">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Smile size={16} color="white" />
        </div>
        <div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Sarabun, sans-serif" }}>คลินิกสุภัทร</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}>SUPHAT CLINIC</div>
        </div>
      </div>

      {/* เมนูนำทาง (อยู่ชิดด้านบน ระดับสายตา) */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 mt-10" style={{ scrollbarWidth: "none" }}>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setView(key as View)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                backgroundColor: active ? "#FF8C9A" : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.65)",
              }}
            >
              <Icon size={17} /> {label}
            </button>
          );
        })}
      </nav>

      {/* โซนโปรไฟล์คนไข้และออกจากระบบ (วางไว้ล่างสุด คลิกเข้าโปรไฟล์ได้เหมือนปุ่ม) */}
      <div className="mt-4 pt-4 flex-shrink-0 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {/* ปุ่มโปรไฟล์คนไข้ */}
        <button
          type="button"
          onClick={() => setView("profile")}
          title="คลิกเพื่อดูและแก้ไขข้อมูลส่วนตัว"
          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all group border ${view === "profile"
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
            {user.firstName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">
              {user.firstName} {user.lastName}
            </p>
            <p
              className={`text-[11px] truncate mt-0.5 ${view === "profile" ? "text-white/80" : "text-white/50"
                }`}
            >
              {user.email}
            </p>
          </div>
          <ChevronRight
            size={16}
            className={`flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${view === "profile" ? "text-white" : "text-white/40 group-hover:text-white"
              }`}
          />
        </button>

        <button
          type="button"
          onClick={onMainSite}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <Home size={15} /> หน้าหลักเว็บไซต์
        </button>
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

export default function PortalLayout({
  user, view, setView, onLogout, onMainSite, children,
}: {
  user: PatientUser; view: View; setView: (v: View) => void;
  onLogout: () => void; onMainSite: () => void; children: React.ReactNode;
}) {
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Sarabun, sans-serif", backgroundColor: "#F0F4F8" }}>
      {/* พื้นหลังมืดขณะเปิดเมนูบนมือถือ */}
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* แถบเมนูด้านข้าง */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sideOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 250,
          backgroundColor: "#1A365D",
        }}
      >
        <SidebarContent user={user} view={view} setView={v => { setView(v); setSideOpen(false); }} onLogout={onLogout} onMainSite={onMainSite} />
      </aside>

      {/* พื้นที่เนื้อหาหลัก */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[250px]">
        {/* แถบด้านบนสำหรับหน้าจอมือถือ */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b bg-white" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
          <button onClick={() => setSideOpen(true)} style={{ color: "#1A365D" }}><Menu size={20} /></button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
              <Smile size={12} color="white" />
            </div>
            <span className="font-bold text-sm" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>คลินิกสุภัทร</span>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
            {user.firstName[0]}
          </div>
        </div>

        <PatientStatusBanner />

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
