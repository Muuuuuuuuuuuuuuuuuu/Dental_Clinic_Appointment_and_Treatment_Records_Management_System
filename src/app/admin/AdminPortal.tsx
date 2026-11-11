import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Appointment, AdminInfo, AdminView } from "@/app/shared/data";
import { getLeaveRequests, getAdmins } from "@/app/shared/api";
import { useIdleTimeout } from "@/app/shared/hooks/useIdleTimeout";

// ─── หน้าย่อยระบบผู้ดูแลระบบ (Views & Sub-modules) ─────────────────────────────
import AdminDashboardView from "./dashboard";
import AdminProfileView from "./profile";
import ScheduleManagementView from "./schedule";
import ClinicManagementView from "./clinicManage";
import UserManagementView from "./userManage";

// ─── โครงสร้างเลย์เอาต์กรอบนอก (Layout Frame & Sidebar) ────────────────────────
import { AdminStatusBanner } from "./AdminStatusBanner";
import { AdminSidebar } from "./AdminSidebar";

interface AdminPortalProps {
  appointments?: Appointment[];
  onLogout: () => void;
  loginEmail?: string;
}

/**
 * 🛡️ [ADMIN PORTAL ROOT]
 * ศูนย์กลางการทำงานของผู้ดูแลระบบ (Dashboard, Schedule, Clinic, Users, Profile)
 */
export default function AdminPortal({
  onLogout,
  loginEmail,
}: AdminPortalProps) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);

  useIdleTimeout(() => {
    alert("ระบบได้ทำการออกจากระบบอัตโนมัติเนื่องจากไม่มีการใช้งาน");
    onLogout();
  }, 30);

  useEffect(() => {
    getLeaveRequests()
      .then((reqs) => {
        setPendingLeaves(reqs.filter((r) => r.status === "รออนุมัติ").length);
      })
      .catch(console.error);

    getAdmins()
      .then((admins) => {
        if (loginEmail) {
          const matched = admins.find((a) => a.email === loginEmail);
          if (matched) setAdminInfo(matched);
        } else if (admins.length > 0) {
          setAdminInfo(admins[0]);
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
        className="fixed top-0 left-0 h-full z-40 hidden lg:block"
        style={{ width: 250 }}
      >
        <AdminSidebar
          view={view}
          setView={setView}
          onLogout={onLogout}
          pendingLeaves={pendingLeaves}
          adminInfo={adminInfo}
        />
      </aside>

      {/* Sidebar Mobile Drawer */}
      {sideOpen && (
        <aside
          className="fixed top-0 left-0 h-full z-40"
          style={{ width: 250 }}
        >
          <AdminSidebar
            view={view}
            setView={(v) => {
              setView(v);
              setSideOpen(false);
            }}
            onLogout={onLogout}
            pendingLeaves={pendingLeaves}
            adminInfo={adminInfo}
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
            คลินิกสุภัทร • ผู้ดูแลระบบ
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: "#FF8C9A" }}
          >
            {adminInfo?.name?.charAt(0) || "ผ"}
          </div>
        </div>

        <AdminStatusBanner />

        <main className="flex-1 p-5 lg:p-8">
          {view === "dashboard" && <AdminDashboardView setView={setView} />}
          {view === "profile" && <AdminProfileView user={adminInfo} />}
          {view === "schedule-hub" && <ScheduleManagementView />}
          {view === "clinic-hub" && <ClinicManagementView />}
          {view === "users-hub" && <UserManagementView />}
        </main>
      </div>
    </div>
  );
}
