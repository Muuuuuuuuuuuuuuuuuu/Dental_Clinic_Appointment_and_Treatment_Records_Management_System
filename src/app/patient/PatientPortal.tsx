import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { View, UserRole, PatientUser } from "./types";
import { Appointment, getClinicStatus, ClinicStatus } from "../shared/data";
import { getWeeklyOffDays, getClinicClosures, getClinicSettings, getDailyHours, savePatientData } from "../shared/supabaseApi";
import { supabase } from "../shared/utils/supabaseClient";
import { useRealtimeAppointments } from "../shared/useRealtimeAppointments";

// ─── Auth pages ───────────────────────────────────────────────────────────────
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import ConsentPage from "./auth/ConsentPage";
import ForgotPasswordPage from "./auth/ForgotPasswordPage";
import type { RegForm } from "./types";

// ─── Portal layout ───────────────────────────────────────────────────────────
import PortalLayout from "./layout/PortalLayout";

// ─── Patient portal views ─────────────────────────────────────────────────────
import DashboardView from "./dashboard/DashboardView";
import BookingView from "./booking/BookingView";
import AppointmentsView from "./appointments/AppointmentsView";
import HistoryView from "./history/HistoryView";
import DentalRecordView from "./record/DentalRecordView";
import ProfileView from "./profile/ProfileView";

// ─── Landing page sections ────────────────────────────────────────────────────
import Header from "./landing/Header";
import Hero from "./landing/Hero";
import Services from "./landing/Services";
import WhyUs from "./landing/WhyUs";
import Doctors from "./landing/Doctors";

import Contact from "./landing/Contact";
import Footer from "./landing/Footer";

// ─── Other portals ────────────────────────────────────────────────────────────
import DoctorPortal from "../dentist/DentistPortal";
import AdminPortal from "../admin/AdminPortal";
import StaffPortal from "../staff/StaffPortal";

// ─── CSS ──────────────────────────────────────────────────────────────────────
import "./patient-animations.css";

// ═══════════════════════════════════════════════════════════════════════════════
// PatientPortal — Application Router
// ═══════════════════════════════════════════════════════════════════════════════

export default function PatientPortal() {
  const [view, setView] = useState<View>("landing");
  const [prevView, setPrevView] = useState<View>("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [user, setUser] = useState<PatientUser | null>(null);
  const [otpEmail, setOtpEmail] = useState("");
  const [regFormData, setRegFormData] = useState<RegForm | null>(null);
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [portalView, setPortalView] = useState<View>("dashboard");
  const [loginEmail, setLoginEmail] = useState("");
  const [clinicStatus, setClinicStatus] = useState<ClinicStatus | null>(null);
  const [followUpProps, setFollowUpProps] = useState<{service: number, doctor: number} | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { appointments: sharedAppointments, setAppointments: setSharedAppointments } = useRealtimeAppointments();

  const PORTAL_VIEWS: View[] = ["dashboard", "profile", "booking", "appointments", "history", "record"];

  const updateView = (v: View) => {
    setPortalView(v);
    setView(v);
    if (PORTAL_VIEWS.includes(v)) {
      localStorage.setItem("supat_last_view", v);
    }
  };

  useEffect(() => {
    // Fetch clinic status data
    Promise.all([getWeeklyOffDays(), getClinicClosures(), getClinicSettings(), getDailyHours()]).then(([offDays, closures, settings, dh]) => {
      setClinicStatus(getClinicStatus(new Date(), closures, offDays, settings, dh));
    }).catch(console.error);
  }, []);

  // Check Supabase session on mount to persist login
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase.from('users').select('role').eq('user_id', session.user.id).single();
          const role = userData?.role || "patient";
          const isPatient = role === "patient" || role === "คนไข้";

          if (isPatient) {
            const { getPatientProfileByUserId } = await import("../shared/supabaseApi");
            const profile = await getPatientProfileByUserId(session.user.id) as any;
            if (profile) {
              setUser({
                patientId: profile.patientId || null,
                idCard: profile.idCard || "",
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                dob: profile.dob || "",
                gender: profile.gender || "",
                phone: profile.phone || "",
                email: session.user.email || "",
                emergencyName: profile.emergencyName || "",
                emergencyPhone: profile.emergencyPhone || "",
                emergencyRelationship: profile.emergencyRelationship || "",
                conditions: profile.conditions || "",
                allergies: profile.allergies || ""
              });
              setRole("patient");
              setIsLoggedIn(true);
              
              // Restore last view or go to dashboard
              const savedView = localStorage.getItem("supat_last_view") as View;
              if (savedView && PORTAL_VIEWS.includes(savedView)) {
                updateView(savedView);
              } else {
                updateView("dashboard");
              }
            }
          } else {
            let mappedRole: UserRole = "patient";
            if (role === "admin" || role === "ผู้ดูแลระบบ") mappedRole = "admin";
            else if (role === "dentist" || role === "doctor" || role === "ทันตแพทย์") mappedRole = "doctor";
            else if (role === "staff" || role === "พนักงาน") mappedRole = "staff";
            setRole(mappedRole);
            setLoginEmail(session.user.email || "");
            setIsLoggedIn(true);
          }
        }
      } catch (err) {
        console.error("Session restore error:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    checkSession();
  }, []);

  const updateAppt = (id: number, updates: Partial<Appointment>) =>
    setSharedAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

  const addAppt = (a: Appointment) =>
    setSharedAppointments(prev => [...prev, a]);

  const handleConsentAccept = async () => {
    if (!regFormData) return;
    setConsentLoading(true);
    setConsentError("");
    try {
      // Create auth user (in real app, this creates Supabase auth user)
      const mockPassword = "password123"; 
      const patientId = await savePatientData(regFormData);
      handleRegisterSuccess(regFormData.email, regFormData, patientId);
    } catch (err: any) {
      setConsentError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setConsentLoading(false);
    }
  };

  const handleLogin = (u: PatientUser) => {
    setUser(u);
    setRole("patient");
    setIsLoggedIn(true);
    updateView("dashboard");
  };

  const handleLoginRole = (r: UserRole, email?: string) => {
    setRole(r);
    if (email) setLoginEmail(email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole(null);
    setUser(null);
    setView("landing");
    localStorage.removeItem("supat_last_view");
    supabase.auth.signOut();
  };

  const handleRegisterSuccess = (email: string, formData?: RegForm, patientId?: number) => {
    if (formData) {
      setUser({
        patientId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        idCard: formData.idCard,
        dob: formData.dob,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone,
        emergencyRelationship: formData.emergencyRelationship,
        conditions: formData.conditions,
        allergies: formData.allergies
      });
      setRole("patient");
      setIsLoggedIn(true);
      updateView("dashboard");
    }
  };

  const handleConsent = () => {
    // After consent, go to registration form
    setView("register");
  };

  const goLogin = () => {
    setPrevView(view);
    setView("login");
  };

  const goCTA = () => {
    if (isLoggedIn && role === "patient") { updateView("booking"); }
    else goLogin();
  };

  // ─── Route to staff/doctor/admin portals ──────────────────────────────────
  if (role === "doctor") {
    return <DoctorPortal appointments={sharedAppointments} onLogout={handleLogout} loginEmail={loginEmail} />;
  }
  if (role === "admin") {
    return <AdminPortal appointments={sharedAppointments} onLogout={handleLogout} loginEmail={loginEmail} />;
  }
  if (role === "staff") {
    return <StaffPortal appointments={sharedAppointments} onUpdateAppt={updateAppt} onAddAppt={addAppt} onLogout={handleLogout} loginEmail={loginEmail} />;
  }

  // ─── Patient portal views ─────────────────────────────────────────────────
  const isPortalView = PORTAL_VIEWS.includes(view);

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">กำลังโหลดข้อมูล...</div>;
  }

  if (isPortalView && isLoggedIn && role === "patient" && user) {
    return (
      <PortalLayout
        user={user}
        view={view}
        setView={updateView}
        onLogout={handleLogout}
        onMainSite={() => setView("landing")}
      >
        {view === "dashboard"    && <DashboardView user={user} setView={updateView} appointments={sharedAppointments} />}
        {view === "profile"      && <ProfileView user={user} setUser={setUser} />}
        {view === "booking"      && (
          <BookingView 
            setView={(v) => { updateView(v); setFollowUpProps(null); }} 
            initialService={followUpProps?.service}
            initialDoctor={followUpProps?.doctor}
            isFollowUp={followUpProps !== null}
            user={user}
            onAddAppt={addAppt}
          />
        )}
        {view === "appointments" && (
          <AppointmentsView 
            user={user}
            setView={updateView}
            appointments={sharedAppointments}
            onUpdateAppt={updateAppt}
            onBookFollowUp={(serviceId, doctorId) => {
              setFollowUpProps({ service: serviceId, doctor: doctorId });
              updateView("booking");
            }}
          />
        )}
        {view === "history" && <HistoryView user={user} />}
        {view === "record" && (
          <DentalRecordView 
            user={user}
            onBack={() => { updateView("dashboard"); }} 
            onBookAppointment={() => { updateView("booking"); }} 
          />
        )}
      </PortalLayout>
    );
  }

  // ─── Auth pages ───────────────────────────────────────────────────────────
  if (view === "login")           return <LoginPage onLogin={handleLogin} onLoginRole={handleLoginRole} onRegister={() => { setPrevView("login"); setView("consent"); }} onForgotPassword={() => { setPrevView("login"); setView("forgot-password"); }} onBack={() => setView(prevView)} />;
  if (view === "consent")         return <ConsentPage onAccept={handleConsent} onBack={() => setView(prevView)} />;
  if (view === "register")        return <RegisterPage onSuccess={handleRegisterSuccess} onLogin={goLogin} onBack={() => setView(prevView)} />;
  if (view === "forgot-password") return <ForgotPasswordPage onBack={() => setView(prevView)} onSuccess={() => setView('login')} />;

  // ─── Landing page ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ fontFamily: "Prompt, sans-serif", scrollBehavior: "smooth" }}>
      {/* Special closure / status announcement bar */}
      {clinicStatus && clinicStatus.type !== "open" && (
        <div className="w-full text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 z-50 relative"
          style={{
            backgroundColor: clinicStatus.type === "special" ? "#FFF3E0" : "#F1F5F9",
            color: clinicStatus.type === "special" ? "#92400E" : "#475569",
            borderBottom: `1px solid ${clinicStatus.type === "special" ? "#FED7AA" : "#E2E8F0"}`,
          }}>
          <Info size={14} />
          <span>
            {clinicStatus.type === "special"
              ? `🏖️ หยุดพิเศษวันนี้ — ${clinicStatus.specialReason}`
              : `🔒 ${clinicStatus.label} — ${clinicStatus.sublabel}`}
          </span>
        </div>
      )}
      <Header
        onLoginClick={goLogin}
        isLoggedIn={isLoggedIn}
        onPortal={() => {
          if (role === "patient") { updateView("dashboard"); }
          else if (role === "doctor") setRole("doctor");
          else if (role === "admin") setRole("admin");
          else if (role === "staff") setRole("staff");
        }}
      />
      <main>
        <Hero onCTA={goCTA} />
        <Services onCTA={goCTA} />

        <WhyUs />
        <Doctors onCTA={goCTA} />
        <Contact onCTA={goCTA} />
      </main>
      <Footer />
    </div>
  );
}
