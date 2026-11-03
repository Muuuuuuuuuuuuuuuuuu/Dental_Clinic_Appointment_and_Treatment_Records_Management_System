import { useState, useEffect } from "react";
import AdminDashboard from "./dashboard/AdminDashboard";
import UserProfile from "../shared/components/UserProfile";
import ScheduleHub from "./hubs/ScheduleHub";
import ClinicHub from "./hubs/ClinicHub";
import UsersHub from "./hubs/UsersHub";

import {
  Home, LogOut, Smile, Menu, Calendar, Clipboard, Users, BookOpen, Bell
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  Appointment, AppointmentStatus, DentistInfo, StaffInfo, ServiceInfo, AdminInfo,
  LeaveRequest, STATUS_COLORS, getClinicStatus, ClinicStatus, AdminView,
} from "../shared/data";
import { getWeeklyOffDays, getClinicClosures, getClinicSettings, getDailyHours, getLeaveRequests, getAdmins } from "../shared/supabaseApi";
import { useRealtimeAppointments } from "../shared/useRealtimeAppointments";
import { useIdleTimeout } from "../shared/useIdleTimeout";

function AdminStatusBanner() {
  const [s, setS] = useState<ClinicStatus | null>(null);
  useEffect(() => {
    Promise.all([getWeeklyOffDays(), getClinicClosures(), getClinicSettings(), getDailyHours()]).then(([offDays, closures, settings, dh]) => {
      setS(getClinicStatus(new Date(), closures, offDays, settings, dh));
    }).catch(console.error);
  }, []);
  if (!s || s.type === "open") return null;
  return (
    <div className="px-5 lg:px-8 pt-4">
      <div className="rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-sm"
        style={{ backgroundColor: s.type === "special" ? "#FFF3E0" : "#F1F5F9", border: `1px solid ${s.type === "special" ? "#FED7AA" : "#E2E8F0"}` }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.dotColor }} />
        <span className="font-medium" style={{ color: s.type === "special" ? "#92400E" : "#475569" }}>{s.label}</span>
        <span className="text-xs" style={{ color: s.type === "special" ? "#B45309" : "#64748B" }}>— {s.sublabel}</span>
      </div>
    </div>
  );
}



const ADMIN_NAV: { key: AdminView; label: string; icon: any }[] = [
  { key: "dashboard",    label: "แดชบอร์ด",           icon: Home },
  { key: "schedule-hub", label: "ตารางเวรและการลา",    icon: Calendar },
  { key: "clinic-hub",   label: "จัดการคลินิก",        icon: Clipboard },
  { key: "users-hub",    label: "จัดการผู้ใช้งาน",      icon: Users }
];

// 

function AdminSidebar({ view, setView, onLogout, pendingLeaves }: {
  view: AdminView; setView: (v: AdminView) => void; onLogout: () => void; pendingLeaves: number;
}) {
  return (
    <div className="flex flex-col h-full py-6 px-4" style={{ backgroundColor: "#1A365D" }}>
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Smile size={16} color="white" />
        </div>
        <div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Sarabun, sans-serif" }}>คลินิกสุภัทร</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>ผู้ดูแลระบบ</div>
        </div>
      </div>
      <div onClick={() => setView("profile")} className="flex items-center gap-3 px-3 py-3 rounded-2xl mb-6 cursor-pointer hover:bg-white/10 transition-colors" style={{ backgroundColor: view === "profile" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: "#FF8C9A" }}>A</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">ผู้ดูแลระบบ</p>
          <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>admin@clinic.com</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 pb-4" style={{ scrollbarWidth: "none" }}>
        {ADMIN_NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setView(key)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left relative"
            style={{ backgroundColor: view === key ? "#FF8C9A" : "transparent", color: view === key ? "white" : "rgba(255,255,255,0.65)" }}>
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            {/* ป้ายแจ้งเตือนจำนวนใบลาที่รออนุมัติ */}
            {key === "schedule-hub" && pendingLeaves > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: view === key ? "rgba(255,255,255,0.25)" : "#EF4444",
                  color: "white",
                }}>
                <Bell size={9} />
                {pendingLeaves}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-4 pt-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-500/10 transition-colors" style={{ color: "rgba(255,140,154,0.8)" }}>
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

// 

function Badge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: active ? "#E8FFF0" : "#F0F4F8", color: active ? "#1B7A3E" : "#4A6080" }}>
      {active ? "ใช้งาน" : "ปิดใช้งาน"}
    </span>
  );
}

// 

export default function AdminPortal({
  onLogout,
  loginEmail,
}: {
  appointments?: Appointment[];
  onLogout: () => void;
  loginEmail?: string;
}) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const { appointments: realAppointments } = useRealtimeAppointments();

  useIdleTimeout(() => {
    alert("ระบบได้ทำการออกจากระบบอัตโนมัติเนื่องจากไม่มีการใช้งาน");
    onLogout();
  }, 30);

  // ดึงจำนวนใบลาที่รออนุมัติมาแสดงบนป้ายแจ้งเตือน
  useEffect(() => {
    getLeaveRequests()
      .then(leaves => setPendingLeaves(leaves.filter(l => l.status === "รออนุมัติ").length))
      .catch(console.error);
      
    getAdmins().then(admins => {
      if (loginEmail) {
        setAdminInfo(admins.find(a => a.email === loginEmail) || admins[0] || null);
      } else {
        setAdminInfo(admins[0] || null);
      }
    }).catch(console.error);
  }, [loginEmail]);

  useEffect(() => {
    const handleNavigation = (e: any) => {
      if (e.detail) {
        setView(e.detail as AdminView);
      }
    };
    window.addEventListener("navigate-admin", handleNavigation);
    return () => window.removeEventListener("navigate-admin", handleNavigation);
  }, []);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Sarabun, sans-serif", backgroundColor: "#F0F4F8" }}>
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSideOpen(false)} />}

      <aside className="fixed top-0 left-0 h-full z-40 hidden lg:block" style={{ width: 250 }}>
        <AdminSidebar view={view} setView={setView} onLogout={onLogout} pendingLeaves={pendingLeaves} />
      </aside>
      {sideOpen && (
        <aside className="fixed top-0 left-0 h-full z-40" style={{ width: 250 }}>
          <AdminSidebar view={view} setView={v => { setView(v); setSideOpen(false); }} onLogout={onLogout} pendingLeaves={pendingLeaves} />
        </aside>
      )}

      <div className="flex-1 flex flex-col lg:ml-[250px]">
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b bg-white" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
          <button onClick={() => setSideOpen(true)} style={{ color: "#1A365D" }}><Menu size={20} /></button>
          <span className="font-bold text-sm" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>คลินิกสุภัทร • ผู้ดูแลระบบ</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#FF8C9A" }}>A</div>
        </div>
        <AdminStatusBanner />
        <main className="flex-1 p-5 lg:p-8">
          {view === "dashboard"    && <AdminDashboard setView={setView} />}
          {view === "schedule-hub" && <ScheduleHub />}
          {view === "clinic-hub"   && <ClinicHub />}
          { view === "users-hub"    && <UsersHub />}
          { view === "profile"      && <UserProfile user={adminInfo} type="admin" />}
        </main>
      </div>
    </div>
  );
}
