import { useState, useEffect } from "react";
import { Shift, SpecialClosure, LeaveRequest, StaffInfo } from "@/app/shared/data";
import {
  getShifts,
  getClinicClosures,
  getLeaveRequests,
  addLeaveRequest,
  getWeeklyOffDays,
} from "@/app/shared/supabaseApi";

export function useStaffLeave(staff?: StaffInfo | null) {
  const staffUserId = (staff as any)?.userId || staff?.id?.toString();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSchedule, setShowSchedule] = useState(true);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [leaveType, setLeaveType] = useState<"ลาป่วย" | "ลากิจ" | "ลาพักร้อน">("ลาป่วย");
  const [leaveReason, setLeaveReason] = useState("");

  useEffect(() => {
    if (staffUserId) fetchData();
    else setLoading(false);
  }, [staffUserId]);

  const fetchData = async () => {
    if (!staffUserId) return;
    try {
      const [sData, cData, lData, offDays] = await Promise.all([
        getShifts(),
        getClinicClosures(),
        getLeaveRequests(),
        getWeeklyOffDays(),
      ]);
      setShifts(sData.filter((s) => s.person_id === staff?.id && s.person_type === "staff"));
      setClosures(cData);
      setLeaves(
        lData.filter(
          (l: any) =>
            (staff?.userId && l.userId === staff.userId) ||
            (staff?.id && (l.staffId === staff.id || l.doctorId === staff.id || String(l.staffId) === String(staff.id))) ||
            (staffUserId && (l.doctorId === staffUserId || l.userId === staffUserId || String(l.doctorId) === String(staffUserId)))
        )
      );
      setWeeklyOffDays(offDays);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUserId || !selectedDate) return;

    if (!leaveReason.trim()) {
      alert("กรุณาระบุเหตุผลการลา");
      return;
    }

    try {
      const added = await addLeaveRequest({
        doctorId: staffUserId,
        startDate: selectedDate,
        endDate: selectedDate,
        leaveType: leaveType,
        reason: leaveReason.trim(),
        status: "รออนุมัติ",
      });
      setLeaves([
        ...leaves,
        {
          id: added?.leave_id || Date.now(),
          doctorId: staffUserId,
          doctorName: staff?.name || "",
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

