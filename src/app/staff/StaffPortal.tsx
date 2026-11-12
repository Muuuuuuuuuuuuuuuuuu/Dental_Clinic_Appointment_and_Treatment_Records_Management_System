import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Appointment, StaffView } from "@/app/shared/data";
import { useIdleTimeout } from "@/app/shared/hooks/useIdleTimeout";
import { getStaff } from "@/app/shared/api";

// ─── หน้าย่อยระบบพนักงาน (Views & Sub-modules) ─────────────────────────────────
import StaffQueueView from "./queue";
import StaffAppointmentsView from "./appointments";
import StaffPatientsView from "./patients";
import StaffWalkInBookingView from "./booking";
import StaffPaymentView from "./payment";
import StaffLeaveView from "./leave";
import StaffProfileView from "./profile";

// ─── โครงสร้างเลย์เอาต์ (Layout & Components) ──────────────────────────────────
import {
  StaffSidebar,
  ClockInScreen,
  STAFF_NAV,
} from "./layout";

interface StaffPortalProps {
  appointments?: Appointment[];
  onUpdateAppt?: (id: number, updates: Partial<Appointment>) => void;
  onAddAppt?: (a: Appointment) => void;
  onLogout: () => void;
  loginEmail?: string;
}

/**
 * 👨‍💼 [STAFF PORTAL ROOT]
 * ศูนย์กลางการทำงานของพนักงานต้อนรับ (Queue, Appointment, Patient, Walk-in, Payment, Leave, Profile)
 */
export default function StaffPortal({
  appointments,
  onUpdateAppt,
  onAddAppt,
  onLogout,
  loginEmail,
}: StaffPortalProps) {
  const [view, setViewRaw] = useState<StaffView>("queue");
  const [selectedPaymentApptId, setSelectedPaymentApptId] = useState<number | null>(null);

  const setView = (v: StaffView, apptId?: number) => {
    if (v === "payment") {
      setSelectedPaymentApptId(apptId ?? null);
    }
    setViewRaw(v);
  };
  const [sideOpen, setSideOpen] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [mockNetwork, setMockNetwork] = useState<"clinic" | "home">("clinic");
  const [staffInfo, setStaffInfo] = useState<any | null>(null);

  useIdleTimeout(() => {
    alert("ระบบได้ทำการออกจากระบบอัตโนมัติเนื่องจากไม่มีการใช้งาน");
    onLogout();
  }, 30);

  useEffect(() => {
    if (loginEmail) {
      getStaff()
        .then((staffList) => {
          const matched = staffList.find((s) => s.email === loginEmail);
          if (matched) setStaffInfo(matched);
        })
        .catch(console.error);
    }
  }, [loginEmail]);

  const currentNav = STAFF_NAV.find((n) => n.key === view);
  const isOperationalView = currentNav?.isOperational ?? false;
  const showLockScreen = isOperationalView && !isClockedIn;

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

      {/* Sidebar สำหรับหน้าจอ Desktop */}
      <aside
        className="fixed top-0 left-0 h-full z-40 hidden lg:block"
        style={{ width: 250 }}
      >
        <StaffSidebar
          view={view}
          setView={setView}
          onLogout={onLogout}
          isClockedIn={isClockedIn}
          staffName={staffInfo?.name}
          staffRole={staffInfo?.role}
          staffInitial={staffInfo?.name?.charAt(0)}
        />
      </aside>

      {/* Sidebar สำหรับหน้าจอมือถือ (Drawer) */}
      {sideOpen && (
        <aside
          className="fixed top-0 left-0 h-full z-40"
          style={{ width: 250 }}
        >
          <StaffSidebar
            view={view}
            setView={(v) => {
              setView(v);
              setSideOpen(false);
            }}
            onLogout={onLogout}
            isClockedIn={isClockedIn}
            staffName={staffInfo?.name}
            staffRole={staffInfo?.role}
            staffInitial={staffInfo?.name?.charAt(0)}
          />
        </aside>
      )}

      {/* เนื้อหาหลักและแถบด้านบน */}
      <div className="flex-1 flex flex-col lg:ml-[250px]">
        {/* Mobile Top Navbar */}
        <div
          className="lg:hidden flex items-center justify-between px-4 h-14 border-b bg-white"
          style={{ borderColor: "rgba(26,54,93,0.1)" }}
        >
          <button
            onClick={() => setSideOpen(true)}
            style={{ color: "#1A365D" }}
          >
            <Menu size={20} />
          </button>
          <span
            className="font-bold text-sm"
            style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
          >
            คลินิกสุภัทร • พนักงาน
          </span>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isClockedIn ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: "#1D6FA4" }}
            >
              {staffInfo?.name?.charAt(0) || "ส"}
            </div>
          </div>
        </div>

        <main className="flex-1 p-5 lg:p-8 h-full">
          {showLockScreen ? (
            <ClockInScreen
              onClockIn={() => setIsClockedIn(true)}
              mockNetwork={mockNetwork}
              setMockNetwork={setMockNetwork}
            />
          ) : (
            <>
              {view === "queue" && (
                <StaffQueueView setView={setView} appointments={appointments} />
              )}
              {view === "appointments" && (
                <StaffAppointmentsView appointments={appointments} />
              )}
              {view === "patients" && <StaffPatientsView />}
              {view === "walkin" && <StaffWalkInBookingView onAddAppt={onAddAppt} />}
              {view === "payment" && (
                <StaffPaymentView
                  appointments={appointments}
                  onUpdateAppt={onUpdateAppt}
                  initialApptId={selectedPaymentApptId}
                />
              )}
              {view === "leave" && <StaffLeaveView staff={staffInfo} />}
              {view === "profile" && <StaffProfileView user={staffInfo} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
