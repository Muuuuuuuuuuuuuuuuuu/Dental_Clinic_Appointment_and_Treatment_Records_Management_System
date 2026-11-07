import { useState, useEffect } from "react";
import { Appointment, SpecialClosure, LeaveRequest, Shift } from "@/app/shared/data";
import {
  getClinicClosures,
  updateAppointmentStatus,
  getDentists,
  getLeaveRequests,
  getShifts,
  getWeeklyOffDays,
} from "@/app/shared/supabaseApi";
import { useRealtimeAppointments } from "@/app/shared/useRealtimeAppointments";

export type ViewMode = "daily" | "weekly" | "monthly";

/** ดึงวันที่ "ปัจจุบัน" โดยรองรับ Time Travel mock datetime จาก localStorage */
export function getNow(): Date {
  const mockDatetime = localStorage.getItem("supat_mock_date");
  if (mockDatetime) {
    const parsed = new Date(mockDatetime);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const thaiDay = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
export const thaiDayShort = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
export const thaiMonth = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function getMonday(d: Date) {
  const r = new Date(d);
  const day = r.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + diff);
  return r;
}

export function useQueueData() {
  const { appointments, refetch: fetchAppointments, setAppointments } = useRealtimeAppointments();
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [weeklyOffs, setWeeklyOffs] = useState<number[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [selectedDate, setSelectedDate] = useState<Date>(getNow);

  useEffect(() => {
    Promise.all([
      getClinicClosures(),
      getDentists(),
      getLeaveRequests(),
      getShifts(),
      getWeeklyOffDays(),
    ])
      .then(([cls, dents, lvs, shfts, wOffs]) => {
        setClosures(cls);
        setDentists(dents);
        setLeaves(lvs);
        setShifts(shfts);
        setWeeklyOffs(wOffs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateAppt = async (id: number, updates: Partial<Appointment>) => {
    try {
      if (updates.status) {
        const updated = await updateAppointmentStatus(id, updates.status);
        setAppointments((apps) =>
          apps.map((a) => (a.id === id ? { ...a, status: updated.status } : a))
        );
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
      fetchAppointments();
    }
  };

  return {
    appointments,
    closures,
    weeklyOffs,
    dentists,
    leaves,
    shifts,
    loading,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    handleUpdateAppt,
  };
}

