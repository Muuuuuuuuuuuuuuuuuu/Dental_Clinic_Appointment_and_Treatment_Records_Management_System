import { useState, useEffect } from "react";
import { Appointment, DentistInfo } from "@/app/shared/data";
import { getAppointments, getDailyHours, getWeeklyOffDays, DayHours } from "@/app/shared/supabaseApi";

export function useDoctorDashboard(
  doctor: DentistInfo | null,
  initialAppointments?: Appointment[]
) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
  const [loading, setLoading] = useState(true);
  const [dailyHours, setDailyHours] = useState<Record<string, DayHours>>({});
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([]);

  useEffect(() => {
    if (initialAppointments) {
      setAppointments(initialAppointments);
    }
  }, [initialAppointments]);

  useEffect(() => {
    if (!initialAppointments) {
      getAppointments()
        .then(setAppointments)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    Promise.all([
      getDailyHours().then(setDailyHours),
      getWeeklyOffDays().then(setWeeklyOffDays),
    ]).catch(console.error);
  }, [initialAppointments]);

  const mockDatetime = localStorage.getItem("supat_mock_date");
  const today = mockDatetime ? new Date(mockDatetime) : new Date();

  // คำนวณวันที่ใน timezone ไทย (UTC+7)
  const todayString = today.toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });
  const formattedDate = today.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Bangkok",
  });

  const myAppts = appointments.filter(
    (a) => a.doctorId === doctor?.id && a.date === todayString
  );
  const waiting = myAppts.filter(
    (a) => a.status === "เช็คอินเรียบร้อย" || a.status === "กำลังรักษา"
  ).length;
  const pending = myAppts.filter((a) => a.status === "รอชำระเงิน").length;
  const done = myAppts.filter((a) => a.status === "เสร็จสิ้น").length;

  const todayDayIdx = today.getDay();
  const isOffToday = weeklyOffDays.includes(todayDayIdx);
  const todayHrs = dailyHours[todayDayIdx.toString()];
  const todayText = isOffToday || !todayHrs ? "คลินิกปิดทำการ" : `เวลาทำการ ${todayHrs.open}–${todayHrs.close} น.`;

  return {
    appointments,
    loading,
    formattedDate,
    todayText,
    myAppts,
    waiting,
    pending,
    done,
  };
}

