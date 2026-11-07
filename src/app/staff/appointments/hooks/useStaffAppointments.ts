import { useState, useEffect, useMemo } from "react";
import { Appointment, DentistInfo, hasHealthAlert } from "@/app/shared/data";
import {
  getDentists,
  updateAppointmentStatus,
  updateAppointmentDetails,
} from "@/app/shared/supabaseApi";
import { useRealtimeAppointments } from "@/app/shared/useRealtimeAppointments";

export type TabView = "risk" | "reschedule" | "transfer" | "all";

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

  const displayAppointments = useMemo(() => {
    let list = appointments;
    if (activeTab === "risk") {
      list = activeAppointments.filter(
        (a) =>
          hasHealthAlert(a.conditions) ||
          hasHealthAlert(a.allergies) ||
          a.status === "รอการยืนยัน"
      );
    } else if (activeTab === "reschedule" || activeTab === "transfer") {
      list = activeAppointments;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.hn.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q)
      );
    }

    return list.sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
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

