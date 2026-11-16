import { useState, useEffect } from "react";
import { Appointment, DentistInfo, Shift } from "@/app/shared/data";
import { getAppointments, getDailyHours, getWeeklyOffDays, getShifts, DayHours } from "@/app/shared/supabaseApi";

export function useDoctorDashboard(
  doctor: DentistInfo | null,
  initialAppointments?: Appointment[]
) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
  const [loading, setLoading] = useState(true);
  const [dailyHours, setDailyHours] = useState<Record<string, DayHours>>({});
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

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
      getShifts().then(setShifts),
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

  // หาตารางเวรออกตรวจจริงของหมอคนนี้ในวันนี้
  const myShiftToday = shifts.find(
    (s) =>
      s.person_type === "dentist" &&
      (s.person_id === doctor?.id || (doctor?.userId && s.userId === doctor.userId)) &&
      s.day_of_week === todayDayIdx
  );

  let dutyStartTime = todayHrs?.open || "09:00";
  let dutyEndTime = todayHrs?.close || (todayDayIdx === 6 ? "18:00" : "20:00");
  let isDoctorOff = isOffToday;

  if (myShiftToday) {
    if (myShiftToday.is_off) {
      isDoctorOff = true;
    } else {
      isDoctorOff = false;
      if (myShiftToday.start_time) dutyStartTime = myShiftToday.start_time.slice(0, 5);
      if (myShiftToday.end_time) dutyEndTime = myShiftToday.end_time.slice(0, 5);

      // กะเวรออกตรวจจริงต้องไม่เกินเวลาปิดทำการของคลินิกในวันนั้น (เช่น วันเสาร์คลินิกปิด 18:00 น.)
      if (todayHrs?.close && dutyEndTime > todayHrs.close) {
        dutyEndTime = todayHrs.close;
      }
    }
  }

  return {
    appointments,
    loading,
    formattedDate,
    todayText,
    myAppts,
    waiting,
    pending,
    done,
    dutyStartTime,
    dutyEndTime,
    isDoctorOff,
  };
}

