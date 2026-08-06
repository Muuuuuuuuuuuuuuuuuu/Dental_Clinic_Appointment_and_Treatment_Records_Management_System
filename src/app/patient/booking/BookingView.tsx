import React, { useState, useEffect } from "react";
import {
  ChevronLeft, Check, ChevronRight, CheckCircle,
  ArrowRight, UserPlus, FileText, Clock, Info,
} from "lucide-react";

import { View, PatientUser } from "../types";
import {
  addAppointment, getClinicClosures, getLeaveRequests, getDentists,
  getLandingServices, getLandingDoctors, getDentistsByService,
  getAppointments, getPaymentPlans, getWeeklyOffDays, getShifts,
} from "../../shared/supabaseApi";
import { SpecialClosure, LeaveRequest, DentistInfo, Appointment, Shift } from "../../shared/data";
import { Smile, Sparkles, Shield, Award, Heart, Calendar, Zap, Scissors, Crown, Layers, Star } from "lucide-react";

const iconMap: Record<string, any> = { Smile, Sparkles, Shield, Award, Heart, Calendar, Zap, Scissors, Crown, Layers, Star };

// ─────────────────────────────────────────────────────────────────────────────
// Service detail static data
// ─────────────────────────────────────────────────────────────────────────────
interface ServiceDetail {
  why: string;
  benefits: string[];
  pros: string[];
  cons: string[];
  symptoms: string[];
  afterCare: string[];
}

const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  "ตรวจฟันและขูดหินปูน": {
    why: "ฟันและเหงือกสะสมคราบหินปูนและแบคทีเรียได้ตลอดเวลา การตรวจและขูดหินปูนช่วยป้องกันโรคเหงือกและฟันผุก่อนที่จะลุกลาม",
    benefits: ["ป้องกันโรคปริทันต์", "ตรวจพบปัญหาในระยะเริ่มต้น", "ลมหายใจสดชื่นขึ้น", "ฟันขาวสะอาดขึ้น"],
    pros: ["ไม่เจ็บปวด หรือเจ็บเล็กน้อย", "ทำเสร็จ 30–60 นาที", "ป้องกันค่าใช้จ่ายในอนาคต"],
    cons: ["อาจเสียวฟันเล็กน้อย 1–2 วัน", "เหงือกอาจบวมชั่วคราว"],
    symptoms: ["เหงือกบวม แดง มีเลือดออก", "มีหินปูนสะสม", "ปากมีกลิ่น"],
    afterCare: ["หลีกเลี่ยงอาหารร้อน/เย็น 24 ชั่วโมงแรก", "แปรงฟันเบาๆ และใช้ไหมขัดฟัน"],
  },
  "ฟอกสีฟัน": {
    why: "ฟันเปลี่ยนสีจากชา กาแฟ และอายุ การฟอกสีฟันช่วยคืนความขาวสว่างอย่างปลอดภัย",
    benefits: ["ฟันขาวสว่างขึ้น 5–8 เฉด", "เสริมความมั่นใจ", "ผลอยู่ได้ 1–2 ปี"],
    pros: ["ปลอดภัยได้มาตรฐาน", "ทำเสร็จในนัดเดียว"],
    cons: ["เสียวฟัน 1–3 วัน", "ต้องงดอาหารสีเข้ม 48 ชั่วโมง"],
    symptoms: ["ฟันเหลือง ทึบ จากชา กาแฟ บุหรี่"],
    afterCare: ["งดชา กาแฟ ไวน์แดง 48 ชั่วโมง", "ใช้ยาสีฟันสำหรับฟันเสียว"],
  },
  "จัดฟันแบบโลหะ": {
    why: "ฟันซ้อนเกหรือสบฟันผิดปกติส่งผลต่อการเคี้ยว การพูด และความสวยงาม การจัดฟันแบบโลหะมีประสิทธิภาพสูงและราคาจับต้องได้",
    benefits: ["แก้ไขฟันซ้อนเก ฟันห่าง ฟันยื่น", "ปรับการสบฟัน", "ดูแลสุขภาพช่องปากง่ายขึ้น"],
    pros: ["ประสิทธิภาพสูง รักษาได้ทุกกรณี", "ราคาเข้าถึงได้", "ทนทาน"],
    cons: ["มองเห็นได้ชัดเจน", "ดูแลทำความสะอาดพิเศษ", "ใช้เวลา 1.5–3 ปี"],
    symptoms: ["ฟันซ้อนเก ฟันห่าง ฟันยื่น", "การสบฟันผิดปกติ"],
    afterCare: ["แปรงฟันหลังทุกมื้ออาหาร", "ใช้แปรงซอกฟัน", "งดอาหารแข็ง/เหนียว"],
  },
  "จัดฟันแบบเซรามิก": {
    why: "สำหรับผู้ต้องการจัดฟันแต่อยากให้ดูเป็นธรรมชาติ เซรามิกมีสีใกล้เคียงฟันจริง",
    benefits: ["สวยงามกว่าโลหะ", "ประสิทธิภาพเทียบเท่าโลหะ"],
    pros: ["สีใกล้เคียงธรรมชาติ"],
    cons: ["ราคาสูงกว่าโลหะ", "อาจเปลี่ยนสีถ้าดูแลไม่ดี"],
    symptoms: ["ต้องการจัดฟันแต่ไม่อยากให้เห็น bracket ชัด"],
    afterCare: ["หลีกเลี่ยงเครื่องดื่มสีเข้ม", "แปรงฟันสม่ำเสมอ"],
  },
  "จัดฟันแบบใส (Invisalign)": {
    why: "เทคโนโลยีใหม่ที่ใช้ถาดใสพลาสติกพิเศษ ถอดได้ เหมาะสำหรับผู้ใหญ่ที่ต้องการความสะดวกและสวยงาม",
    benefits: ["มองไม่เห็น", "ถอดออกได้ตอนทานอาหาร", "เจ็บน้อยกว่าเหล็ก"],
    pros: ["สวยงามที่สุด", "ไม่มีข้อห้ามอาหาร"],
    cons: ["ราคาสูงสุด", "ต้องใส่ 20–22 ชั่วโมงต่อวัน"],
    symptoms: ["ต้องการจัดฟันแบบไม่เห็น ฟันซ้อนเก/ห่าง ปานกลาง"],
    afterCare: ["ใส่ถาดให้ครบเวลา", "แปรงฟันและทำความสะอาดถาดก่อนใส่"],
  },
  "รากฟันเทียม (Implant)": {
    why: "เมื่อสูญเสียฟันแท้ รากฟันเทียมคือการทดแทนที่ใกล้เคียงฟันธรรมชาติที่สุด โดยฝังรากไทเทเนียมลงในกระดูกขากรรไกร",
    benefits: ["ทนทาน 15–25 ปี", "ป้องกันกระดูกยุบ", "ใช้งานเหมือนฟันจริง"],
    pros: ["แข็งแรงที่สุด ไม่กระทบฟันข้างเคียง"],
    cons: ["ราคาสูง", "ต้องผ่าตัด ใช้เวลา 3–6 เดือน"],
    symptoms: ["สูญเสียฟันแท้ ต้องการทดแทนถาวร"],
    afterCare: ["งดอาหารแข็ง 2 สัปดาห์", "แปรงฟันอ่อนๆ รอบรากฟัน"],
  },
  "อุดฟัน / ถอนฟัน": {
    why: "ฟันผุที่ไม่รักษาจะลุกลามเข้าโพรงประสาท การอุดฟันเนิ่นๆ ช่วยหยุดการทำลายและรักษาฟันไว้",
    benefits: ["หยุดฟันผุไม่ให้ลุกลาม", "บรรเทาอาการปวด", "รักษาฟันแท้ให้อยู่นานขึ้น"],
    pros: ["รวดเร็ว ทำเสร็จในนัดเดียว", "ราคาไม่แพง"],
    cons: ["วัสดุอุดอาจสึกหรอ", "การถอนฟันทำให้ฟันข้างเคียงเอียงได้"],
    symptoms: ["ปวดฟัน เสียวฟัน มีรูหรือสีดำบนฟัน"],
    afterCare: ["งดทานที่ซี่อุด 1–2 ชั่วโมง", "กินยาแก้ปวดตามที่แพทย์สั่ง"],
  },
  "กันตกรรมเด็ก": {
    why: "ฟันน้ำนมสำคัญต่อพัฒนาการเคี้ยว การพูด และทิศทางฟันแท้ การดูแลตั้งแต่เนิ่นๆ ป้องกันปัญหาระยะยาว",
    benefits: ["ป้องกันฟันผุในเด็ก", "สร้างนิสัยดูแลฟัน", "ป้องกันฟันแท้ขึ้นผิดตำแหน่ง"],
    pros: ["แพทย์ชำนาญด้านเด็ก อุปกรณ์เหมาะกับขนาดปาก"],
    cons: ["เด็กเล็กอาจให้ความร่วมมือน้อย"],
    symptoms: ["ฟันน้ำนมผุ เด็กบ่นปวดฟัน"],
    afterCare: ["แปรงฟัน 2 ครั้งต่อวัน", "ลดขนมหวาน มาตรวจทุก 6 เดือน"],
  },
  "รักษารากฟัน (Root Canal)": {
    why: "เมื่อฟันผุลุกลามถึงโพรงประสาท การรักษารากฟันช่วยเอาเนื้อเยื่อติดเชื้อออกและรักษาฟันไว้",
    benefits: ["รักษาฟันแท้ไม่ต้องถอน", "บรรเทาปวดถาวร", "ป้องกันการติดเชื้อลุกลาม"],
    pros: ["หยุดปวดได้เด็ดขาด"],
    cons: ["ใช้เวลา 2–3 นัด", "ต้องทำครอบฟันภายหลัง"],
    symptoms: ["ปวดฟันรุนแรงกลางคืน", "เหงือกบวมหรือเป็นตุ่มหนอง", "ฟันดำ"],
    afterCare: ["กินยาครบตามที่สั่ง", "หลีกเลี่ยงเคี้ยวด้านที่รักษา", "กลับมาทำครอบฟันตามนัด"],
  },
};

const DEFAULT_SERVICE_DETAIL: ServiceDetail = {
  why: "บริการนี้ออกแบบมาเพื่อดูแลสุขภาพช่องปากของคุณอย่างครบถ้วนโดยทันตแพทย์ผู้เชี่ยวชาญ",
  benefits: ["ดูแลสุขภาพช่องปากครบถ้วน", "ป้องกันปัญหาระยะยาว"],
  pros: ["ปลอดภัยและได้มาตรฐาน"],
  cons: ["ควรปรึกษาทันตแพทย์ก่อนเพื่อรับข้อมูลเพิ่มเติม"],
  symptoms: ["มีปัญหาช่องปากที่ต้องการดูแล"],
  afterCare: ["ปฏิบัติตามคำแนะนำของทันตแพทย์"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Reusable section card (always expanded, no toggle)
// ─────────────────────────────────────────────────────────────────────────────
const DetailCard = ({ emoji, title, accent, children }: { emoji: string; title: string; accent: string; children: React.ReactNode }) => (
  <div style={{ borderRadius: 14, backgroundColor: "white", padding: "14px 16px", boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}>
    <p style={{ fontWeight: 700, fontSize: 12, color: accent, marginBottom: 8 }}>{emoji} {title}</p>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function BookingView({
  setView,
  initialService = null,
  initialDoctor = null,
  isFollowUp = false,
  user,
}: {
  setView: (v: View) => void;
  initialService?: number | null;
  initialDoctor?: number | null;
  isFollowUp?: boolean;
  user: PatientUser | null;
}) {
  const [step, setStep] = useState(isFollowUp ? 1 : 0);
  const [selService, setSelService] = useState<number | null>(initialService);
  const [selDoctor, setSelDoctor] = useState<number | "any" | null>(initialDoctor ?? "any");
  const [wantSelectDoctor, setWantSelectDoctor] = useState(false);
  const [matchedDoctor, setMatchedDoctor] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [selDay, setSelDay] = useState<number | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [dentistsData, setDentistsData] = useState<DentistInfo[]>([]);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [landingDoctors, setLandingDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [selPaymentPlan, setSelPaymentPlan] = useState<number | null>(null);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    Promise.all([
      getClinicClosures(), getLeaveRequests(), getDentists(),
      getLandingServices(), getLandingDoctors(), getAppointments(), getWeeklyOffDays(), getShifts()
    ]).then(([cData, lData, dData, sData, ldData, apptData, offData, shData]) => {
      setClosures(cData);
      setLeaves(lData.filter((l) => l.status === "อนุมัติแล้ว"));
      setDentistsData(dData);
      setServicesData(sData);
      setLandingDoctors(ldData);
      setAppointments(apptData.filter((a) => a.status !== "ยกเลิก"));
      setWeeklyOffDays(offData);
      setShifts(shData);
    });
  }, []);

  useEffect(() => {
    if (step === 1 && selService !== null && servicesData[selService]) {
      const sid = servicesData[selService].serviceId;
      setLoadingDoctors(true);
      (sid ? getDentistsByService(sid) : Promise.resolve(landingDoctors))
        .then((docs) => { setFilteredDoctors(docs); setLoadingDoctors(false); })
        .catch(() => { setFilteredDoctors(landingDoctors); setLoadingDoctors(false); });
    }
  }, [step, selService, servicesData]);

  useEffect(() => {
    if (selService === null || !servicesData[selService]) { setPaymentPlans([]); setSelPaymentPlan(null); return; }
    getPaymentPlans(servicesData[selService].serviceId).then(setPaymentPlans).catch(() => setPaymentPlans([]));
  }, [selService, servicesData]);

  useEffect(() => {
    if (step === 1) {
      getAppointments().then((a) => setAppointments(a.filter((x) => x.status !== "ยกเลิก")));
    }
  }, [step, selDay]);

  // ─── Shift helpers ──────────────────────────────────────────────────────────
  /** ตรวจว่าหมอมีเวรในวันที่ระบุหรือไม่ */
  const isDoctorOnShift = (doctorId: number, dateObj: Date): boolean => {
    const dow = dateObj.getDay();
    const shift = shifts.find(
      (s) => s.person_type === "dentist" && s.person_id === doctorId && s.day_of_week === dow
    );
    // ไม่มี record หรือ is_off → ไม่มีเวร
    if (!shift || shift.is_off) return false;
    return true;
  };

  /** ตรวจว่า time slot อยู่ในช่วงเวรของหมอหรือไม่ */
  const isTimeInShift = (doctorId: number, dateObj: Date, timeStr: string): boolean => {
    const dow = dateObj.getDay();
    const shift = shifts.find(
      (s) => s.person_type === "dentist" && s.person_id === doctorId && s.day_of_week === dow
    );
    if (!shift || shift.is_off) return false;
    // ถ้าไม่ได้กำหนดเวลาเวร (null) → ถือว่าทำงานทั้งวัน
    if (!shift.start_time && !shift.end_time) return true;
    const shiftStart = shift.start_time?.substring(0, 5) || "00:00";
    const shiftEnd = shift.end_time?.substring(0, 5) || "23:59";
    return timeStr >= shiftStart && timeStr < shiftEnd;
  };

  // Calendar helpers
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
    if (weeklyOffDays.includes(dateObj.getDay())) return { status: "past" as const };

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const closure = closures.find((c) => c.date === dateStr);
    if (closure) return { status: "past" as const };

    if (selDoctor !== null && selDoctor !== "any") {
      // ── เลือกหมอเฉพาะคน ──
      // 1) ตรวจว่าหมอมีเวรวันนี้ไหม
      if (!isDoctorOnShift(selDoctor as number, dateObj)) return { status: "past" as const };
      // 2) ตรวจว่าหมอลาเต็มวัน (อนุมัติแล้ว) ไหม
      const docInfo = dentistsData.find((db) => db.id === selDoctor);
      if (docInfo?.userId) {
        const fullLeave = leaves.find((l) => l.doctorId === docInfo.userId && l.startDate === dateStr && l.leavePeriod === "เต็มวัน");
        if (fullLeave) return { status: "past" as const };
      }
    } else if (filteredDoctors.length > 0) {
      // ── ท่านใดก็ได้ ── ต้องมีหมออย่างน้อย 1 คนที่มีเวร + ไม่ได้ลาเต็มวัน
      let anyAvailable = false;
      for (const doc of filteredDoctors) {
        // ไม่มีเวร → ข้ามไป
        if (!isDoctorOnShift(doc.id, dateObj)) continue;
        // ลาเต็มวัน (อนุมัติแล้ว) → ข้ามไป
        const docInfo = dentistsData.find((db) => db.id === doc.id);
        if (docInfo?.userId) {
          const fullLeave = leaves.find((l) => l.doctorId === docInfo.userId && l.startDate === dateStr && l.leavePeriod === "เต็มวัน");
          if (fullLeave) continue;
        }
        anyAvailable = true;
        break;
      }
      if (!anyAvailable) return { status: "past" as const };
    }
    return { status: "available" as const };
  };

  const BASE_TIMES = [
    "09:00","09:30","10:00","10:30","11:00","11:30",
    "13:00","13:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  ];
  const estTime = selService !== null && servicesData[selService] ? servicesData[selService].baseTimeMins : 30;
  const reqSlots = Math.ceil((estTime + 15) / 30);
  const endTimeStr = selTime ? (() => {
    const [h, m] = selTime.split(":").map(Number);
    const tot = h * 60 + m + estTime;
    return `${String(Math.floor(tot / 60)).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`;
  })() : "";

  const processedTimes = BASE_TIMES.map((t) => {
    let blocked = false, booked = false;
    if (selDay) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selDay).padStart(2, "0")}`;
      const slotDateObj = new Date(year, month, selDay);
      const dayAppts = appointments.filter((a) => a.date === dateStr);
      if (selDoctor !== null && selDoctor !== "any") {
        // ── เลือกหมอเฉพาะคน ──
        // ตรวจเวร: ไม่มีเวร หรือ slot อยู่นอกเวลาเวร → blocked
        if (!isTimeInShift(selDoctor as number, slotDateObj, t)) {
          blocked = true;
        }
        // ตรวจการลา (อนุมัติแล้ว)
        const docInfo = dentistsData.find((db) => db.id === selDoctor);
        if (docInfo?.userId) {
          const lv = leaves.filter((l) => l.doctorId === docInfo.userId && l.startDate === dateStr);
          if (lv.some((l) => l.leavePeriod === "ครึ่งวันเช้า") && t < "13:00") blocked = true;
          if (lv.some((l) => l.leavePeriod === "ครึ่งวันบ่าย") && t >= "13:00") blocked = true;
          if (lv.some((l) => l.leavePeriod === "เต็มวัน")) blocked = true;
        }
        if (dayAppts.some((a) => a.doctorId === (selDoctor as number) && t >= a.time && (a.endTime ? t < a.endTime : a.time.startsWith(t)))) booked = true;
      } else {
        // ── ท่านใดก็ได้ ──
        let anyDocAvailable = false;
        if (filteredDoctors.length > 0) {
          for (const doc of filteredDoctors) {
            const docInfo = dentistsData.find((db) => db.id === doc.id);
            if (!docInfo) continue;
            
            // ตรวจเวร: ไม่มีเวร หรือ slot อยู่นอกเวลาเวร → ข้ามหมอคนนี้
            if (!isTimeInShift(doc.id, slotDateObj, t)) continue;

            // ตรวจการลา (อนุมัติแล้ว)
            let docBlocked = false;
            if (docInfo.userId) {
              const lv = leaves.filter((l) => l.doctorId === docInfo.userId && l.startDate === dateStr);
              if (lv.some((l) => l.leavePeriod === "ครึ่งวันเช้า") && t < "13:00") docBlocked = true;
              if (lv.some((l) => l.leavePeriod === "ครึ่งวันบ่าย") && t >= "13:00") docBlocked = true;
              if (lv.some((l) => l.leavePeriod === "เต็มวัน")) docBlocked = true;
            }
            if (docBlocked) continue;

            const docBooked = dayAppts.some((a) => a.doctorId === doc.id && t >= a.time && (a.endTime ? t < a.endTime : a.time.startsWith(t)));
            if (!docBooked) {
              anyDocAvailable = true;
              break;
            }
          }
        }
        booked = !anyDocAvailable;
      }
    }
    return { t, booked: booked || blocked };
  });

  const availableTimes = processedTimes.map((slot, i) => {
    if (slot.booked) return { ...slot, canBook: false };
    let ok = true;
    for (let j = 0; j < reqSlots; j++) {
      if (i + j >= processedTimes.length || processedTimes[i + j].booked) { ok = false; break; }
    }
    return { ...slot, canBook: ok };
  });

  const canNext = () => step === 0 ? selService !== null : selDay !== null && selTime !== null;

  const handleNext = () => {
    if (!canNext()) return;
    if (step === 0) setStep(1);
    else if (step === 1) setStep(4);
  };

  const handleBack = () => {
    if (step === 4) setStep(1);
    else if (step === 1) setStep(0);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const serviceTitle = servicesData[selService!]?.title || "";
    const requiresApproval = serviceTitle.includes("จัดฟัน") || serviceTitle.includes("รากฟันเทียม") || serviceTitle.includes("ผ่าฟันคุด");
    setIsPending(requiresApproval);
    let finalDoctor = { name: "ไม่ระบุแพทย์", id: 1 };
    if (selDoctor === "any" || selDoctor === null) {
      // กรองเฉพาะหมอที่มีเวร + ไม่ได้ลา + slot ว่าง ในวัน/เวลาที่เลือก
      const bookingDateObj = new Date(year, month, selDay!);
      const bookingDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${selDay?.toString().padStart(2, "0")}`;
      const dayAppts = appointments.filter((a) => a.date === bookingDateStr);
      const availableDocs = filteredDoctors.filter((doc: any) => {
        // ต้องมีเวร
        if (!isDoctorOnShift(doc.id, bookingDateObj)) return false;
        // slot เวลาต้องอยู่ในช่วงเวร
        if (selTime && !isTimeInShift(doc.id, bookingDateObj, selTime)) return false;
        // ต้องไม่ลา (อนุมัติแล้ว)
        const docInfo = dentistsData.find((db) => db.id === doc.id);
        if (docInfo?.userId) {
          const lv = leaves.filter((l) => l.doctorId === docInfo.userId && l.startDate === bookingDateStr);
          if (lv.some((l) => l.leavePeriod === "เต็มวัน")) return false;
          if (lv.some((l) => l.leavePeriod === "ครึ่งวันเช้า") && selTime && selTime < "13:00") return false;
          if (lv.some((l) => l.leavePeriod === "ครึ่งวันบ่าย") && selTime && selTime >= "13:00") return false;
        }
        // slot ต้องไม่ถูกจองโดยหมอคนนี้
        if (selTime && dayAppts.some((a) => a.doctorId === doc.id && selTime >= a.time && (a.endTime ? selTime < a.endTime : a.time.startsWith(selTime)))) return false;
        return true;
      });
      const idx = Math.floor(Math.random() * (availableDocs.length || 1));
      if (availableDocs[idx]) finalDoctor = { name: availableDocs[idx].name, id: availableDocs[idx].id };
      setMatchedDoctor(finalDoctor.id);
    } else {
      const doc = landingDoctors.find((d) => d.id === selDoctor);
      if (doc) finalDoctor = { name: doc.name, id: doc.id };
      setMatchedDoctor(selDoctor as number);
    }
    try {
      await addAppointment({
        patientId: user?.patientId,
        patientName: user ? `${user.firstName} ${user.lastName}` : "ผู้ป่วยทั่วไป",
        hn: user?.idCard?.slice(-6) || "W-000",
        patientPhone: user?.phone || "080-000-0000",
        service: serviceTitle,
        doctorName: finalDoctor.name,
        doctorId: finalDoctor.id,
        date: `${year}-${String(month + 1).padStart(2, "0")}-${selDay?.toString().padStart(2, "0")}`,
        time: selTime || "",
        durationMins: estTime,
        status: requiresApproval ? "รอการยืนยัน" : "ยืนยันการจอง",
        source: "patient", cost: 0, paid: false,
        treatmentNotes: "", treatmentServices: [], recommendations: "",
        allergies: "ไม่มี", conditions: notes || "ไม่มี",
        paymentPlanId: selPaymentPlan || undefined,
      });
      setDone(true);
    } catch (err: any) {
      alert("Failed to book: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Done screen
  if (done) {
    const displayDoc = selDoctor === "any" || selDoctor === null
      ? (landingDoctors.find((d) => d.id === matchedDoctor)?.name || "ไม่ระบุแพทย์")
      : (landingDoctors.find((d) => d.id === selDoctor)?.name || "ไม่ระบุแพทย์");
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: isPending ? "#FFF3E0" : "#E8FFF0" }}>
          {isPending ? <FileText size={36} style={{ color: "#E65100" }} /> : <CheckCircle size={36} style={{ color: "#22C55E" }} />}
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          {isPending ? "ส่งคำขอจองนัดหมายแล้ว" : "จองนัดหมายสำเร็จ!"}
        </h2>
        <p className="text-sm mb-2" style={{ color: "#4A6080" }}>{servicesData[selService!]?.title || ""} กับ {displayDoc}</p>
        <p className="text-sm font-semibold mb-6" style={{ color: "#1A365D" }}>
          วันที่ {selDay} {today.toLocaleDateString("th-TH", { month: "long", year: "numeric" })} เวลา {selTime} - {endTimeStr} น.
        </p>
        {isPending && (
          <p className="text-sm mb-6 px-4 py-3 rounded-xl text-left" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
            บริการนี้เป็นบริการเฉพาะทาง คำขอกำลังรอให้พนักงานยืนยันคิว เราจะแจ้งให้ทราบทาง SMS
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={() => setView("appointments")} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>ดูรายการนัดหมาย</button>
          {!isFollowUp && (
            <button onClick={() => { setStep(0); setSelService(null); setSelDoctor("any"); setWantSelectDoctor(false); setSelDay(null); setSelTime(null); setDone(false); setNotes(""); }}
              className="px-6 py-2.5 rounded-xl text-sm font-medium"
              style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#1A365D" }}>จองอีกครั้ง</button>
          )}
        </div>
      </div>
    );
  }

  const steps = [{ id: 0, label: "บริการ" }, { id: 1, label: "รายละเอียดและนัดหมาย" }, { id: 4, label: "ยืนยัน" }];
  const currentStepIndex = step === 4 ? 2 : step === 1 ? 1 : 0;
  const serviceTitle = selService !== null ? (servicesData[selService]?.title || "") : "";
  const detail: ServiceDetail = SERVICE_DETAILS[serviceTitle] || DEFAULT_SERVICE_DETAIL;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        {step > (isFollowUp ? 1 : 0) && (
          <button onClick={handleBack} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white"
            style={{ color: "#1A365D" }}><ChevronLeft size={18} /></button>
        )}
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จองนัดหมาย</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>
            {step === 0 && "เลือกบริการ"}{step === 1 && "รายละเอียดและเลือกเวลา"}{step === 4 && "ยืนยันการจอง"}
          </p>
        </div>
      </div>

      {/* Step pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: i < currentStepIndex ? "#E8FFF0" : i === currentStepIndex ? "#FF8C9A" : "rgba(26,54,93,0.06)",
                color: i < currentStepIndex ? "#1B7A3E" : i === currentStepIndex ? "white" : "#4A6080",
              }}>
              {i < currentStepIndex ? <Check size={11} /> : <span>{i + 1}</span>}
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={12} style={{ color: "#ccc" }} />}
          </div>
        ))}
      </div>

      {/* ══ STEP 0: Select Service ══ */}
      {step === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicesData.map((s, i) => {
            const Icon = iconMap[s.iconName] || Smile;
            return (
              <button key={i} onClick={() => { setSelService(i); setStep(1); }}
                className="p-5 rounded-2xl text-left"
                style={{ backgroundColor: "white", border: "2px solid transparent", boxShadow: "0 2px 12px rgba(26,54,93,0.06)", transition: "all 0.18s ease" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,140,154,0.2)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,54,93,0.06)")}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.color }}>
                  <Icon size={18} style={{ color: "#1A365D" }} />
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: "#1A365D" }}>{s.title}</p>
                <p className="text-xs" style={{ color: "#4A6080" }}>{s.price}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* ══ STEP 1: Combined (2 columns) ══ */}
      {step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 20, alignItems: "start" }}>

          {/* LEFT: all detail cards, always visible */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Service badge */}
            <div style={{ borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg,#FFF0F2,#FFF8F9)", border: "1px solid rgba(255,140,154,0.25)" }}>
              {(() => { const Icon = iconMap[servicesData[selService!]?.iconName] || Smile; return (
                <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "white", boxShadow: "0 2px 8px rgba(255,140,154,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} style={{ color: "#FF8C9A" }} />
                </div>
              ); })()}
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#1A365D", marginBottom: 2 }}>{serviceTitle}</p>
                <p style={{ fontSize: 12, color: "#FF8C9A" }}>{servicesData[selService!]?.price}</p>
              </div>
            </div>

            <DetailCard emoji="💡" title="ทำไมถึงต้องบริการนี้?" accent="#3B82F6">
              <p style={{ fontSize: 13, color: "#4A6080", lineHeight: 1.7 }}>{detail.why}</p>
            </DetailCard>

            <DetailCard emoji="🦷" title="อาการที่ควรพบทันตแพทย์" accent="#FF8C9A">
              {detail.symptoms.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#4A6080", marginBottom: 4 }}>
                  <span style={{ color: "#FF8C9A", flexShrink: 0 }}>•</span>{s}
                </div>
              ))}
            </DetailCard>

            <DetailCard emoji="✨" title="ประโยชน์ของบริการ" accent="#22C55E">
              {detail.benefits.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#4A6080", marginBottom: 4, alignItems: "flex-start" }}>
                  <CheckCircle size={13} style={{ color: "#22C55E", flexShrink: 0, marginTop: 2 }} />{b}
                </div>
              ))}
            </DetailCard>

            <DetailCard emoji="⚖️" title="ข้อดีและข้อควรทราบ" accent="#1A365D">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", marginBottom: 6 }}>✅ ข้อดี</p>
                  {detail.pros.map((p, i) => <p key={i} style={{ fontSize: 12, color: "#4A6080", marginBottom: 4 }}>• {p}</p>)}
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", marginBottom: 6 }}>⚠️ ข้อควรทราบ</p>
                  {detail.cons.map((c, i) => <p key={i} style={{ fontSize: 12, color: "#4A6080", marginBottom: 4 }}>• {c}</p>)}
                </div>
              </div>
            </DetailCard>

            <DetailCard emoji="💊" title="การดูแลหลังรับบริการ" accent="#3B82F6">
              {detail.afterCare.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#4A6080", marginBottom: 4 }}>
                  <span style={{ color: "#3B82F6", flexShrink: 0 }}>→</span>{a}
                </div>
              ))}
            </DetailCard>

            <div style={{ borderRadius: 14, backgroundColor: "white", padding: "14px 16px", boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1A365D", display: "block", marginBottom: 8 }}>📝 อาการเพิ่มเติม (ไม่บังคับ)</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น ปวดฟันกลางคืน มีเลือดออก แพ้ยาชา..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, outline: "none", resize: "none", fontSize: 13, backgroundColor: "#F0F4F8", color: "#1A365D", border: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* RIGHT: Doctor + Calendar + Time */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Doctor (toggle) */}
            <div style={{ borderRadius: 16, backgroundColor: "white", overflow: "hidden", boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}>
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: wantSelectDoctor ? "1px solid rgba(26,54,93,0.06)" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#FFF0F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <UserPlus size={16} style={{ color: "#FF8C9A" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#1A365D" }}>เลือกทันตแพทย์เอง</p>
                  <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>ไม่เลือก = ระบบจัดให้อัตโนมัติ</p>
                </div>
                <button onClick={() => { setWantSelectDoctor(!wantSelectDoctor); if (wantSelectDoctor) setSelDoctor("any"); }}
                  style={{ position: "relative", width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer", backgroundColor: wantSelectDoctor ? "#FF8C9A" : "#E2E8F0", transition: "background 0.25s", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 2, left: wantSelectDoctor ? 20 : 2, width: 20, height: 20, borderRadius: "50%", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.25s" }} />
                </button>
              </div>
              {wantSelectDoctor && (
                <div style={{ padding: "10px 14px" }}>
                  {loadingDoctors ? (
                    <p style={{ textAlign: "center", fontSize: 13, color: "#4A6080", padding: "12px 0" }}>กำลังโหลด...</p>
                  ) : (
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                      <button onClick={() => setSelDoctor("any")}
                        style={{ flexShrink: 0, width: 86, borderRadius: 12, overflow: "hidden", textAlign: "left", cursor: "pointer", backgroundColor: "white", border: selDoctor === "any" ? "2px solid #FF8C9A" : "2px solid rgba(26,54,93,0.1)", boxShadow: selDoctor === "any" ? "0 3px 12px rgba(255,140,154,0.3)" : "none" }}>
                        <div style={{ height: 64, backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <UserPlus size={24} style={{ color: "#1A365D", opacity: 0.2 }} />
                        </div>
                        <div style={{ padding: "5px 7px" }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#1A365D" }}>ท่านใดก็ได้</p>
                          <p style={{ fontSize: 9, color: "#FF8C9A", marginTop: 1 }}>คิวเร็วสุด</p>
                        </div>
                      </button>
                      {landingDoctors.map((d) => {
                        const avail = filteredDoctors.some((fd) => fd.id === d.id);
                        return (
                          <button key={d.id} onClick={() => avail && setSelDoctor(d.id)} disabled={!avail}
                            style={{ flexShrink: 0, width: 86, borderRadius: 12, overflow: "hidden", textAlign: "left", cursor: avail ? "pointer" : "not-allowed", opacity: avail ? 1 : 0.4, backgroundColor: "white", border: selDoctor === d.id ? "2px solid #FF8C9A" : "2px solid rgba(26,54,93,0.1)", boxShadow: selDoctor === d.id ? "0 3px 12px rgba(255,140,154,0.3)" : "none" }}>
                            <img src={d.img} alt={d.name} style={{ width: "100%", height: 64, objectFit: "cover", display: "block" }} />
                            <div style={{ padding: "5px 7px" }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#1A365D", lineHeight: 1.3 }}>{d.name}</p>
                              <p style={{ fontSize: 9, color: "#FF8C9A", marginTop: 1 }}>{d.specialty}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment plans */}
            {paymentPlans.length > 0 && (
              <div style={{ borderRadius: 16, backgroundColor: "white", padding: "14px 16px", boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#1A365D", marginBottom: 10 }}>แผนการชำระเงิน</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {paymentPlans.map((plan) => (
                    <button key={plan.plan_id} onClick={() => setSelPaymentPlan(plan.plan_id)}
                      style={{ textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer", border: selPaymentPlan === plan.plan_id ? "2px solid #FF8C9A" : "1.5px solid rgba(26,54,93,0.08)", backgroundColor: selPaymentPlan === plan.plan_id ? "#FFF0F2" : "white" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#1A365D" }}>{plan.plan_name}</span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#FF8C9A" }}>{plan.total_amount?.toLocaleString()} บาท</span>
                      </div>
                      {plan.installments > 1 && <p style={{ fontSize: 11, color: "#4A6080", marginTop: 4 }}>แบ่ง {plan.installments} งวด งวดละ {plan.per_month?.toLocaleString()} บาท</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar — compact premium */}
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 16px rgba(26,54,93,0.10)" }}>
              {/* Header gradient */}
              <div style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", padding: "9px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={() => setMonthOffset((m) => m - 1)}
                  style={{ width: 24, height: 24, borderRadius: 6, border: "none", backgroundColor: "rgba(255,255,255,0.2)", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.35)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}>
                  <ChevronLeft size={12} />
                </button>
                <p style={{ fontWeight: 700, fontSize: 12, color: "white", letterSpacing: "0.02em" }}>
                  {targetDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
                </p>
                <button onClick={() => setMonthOffset((m) => m + 1)}
                  style={{ width: 24, height: 24, borderRadius: 6, border: "none", backgroundColor: "rgba(255,255,255,0.2)", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.35)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}>
                  <ChevronRight size={12} />
                </button>
              </div>

              {/* Grid */}
              <div style={{ backgroundColor: "white", padding: "8px 10px 10px" }}>
                {/* Day labels */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
                  {["อา","จ","อ","พ","พฤ","ศ","ส"].map((d, i) => (
                    <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 600, color: i === 0 ? "#FDA4AF" : i === 6 ? "#93C5FD" : "#94A3B8", paddingBottom: 2 }}>{d}</div>
                  ))}
                </div>
                {/* Date cells */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                  {[...Array(firstDow)].map((_, i) => <div key={`e${i}`} />)}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const d = i + 1;
                    const st = dayStatus(d).status;
                    const sel = selDay === d;
                    const isWeekend = (firstDow + i) % 7 === 0 || (firstDow + i) % 7 === 6;
                    return (
                      <button key={d} disabled={st !== "available"} onClick={() => { setSelDay(d); setSelTime(null); }}
                        style={{
                          height: 30, borderRadius: 6, border: "none", width: "100%",
                          fontSize: 10, fontWeight: sel ? 700 : 500,
                          cursor: st === "available" ? "pointer" : "not-allowed",
                          transition: "all 0.15s",
                          background: sel ? "linear-gradient(135deg,#FF8C9A,#FF6B7E)" : "transparent",
                          color: sel ? "white" : st === "past" ? "#D1D5DB" : isWeekend ? "#F87171" : "#1A365D",
                          boxShadow: sel ? "0 2px 6px rgba(255,140,154,0.5)" : "none",
                        }}
                        onMouseEnter={e => { if (st === "available" && !sel) e.currentTarget.style.backgroundColor = "#FFF0F2"; }}
                        onMouseLeave={e => { if (st === "available" && !sel) e.currentTarget.style.backgroundColor = "transparent"; }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
                {/* Legend */}
                <div style={{ display: "flex", gap: 10, marginTop: 8, justifyContent: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "#94A3B8" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }} />เลือก
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "#94A3B8" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#D1D5DB" }} />ไม่ว่าง
                  </div>
                </div>
              </div>
            </div>

            {/* Time slots */}
            <div style={{ borderRadius: 16, backgroundColor: "white", padding: "14px 16px", boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#1A365D", marginBottom: 10 }}>
                {selDay ? `⏰ เวลาว่าง — วันที่ ${selDay}` : "⏰ เลือกวันในปฏิทินก่อน"}
              </p>
              {selDay ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {availableTimes.map(({ t, booked, canBook }) => {
                      const isSelected = selTime && t >= selTime && t < endTimeStr;
                      return (
                        <button key={t} disabled={!canBook} onClick={() => setSelTime(t)}
                          style={{ padding: "8px 4px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "none", cursor: canBook ? "pointer" : "not-allowed", transition: "all 0.15s", opacity: !canBook && !booked ? 0.4 : 1, backgroundColor: isSelected ? "#FF8C9A" : booked ? "#F0F4F8" : "white", color: isSelected ? "white" : !canBook ? "#ccc" : "#1A365D", boxShadow: canBook && !isSelected ? "0 1px 4px rgba(26,54,93,0.1)" : "none" }}>
                          {t}
                          {booked && <span style={{ display: "block", fontSize: 9, color: "#bbb" }}>จองแล้ว</span>}
                          {!booked && !canBook && <span style={{ display: "block", fontSize: 9, color: "#bbb" }}>เวลาไม่พอ</span>}
                        </button>
                      );
                    })}
                  </div>
                  {selTime && (
                    <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, backgroundColor: "#FFE8EC", display: "flex", gap: 8 }}>
                      <Clock size={14} style={{ color: "#E0314C", flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#E0314C" }}>{selTime} – {endTimeStr} น.</p>
                        <p style={{ fontSize: 10, color: "#E0314C", opacity: 0.8, marginTop: 2 }}>ประมาณ {estTime} นาที (รวมเตรียมตัว 15 นาที)</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ height: 80, borderRadius: 12, backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ fontSize: 12, color: "#94A3B8" }}>เลือกวันก่อน</p>
                </div>
              )}
            </div>

            {/* Proceed button */}
            <button onClick={handleNext} disabled={!canNext()}
              style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: canNext() ? "pointer" : "not-allowed", background: canNext() ? "linear-gradient(135deg,#FF8C9A,#FF6B7E)" : "rgba(26,54,93,0.08)", color: canNext() ? "white" : "#94A3B8", boxShadow: canNext() ? "0 4px 20px rgba(255,140,154,0.35)" : "none", transition: "all 0.2s" }}>
              {canNext() ? <><span>ดำเนินการต่อ</span><ArrowRight size={16} /></> : "เลือกวันและเวลาก่อน"}
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 4: Confirm ══ */}
      {step === 4 && (
        <div style={{ maxWidth: 520 }}>
          <div style={{ borderRadius: 20, backgroundColor: "white", padding: 24, boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: "#1A365D", marginBottom: 20 }}>สรุปการจองนัดหมาย</h3>
            {[
              { label: "บริการ",        val: servicesData[selService!]?.title || "ไม่ระบุ" },
              { label: "ทันตแพทย์",    val: (selDoctor === "any" || selDoctor === null) ? "จัดแพทย์ให้อัตโนมัติ" : (landingDoctors.find((d) => d.id === selDoctor)?.name || "ไม่ระบุ") },
              { label: "แผนชำระเงิน",  val: paymentPlans.length > 0 && selPaymentPlan ? (paymentPlans.find((p) => p.plan_id === selPaymentPlan)?.plan_name || "ชำระปกติ") : "ชำระปกติ" },
              { label: "วันที่",        val: `${selDay} ${today.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}` },
              { label: "เวลา",          val: `${selTime} – ${endTimeStr} น.` },
              { label: "ราคาเริ่มต้น", val: servicesData[selService!]?.price || "-" },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: 14, borderBottom: "1px solid rgba(26,54,93,0.06)" }}>
                <span style={{ color: "#4A6080" }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: "#1A365D" }}>{r.val}</span>
              </div>
            ))}
            {notes && (
              <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, backgroundColor: "#F0F4F8" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1A365D", marginBottom: 4 }}>📝 อาการที่แจ้งไว้</p>
                <p style={{ fontSize: 12, color: "#4A6080" }}>{notes}</p>
              </div>
            )}
            <button onClick={handleConfirm} disabled={isSubmitting}
              style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", fontWeight: 700, fontSize: 14, color: "white", marginTop: 20, cursor: isSubmitting ? "not-allowed" : "pointer", background: isSubmitting ? "#ccc" : "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(255,140,154,0.4)", transition: "all 0.2s" }}>
              {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการจองนัดหมาย"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
