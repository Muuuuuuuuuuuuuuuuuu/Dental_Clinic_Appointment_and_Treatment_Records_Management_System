import { useState, useEffect, useRef } from "react";
import { Appointment } from "@/app/shared/data";
import { getPatientAppointments, updateAppointmentStatus } from "@/app/shared/supabaseApi";
import { PatientUser } from "../../types";

/** ดึงเวลา "ปัจจุบัน" โดยรองรับ Time Travel mock time */
export function getNow(): Date {
  const mockDatetime = localStorage.getItem("supat_mock_date");
  if (mockDatetime) {
    const parsed = new Date(mockDatetime);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export const thDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function usePatientAppointments(
  user: PatientUser,
  globalAppointments?: Appointment[],
  onUpdateAppt?: (id: number, updates: Partial<Appointment>) => void
) {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [expiringIds, setExpiringIds] = useState<Set<number>>(new Set());
  const autoExpireRanRef = useRef(false);

  useEffect(() => {
    if (!user.patientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    autoExpireRanRef.current = false;
    
    const fetchAppts = () => {
      if (user.patientId) {
        getPatientAppointments(user.patientId)
          .then((data) => setAppts(data))
          .catch(console.error)
          .finally(() => setLoading(false));
      }
    };

    fetchAppts();

    const handleUpdate = () => {
      fetchAppts();
    };
    window.addEventListener('appointments-updated', handleUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'icemu-sync-update') fetchAppts();
    };
    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('icemu-updates');
        bc.onmessage = () => fetchAppts();
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('appointments-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
    };
  }, [user.patientId]);

  useEffect(() => {
    if (loading || autoExpireRanRef.current || appts.length === 0) return;
    autoExpireRanRef.current = true;

    const now = getNow();
    const expirableStatuses = ["รอการยืนยัน", "ยืนยันการจอง"];

    const toExpire = appts.filter((a) => {
      if (!expirableStatuses.includes(a.status)) return false;
      if (!a.date || !a.time) return false;
      const apptDateTime = new Date(`${a.date}T${a.time}:00`);
      return apptDateTime < now;
    });

    if (toExpire.length === 0) return;

    setExpiringIds(new Set(toExpire.map((a) => a.id)));

    setAppts((prev) =>
      prev.map((a) =>
        toExpire.find((e) => e.id === a.id) ? { ...a, status: "ไม่มาตามนัด" } : a
      )
    );

    Promise.allSettled(
      toExpire.map((a) =>
        updateAppointmentStatus(
          a.id,
          "ไม่มาตามนัด",
          "ระบบยกเลิกอัตโนมัติ: คนไข้ไม่มาตามนัดหมายที่กำหนด"
        ).catch((err) => {
          console.error(`Auto-expire failed for appt ${a.id}:`, err);
          setAppts((prev) =>
            prev.map((p) => (p.id === a.id ? { ...p, status: a.status } : p))
          );
        })
      )
    ).finally(() => {
      setExpiringIds(new Set());
    });
  }, [loading, appts.length]);

  useEffect(() => {
    if (!globalAppointments || !user.patientId) return;
    const parentAppts = globalAppointments.filter((a) => a.patientId === user.patientId);
    setAppts(parentAppts);
  }, [globalAppointments, user.patientId]);

  const doCancel = async (id: number) => {
    const previousAppts = [...appts];
    setAppts((apps) => apps.map((a) => (a.id === id ? { ...a, status: "ยกเลิก" } : a)));
    if (onUpdateAppt) {
      onUpdateAppt(id, { status: "ยกเลิก" });
    }
    setCancelId(null);

    try {
      await updateAppointmentStatus(id, "ยกเลิก");
    } catch (err) {
      console.error(err);
      setAppts(previousAppts);
      if (onUpdateAppt) {
        const prevAppt = previousAppts.find((a) => a.id === id);
        if (prevAppt) onUpdateAppt(id, { status: prevAppt.status });
      }
      alert("ไม่สามารถยกเลิกนัดหมายได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const activeAppts = appts
    .filter((a) => {
      if (a.status === "ยกเลิก") return false;
      if (a.status === "เสร็จสิ้น" || a.status === "ไม่มาตามนัด") return false;
      return true;
    })
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      const timeA = a.time || "00:00";
      const timeB = b.time || "00:00";
      const dateA = new Date(`${a.date}T${timeA}:00`).getTime();
      const dateB = new Date(`${b.date}T${timeB}:00`).getTime();
      return dateA - dateB;
    });

  return {
    appts,
    loading,
    cancelId,
    setCancelId,
    expiringIds,
    activeAppts,
    doCancel,
  };
}

