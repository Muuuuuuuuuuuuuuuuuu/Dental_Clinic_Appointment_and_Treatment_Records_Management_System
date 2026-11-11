import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { DocView, DentistInfo, Appointment } from "@/app/shared/data";
import { getDentists } from "@/app/shared/supabaseApi";
import { useRealtimeAppointments } from "@/app/shared/useRealtimeAppointments";
import { useIdleTimeout } from "@/app/shared/useIdleTimeout";

// ─── หน้าย่อยระบบทันตแพทย์ (Views & Sub-modules) ─────────────────────────────────
import DentistDashboardView from "./dashboard";
import DentistQueueView from "./queue";
import DentistRecordsView from "./records";
import DentistHistoryView from "./history";
import DentistScheduleView from "./schedule";
import DentistProfileView from "./profile";

// ─── โครงสร้างเลย์เอาต์ (Layout & Components) ──────────────────────────────────
import DentistSidebar from "./DentistSidebar";
import DentistStatusBanner from "./DentistStatusBanner";

interface DoctorPortalProps {
  onLogout: () => void;
  loginEmail?: string;
  appointments?: Appointment[];
}

/**
 * 🦷 [DOCTOR / DENTIST PORTAL ROOT]
 * ศูนย์กลางการทำงานของทันตแพทย์ (Dashboard, Treatment Queue, Records, History, Schedule, Profile)
 */
export default function DoctorPortal({
  onLogout,
  loginEmail,
  appointments: initialAppointments,
}: DoctorPortalProps) {
  const { appointments: sharedAppointments } = useRealtimeAppointments();
  const appointments = sharedAppointments || initialAppointments;
  const [view, setView] = useState<DocView>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [doctor, setDoctor] = useState<DentistInfo | null>(null);

  useIdleTimeout(() => {
    alert("ระบบได้ทำการออกจากระบบอัตโนมัติเนื่องจากไม่มีการใช้งาน");
    onLogout();
  }, 30);

  useEffect(() => {
    getDentists()
      .then((d) => {
        if (loginEmail) {
          const doc = d.find((x) => x.email === loginEmail);
          setDoctor(doc || d[0]);
        } else {
          setDoctor(d[0]);
        }
      })
      .catch(console.error);
  }, [loginEmail]);

  return (
    <div
      className="min-h-screen flex"
      style={{
        fontFamily: "Sarabun, sans-serif",
        backgroundColor: "#F0F4F8",
      }}
    >
      {sideOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSideOpen(false)}
        />
      )}

      {/* Sidebar Desktop */}
      <aside
        className="fixed top-0 left-0 h-full z-40 transition-transform duration-300 lg:translate-x-0 hidden lg:block"
        style={{ width: 250 }}
      >
        <DentistSidebar
          view={view}
          setView={setView}
          onLogout={onLogout}
          doctor={doctor}
        />
      </aside>

      {/* Sidebar Mobile Drawer */}
      {sideOpen && (
        <aside className="fixed top-0 left-0 h-full z-40" style={{ width: 250 }}>
          <DentistSidebar
            view={view}
            setView={(v) => {
              setView(v);
              setSideOpen(false);
            }}
            onLogout={onLogout}
            doctor={doctor}
          />
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-[250px]">
        {/* Mobile Top Navbar */}
        <div
          className="lg:hidden flex items-center justify-between px-4 h-14 border-b bg-white"
          style={{ borderColor: "rgba(26,54,93,0.1)" }}
        >
          <button onClick={() => setSideOpen(true)} style={{ color: "#1A365D" }}>
            <Menu size={20} />
          </button>
          <span
            className="font-bold text-sm"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            คลินิกสุภัทร • ทันตแพทย์
          </span>
          {doctor && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
            >
              {(doctor.firstName?.trim() || doctor.name?.replace(/^(ทพญ\.|ทพ\.|นพ\.|พญ\.|ดร\.|นาย|นางสาว|นาง)\s*/i, "").trim())?.[0] || "ท"}
            </div>
          )}
        </div>

        <DentistStatusBanner />

        <main className="flex-1 p-5 lg:p-8">
          {view === "dashboard" && (
            <DentistDashboardView
              setView={setView}
              doctor={doctor}
              appointments={appointments}
            />
          )}
          {view === "queue" && (
            <DentistQueueView doctor={doctor} appointments={appointments} />
          )}
          {view === "records" && <DentistRecordsView doctorId={doctor?.id} />}
          {view === "history" && <DentistHistoryView doctor={doctor} />}
          {view === "calendar" && <DentistScheduleView doctor={doctor} />}
          {view === "profile" && <DentistProfileView doctor={doctor} />}
        </main>
      </div>
    </div>
  );
}
