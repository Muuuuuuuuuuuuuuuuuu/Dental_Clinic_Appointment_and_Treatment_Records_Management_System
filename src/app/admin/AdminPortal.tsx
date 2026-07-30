import { useState, useEffect } from "react";
import LeaveApprovals from "./leave/LeaveApprovals";
import ScheduleManagement from "./schedule/ScheduleManagement";
import ServiceManagement from "./settings/ServiceManagement";
import ClinicSettingsManagement from "./settings/ClinicSettingsManagement";
import StaffManagement from "./users/StaffManagement";
import DentistManagement from "./users/DentistManagement";
import PatientManagement from "./users/PatientManagement";
import AdminDashboard from "./dashboard/AdminDashboard";
import AnnouncementManagement from "./announcements/AnnouncementManagement";
import PromotionManagement from "./announcements/PromotionManagement";
import AdminManagement from "./users/AdminManagement";
import AccountSettings from "./profile/AccountSettings";

import {
  Home, Calendar, Users, FileText, LogOut, Smile, Settings,
  Plus, Edit3, Trash2, CheckCircle, X, Menu, BarChart3,
  TrendingUp, UserCheck, Clock, AlertCircle, Check, Megaphone, Percent, Shield, Lock, ChevronDown, ChevronRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  Appointment, AppointmentStatus, DentistInfo, StaffInfo, ServiceInfo,
  LeaveRequest, STATUS_COLORS, getClinicStatus, ClinicStatus,
} from "../shared/data";
import { getWeeklyOffDays, getClinicClosures, getClinicSettings, getDailyHours } from "../shared/supabaseApi";

function AdminStatusBanner() {
  const [s, setS] = useState<ClinicStatus>(getClinicStatus());
  useEffect(() => {
    Promise.all([getWeeklyOffDays(), getClinicClosures(), getClinicSettings(), getDailyHours()]).then(([offDays, closures, settings, dh]) => {
      setS(getClinicStatus(new Date(), closures, offDays, settings, dh));
    }).catch(console.error);
  }, []);
  if (s.type === "open") return null;
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

type AdminView = "dashboard" | "admins" | "dentists" | "staff" | "patients" | "services" | "schedule" | "leaves" | "announcements" | "promotions" | "settings" | "account";

const ADMIN_NAV_MAIN = [
  { key: "dashboard" as AdminView, label: "แดชบอร์ด",         icon: Home },
  { key: "schedule"  as AdminView, label: "จัดการตารางเวร",  icon: Calendar },
  { key: "leaves"    as AdminView, label: "อนุมัติการลา",     icon: FileText },
  { key: "services"  as AdminView, label: "จัดการบริการ",     icon: Settings },
  { key: "announcements" as AdminView, label: "จัดการประกาศ", icon: Megaphone },
  { key: "promotions" as AdminView, label: "จัดการโปรโมชั่น", icon: Percent },
];

const ADMIN_NAV_USERS = [
  { key: "admins"    as AdminView, label: "ผู้ดูแลระบบ", icon: Shield },
  { key: "dentists"  as AdminView, label: "ทันตแพทย์",  icon: UserCheck },
  { key: "staff"     as AdminView, label: "พนักงาน",    icon: Users },
  { key: "patients"  as AdminView, label: "คนไข้",      icon: Smile },
];

const ADMIN_NAV_SETTINGS = [
  { key: "settings"  as AdminView, label: "ตั้งค่าคลินิก",     icon: Clock },
  { key: "account"   as AdminView, label: "ตั้งค่าบัญชี", icon: Lock },
];

const CHART_DATA = [
  { day: "จ", appts: 12, revenue: 18500 },
  { day: "อ", appts: 8,  revenue: 12000 },
  { day: "พ", appts: 15, revenue: 24000 },
  { day: "พฤ", appts: 10, revenue: 15500 },
  { day: "ศ", appts: 14, revenue: 22000 },
  { day: "ส", appts: 6,  revenue: 9000 },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function AdminSidebar({ view, setView, onLogout }: { view: AdminView; setView: (v: AdminView) => void; onLogout: () => void }) {
  const [isUsersOpen, setIsUsersOpen] = useState(true);

  const renderNav = (items: any[]) => items.map(({ key, label, icon: Icon }) => (
    <button key={key} onClick={() => setView(key)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
      style={{ backgroundColor: view === key ? "#FF8C9A" : "transparent", color: view === key ? "white" : "rgba(255,255,255,0.65)" }}>
      <Icon size={17} /> {label}
    </button>
  ));

  return (
    <div className="flex flex-col h-full py-6 px-4" style={{ backgroundColor: "#1A365D" }}>
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Smile size={16} color="white" />
        </div>
        <div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Playfair Display, serif" }}>คลินิกสุภัทร</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>ผู้ดูแลระบบ</div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-3 py-3 rounded-2xl mb-6" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: "#FF8C9A" }}>A</div>
        <div>
          <p className="text-xs font-semibold text-white">ผู้ดูแลระบบ</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>admin@clinic.com</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 pb-4" style={{ scrollbarWidth: "none" }}>
        {renderNav(ADMIN_NAV_MAIN)}

        {/* Dropdown: จัดการผู้ใช้งาน */}
        <div className="pt-2">
           <button onClick={() => setIsUsersOpen(!isUsersOpen)} 
             className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left hover:bg-white/5" 
             style={{ color: isUsersOpen ? "white" : "rgba(255,255,255,0.8)" }}>
             <div className="flex items-center gap-3">
               <Users size={17} style={{ color: isUsersOpen ? "#FF8C9A" : "inherit" }} /> 
               <span>จัดการผู้ใช้งาน</span>
             </div>
             {isUsersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
           </button>
           
           <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isUsersOpen ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
             <div className="space-y-1 ml-4 pl-3 border-l border-white/10">
               {renderNav(ADMIN_NAV_USERS)}
             </div>
           </div>
        </div>

        {/* Header: ระบบและตั้งค่า */}
        <div className="pt-4 pb-1">
           <span className="px-3 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>ระบบและตั้งค่า</span>
        </div>
        {renderNav(ADMIN_NAV_SETTINGS)}
      </nav>
      <div className="mt-4 pt-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-500/10 transition-colors" style={{ color: "rgba(255,140,154,0.8)" }}>
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────



// ─── Generic CRUD Table helper ────────────────────────────────────────────────

function Badge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: active ? "#E8FFF0" : "#F0F4F8", color: active ? "#1B7A3E" : "#4A6080" }}>
      {active ? "ใช้งาน" : "ปิดใช้งาน"}
    </span>
  );
}

// ─── Dentist Management ───────────────────────────────────────────────────────



// ─── Staff Management ─────────────────────────────────────────────────────────



// ─── Service Management ───────────────────────────────────────────────────────



// ─── Schedule Management ──────────────────────────────────────────────────────



// ─── Leave Approvals ──────────────────────────────────────────────────────────



// ─── Admin Portal Root ────────────────────────────────────────────────────────

export default function AdminPortal({
  appointments, onLogout,
}: {
  appointments: Appointment[];
  onLogout: () => void;
  loginEmail?: string;
}) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Prompt, sans-serif", backgroundColor: "#F0F4F8" }}>
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSideOpen(false)} />}

      <aside className="fixed top-0 left-0 h-full z-40 hidden lg:block" style={{ width: 250 }}>
        <AdminSidebar view={view} setView={setView} onLogout={onLogout} />
      </aside>
      {sideOpen && (
        <aside className="fixed top-0 left-0 h-full z-40" style={{ width: 250 }}>
          <AdminSidebar view={view} setView={v => { setView(v); setSideOpen(false); }} onLogout={onLogout} />
        </aside>
      )}

      <div className="flex-1 flex flex-col lg:ml-[250px]">
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b bg-white" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
          <button onClick={() => setSideOpen(true)} style={{ color: "#1A365D" }}><Menu size={20} /></button>
          <span className="font-bold text-sm" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>คลินิกสุภัทร • ผู้ดูแลระบบ</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#FF8C9A" }}>A</div>
        </div>
        <AdminStatusBanner />
        <main className="flex-1 p-5 lg:p-8">
          {view === "dashboard" && <AdminDashboard setView={setView} />}
          {view === "admins"    && <AdminManagement />}
          {view === "dentists"  && <DentistManagement />}
          {view === "staff"     && <StaffManagement />}
          {view === "patients"  && <PatientManagement />}
          {view === "services"  && <ServiceManagement />}
          {view === "schedule"  && <ScheduleManagement />}
          {view === "leaves"    && <LeaveApprovals />}
          {view === "announcements" && <AnnouncementManagement />}
          {view === "promotions" && <PromotionManagement />}
          {view === "settings"  && <ClinicSettingsManagement />}
          {view === "account"   && <AccountSettings />}
        </main>
      </div>
    </div>
  );
}
