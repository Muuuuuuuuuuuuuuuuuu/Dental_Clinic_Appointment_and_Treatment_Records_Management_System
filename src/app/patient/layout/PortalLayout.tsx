import { useState } from "react";
import { Menu, Smile, LogOut, Home } from "lucide-react";
import { PatientUser, View, NAV_ITEMS } from "../types";

function SidebarContent({ user, view, setView, onLogout, onMainSite }:
  { user: PatientUser; view: View; setView: (v: View) => void; onLogout: () => void; onMainSite: () => void }) {
  return (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Smile size={16} color="white" />
        </div>
        <div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Playfair Display, serif" }}>คลินิกสุภัทร</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}>SUPHAT CLINIC</div>
        </div>
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-3 px-3 py-3 rounded-2xl mb-6" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          {user.firstName[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
          <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{user.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button key={key} onClick={() => setView(key as View)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                backgroundColor: active ? "#FF8C9A" : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.65)",
              }}>
              <Icon size={17} /> {label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onMainSite}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: "rgba(255,255,255,0.5)" }}>
          <Home size={16} /> หน้าหลักเว็บไซต์
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-500/10"
          style={{ color: "rgba(255,140,154,0.8)" }}>
          <LogOut size={16} /> ออกจากระบบ
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
    <div className="min-h-screen flex" style={{ fontFamily: "Prompt, sans-serif", backgroundColor: "#F0F4F8" }}>
      {/* Sidebar overlay (mobile) */}
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sideOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 250,
          backgroundColor: "#1A365D",
        }}
      >
        <SidebarContent user={user} view={view} setView={v => { setView(v); setSideOpen(false); }} onLogout={onLogout} onMainSite={onMainSite} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[250px]">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b bg-white" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
          <button onClick={() => setSideOpen(true)} style={{ color: "#1A365D" }}><Menu size={20} /></button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
              <Smile size={12} color="white" />
            </div>
            <span className="font-bold text-sm" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>คลินิกสุภัทร</span>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
            {user.firstName[0]}
          </div>
        </div>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
