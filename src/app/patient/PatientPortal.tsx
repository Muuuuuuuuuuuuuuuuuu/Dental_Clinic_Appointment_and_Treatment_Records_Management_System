import { Info } from "lucide-react";
import { usePatientAuthFlow, PatientPortalProps } from "./hooks/usePatientAuthFlow";

// ─── หน้าเข้าสู่ระบบและสมัครสมาชิก ────────────────────────────────────────────
import LoginPage from "./auth/LoginPage";
import ForgotPasswordPage from "./auth/ForgotPasswordPage";
import ConsentPage from "./auth/ConsentPage";
import FirstTimePasswordPage from "./auth/FirstTimePasswordPage";

// ─── โครงสร้างหน้าเว็บฝั่งคนไข้ ───────────────────────────────────────────────
import PortalLayout from "./layout/PortalLayout";

// ─── หน้าย่อยในระบบคนไข้ (Views & Sub-modules) ─────────────────────────────────
import PatientDashboardView from "./dashboard";
import PatientBookingView from "./booking";
import PatientAppointmentsView from "./appointments";
import PatientHistoryView from "./history";
import PatientDentalRecordView from "./record";
import PatientProfileView from "./profile";

// ─── ส่วนประกอบหน้าแรกของเว็บไซต์ ─────────────────────────────────────────────
import Header from "./landing/Header";
import Hero from "./landing/Hero";
import Services from "./landing/Services";
import WhyUs from "./landing/WhyUs";
import Doctors from "./landing/Doctors";
import Contact from "./landing/Contact";
import Footer from "./landing/Footer";

// ─── ไฟล์สไตล์ CSS ────────────────────────────────────────────────────────────
import "./patient-animations.css";

export type { PatientPortalProps };

/**
 * 🧑‍🤝‍🧑 [PATIENT PORTAL ROOT]
 * คอมโพเนนต์หลักสำหรับจัดการการแสดงผลหน้าเว็บฝั่งคนไข้ และ Landing Page
 * แยก Business Logic & Authentication ไปไว้ใน usePatientAuthFlow Hook
 */
export default function PatientPortal(props: PatientPortalProps = {}) {
  const p = usePatientAuthFlow(props);

  if (p.isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-sans">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  // ─── หน้าเปลี่ยนรหัสผ่านเริ่มต้นสำหรับการเข้าใช้งานครั้งแรก ────────────────────
  if (p.needsPasswordChange && p.isLoggedIn && p.role === "patient") {
    return (
      <FirstTimePasswordPage
        userEmail={p.user?.email}
        onSuccess={p.handleFirstTimePasswordChanged}
        onBack={() => {
          p.setNeedsPasswordChange(false);
          p.setNeedsConsent(false);
          p.handleLogout();
        }}
      />
    );
  }

  // ─── หน้าให้ความยินยอมข้อมูลส่วนบุคคล (PDPA) สำหรับการเข้าใช้งานครั้งแรก ─────
  if (p.needsConsent && p.isLoggedIn && p.role === "patient") {
    return (
      <ConsentPage
        onAccept={p.handleConsentAccepted}
        onBack={() => {
          p.setNeedsConsent(false);
          p.handleLogout();
        }}
      />
    );
  }

  // ─── หน้าระบบภายในของผู้ป่วย (Portal Views) ──────────────────────────────────
  if (p.isPortalView && p.isLoggedIn && p.role === "patient" && p.user) {
    return (
      <PortalLayout
        user={p.user}
        view={p.view}
        setView={p.updateView}
        onLogout={p.handleLogout}
        onMainSite={() => p.setView("landing")}
      >
        {p.view === "dashboard" && (
          <PatientDashboardView
            user={p.user}
            setView={p.updateView}
            appointments={p.sharedAppointments}
          />
        )}
        {p.view === "profile" && (
          <PatientProfileView user={p.user} setUser={p.setUser} />
        )}
        {p.view === "booking" && (
          <PatientBookingView
            setView={(v) => {
              p.updateView(v);
              p.setFollowUpProps(null);
            }}
            initialService={p.followUpProps?.service}
            initialDoctor={p.followUpProps?.doctor}
            isFollowUp={p.followUpProps !== null}
            planItemId={p.followUpProps?.planItem}
            openTicketId={p.followUpProps?.openTicketId}
            user={p.user}
            onAddAppt={p.addAppt}
          />
        )}
        {p.view === "appointments" && (
          <PatientAppointmentsView
            user={p.user}
            setView={p.updateView}
            appointments={p.sharedAppointments}
            onUpdateAppt={p.updateAppt}
            onBookFollowUp={(serviceId, doctorId, openTicketId) => {
              p.setFollowUpProps({
                service: serviceId,
                doctor: doctorId || 0,
                openTicketId,
              });
              p.updateView("booking");
            }}
          />
        )}
        {p.view === "history" && <PatientHistoryView user={p.user} />}
        {p.view === "record" && (
          <PatientDentalRecordView
            user={p.user}
            onBack={() => p.updateView("dashboard")}
            onBookAppointment={() => p.updateView("booking")}
          />
        )}
      </PortalLayout>
    );
  }

  // ─── หน้ายืนยันตัวตน (เข้าสู่ระบบ / สมัครสมาชิก / ลืมรหัสผ่าน) ──────────────
  if (p.view === "login") {
    return (
      <LoginPage
        onLogin={p.handleLogin}
        onLoginRole={p.handleLoginRole}
        onRegister={() => p.setView("login")}
        onForgotPassword={() => {
          p.setPrevView("login");
          p.setView("forgot-password");
        }}
        onBack={() => p.setView(p.prevView)}
      />
    );
  }

  if (p.view === "forgot-password") {
    return (
      <ForgotPasswordPage
        onBack={() => p.setView(p.prevView)}
        onSuccess={() => p.setView("login")}
      />
    );
  }

  // ─── หน้าแรกของคลินิก (Landing Page) ─────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "Sarabun, sans-serif", scrollBehavior: "smooth" }}
    >
      {p.clinicStatus && p.clinicStatus.type !== "open" && (
        <div
          className="w-full text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 z-50 relative"
          style={{
            backgroundColor:
              p.clinicStatus.type === "special" ? "#FFF3E0" : "#F1F5F9",
            color: p.clinicStatus.type === "special" ? "#92400E" : "#475569",
            borderBottom: `1px solid ${
              p.clinicStatus.type === "special" ? "#FED7AA" : "#E2E8F0"
            }`,
          }}
        >
          <Info size={14} />
          <span>
            {p.clinicStatus.type === "special"
              ? `หยุดพิเศษวันนี้ — ${p.clinicStatus.specialReason}`
              : `${p.clinicStatus.label} — ${p.clinicStatus.sublabel}`}
          </span>
        </div>
      )}

      <Header
        onLoginClick={p.goLogin}
        isLoggedIn={p.isLoggedIn}
        onPortal={() => {
          if (p.role === "patient") p.updateView("dashboard");
          else if (p.role === "doctor") props.onRoleChange?.("doctor");
          else if (p.role === "admin") props.onRoleChange?.("admin");
          else if (p.role === "staff") props.onRoleChange?.("staff");
        }}
      />

      <main>
        <Hero onCTA={p.goCTA} />
        <Services onCTA={p.goCTA} />
        <WhyUs />
        <Doctors onCTA={p.goCTA} />
        <Contact onCTA={p.goCTA} />
      </main>

      <Footer />
    </div>
  );
}
