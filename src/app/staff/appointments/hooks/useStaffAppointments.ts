import { useState, useEffect, useMemo, useRef } from "react";
import { Appointment, DentistInfo, hasHealthAlert } from "@/app/shared/data";
import {
  getDentists,
  updateAppointmentStatus,
  updateAppointmentDetails,
} from "@/app/shared/supabaseApi";
import { useRealtimeAppointments } from "@/app/shared/useRealtimeAppointments";

export type TabView = "risk" | "reschedule" | "transfer" | "all";

function getNow(): Date {
  const mockDatetime =
    typeof window !== "undefined" ? localStorage.getItem("supat_mock_date") : null;
  if (mockDatetime) {
    return new Date(mockDatetime.includes("T") ? mockDatetime : `${mockDatetime}T08:00:00`);
  }
  return new Date();
}

function getTodayStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useStaffAppointments(initialAppointments?: Appointment[]) {
  const { appointments, refetch: fetchAppointments, setAppointments } = useRealtimeAppointments();
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabView>("risk");
  const [searchQuery, setSearchQuery] = useState("");

  // สถานะการเปิด-ปิดหน้าต่างป๊อปอัป
  const [transferAppt, setTransferAppt] = useState<Appointment | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);

  // สถานะข้อมูลในแบบฟอร์ม
  const [newDoctorId, setNewDoctorId] = useState<string>("");
  const [newDate, setNewDate] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");
  const [updateReason, setUpdateReason] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    getDentists()
      .then((docs) => {
        setDentists(docs);
        if (!initialAppointments) {
          fetchAppointments().catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initialAppointments) {
      setAppointments(initialAppointments);
    }
  }, [initialAppointments, setAppointments]);

  const onUpdateAppt = async (
    id: number,
    updates: Partial<Appointment> & { reason?: string }
  ) => {
    try {
      if (updates.status) {
        const updated = await updateAppointmentStatus(id, updates.status, updates.reason);
        setAppointments((apps) =>
          apps.map((a) => (a.id === id ? { ...a, ...updates, status: updated.status } : a))
        );
      } else {
        await updateAppointmentDetails(id, {
          date: updates.date,
          time: updates.time,
          doctorId: updates.doctorId,
          reason: updates.reason,
        });
        setAppointments((apps) =>
          apps.map((a) => (a.id === id ? { ...a, ...updates } : a))
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment");
    }
  };

  const handleTransferSubmit = () => {
    if (!transferAppt || !newDoctorId) return;
    const doctor = dentists.find((d) => d.id.toString() === newDoctorId);
    if (doctor) {
      onUpdateAppt(transferAppt.id, {
        doctorId: doctor.id,
        doctorName: doctor.name,
        reason: updateReason,
      });
    }
    setTransferAppt(null);
    setNewDoctorId("");
    setUpdateReason("");
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleAppt || !newDate || !newTime) return;
    onUpdateAppt(rescheduleAppt.id, {
      date: newDate,
      time: newTime,
      reason: updateReason,
    });
    setRescheduleAppt(null);
    setNewDate("");
    setNewTime("");
    setUpdateReason("");
  };

  const handleCancelAppt = (appt: Appointment) => {
    if (confirm(`ยืนยันยกเลิกนัดหมายของคุณ ${appt.patientName} ใช่ไหม?`)) {
      onUpdateAppt(appt.id, { status: "ยกเลิก", reason: updateReason });
      setRescheduleAppt(null);
      setUpdateReason("");
    }
  };

  const handleNoShowAppt = (appt: Appointment) => {
    if (confirm(`ยืนยันว่าคุณ ${appt.patientName} ไม่มาตามนัดใช่ไหม?`)) {
      onUpdateAppt(appt.id, { status: "ไม่มาตามนัด", reason: updateReason });
      setRescheduleAppt(null);
      setUpdateReason("");
    }
  };

  const activeAppointments = appointments.filter(
    (a) => !["เสร็จสิ้น", "ยกเลิก", "ไม่มาตามนัด"].includes(a.status)
  );

  // ตรวจสอบและปรับสถานะนัดหมายที่เลยเวลาแล้วเป็น "ไม่มาตามนัด" อัตโนมัติ
  const processedExpiredIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (loading || appointments.length === 0) return;

    const now = getNow();
    const expirableStatuses = ["รอการยืนยัน", "ยืนยันการจอง"];

    const toExpire = appointments.filter((a) => {
      if (processedExpiredIds.current.has(a.id)) return false;
      if (!expirableStatuses.includes(a.status)) return false;
      if (!a.date || !a.time) return false;
      const apptDateTime = new Date(`${a.date}T${a.time}:00`);
      return apptDateTime < now;
    });

    if (toExpire.length === 0) return;

    toExpire.forEach((a) => processedExpiredIds.current.add(a.id));

    setAppointments((prev) =>
      prev.map((a) =>
        toExpire.some((e) => e.id === a.id) ? { ...a, status: "ไม่มาตามนัด" } : a
      )
    );

    toExpire.forEach((a) => {
      updateAppointmentStatus(a.id, "ไม่มาตามนัด", "เลยเวลานัดหมาย").catch(console.error);
    });
  }, [loading, appointments, setAppointments]);

  const isUpcoming = (a: Appointment, now: Date, todayStr: string) => {
    if (!a.date) return false;
    if (a.date < todayStr) return false;
    if (a.date === todayStr && a.time) {
      const apptDateTime = new Date(`${a.date}T${a.time}:00`);
      return apptDateTime >= now;
    }
    return true;
  };

  const displayAppointments = useMemo(() => {
    const now = getNow();
    const todayStr = getTodayStr(now);
    const upcomingActiveAppointments = activeAppointments.filter((a) =>
      isUpcoming(a, now, todayStr)
    );

    let list = appointments;
    if (activeTab === "risk") {
      list = upcomingActiveAppointments.filter(
        (a) =>
          hasHealthAlert(a.conditions) ||
          hasHealthAlert(a.allergies) ||
          a.status === "รอการยืนยัน"
      );
    } else if (activeTab === "reschedule" || activeTab === "transfer") {
      list = upcomingActiveAppointments;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          (a.hn && a.hn.toLowerCase().includes(q)) ||
          (a.doctorName && a.doctorName.toLowerCase().includes(q))
      );
    }

    if (activeTab === "all") {
      return [...list].sort(
        (a, b) =>
          new Date(`${b.date}T${b.time || "00:00"}`).getTime() -
          new Date(`${a.date}T${a.time || "00:00"}`).getTime()
      );
    }

    return [...list].sort(
      (a, b) =>
        new Date(`${a.date}T${a.time || "00:00"}`).getTime() -
        new Date(`${b.date}T${b.time || "00:00"}`).getTime()
    );
  }, [appointments, activeTab, searchQuery, activeAppointments]);

  return {
    appointments,
    dentists,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    displayAppointments,
    transferAppt,
    setTransferAppt,
    rescheduleAppt,
    setRescheduleAppt,
    newDoctorId,
    setNewDoctorId,
    newDate,
    setNewDate,
    newTime,
    setNewTime,
    updateReason,
    setUpdateReason,
    onUpdateAppt,
    handleTransferSubmit,
    handleRescheduleSubmit,
    handleCancelAppt,
    handleNoShowAppt,
  };
}

