import { useState, useEffect } from "react";
import { getAppointmentBreakdown } from "@/app/shared/data";
import { getLeaveRequests, getDoctorSchedules } from "@/app/shared/supabaseApi";
import { useRealtimeAppointments } from "@/app/shared/useRealtimeAppointments";

export type Timeframe = "today" | "week" | "month";

/** ดึงวันที่ "ปัจจุบัน" โดยรองรับ Time Travel mock datetime จาก localStorage */
function getNow(): Date {
  const mockDatetime = localStorage.getItem("supat_mock_date");
  if (mockDatetime) {
    const parsed = new Date(mockDatetime);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export function useDashboardData() {
  const { appointments, loading: apptsLoading } = useRealtimeAppointments();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApptModal, setShowApptModal] = useState(false);

  const [timeframe, setTimeframe] = useState<Timeframe>("today");
  const [selectedDate, setSelectedDate] = useState<Date>(getNow);

  useEffect(() => {
    Promise.all([
      getLeaveRequests(),
      getDoctorSchedules()
    ]).then(([lvs, scheds]) => {
      setLeaves(lvs);
      setDoctorSchedules(scheds);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const syncDate = () => setSelectedDate(getNow());
    window.addEventListener("storage", (e) => {
      if (e.key === "supat_mock_date") syncDate();
    });
    return () => {
      window.removeEventListener("storage", syncDate);
    };
  }, []);

  const getLocalDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const targetDateStr = getLocalDateStr(selectedDate);

  // กรองนัดหมายตามช่วงเวลาที่เลือก
  const filteredAppts = appointments.filter(a => {
    if (!a?.date) return false;
    if (timeframe === "today") return a.date === targetDateStr;
    if (timeframe === "week") {
      const targetTime = selectedDate.getTime();
      const pastWeek = new Date(selectedDate);
      pastWeek.setDate(pastWeek.getDate() - 7);
      const apptTime = new Date(a.date).getTime();
      return !isNaN(apptTime) && apptTime <= targetTime && apptTime >= pastWeek.getTime();
    }
    if (timeframe === "month") {
      const [y, m] = a.date.split('-');
      return parseInt(y) === selectedDate.getFullYear() && parseInt(m) === (selectedDate.getMonth() + 1);
    }
    return false;
  });

  // รายได้รวม
  const revenue = filteredAppts
    .filter(a => ["เสร็จสิ้น"].includes(a.status))
    .reduce((sum, a) => sum + (a.cost ?? 0), 0);

  // คำนวณจำนวนแพทย์ที่ออกตรวจ
  const currentDayOfWeek = selectedDate.getDay();
  const dentistsOnShift = doctorSchedules.filter(s => (s.dayOfWeek === currentDayOfWeek || s.day_of_week === currentDayOfWeek) && !s.isOff && !s.is_off);
  const onDutyDentistsCnt = dentistsOnShift.filter(s => {
    const hasApprovedLeave = leaves.some(l =>
      (
        (l.staffId && s.staffId && l.staffId === s.staffId) ||
        (l.doctorId && s.dentistId && l.doctorId === s.dentistId) ||
        (l.doctorId && s.userId && l.doctorId === s.userId)
      ) &&
      l.status === "อนุมัติแล้ว" &&
      l.startDate <= targetDateStr &&
      l.endDate >= targetDateStr
    );
    return !hasApprovedLeave;
  }).length;

  const pendingLeavesCount = leaves.filter(l => l.status === "รออนุมัติ").length;

  // ข้อมูลสำหรับกราฟ
  const chartData = timeframe === "today"
    ? Array.from({ length: 11 }).map((_, i) => {
      const hour = i + 9;
      const hStr = `${hour.toString().padStart(2, '0')}:00`;
      const hourAppts = filteredAppts.filter(a => a.time && parseInt(a.time.split(':')[0]) === hour);
      const hourRev = hourAppts.filter(a => a.status === "เสร็จสิ้น").reduce((s, a) => s + (a.cost ?? 0), 0);
      return { day: hStr, appts: hourAppts.length, revenue: hourRev };
    })
    : timeframe === "month"
      ? (() => {
        const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
        return Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const dayLabel = `${dayNum}`;
          const dayAppts = appointments.filter(a => a.date === dStr);
          const dayRev = dayAppts.filter(a => ["เสร็จสิ้น"].includes(a.status)).reduce((s, a) => s + (a.cost ?? 0), 0);
          return { day: dayLabel, appts: dayAppts.length, revenue: dayRev, fullDate: dStr };
        });
      })()
      : Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - (7 - 1 - i));
        const dStr = getLocalDateStr(d);
        const dayLabel = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
        const dayAppts = appointments.filter(a => a.date === dStr);
        const dayRev = dayAppts.filter(a => a.status === "เสร็จสิ้น").reduce((s, a) => s + (a.cost ?? 0), 0);
        return { day: dayLabel, appts: dayAppts.length, revenue: dayRev, fullDate: dStr };
      });

  const handleChartClick = (data: any) => {
    if (timeframe !== "today" && data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload;
      if (payload.fullDate) {
        setSelectedDate(new Date(payload.fullDate));
        setTimeframe("today");
      }
    }
  };

  const breakdown = getAppointmentBreakdown(filteredAppts);
  const activeOrtho = appointments.filter(
    a => (a.service?.includes("จัดฟัน") || a.service?.includes("รากเทียม")) && !["ยกเลิก", "เสร็จสิ้น"].includes(a.status)
  ).length;

  return {
    appointments,
    apptsLoading,
    loading,
    selectedDate,
    setSelectedDate,
    targetDateStr,
    timeframe,
    setTimeframe,
    filteredAppts,
    revenue,
    onDutyDentistsCnt,
    pendingLeavesCount,
    chartData,
    handleChartClick,
    breakdown,
    activeOrtho,
    showApptModal,
    setShowApptModal,
  };
}

