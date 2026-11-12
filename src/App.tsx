import { useState, useEffect } from "react";
import { UserRole } from "@/app/shared/types";
import { Appointment } from "@/app/shared/data";
import { supabase } from "@/app/shared/api/supabaseClient";
import { useRealtimeAppointments } from "@/app/shared/hooks/useRealtimeAppointments";

// ─── พอร์ทัลหลักของแต่ละบทบาทผู้ใช้งาน ──────────────────────────────────────────
import DoctorPortal from "@/app/dentist/DentistPortal";
import AdminPortal from "@/app/admin/AdminPortal";
import StaffPortal from "@/app/staff/StaffPortal";
import PatientPortal from "@/app/patient/PatientPortal";

/**
 * 🌐 [ROOT APPLICATION ROUTER]
 * คอมโพเนนต์รากของแอปพลิเคชัน ทำหน้าที่:
 * 1. ตรวจสอบการยืนยันตัวตน (Global Supabase Session)
 * 2. กระจายข้อมูลการนัดหมายแบบ Realtime (sharedAppointments)
 * 3. เลือกระบบพอร์ทัลหลักตามบทบาท (Role-based Routing: Admin, Doctor, Staff, Patient)
 */
export default function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);

  const { appointments: sharedAppointments, setAppointments: setSharedAppointments } = useRealtimeAppointments();

  const updateAppt = (id: number, updates: Partial<Appointment>) =>
    setSharedAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

  const addAppt = (a: Appointment) =>
    setSharedAppointments(prev => [...prev, a]);

  const handleRoleChange = (newRole: UserRole, email?: string) => {
    setRole(newRole);
    if (email) setLoginEmail(email);
  };

  const handleLogout = async () => {
    // 1. ล้าง token ของ Supabase และข้อมูลชั่วคราวใน localStorage ทันทีแบบ synchronous
    // เพื่อป้องกันไม่ให้คอมโพเนนต์ที่ mount ใหม่ตรวจพบ session เดิมแล้วล็อกอินกลับเข้ามาเอง
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

    // 2. ปรับ State บทบาทใน React ทันทีโดยไม่ต้องรอเครือข่าย หน้าจอจะเด้งกลับหน้าหลักในคลิกเดียวทันที
    setRole(null);
    setLoginEmail("");

    // 3. ส่งคำขอยกเลิกเซสชันไปยัง Supabase API ในเบื้องหลัง
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          const rawRole = userData?.role || "patient";
          let mappedRole: UserRole = "patient";
          if (rawRole === "admin" || rawRole === "ผู้ดูแลระบบ") mappedRole = "admin";
          else if (rawRole === "dentist" || rawRole === "doctor" || rawRole === "ทันตแพทย์") mappedRole = "doctor";
          else if (rawRole === "staff" || rawRole === "พนักงาน") mappedRole = "staff";

          setRole(mappedRole);
          setLoginEmail(session.user.email || "");
        }
      } catch (err) {
        console.error("App Root Session restore error:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    checkSession();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-sans">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  // นำทางตามบทบาทของผู้ใช้งาน
  if (role === "doctor") {
    return (
      <DoctorPortal
        appointments={sharedAppointments}
        onLogout={handleLogout}
        loginEmail={loginEmail}
      />
    );
  }

  if (role === "admin") {
    return (
      <AdminPortal
        appointments={sharedAppointments}
        onLogout={handleLogout}
        loginEmail={loginEmail}
      />
    );
  }

  if (role === "staff") {
    return (
      <StaffPortal
        appointments={sharedAppointments}
        onUpdateAppt={updateAppt}
        onAddAppt={addAppt}
        onLogout={handleLogout}
        loginEmail={loginEmail}
      />
    );
  }

  // ค่าเริ่มต้น: หน้าพอร์ทัลคนไข้และ Landing Page
  return (
    <PatientPortal
      key={role || "guest"}
      sharedAppointments={sharedAppointments}
      updateAppt={updateAppt}
      addAppt={addAppt}
      onRoleChange={handleRoleChange}
      onLogout={handleLogout}
    />
  );
}

