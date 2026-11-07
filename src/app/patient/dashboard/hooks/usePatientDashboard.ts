import { useState, useEffect } from "react";
import { Appointment } from "@/app/shared/data";
import {
  getPatientAppointments,
  getPatientTreatmentRecords,
  getDailyHours,
  getWeeklyOffDays,
  DayHours,
} from "@/app/shared/supabaseApi";
import { PatientUser } from "../../types";

export function usePatientDashboard(user: PatientUser, globalAppointments?: Appointment[]) {
  const [appointments, setAppointments] = useState<Appointment[]>(
    globalAppointments?.filter((a) => a.patientId === user.patientId) || []
  );
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyHours, setDailyHours] = useState<Record<string, DayHours>>({});
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([]);

  useEffect(() => {
    if (globalAppointments) {
      setAppointments(globalAppointments.filter((a) => a.patientId === user.patientId));
    }
  }, [globalAppointments, user.patientId]);

  useEffect(() => {
    if (!user.patientId) return;

    const loadData = () => {
      if (!user.patientId) return;
      Promise.all([
        !globalAppointments
          ? getPatientAppointments(user.patientId).then((data) => setAppointments(data))
          : Promise.resolve(),
        getPatientTreatmentRecords(user.patientId).then((data) => setHistory(data)),
        getDailyHours().then((data) => setDailyHours(data)),
        getWeeklyOffDays().then((data) => setWeeklyOffDays(data)),
      ])
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('appointments-updated', handleUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'icemu-sync-update') loadData();
    };
    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('icemu-updates');
        bc.onmessage = () => loadData();
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('appointments-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
    };
  }, [user, globalAppointments]);

  const upcoming = appointments.find(
    (a) => a.status !== "เสร็จสิ้น" && a.status !== "ยกเลิก" && a.status !== "ไม่มาตามนัด"
  );

  return {
    appointments,
    history,
    loading,
    dailyHours,
    weeklyOffDays,
    upcoming,
  };
}

