import { useState, useEffect } from "react";
import { Shift, SpecialClosure, LeaveRequest, DentistInfo, Appointment } from "@/app/shared/data";
import {
  getShifts,
  getClinicClosures,
  getLeaveRequests,
  addLeaveRequest,
  getAppointments,
  getWeeklyOffDays,
} from "@/app/shared/supabaseApi";

export function useDoctorCalendar(doctor: DentistInfo | null) {
  const doctorId = doctor?.userId;

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSchedule, setShowSchedule] = useState(true);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [leaveType, setLeaveType] = useState<"ลาป่วย" | "ลากิจ" | "ลาพักร้อน">("ลาป่วย");
  const [leaveReason, setLeaveReason] = useState("");

  useEffect(() => {
    if (doctorId) {
      fetchData();
      const handleUpdate = () => fetchData();
      window.addEventListener('appointments-updated', handleUpdate);
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'icemu-sync-update') fetchData();
      };
      window.addEventListener('storage', handleStorage);
      let bc: BroadcastChannel | null = null;
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          bc = new BroadcastChannel('icemu-updates');
          bc.onmessage = () => fetchData();
        } catch (e) {}
      }
      return () => {
        window.removeEventListener('appointments-updated', handleUpdate);
        window.removeEventListener('storage', handleStorage);
        if (bc) {
          try { bc.close(); } catch (e) {}
        }
      };
    }
  }, [doctorId]);

  const fetchData = async () => {
    if (!doctorId) return;
    try {
      const [sData, cData, lData, aData, offDays] = await Promise.all([
        getShifts(),
        getClinicClosures(),
        getLeaveRequests(),
        getAppointments(),
        getWeeklyOffDays(),
      ]);
      setShifts(sData.filter((s) => s.person_id === doctor?.id && s.person_type === "dentist"));
      setClosures(cData);
      setLeaves(lData.filter((l) => l.doctorId === doctorId));
      setAppointments(aData.filter((a) => a.doctorId === doctor?.id));
      setWeeklyOffDays(offDays);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !selectedDate) return;

    if (!leaveReason.trim()) {
      alert("กรุณาระบุเหตุผลการลา");
      return;
    }

    try {
      const added = await addLeaveRequest({
        doctorId: doctorId,
        startDate: selectedDate,
        endDate: selectedDate,
        leaveType: leaveType,
        reason: leaveReason.trim(),
        status: "รออนุมัติ",
      });
      setLeaves([
        ...leaves,
        {
          id: added.leave_id || Date.now(),
          doctorId: doctorId,
          doctorName: doctor?.name || "",
          startDate: selectedDate,
          endDate: selectedDate,
          leaveType: leaveType,
          reason: leaveReason.trim(),
          status: "รออนุมัติ",
          createdAt: selectedDate,
        },
      ]);
      setLeaveModalOpen(false);
      setLeaveReason("");
      alert("ส่งคำขอลางานสำเร็จ รอแอดมินอนุมัติ");
    } catch (err: any) {
      console.error("Error adding leave", err);
      alert("ไม่สามารถขอลางานได้: " + (err.message || JSON.stringify(err)));
    }
  };

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const resetToCurrentMonth = () => setCurrentDate(new Date());

  const openLeaveModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setLeaveModalOpen(true);
  };

  return {
    loading,
    shifts,
    closures,
    leaves,
    appointments,
    weeklyOffDays,
    currentDate,
    setCurrentDate,
    prevMonth,
    nextMonth,
    resetToCurrentMonth,
    showSchedule,
    setShowSchedule,
    leaveModalOpen,
    setLeaveModalOpen,
    selectedDate,
    leaveType,
    setLeaveType,
    leaveReason,
    setLeaveReason,
    handleAddLeave,
    openLeaveModal,
  };
}

