import { useState, useEffect } from "react";
import { Appointment, DentistInfo, ServiceInfo } from "@/app/shared/data";
import {
  getDentists,
  getServices,
  addAppointment,
  getClinicTimeSlots,
  getClinicClosures,
  getWeeklyOffDays,
  getDoctorSchedules,
  getUpcomingLeaves,
  getPatients,
} from "@/app/shared/supabaseApi";

export interface BookingForm {
  service: string;
  doctorId: number;
  date: string;
  time: string;
  note: string;
  openAppt: boolean;
}

export function useWalkInBooking(onAddAppt?: (appt: Appointment) => void) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingForm>({
    service: "",
    doctorId: 0,
    date: "",
    time: "",
    note: "",
    openAppt: false,
  });
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchError, setSearchError] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [closures, setClosures] = useState<any[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<any[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);

  const [monthOffset, setMonthOffset] = useState(0);
  const [timeSlots, setTimeSlots] = useState<
    { time: string; status: string; canBook: boolean }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    Promise.all([
      getDentists(),
      getServices(),
      getClinicClosures(),
      getWeeklyOffDays(),
      getDoctorSchedules(),
      getUpcomingLeaves(),
      getPatients(),
    ])
      .then(([d, s, cData, offData, dsData, leavesData, patData]) => {
        setDentists(d.filter((x) => x.active));
        setServices(s.filter((x) => x.active));
        setClosures(cData);
        setWeeklyOffDays(offData);
        setDoctorSchedules(dsData);
        setUpcomingLeaves(leavesData);
        setAllPatients(patData);
      })
      .catch(console.error);
  }, []);

  const getEstMins = (serviceName: string) => {
    if (serviceName.includes("จัดฟัน") || serviceName.includes("รากฟันเทียม")) return 60;
    if (serviceName.includes("ฟอกสีฟัน") || serviceName.includes("รักษารากฟัน")) return 45;
    return 30;
  };

  const estMins = form.service ? getEstMins(form.service) : 30;
  const reqSlots = Math.ceil(estMins / 30);

  const selectedServiceId = services.find((s) => s.name === form.service)?.id;
  const matchedDentists = selectedServiceId
    ? dentists.filter((d) => d.serviceIds?.includes(selectedServiceId))
    : dentists;
  // ถ้าบริการนี้ยังไม่ได้ผูกกับหมอคนใด ให้แสดงหมอทั้งหมด
  const filteredDentists = matchedDentists.length > 0 ? matchedDentists : dentists;

  useEffect(() => {
    if (step === 1 && form.date && !form.openAppt) {
      setLoadingSlots(true);
      getClinicTimeSlots(form.date, selectedServiceId, form.doctorId || undefined)
        .then((slots) => {
          const processed = slots.map((slot, i) => {
            if (slot.status !== "available") return { ...slot, canBook: false };
            let canBook = true;
            for (let j = 0; j < reqSlots; j++) {
              if (i + j >= slots.length || slots[i + j].status !== "available") {
                canBook = false;
                break;
              }
            }
            return { ...slot, canBook };
          });
          setTimeSlots(processed);
        })
        .catch(console.error)
        .finally(() => setLoadingSlots(false));
    }
  }, [step, form.date, form.doctorId, form.openAppt, selectedServiceId, reqSlots]);

  const handleServiceChange = (serviceName: string) => {
    setForm((f) => {
      const newForm = { ...f, service: serviceName };
      const sId = services.find((s) => s.name === serviceName)?.id;
      if (sId && f.doctorId) {
        const hasMappedDoctor = dentists.some((d) => d.serviceIds?.includes(sId));
        const doc = dentists.find((d) => d.id === f.doctorId);
        if (hasMappedDoctor && doc && !doc.serviceIds?.includes(sId)) {
          newForm.doctorId = 0;
        }
      }
      return newForm;
    });
  };

  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const todayN = today.getDate();
  const isCurrentMonth = monthOffset === 0;

  const dayStatus = (d: number) => {
    if (isCurrentMonth && d < todayN) return { status: "past" as const };
    if (monthOffset < 0) return { status: "past" as const };
    const dateObj = new Date(year, month, d);
    const dayOfWk = dateObj.getDay();
    if (weeklyOffDays.includes(dayOfWk))
      return { status: "past" as const, reason: "วันหยุดประจำสัปดาห์" };
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const closure = closures.find((c) => c.date === dateStr);
    if (closure) return { status: "past" as const, reason: closure.reason };

    if (form.doctorId > 0) {
      const selDocData = dentists.find((fd) => fd.id === form.doctorId);
      const shift = doctorSchedules.find(
        (s) => s.dentistId === form.doctorId && s.dayOfWeek === dayOfWk
      );
      const isFullLeave = selDocData
        ? upcomingLeaves.some((l) => {
            if (l.leave_date !== dateStr || l.leave_period !== "เต็มวัน") return false;
            const matchUser = Boolean(l.user_id && selDocData.userId && l.user_id === selDocData.userId);
            const matchStaff = Boolean(l.staff_id && selDocData.staffId && l.staff_id === selDocData.staffId);
            return matchUser || matchStaff;
          })
        : false;

      if (shift && shift.isOff) {
        return { status: "past" as const, reason: "แพทย์ไม่เข้าตรวจ/ลา" };
      } else if (isFullLeave) {
        return { status: "past" as const, reason: "แพทย์ไม่เข้าตรวจ/ลา" };
      }
    }
    return { status: "available" as const };
  };

  useEffect(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      setPatientResults([]);
      setSearchError("");
      if (patientInfo) setPatientInfo(null);
      return;
    }

    const filtered = allPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.hn.toLowerCase().includes(keyword) ||
        (p.phone && p.phone.includes(keyword)) ||
        (p.email && p.email.toLowerCase().includes(keyword)) ||
        (p.citizenId && p.citizenId.includes(keyword))
    );

    setPatientResults(filtered);
    if (filtered.length === 0 && !patientInfo) {
      setSearchError(
        "ไม่พบข้อมูลคนไข้ในระบบ กรุณาตรวจสอบอีกครั้ง หรือไปที่เมนูลงทะเบียนคนไข้ใหม่"
      );
    } else {
      setSearchError("");
    }
  }, [searchKeyword, allPatients]);

  const confirm = async () => {
    const doctorName =
      dentists.find((d) => d.id === form.doctorId)?.name ?? "ท่านใดก็ได้";
    const newAppt: Omit<Appointment, "id"> = {
      hn: patientInfo?.hn || `HN${Date.now().toString().slice(-3)}`,
      patientId: patientInfo?.id,
      patientName: patientInfo?.name || "Unknown",
      patientPhone: patientInfo?.phone || "",
      service: form.service,
      doctorName,
      doctorId: form.doctorId,
      date: form.openAppt ? "" : form.date,
      time: form.openAppt ? "" : form.time,
      status: form.openAppt ? "ยืนยันการจอง" : "เช็คอินเรียบร้อย",
      conditions: patientInfo?.underlyingDisease || "ไม่มี",
      allergies: patientInfo?.allergyHistory || "ไม่มี",
      note: form.note,
    };
    setIsSubmitting(true);
    try {
      const added = await addAppointment(newAppt);
      if (onAddAppt) {
        onAddAppt({ ...newAppt, id: added.appointment_id.toString() });
      }
      setDone(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setStep(0);
    setForm({
      service: "",
      doctorId: 0,
      date: "",
      time: "",
      note: "",
      openAppt: false,
    });
    setPatientInfo(null);
    setPatientResults([]);
    setSearchKeyword("");
    setDone(false);
  };

  return {
    step,
    setStep,
    form,
    setForm,
    handleServiceChange,
    patientResults,
    patientInfo,
    setPatientInfo,
    searchKeyword,
    setSearchKeyword,
    searchError,
    dentists,
    filteredDentists,
    services,
    estMins,
    monthOffset,
    setMonthOffset,
    targetDate,
    year,
    month,
    daysInMonth,
    firstDow,
    dayStatus,
    timeSlots,
    loadingSlots,
    confirm,
    isSubmitting,
    done,
    resetAll,
  };
}

