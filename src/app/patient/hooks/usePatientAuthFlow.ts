import { useState, useEffect } from "react";
import { View, PatientUser } from "../types";
import { UserRole } from "@/app/shared/types";
import { Appointment, getClinicStatus, ClinicStatus } from "@/app/shared/data";
import {
  getWeeklyOffDays,
  getClinicClosures,
  getClinicSettings,
  getDailyHours,
  getPatientProfileByUserId,
} from "@/app/shared/api";
import { supabase } from "@/app/shared/api/supabaseClient";
import { useRealtimeAppointments } from "@/app/shared/hooks/useRealtimeAppointments";

export interface PatientPortalProps {
  sharedAppointments?: Appointment[];
  updateAppt?: (id: number, updates: Partial<Appointment>) => void;
  addAppt?: (a: Appointment) => void;
  onRoleChange?: (role: UserRole, email?: string) => void;
  onLogout?: () => void;
}

const PORTAL_VIEWS: View[] = [
  "dashboard",
  "profile",
  "booking",
  "appointments",
  "history",
  "record",
];

/**
 * 🔐 [HOOK] usePatientAuthFlow
 * จัดการ Session, การตรวจสอบสิทธิ์, ความยินยอม PDPA, รหัสผ่านครั้งแรก และการนำทางของระบบคนไข้
 */
export function usePatientAuthFlow(props: PatientPortalProps = {}) {
  const [view, setView] = useState<View>("landing");
  const [prevView, setPrevView] = useState<View>("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [user, setUser] = useState<PatientUser | null>(null);

  const [clinicStatus, setClinicStatus] = useState<ClinicStatus | null>(null);
  const [followUpProps, setFollowUpProps] = useState<{
    service: number;
    doctor: number;
    planItem?: number;
    openTicketId?: number;
  } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  // ─── ตรวจสอบว่าคนไข้ต้องเปลี่ยนรหัสผ่านเริ่มต้นในการเข้าใช้งานครั้งแรกหรือไม่ ───
  const needsFirstTimePasswordChange = (
    identifiers: (string | number | undefined | null)[],
    sessionUser?: any
  ) => {
    for (const id of identifiers) {
      if (!id) continue;
      const clean = String(id).trim().toLowerCase();
      if (localStorage.getItem(`supat_must_change_pwd_${clean}`) === "true")
        return true;
    }

    if (
      sessionUser?.user_metadata?.must_change_password === true &&
      sessionUser?.user_metadata?.password_changed !== true
    ) {
      for (const id of identifiers) {
        if (!id) continue;
        const clean = String(id).trim().toLowerCase();
        if (localStorage.getItem(`supat_pwd_changed_${clean}`) === "true")
          return false;
      }
      return true;
    }

    return false;
  };

  const markPasswordChanged = (
    identifiers: (string | number | undefined | null)[]
  ) => {
    for (const id of identifiers) {
      if (!id) continue;
      const clean = String(id).trim().toLowerCase();
      localStorage.removeItem(`supat_must_change_pwd_${clean}`);
      localStorage.setItem(`supat_pwd_changed_${clean}`, "true");
    }
  };

  const markConsentAccepted = async (
    identifiers: (string | number | undefined | null)[]
  ) => {
    for (const id of identifiers) {
      if (!id) continue;
      const clean = String(id).trim().toLowerCase();
      localStorage.setItem(`supat_consent_${clean}`, "accepted");
      localStorage.setItem(`supat_consent_${id}`, "accepted");
    }

    try {
      await supabase.auth.updateUser({
        data: {
          pdpa_consent: true,
          pdpa_consent_date: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.warn("Failed to update pdpa_consent in auth metadata:", e);
    }
  };

  const {
    appointments: internalAppointments,
    setAppointments: setInternalAppointments,
  } = useRealtimeAppointments();
  const sharedAppointments = props.sharedAppointments ?? internalAppointments;

  const updateView = (v: View) => {
    setView(v);
    if (PORTAL_VIEWS.includes(v)) {
      localStorage.setItem("supat_last_view", v);
    }
  };

  // ดึงข้อมูลสถานะการเปิด-ปิดของคลินิก
  useEffect(() => {
    Promise.all([
      getWeeklyOffDays(),
      getClinicClosures(),
      getClinicSettings(),
      getDailyHours(),
    ])
      .then(([offDays, closures, settings, dh]) => {
        setClinicStatus(
          getClinicStatus(new Date(), closures, offDays, settings, dh)
        );
      })
      .catch(console.error);
  }, []);

  // ตรวจสอบเซสชันการเข้าสู่ระบบเมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("user_id", session.user.id)
            .single();
          const role = userData?.role || "patient";
          const isPatient = role === "patient" || role === "คนไข้";

          if (isPatient) {
            const profile = (await getPatientProfileByUserId(
              session.user.id
            )) as any;
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
                allergies: profile.allergies || "",
              });
              setRole("patient");
              setIsLoggedIn(true);

              // ตรวจการเปลี่ยนรหัสผ่านครั้งแรก
              const identifiers = [
                session.user.id,
                session.user.email,
                profile.email,
                profile.patientId,
                profile.idCard,
                profile.phone,
              ];
              const mustChangePwd = needsFirstTimePasswordChange(
                identifiers,
                session.user
              );
              if (mustChangePwd) {
                setNeedsPasswordChange(true);
                return;
              }

              // คืนค่าหน้าล่าสุดที่เปิดค้างไว้ หรือไปที่หน้าแดชบอร์ด
              const savedView = localStorage.getItem("supat_last_view") as View;
              const urlParams = new URLSearchParams(window.location.search);
              if (
                urlParams.get("planItem") ||
                urlParams.get("followUp") ||
                urlParams.get("openTicketId")
              ) {
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
            else if (
              role === "dentist" ||
              role === "doctor" ||
              role === "ทันตแพทย์"
            )
              mappedRole = "doctor";
            else if (role === "staff" || role === "พนักงาน") mappedRole = "staff";
            setRole(mappedRole);
            setIsLoggedIn(true);
            props.onRoleChange?.(mappedRole, session.user.email || "");
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

  // ตรวจสอบพารามิเตอร์บน URL สำหรับเปิดรายการนัดหมาย
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planItem = urlParams.get("planItem");
    const doctorStr = urlParams.get("doctorId");
    const serviceStr = urlParams.get("serviceId");
    const openTicketId = urlParams.get("openTicketId");

    if (openTicketId) {
      setFollowUpProps({
        openTicketId: parseInt(openTicketId, 10),
        service: 1,
        doctor: 1,
      });
      setView("login");
    } else if (planItem) {
      setFollowUpProps({
        planItem: parseInt(planItem, 10),
        doctor: doctorStr ? parseInt(doctorStr, 10) : 1,
        service: serviceStr ? parseInt(serviceStr, 10) : 1,
      });
      setView("login");
    }
  }, []);

  const updateAppt =
    props.updateAppt ??
    ((id: number, updates: Partial<Appointment>) =>
      setInternalAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      ));

  const addAppt =
    props.addAppt ??
    ((a: Appointment) =>
      setInternalAppointments((prev) =>
        prev.some((x) => x.id === a.id)
          ? prev.map((x) => (x.id === a.id ? { ...x, ...a } : x))
          : [...prev, a]
      ));

  const handleLogin = async (u: PatientUser) => {
    setUser(u);
    setRole("patient");
    setIsLoggedIn(true);

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
      authUser?.email,
    ];
    const mustChangePwd = needsFirstTimePasswordChange(identifiers, authUser);
    setNeedsPasswordChange(mustChangePwd);
    if (!mustChangePwd) {
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
      authUser?.email,
    ];
    markPasswordChanged(identifiers);
    setNeedsPasswordChange(false);
    updateView("dashboard");
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
      authUser?.email,
    ];
    await markConsentAccepted(identifiers);
    setNeedsConsent(false);
    updateView("dashboard");
  };

  const handleLoginRole = (r: UserRole, email?: string) => {
    setRole(r);
    setIsLoggedIn(true);
    props.onRoleChange?.(r, email);
  };

  const handleLogout = async () => {
    // 1. ล้าง token ของ Supabase และข้อมูลชั่วคราวใน localStorage ทันทีแบบ synchronous
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("sb-") ||
            key.includes("supabase.auth.token") ||
            key.startsWith("supat_"))
        ) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn("Error clearing localStorage auth keys:", e);
    }

    // 2. ปรับ State ให้กลับสู่หน้า Landing Page ทันทีในคลิกเดียว
    setIsLoggedIn(false);
    setRole(null);
    setUser(null);
    setView("landing");
    props.onLogout?.();

    // 3. ส่งคำขอยกเลิกเซสชันไปยัง Supabase API ในเบื้องหลัง
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const goLogin = () => {
    setPrevView(view);
    setView("login");
  };

  const goCTA = () => {
    if (isLoggedIn && role === "patient") {
      updateView("booking");
    } else {
      goLogin();
    }
  };

  const isPortalView = PORTAL_VIEWS.includes(view);

  return {
    view,
    setView,
    prevView,
    setPrevView,
    updateView,
    isLoggedIn,
    role,
    user,
    setUser,
    clinicStatus,
    followUpProps,
    setFollowUpProps,
    isInitializing,
    needsConsent,
    setNeedsConsent,
    needsPasswordChange,
    setNeedsPasswordChange,
    sharedAppointments,
    updateAppt,
    addAppt,
    handleLogin,
    handleFirstTimePasswordChanged,
    handleConsentAccepted,
    handleLoginRole,
    handleLogout,
    goLogin,
    goCTA,
    isPortalView,
  };
}

