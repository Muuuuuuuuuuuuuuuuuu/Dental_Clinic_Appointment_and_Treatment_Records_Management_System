import { useState, useEffect } from "react";
import DoctorProfile from "./profile/DoctorProfile";

import DoctorCalendar from "./schedule/DoctorCalendar";

import PatientRecords from "./patients/PatientRecords";

import TreatmentQueue from "./treatment/TreatmentQueue";

import DoctorDashboard from "./dashboard/DoctorDashboard";
import AnnouncementView from "../shared/components/AnnouncementView";
import TreatmentHistory from "./treatment/TreatmentHistory";

import {
  Home, Calendar, Users, FileText, LogOut, Smile, ChevronRight,
  AlertTriangle, Clock, CheckCircle, User, Send, ClipboardList,
  CalendarX, Menu, X, Plus, Check, Megaphone
} from "lucide-react";
import {
  getClinicStatus, DocView, DentistInfo, ClinicStatus, Appointment
} from "../shared/data";

import { getDentists, getWeeklyOffDays, getClinicClosures, getClinicSettings, getDailyHours } from "../shared/supabaseApi";
import { useRealtimeAppointments } from "../shared/useRealtimeAppointments";

function PortalStatusBanner() {
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



const DOC_NAV = [
  { key: "dashboard" as DocView, label: "แดชบอร์ด",          icon: Home },
  { key: "queue"     as DocView, label: "คิวการรักษา",        icon: Users },
  { key: "records"   as DocView, label: "เวชระเบียน",         icon: FileText },
  { key: "history"   as DocView, label: "ประวัติการทำงาน",      icon: ClipboardList },
  { key: "calendar"  as DocView, label: "ปฏิทินและการลางาน",   icon: Calendar },
  { key: "announcements" as DocView, label: "ประกาศ",        icon: Megaphone },
  { key: "profile"   as DocView, label: "ข้อมูลส่วนตัว",     icon: User },
];

const WEEK_SCHEDULE = [
  { day: "จันทร์",  date: "7 ก.ค.", shift: "09:00–17:00", patients: 8,  status: "วันทำงาน" },
  { day: "อังคาร",  date: "8 ก.ค.", shift: "09:00–17:00", patients: 7,  status: "วันทำงาน" },
  { day: "พุธ",     date: "9 ก.ค.", shift: "09:00–12:00", patients: 4,  status: "ครึ่งวัน" },
  { day: "พฤหัส",  date: "10 ก.ค.", shift: "09:00–17:00", patients: 8,  status: "วันนี้" },
  { day: "ศุกร์",   date: "11 ก.ค.", shift: "09:00–17:00", patients: 6,  status: "วันทำงาน" },
  { day: "เสาร์",  date: "12 ก.ค.", shift: "หยุด",          patients: 0,  status: "หยุด" },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function DoctorSidebar({ view, setView, onLogout, doctor }: { view: DocView; setView: (v: DocView) => void; onLogout: () => void; doctor: DentistInfo | null }) {
  return (
    <div className="flex flex-col h-full py-6 px-4" style={{ backgroundColor: "#1A365D" }}>
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Smile size={16} color="white" />
        </div>
        <div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Playfair Display, serif" }}>คลินิกสุภัทร</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>DENTAL CLINIC</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 py-3 rounded-2xl mb-6" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        {doctor ? (
          <>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
              {doctor.name[4] || "ท"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{doctor.name}</p>
              <p className="text-xs truncate" style={{ color: "#FFB3BC" }}>{doctor.specialty}</p>
            </div>
          </>
        ) : (
          <div className="min-w-0 text-white text-xs">Loading...</div>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {DOC_NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setView(key)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
            style={{ backgroundColor: view === key ? "#FF8C9A" : "transparent", color: view === key ? "white" : "rgba(255,255,255,0.65)" }}>
            <Icon size={17} /> {label}
          </button>
        ))}
      </nav>

      <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-500/10 transition-all"
          style={{ color: "rgba(255,140,154,0.8)" }}>
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

// ─── Doctor Portal Root ───────────────────────────────────────────────────────

export default function DoctorPortal({
  onLogout,
  loginEmail,
  appointments: initialAppointments
}: {
  onLogout: () => void;
  loginEmail?: string;
  appointments?: Appointment[];
}) {
  const { appointments: sharedAppointments } = useRealtimeAppointments();
  const appointments = sharedAppointments || initialAppointments;
  const [view, setView] = useState<DocView>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [doctor, setDoctor] = useState<DentistInfo | null>(null);

  useEffect(() => {
    getDentists().then(d => {
      if (loginEmail) {
        const doc = d.find(x => x.email === loginEmail);
        setDoctor(doc || d[0]);
      } else {
        setDoctor(d[0]);
      }
    }).catch(console.error);
  }, [loginEmail]);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Prompt, sans-serif", backgroundColor: "#F0F4F8" }}>
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSideOpen(false)} />}

      <aside className="fixed top-0 left-0 h-full z-40 transition-transform duration-300 lg:translate-x-0 hidden lg:block" style={{ width: 250 }}>
        <DoctorSidebar view={view} setView={setView} onLogout={onLogout} doctor={doctor} />
      </aside>
      {sideOpen && (
        <aside className="fixed top-0 left-0 h-full z-40" style={{ width: 250 }}>
          <DoctorSidebar view={view} setView={v => { setView(v); setSideOpen(false); }} onLogout={onLogout} doctor={doctor} />
        </aside>
      )}

      <div className="flex-1 flex flex-col lg:ml-[250px]">
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b bg-white" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
          <button onClick={() => setSideOpen(true)} style={{ color: "#1A365D" }}><Menu size={20} /></button>
          <span className="font-bold text-sm" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>คลินิกสุภัทร • ทันตแพทย์</span>
          {doctor && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
              {doctor.name[4] || "ท"}
            </div>
          )}
        </div>
        <PortalStatusBanner />
        <main className="flex-1 p-5 lg:p-8">
          {view === "dashboard" && <DoctorDashboard setView={setView} doctor={doctor} appointments={appointments} />}
          {view === "queue"     && <TreatmentQueue doctor={doctor} appointments={appointments} />}
          {view === "records"   && <PatientRecords />}
          {view === "history"   && <TreatmentHistory doctor={doctor} />}
          {view === "calendar"  && <DoctorCalendar doctor={doctor} />}
          {view === "announcements" && <AnnouncementView role="dentist" />}
          {view === "profile"   && <DoctorProfile doctor={doctor} />}
        </main>
      </div>
    </div>
  );
}
