import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { View, UserRole, PatientUser } from "./types";
import { Appointment, getClinicStatus, ClinicStatus } from "../shared/data";
import { getWeeklyOffDays, getClinicClosures, getClinicSettings, getDailyHours } from "../shared/supabaseApi";
import { supabase } from "../shared/api/supabaseClient";
import { useRealtimeAppointments } from "../shared/useRealtimeAppointments";

// ─── หน้าเข้าสู่ระบบและสมัครสมาชิก ────────────────────────────────────────────
import LoginPage from "./auth/LoginPage";
import ForgotPasswordPage from "./auth/ForgotPasswordPage";
import ConsentPage from "./auth/ConsentPage";
import FirstTimePasswordPage from "./auth/FirstTimePasswordPage";

// ─── โครงสร้างหน้าเว็บฝั่งคนไข้ ───────────────────────────────────────────────
import PortalLayout from "./layout/PortalLayout";

// ─── หน้าย่อยในระบบคนไข้ ──────────────────────────────────────────────────────
import DashboardView from "./dashboard/DashboardView";
import BookingView from "./booking/BookingView";
import AppointmentsView from "./appointments/AppointmentsView";
import HistoryView from "./history/HistoryView";
import DentalRecordView from "./record/DentalRecordView";
import ProfileView from "./profile/ProfileView";

// ─── ส่วนประกอบหน้าแรกของเว็บไซต์ ─────────────────────────────────────────────
import Header from "./landing/Header";
import Hero from "./landing/Hero";
import Services from "./landing/Services";
import WhyUs from "./landing/WhyUs";
import Doctors from "./landing/Doctors";

import Contact from "./landing/Contact";
import Footer from "./landing/Footer";

// ─── ระบบฝั่งพนักงาน ทันตแพทย์ และผู้ดูแลระบบ ─────────────────────────────────
import DoctorPortal from "../dentist/DentistPortal";
import AdminPortal from "../admin/AdminPortal";
import StaffPortal from "../staff/StaffPortal";

// ─── ไฟล์สไตล์ CSS ────────────────────────────────────────────────────────────
import "./patient-animations.css";

// ═══════════════════════════════════════════════════════════════════════════════
// คอมโพเนนต์หลักสำหรับจัดการเส้นทางหน้าเว็บทั้งหมด
// ═══════════════════════════════════════════════════════════════════════════════

export default function PatientPortal() {
  const [view, setView] = useState<View>("landing");
  const [prevView, setPrevView] = useState<View>("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [user, setUser] = useState<PatientUser | null>(null);
  const [portalView, setPortalView] = useState<View>("dashboard");
  const [loginEmail, setLoginEmail] = useState("");
  const [clinicStatus, setClinicStatus] = useState<ClinicStatus | null>(null);
  const [followUpProps, setFollowUpProps] = useState<{service: number, doctor: number, planItem?: number, openTicketId?: number} | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  // ─── ตรวจสอบว่าคนไข้ต้องเปลี่ยนรหัสผ่านเริ่มต้นในการเข้าใช้งานครั้งแรกหรือไม่ ───
  const needsFirstTimePasswordChange = (identifiers: (string | number | undefined | null)[], sessionUser?: any) => {
    // 1. ตรวจสอบจาก LocalStorage หากถูกกำหนดให้ต้องเปลี่ยนรหัสผ่านเริ่มต้น
    for (const id of identifiers) {
      if (!id) continue;
      const clean = String(id).trim().toLowerCase();
      if (localStorage.getItem(`supat_must_change_pwd_${clean}`) === "true") return true;
    }

    // 2. ตรวจสอบจาก Supabase Auth metadata
    if (sessionUser?.user_metadata?.must_change_password === true && sessionUser?.user_metadata?.password_changed !== true) {
      for (const id of identifiers) {
        if (!id) continue;
        const clean = String(id).trim().toLowerCase();
        if (localStorage.getItem(`supat_pwd_changed_${clean}`) === "true") return false;
      }
      return true;
    }

    return false;
  };

  const markPasswordChanged = (identifiers: (string | number | undefined | null)[]) => {
    for (const id of identifiers) {
      if (!id) continue;
      const clean = String(id).trim().toLowerCase();
      localStorage.removeItem(`supat_must_change_pwd_${clean}`);
      localStorage.setItem(`supat_pwd_changed_${clean}`, "true");
    }
  };

  // ─── ตรวจสอบว่าคนไข้คนนี้เคยยินยอมนโยบายแล้วหรือยัง ────────────────────
  const hasAcceptedConsent = (identifiers: (string | number | undefined | null)[], sessionUser?: any) => {
    // 1. ตรวจสอบจาก Supabase Auth metadata ถ้ามี (จำถาวรใน Cloud)
    if (sessionUser?.user_metadata?.pdpa_consent === true) return true;

    // 2. ตรวจสอบจาก LocalStorage (ตรวจสอบทุกรูปแบบ เช่น ID, email, เลขบัตร, เบอร์โทร ทั้งตัวพิมพ์เล็ก/ใหญ่)
    for (const id of identifiers) {
      if (!id) continue;
      const clean = String(id).trim().toLowerCase();
      if (localStorage.getItem(`supat_consent_${clean}`) === "accepted") return true;
      if (localStorage.getItem(`supat_consent_${id}`) === "accepted") return true;
    }
    return false;
  };

  const markConsentAccepted = async (identifiers: (string | number | undefined | null)[]) => {
    // 1. บันทึก LocalStorage สำหรับทุก Identifier ของผู้ใช้คนนี้
    for (const id of identifiers) {
      if (!id) continue;
      const clean = String(id).trim().toLowerCase();
      localStorage.setItem(`supat_consent_${clean}`, "accepted");
      localStorage.setItem(`supat_consent_${id}`, "accepted");
    }

    // 2. บันทึกลง Supabase Auth metadata ให้จำถาวรข้ามอุปกรณ์/ข้ามเบราว์เซอร์
    try {
      await supabase.auth.updateUser({
        data: { pdpa_consent: true, pdpa_consent_date: new Date().toISOString() }
      });
    } catch (e) {
      console.warn("Failed to update pdpa_consent in auth metadata:", e);
    }
  };
  
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
    // ดึงข้อมูลสถานะการเปิด-ปิดของคลินิก
    Promise.all([getWeeklyOffDays(), getClinicClosures(), getClinicSettings(), getDailyHours()]).then(([offDays, closures, settings, dh]) => {
      setClinicStatus(getClinicStatus(new Date(), closures, offDays, settings, dh));
    }).catch(console.error);
  }, []);

  // ตรวจสอบเซสชันการเข้าสู่ระบบเมื่อเปิดหน้าเว็บ
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
                email: session.user.email || profile.email || "",
                emergencyName: profile.emergencyName || "",
                emergencyPhone: profile.emergencyPhone || "",
                emergencyRelationship: profile.emergencyRelationship || "",
                conditions: profile.conditions || "",
                allergies: profile.allergies || ""
              });
              setRole("patient");
              setIsLoggedIn(true);

              // ─── ตรวจการเปลี่ยนรหัสผ่านครั้งแรก และ consent ก่อนเข้า Portal (session restore) ───
              const identifiers = [
                session.user.id,
                session.user.email,
                profile.email,
                profile.patientId,
                profile.idCard,
                profile.phone
              ];
              const mustChangePwd = needsFirstTimePasswordChange(identifiers, session.user);
              const mustAcceptConsent = !hasAcceptedConsent(identifiers, session.user);
              if (mustChangePwd) setNeedsPasswordChange(true);
              if (mustAcceptConsent) setNeedsConsent(true);
              if (mustChangePwd || mustAcceptConsent) {
                return;
              }

              // คืนค่าหน้าล่าสุดที่เปิดค้างไว้ หรือไปที่หน้าแดชบอร์ด
              const savedView = localStorage.getItem("supat_last_view") as View;
              const urlParams = new URLSearchParams(window.location.search);
              if (urlParams.get('planItem') || urlParams.get('followUp') || urlParams.get('openTicketId')) {
                updateView("booking");
              } else if (savedView && PORTAL_VIEWS.includes(savedView)) {
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

  useEffect(() => {
    // ตรวจสอบพารามิเตอร์บน URL สำหรับเปิดรายการนัดหมาย
    const urlParams = new URLSearchParams(window.location.search);
    const planItem = urlParams.get('planItem');
    const doctorStr = urlParams.get('doctorId');
    const serviceStr = urlParams.get('serviceId');
    const openTicketId = urlParams.get('openTicketId');

    if (openTicketId) {
      setFollowUpProps({
        openTicketId: parseInt(openTicketId, 10),
        service: 1, doctor: 1 // ข้อมูลจะถูกอัปเดตอีกครั้งเมื่อหน้าจองคิวโหลดเสร็จ
      });
      setView("login");
    } else if (planItem) {
      setFollowUpProps({
        planItem: parseInt(planItem, 10),
        doctor: doctorStr ? parseInt(doctorStr, 10) : 1, // ค่าสำรองกรณีไม่ได้ระบุ
        service: serviceStr ? parseInt(serviceStr, 10) : 1 // ค่าสำรองกรณีไม่ได้ระบุ
      });
      setView("login"); // หากยังไม่ได้เข้าสู่ระบบให้ไปหน้าล็อกอินก่อน หากเข้าสู่ระบบแล้วให้ไปหน้าจองคิว
    }
  }, []);

  const updateAppt = (id: number, updates: Partial<Appointment>) =>
    setSharedAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

  const addAppt = (a: Appointment) =>
    setSharedAppointments(prev => [...prev, a]);



  const handleLogin = async (u: PatientUser) => {
    setUser(u);
    setRole("patient");
    setIsLoggedIn(true);
    // ─── ตรวจ consent ก่อนเข้า Dashboard ─────────────────────────────────
    let authUser: any = null;
    try {
      const { data } = await supabase.auth.getUser();
      authUser = data?.user;
    } catch (e) {
      // ข้ามข้อผิดพลาด
    }
    const identifiers = [
      u.email,
      u.patientId,
      u.idCard,
      u.phone,
      authUser?.id,
      authUser?.email
    ];
    const mustChangePwd = needsFirstTimePasswordChange(identifiers, authUser);
    const mustAcceptConsent = !hasAcceptedConsent(identifiers, authUser);
    setNeedsPasswordChange(mustChangePwd);
    setNeedsConsent(mustAcceptConsent);
    if (!mustChangePwd && !mustAcceptConsent) {
      updateView("dashboard");
    }
  };

  const handleFirstTimePasswordChanged = async () => {
    let authUser: any = null;
    try {
      const { data } = await supabase.auth.getUser();
      authUser = data?.user;
    } catch (e) {
      // ข้ามข้อผิดพลาด
    }
    const identifiers = [
      user?.email,
      user?.patientId,
      user?.idCard,
      user?.phone,
      authUser?.id,
      authUser?.email
    ];
    markPasswordChanged(identifiers);
    setNeedsPasswordChange(false);
    if (!needsConsent) {
      updateView("dashboard");
    }
  };

  const handleConsentAccepted = async () => {
    let authUser: any = null;
    try {
      const { data } = await supabase.auth.getUser();
      authUser = data?.user;
    } catch (e) {
      // ข้ามข้อผิดพลาด
    }
    const identifiers = [
      user?.email,
      user?.patientId,
      user?.idCard,
      user?.phone,
      authUser?.id,
      authUser?.email
    ];
    await markConsentAccepted(identifiers);
    setNeedsConsent(false);
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

  const goLogin = () => {
    setPrevView(view);
    setView("login");
  };

  const goCTA = () => {
    if (isLoggedIn && role === "patient") { updateView("booking"); }
    else goLogin();
  };

  // ─── นำทางไปยังหน้าของพนักงาน ทันตแพทย์ หรือผู้ดูแลระบบ ──────────────────────
  if (role === "doctor") {
    return <DoctorPortal appointments={sharedAppointments} onLogout={handleLogout} loginEmail={loginEmail} />;
  }
  if (role === "admin") {
    return <AdminPortal appointments={sharedAppointments} onLogout={handleLogout} loginEmail={loginEmail} />;
  }
  if (role === "staff") {
    return <StaffPortal appointments={sharedAppointments} onUpdateAppt={updateAppt} onAddAppt={addAppt} onLogout={handleLogout} loginEmail={loginEmail} />;
  }

  // ─── แสดงผลหน้าต่างๆ ของฝั่งคนไข้ ────────────────────────────────────────────
  const isPortalView = PORTAL_VIEWS.includes(view);

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">กำลังโหลดข้อมูล...</div>;
  }

  // ─── หน้าเปลี่ยนรหัสผ่านเริ่มต้นสำหรับการเข้าใช้งานครั้งแรก ────────────────────
  if (needsPasswordChange && isLoggedIn && role === "patient") {
    return (
      <FirstTimePasswordPage
        userEmail={user?.email}
        onSuccess={handleFirstTimePasswordChanged}
        onBack={() => {
          setNeedsPasswordChange(false);
          setNeedsConsent(false);
          handleLogout();
        }}
      />
    );
  }

  // ─── หน้าให้ความยินยอมข้อมูลส่วนบุคคล (PDPA) สำหรับการเข้าใช้งานครั้งแรก ─────
  if (needsConsent && isLoggedIn && role === "patient") {
    return (
      <ConsentPage
        onAccept={handleConsentAccepted}
        onBack={() => {
          // ยกเลิก → logout กลับ landing
          setNeedsConsent(false);
          handleLogout();
        }}
      />
    );
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
            planItemId={followUpProps?.planItem}
            openTicketId={followUpProps?.openTicketId}
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
            onBookFollowUp={(serviceId, doctorId, openTicketId) => {
              setFollowUpProps({ service: serviceId, doctor: doctorId || 0, openTicketId });
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

  // ─── หน้ายืนยันตัวตน (เข้าสู่ระบบ / สมัครสมาชิก / ลืมรหัสผ่าน) ──────────────
  if (view === "login")           return <LoginPage onLogin={handleLogin} onLoginRole={handleLoginRole} onRegister={() => setView("login")} onForgotPassword={() => { setPrevView("login"); setView("forgot-password"); }} onBack={() => setView(prevView)} />;
  if (view === "forgot-password") return <ForgotPasswordPage onBack={() => setView(prevView)} onSuccess={() => setView('login')} />;

  // ─── หน้าแรกของคลินิก ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ fontFamily: "Sarabun, sans-serif", scrollBehavior: "smooth" }}>
      {/* แถบประกาศวันหยุดพิเศษหรือสถานะคลินิก */}
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
              ? `หยุดพิเศษวันนี้ — ${clinicStatus.specialReason}`
              : `${clinicStatus.label} — ${clinicStatus.sublabel}`}
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
