import React, { useState, useEffect } from "react";
import {
  ChevronLeft, Check, ChevronRight, CheckCircle,
  ArrowRight, UserPlus, FileText, Clock, Info,
} from "lucide-react";

import { View, PatientUser } from "../types";
import {
  addAppointment, getClinicClosures,
  getLandingServices, getLandingDoctors, getDentistsByService,
  getPaymentPlans, getWeeklyOffDays, getAvailableTimeSlots, getDoctorSchedules
} from "../../shared/supabaseApi";
import { SpecialClosure } from "../../shared/data";
import { Smile, Sparkles, Shield, Award, Heart, Calendar, Zap, Scissors, Crown, Layers, Star, Syringe, Baby, Activity } from "lucide-react";

const iconMap: Record<string, any> = { Smile, Sparkles, Shield, Award, Heart, Calendar, Zap, Scissors, Crown, Layers, Star, Syringe, Baby, Activity, Clock };

// ─────────────────────────────────────────────────────────────────────────────
// Service detail static data
// ─────────────────────────────────────────────────────────────────────────────
interface ServiceDetail {
  benefits: string[];
  procedures: string[];
  care: string[];
}

const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  "ตรวจฟันและขูดหินปูน": {
    benefits: ["ป้องกันโรคปริทันต์และเหงือกอักเสบ", "ขจัดคราบหินปูนและคราบแบคทีเรียที่แปรงไม่ออก", "ลดกลิ่นปาก ช่วยให้ลมหายใจสดชื่น", "ช่วยให้ฟันดูขาวสะอาดขึ้น"],
    procedures: ["ทันตแพทย์ตรวจประเมินสุขภาพช่องปากโดยรวม", "ใช้เครื่องมืออัลตราโซนิกกะเทาะคราบหินปูนที่เกาะตามคอฟัน", "ใช้เครื่องมือขูดหินปูนในจุดที่เข้าถึงยากและใต้เหงือก", "ขัดฟันด้วยผงขัดเพื่อขจัดคราบสีและทำให้ผิวฟันเรียบ"],
    care: ["ก่อนทำ:", "ไม่ต้องเตรียมตัวพิเศษ สามารถทานอาหารและแปรงฟันได้ตามปกติ", "หลังทำ:", "งดทานอาหารและเครื่องดื่มที่ร้อนจัดหรือเย็นจัด 24 ชั่วโมงแรก หากมีอาการเสียวฟัน", "อาจมีอาการเสียวฟันหรือเลือดออกตามไรเหงือกเล็กน้อย 1-2 วัน", "แปรงฟันอย่างน้อยวันละ 2 ครั้ง และใช้ไหมขัดฟันเป็นประจำ"],
  },
  "ฟอกสีฟัน": {
    benefits: ["ปรับสีฟันให้ขาวสว่างขึ้น 5-8 เฉด อย่างเห็นได้ชัด", "เสริมสร้างความมั่นใจในรอยยิ้ม", "มีความปลอดภัยสูง ภายใต้การดูแลของทันตแพทย์", "เห็นผลลัพธ์ทันทีหลังทำเสร็จใน 1 ชั่วโมง"],
    procedures: ["ทันตแพทย์เทียบสีฟันก่อนทำและประเมินสุขภาพช่องปาก", "ทำความสะอาดผิวฟันและใส่ยางป้องกันเหงือก", "ทาน้ำยาฟอกสีฟันลงบนผิวฟันและฉายแสงเย็น  กระตุ้นน้ำยา", "ทำซ้ำ 2-3 รอบ รอบละ 15-20 นาที", "ล้างน้ำยาออกและเทียบสีฟันหลังทำ"],
    care: ["ก่อนทำ:", "ควรขูดหินปูนและอุดฟันผุให้เรียบร้อยก่อน", "หลังทำ:", "งดอาหารและเครื่องดื่มที่มีสีเข้ม (ชา กาแฟ ไวน์ ซอส) เป็นเวลา 48 ชั่วโมง", "งดสูบบุหรี่", "อาจมีอาการเสียวฟัน 1-3 วัน แนะนำให้ใช้ยาสีฟันลดอาการเสียวฟัน"],
  },
  "จัดฟันแบบโลหะ": {
    benefits: ["แก้ไขปัญหาฟันซ้อนเก ฟันห่าง ฟันยื่น ได้ทุกรูปแบบ", "ปรับการสบฟันให้เป็นปกติ เพิ่มประสิทธิภาพในการเคี้ยวอาหาร", "ปรับรูปหน้าและรอยยิ้มให้สมส่วน", "ราคาเข้าถึงได้ง่ายและมีความทนทานสูง"],
    procedures: ["พิมพ์ปากและเอกซเรย์เพื่อวางแผนการรักษา", "เคลียร์ช่องปาก ", "ติดเครื่องมือจัดฟัน ลงบนผิวฟัน", "ใส่ลวดและยางรัด  เพื่อเริ่มเคลื่อนฟัน", "ปรับเครื่องมือทุกๆ 3-4 สัปดาห์ จนกว่าฟันจะเข้าที่"],
    care: ["ก่อนทำ:", "เตรียมเวลาสำหรับการเคลียร์ช่องปากก่อนติดเครื่องมือ", "หลังทำ:", "แปรงฟันหลังมื้ออาหารทุกครั้งและใช้แปรงซอกฟัน", "หลีกเลี่ยงอาหารแข็ง เหนียว กรอบ เพื่อป้องกันเครื่องมือหลุด", "หากมีแผลในปากจากเครื่องมือ สามารถใช้ขี้ผึ้ง (Wax) ปิดทับได้"],
  },
  "จัดฟันแบบเซรามิก": {
    benefits: ["ให้ความสวยงาม กลมกลืนกับสีฟันธรรมชาติ มองเห็นไม่ชัด", "มีประสิทธิภาพในการเคลื่อนฟันใกล้เคียงกับโลหะ", "ลดการระคายเคืองในช่องปาก", "เหมาะสำหรับวัยทำงานที่ต้องการความสุภาพ"],
    procedures: ["ปรึกษาและวางแผนการรักษาด้วยการพิมพ์ปาก/สแกนฟันและเอกซเรย์", "เคลียร์ช่องปากให้เรียบร้อย", "ติดเครื่องมือเซรามิก", "ใส่ลวดและยางรัด", "พบทันตแพทย์เพื่อปรับเครื่องมือทุก 3-4 สัปดาห์"],
    care: ["ก่อนทำ:", "รักษาความสะอาดช่องปากให้ดี", "หลังทำ:", "ระมัดระวังในการรับประทานอาหารแข็ง เนื่องจากเซรามิกอาจแตกหักได้", "หลีกเลี่ยงเครื่องดื่มหรืออาหารที่มีสีเข้มจัด เพราะยางรัดสีใสอาจติดสีได้ง่าย", "ทำความสะอาดอย่างเคร่งครัดด้วยอุปกรณ์จัดฟันเฉพาะ"],
  },
  "จัดฟันแบบใส (Invisalign)": {
    benefits: ["มองแทบไม่เห็นเครื่องมือ สวยงามที่สุด", "สามารถถอดออกขณะรับประทานอาหารและแปรงฟันได้", "ทำความสะอาดช่องปากได้ง่าย ลดความเสี่ยงฟันผุและเหงือกอักเสบ", "เจ็บน้อยกว่าการจัดฟันแบบติดเครื่องมือ และพบแพทย์น้อยลง"],
    procedures: ["สแกนฟัน 3 มิติ และเอกซเรย์ เพื่อจำลองการเคลื่อนตัวของฟันผ่านโปรแกรม ", "ทันตแพทย์ออกแบบแผนการรักษา และสั่งทำชุดอุปกรณ์จัดฟันใส", "ติดปุ่ม Attachment (บางกรณี) และรับชุดชิ้นงานจัดฟัน", "คนไข้เปลี่ยนชุดอุปกรณ์ใหม่ด้วยตนเองทุกๆ 1-2 สัปดาห์", "พบทันตแพทย์ทุกๆ 6-8 สัปดาห์เพื่อติดตามผล"],
    care: ["ก่อนทำ:", "เข้าใจว่าต้องมีวินัยในการใส่เครื่องมืออย่างน้อยวันละ 20-22 ชั่วโมง", "หลังทำ:", "ถอดเครื่องมือทุกครั้งเมื่อรับประทานอาหารหรือดื่มเครื่องดื่มร้อน", "ทำความสะอาดชิ้นงานใสด้วยแปรงขนนุ่มและน้ำสบู่อ่อนๆ", "เก็บเครื่องมือในกล่องทุกครั้งที่ถอด ห้ามห่อทิชชู่"],
  },
  "รากฟันเทียม (Implant)": {
    benefits: ["ทดแทนฟันที่สูญเสียไปได้อย่างถาวรและเป็นธรรมชาติที่สุด", "ป้องกันการละลายตัวของกระดูกขากรรไกร", "ไม่ส่งผลกระทบหรือต้องกรอฟันข้างเคียง", "เพิ่มประสิทธิภาพในการบดเคี้ยวอาหารได้ใกล้เคียงฟันจริง"],
    procedures: ["ตรวจประเมินกระดูกขากรรไกรด้วย 3D CT Scan", "ผ่าตัดฝังรากฟันเทียม ลงในกระดูกขากรรไกร", "รอให้กระดูกสมานกับรากฟันเทียมประมาณ 2-4 เดือน", "ใส่แกนยึด (Abutment)", "พิมพ์ปากเพื่อทำครอบฟัน และใส่ครอบฟันลงบนรากเทียม"],
    care: ["ก่อนทำ:", "ควบคุมโรคประจำตัวให้ปกติ แจ้งประวัติการแพ้ยา", "หลังทำ:", "ประคบเย็นเพื่อลดอาการบวม ทานยาและบ้วนปากตามแพทย์สั่ง (ระยะผ่าตัด)", "รับประทานอาหารอ่อน หลีกเลี่ยงการเคี้ยวบริเวณที่ผ่าตัด (ระยะผ่าตัด)", "ดูแลเหมือนฟันธรรมชาติ แปรงฟัน ใช้ไหมขัดฟัน และตรวจเช็คทุก 6 เดือน (ระยะใส่ครอบฟัน)"],
  },
  "อุดฟัน / ถอนฟัน": {
    benefits: ["ระงับอาการปวดและหยุดการลุกลามของโรคฟันผุ", "ฟื้นฟูรูปร่างและการทำงานของฟันให้กลับมาเคี้ยวได้ปกติ", "กำจัดแหล่งสะสมเชื้อโรคในช่องปาก", "ป้องกันปัญหาฟันล้ม เอียง จากการปล่อยฟันผุทิ้งไว้"],
    procedures: ["อุดฟัน: กรอส่วนที่ผุออก ล้างทำความสะอาด แล้วใส่วัสดุอุดฟัน ฉายแสง และขัดแต่งรูปร่าง", "ถอนฟัน: ฉีดยาชา เมื่อชาเต็มที่ จะใช้เครื่องมือดึงออก ทำความสะอาดแผล และให้กัดผ้าก๊อซ"],
    care: ["ก่อนทำ:", "แจ้งประวัติโรคประจำตัว ยาที่ทานประจำ และประวัติการแพ้ยา ", "หลังทำ:", "งดเคี้ยวอาหารด้วยซี่ที่อุด 1-2 ชั่วโมงแรก หรือจนกว่ายาชาจะหมดฤทธิ์ (อุดฟัน)", "กัดผ้าก๊อซให้แน่น 1-2 ชั่วโมง ห้ามบ้วนน้ำหรือน้ำลาย (ถอนฟัน)", "วันแรกงดแปรงฟันบริเวณแผล วันต่อไปแปรงฟันได้เบาๆ (ถอนฟัน)"],
  },
  "กันตกรรมเด็ก": {
    benefits: ["ดูแลรักษาสุขภาพฟันน้ำนมให้อยู่ได้นานจนฟันแท้ขึ้น", "ป้องกันปัญหาฟันผุและการสูญเสียฟันก่อนวัยอันควร", "ช่วยให้เด็กมีทัศนคติที่ดีต่อการทำฟัน", "ส่งเสริมพัฒนาการการเคี้ยวอาหารและการพูดที่ถูกต้อง"],
    procedures: ["ทันตแพทย์สร้างความคุ้นเคยกับเด็กก่อนเริ่มการรักษา", "ตรวจประเมินสุขภาพช่องปาก เคลือบฟลูออไรด์ หรือเคลือบหลุมร่องฟัน", "หากพบฟันผุ จะทำการกรอและอุดฟัน หรือรักษารากฟันน้ำนมตามความเหมาะสม", "ถอนฟันน้ำนมกรณีที่ฟันแท้ขึ้นซ้อน หรือผุมากจนรักษาไม่ได้"],
    care: ["ก่อนทำ:", "ผู้ปกครองควรสร้างทัศนคติเชิงบวกเกี่ยวกับการทำฟันให้เด็ก ไม่หลอกให้กลัว", "หลังทำ:", "หากมียาชา ควรดูแลไม่ให้เด็กกัดริมฝีปากหรือกระพุ้งแก้มเล่นจนเป็นแผล", "ดูแลการแปรงฟันของเด็กอย่างใกล้ชิด (แปรงให้เด็กจนถึงอายุ 7-8 ขวบ)", "ควบคุมการรับประทานขนมหวาน และพบแพทย์ทุก 6 เดือน"],
  },
  "รักษารากฟัน (Root Canal)": {
    benefits: ["สามารถเก็บรักษาฟันแท้ไว้ได้ ไม่ต้องถอน", "กำจัดอาการปวดฟันที่รุนแรงและอาการอักเสบติดเชื้อ", "ฟื้นฟูประสิทธิภาพการบดเคี้ยว (หลังจากทำครอบฟัน)", "ป้องกันไม่ให้การติดเชื้อลุกลามไปยังกระดูกเบ้าฟัน"],
    procedures: ["ฉีดยาชาและใส่แผ่นยางกันน้ำลาย ", "กรอเปิดทางเข้าสู่โพรงประสาทฟัน", "เอาเนื้อเยื่อที่ติดเชื้อออก ทำความสะอาดคลองรากฟัน และขยายขนาด", "ใส่ยาฆ่าเชื้อและอุดปิดชั่วคราว (อาจต้องรักษา 1-3 ครั้ง)", "เมื่อหายอักเสบ จะทำการอุดคลองรากฟันแบบถาวร และเตรียมทำครอบฟัน"],
    care: ["ก่อนทำ:", "รับประทานอาหารมาให้เรียบร้อย และแจ้งโรคประจำตัว", "หลังทำ:", "ห้ามใช้ฟันซี่นั้นเคี้ยวอาหารแข็งเด็ดขาดระหว่างรอการรักษาเสร็จสมบูรณ์ เพราะฟันอาจแตกได้", "หากมีอาการปวด สามารถรับประทานยาแก้ปวดตามที่สั่ง", "เมื่อรักษารากฟันเสร็จแล้ว จำเป็นต้องทำครอบฟันเพื่อความแข็งแรง"],
  },
};

const DEFAULT_SERVICE_DETAIL: ServiceDetail = {
  benefits: ["ดูแลสุขภาพช่องปากครบถ้วน", "ป้องกันปัญหาระยะยาว", "เพิ่มความมั่นใจในการใช้ชีวิตประจำวัน"],
  procedures: ["ประเมินและตรวจสภาพช่องปาก", "ให้คำปรึกษาและวางแผนการรักษา", "ดำเนินการรักษาตามขั้นตอนโดยทันตแพทย์ผู้เชี่ยวชาญ", "ตรวจสอบความเรียบร้อยและนัดหมายติดตามผล"],
  care: ["ก่อนทำ:", "เตรียมตัวและพักผ่อนให้เพียงพอ ทำความสะอาดช่องปาก", "หลังทำ:", "ปฏิบัติตามคำแนะนำของทันตแพทย์อย่างเคร่งครัด", "ทานยาตามที่สั่ง (ถ้ามี)", "หากมีอาการผิดปกติ ให้รีบติดต่อคลินิกทันที"],
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
  onAddAppt,
}: {
  setView: (v: View) => void;
  initialService?: number | null;
  initialDoctor?: number | null;
  isFollowUp?: boolean;
  user: PatientUser | null;
  onAddAppt?: (appt: any) => void;
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
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [landingDoctors, setLandingDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [selPaymentPlan, setSelPaymentPlan] = useState<number | null>(null);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [backendSlots, setBackendSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getClinicClosures(),
      getLandingServices(), getLandingDoctors(), getWeeklyOffDays(), getDoctorSchedules()
    ]).then(([cData, sData, ldData, offData, dsData]) => {
      setClosures(cData);
      setServicesData(sData);
      setLandingDoctors(ldData);
      setWeeklyOffDays(offData);
      setDoctorSchedules(dsData);
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

  // Calendar helpers
  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const todayN = today.getDate();
  const isCurrentMonth = monthOffset === 0;

  // ─── dayStatus: เช็คระดับปฏิทิน (past / weeklyOff / closure / doctor working) ──────────
  const dayStatus = (d: number) => {
    if (isCurrentMonth && d < todayN) return { status: "past" as const };
    if (monthOffset < 0) return { status: "past" as const };
    const dateObj = new Date(year, month, d);
    const dayOfWk = dateObj.getDay();
    if (weeklyOffDays.includes(dayOfWk)) return { status: "past" as const, reason: "วันหยุดประจำสัปดาห์" };
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const closure = closures.find((c) => c.date === dateStr);
    if (closure) return { status: "past" as const, reason: closure.reason };
    
    // Check doctor schedule
    if (step >= 1 && filteredDoctors.length > 0) {
      let isWorking = false;
      if (selDoctor === "any") {
        // Any doctor in filteredDoctors must be working on this dayOfWk and not off
        isWorking = filteredDoctors.some(fd => {
          const shift = doctorSchedules.find(s => s.dentistId === fd.id && s.dayOfWeek === dayOfWk);
          return shift && !shift.isOff && shift.start && shift.end;
        });
      } else {
        // Selected doctor must be working
        const shift = doctorSchedules.find(s => s.dentistId === selDoctor && s.dayOfWeek === dayOfWk);
        isWorking = !!(shift && !shift.isOff && shift.start && shift.end);
      }
      if (!isWorking) return { status: "past" as const, reason: "แพทย์ไม่เข้าตรวจ" };
    }

    return { status: "available" as const };
  };

  const estTime = selService !== null && servicesData[selService] ? servicesData[selService].baseTimeMins : 30;
  const reqSlots = Math.ceil((estTime + 15) / 30);
  const endTimeStr = selTime ? (() => {
    const [h, m] = selTime.split(":").map(Number);
    const tot = h * 60 + m + estTime;
    return `${String(Math.floor(tot / 60)).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`;
  })() : "";

  // ─── Backend-driven time slots ────────────────────────────────────────────
  useEffect(() => {
    if (!selDay || selService === null || !servicesData[selService]) {
      setBackendSlots([]);
      return;
    }
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selDay).padStart(2, "0")}`;
    const serviceId = servicesData[selService]?.serviceId;
    const doctorIdParam = selDoctor !== "any" && selDoctor !== null ? (selDoctor as number) : undefined;

    setLoadingSlots(true);
    setSelTime(null);
    getAvailableTimeSlots(dateStr, serviceId, doctorIdParam)
      .then((slots) => setBackendSlots(slots))
      .catch(() => setBackendSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selDay, selDoctor, selService, monthOffset, year, month, servicesData]);

  // ─── Compute canBook from backendSlots (consecutive slot check) ──────────
  const availableTimes = backendSlots.map((slot, i) => {
    let ok = true;
    for (let j = 0; j < reqSlots; j++) {
      if (i + j >= backendSlots.length) { ok = false; break; }
      // Check consecutive: next slot must be exactly 30 min after current
      if (j > 0) {
        const [prevH, prevM] = backendSlots[i + j - 1].split(":").map(Number);
        const [curH, curM] = backendSlots[i + j].split(":").map(Number);
        if ((curH * 60 + curM) - (prevH * 60 + prevM) !== 30) { ok = false; break; }
      }
    }
    return { t: slot, canBook: ok };
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
    let finalDoctorId: number | undefined;
    let finalDoctorName = "ไม่ระบุแพทย์";
    
    if (selDoctor !== "any" && selDoctor !== null) {
      const doc = landingDoctors.find((d) => d.id === selDoctor);
      if (doc) {
        finalDoctorId = doc.id;
        finalDoctorName = doc.name;
      }
      setMatchedDoctor(selDoctor as number);
    } else {
      // Backend will auto-assign, we don't set finalDoctorId
      finalDoctorId = undefined;
    }
    
    const serviceData = servicesData[selService!];
    const isComplex = serviceData?.requiresConfirmation || false;
    const initialStatus = isComplex ? "รอการยืนยัน" : "ยืนยันการจอง";

    try {
      const res = await addAppointment({
        patientId: user?.patientId,
        patientName: user ? `${user.firstName} ${user.lastName}` : "ผู้ป่วยทั่วไป",
        hn: user?.idCard?.slice(-6) || "W-000",
        patientPhone: user?.phone || "080-000-0000",
        service: serviceTitle,
        serviceId: servicesData[selService!]?.serviceId,
        doctorName: finalDoctorName,
        doctorId: finalDoctorId,
        date: `${year}-${String(month + 1).padStart(2, "0")}-${selDay?.toString().padStart(2, "0")}`,
        time: selTime || "",
        durationMins: estTime,
        status: initialStatus,
        source: "patient", cost: 0, paid: false,
        treatmentNotes: "", treatmentServices: [], recommendations: "",
        allergies: "ไม่มี", conditions: notes || "ไม่มี",
        paymentPlanId: selPaymentPlan || undefined,
      });
      if (res && (res as any).assignedDoctorId) {
        setMatchedDoctor((res as any).assignedDoctorId);
      }
      if (onAddAppt && res) {
        // Map the Supabase response to the frontend Appointment type roughly so UI updates instantly
        onAddAppt({
          id: (res as any).appointment_id || Date.now(),
          patientId: user?.patientId,
          hn: user?.idCard?.slice(-6) || "W-000",
          patientName: user ? `${user.firstName} ${user.lastName}` : "ผู้ป่วยทั่วไป",
          patientPhone: user?.phone || "080-000-0000",
          service: serviceTitle,
          serviceId: servicesData[selService!]?.serviceId,
          doctorName: finalDoctorName !== "ไม่ระบุแพทย์" ? finalDoctorName : (res as any).assignedDoctorId ? "ระบบสุ่มเลือกให้" : "รอระบุแพทย์",
          doctorId: finalDoctorId || (res as any).assignedDoctorId || 0,
          date: `${year}-${String(month + 1).padStart(2, "0")}-${selDay?.toString().padStart(2, "0")}`,
          time: selTime || "",
          status: initialStatus,
          endTime: "00:00"
        });
      }
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
          style={{ backgroundColor: "#E8FFF0" }}>
          <CheckCircle size={36} style={{ color: "#22C55E" }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          จองนัดหมายสำเร็จ!
        </h2>
        <p className="text-sm mb-2" style={{ color: "#4A6080" }}>{servicesData[selService!]?.title || ""} กับ {displayDoc}</p>
        <p className="text-sm font-semibold mb-6" style={{ color: "#1A365D" }}>
          วันที่ {selDay} {today.toLocaleDateString("th-TH", { month: "long", year: "numeric" })} เวลา {selTime} - {endTimeStr} น.
        </p>
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-5 items-start">

          {/* LEFT: all detail cards, always visible */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Service badge */}
            <div style={{ borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg,#FFF0F2,#FFF8F9)", border: "1px solid rgba(255,140,154,0.25)" }}>
              {(() => {
                const Icon = iconMap[servicesData[selService!]?.iconName] || Smile; return (
                  <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "white", boxShadow: "0 2px 8px rgba(255,140,154,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} style={{ color: "#FF8C9A" }} />
                  </div>
                );
              })()}
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#1A365D", marginBottom: 2 }}>{serviceTitle}</p>
                <p style={{ fontSize: 12, color: "#FF8C9A" }}>{servicesData[selService!]?.price}</p>
              </div>
            </div>

            <DetailCard emoji="✨" title={`ประโยชน์ของ${serviceTitle}`} accent="#22C55E">
              {detail.benefits.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#4A6080", marginBottom: 6, alignItems: "flex-start" }}>
                  <CheckCircle size={13} style={{ color: "#22C55E", flexShrink: 0, marginTop: 2 }} />{b}
                </div>
              ))}
            </DetailCard>

            <DetailCard emoji="🩺" title="ขั้นตอนการรักษา" accent="#FF8C9A">
              {detail.procedures.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#4A6080", marginBottom: 6, alignItems: "flex-start" }}>
                  <span style={{ color: "white", backgroundColor: "#FF8C9A", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: "bold", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                  <span>{p}</span>
                </div>
              ))}
            </DetailCard>

            <DetailCard emoji="💊" title="การดูแลก่อนและหลังการรักษา" accent="#3B82F6">
              {detail.care.map((c, i) => {
                const isPre = c.startsWith("ก่อนทำ:");
                const isPost = c.startsWith("หลังทำ:");
                const text = c.replace(/^(ก่อนทำ:|หลังทำ:)\s*/, "");
                return (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#4A6080", marginBottom: 8, alignItems: "flex-start" }}>
                    {isPre && <div style={{ backgroundColor: "#EFF6FF", color: "#3B82F6", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginTop: 1 }}>ก่อนทำ</div>}
                    {isPost && <div style={{ backgroundColor: "#F0FDF4", color: "#22C55E", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginTop: 1 }}>หลังทำ</div>}
                    {!isPre && !isPost && <span style={{ color: "#3B82F6", flexShrink: 0, fontWeight: "bold", marginTop: -2 }}>•</span>}
                    <span style={{ lineHeight: 1.5 }}>{text}</span>
                  </div>
                );
              })}
            </DetailCard>

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
                  {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d, i) => (
                    <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 600, color: i === 0 ? "#FDA4AF" : i === 6 ? "#93C5FD" : "#94A3B8", paddingBottom: 2 }}>{d}</div>
                  ))}
                </div>
                {/* Date cells */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                  {[...Array(firstDow)].map((_, i) => <div key={`e${i}`} />)}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const d = i + 1;
                    const ds = dayStatus(d);
                    const st = ds.status;
                    const reason = ds.reason;
                    const sel = selDay === d;
                    const isWeekend = (firstDow + i) % 7 === 0 || (firstDow + i) % 7 === 6;
                    const isPast = st === "past";
                    const isAvailable = st === "available";
                    return (
                      <button key={d} disabled={!isAvailable} onClick={() => { setSelDay(d); setSelTime(null); }}
                        title={reason}
                        style={{
                          height: 30, borderRadius: 6, border: "none", width: "100%",
                          fontSize: 10, fontWeight: sel ? 700 : 500,
                          cursor: isAvailable ? "pointer" : "not-allowed",
                          transition: "all 0.15s",
                          background: sel
                            ? "linear-gradient(135deg,#FF8C9A,#FF6B7E)"
                            : "transparent",
                          color: sel ? "white" : isPast ? "#D1D5DB" : isWeekend ? "#F87171" : "#1A365D",
                          boxShadow: sel ? "0 2px 6px rgba(255,140,154,0.5)" : "none",
                          position: "relative",
                        }}
                        onMouseEnter={e => { if (isAvailable && !sel) e.currentTarget.style.backgroundColor = "#FFF0F2"; }}
                        onMouseLeave={e => { if (isAvailable && !sel) e.currentTarget.style.backgroundColor = "transparent"; }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
                {/* Legend */}
                <div style={{ display: "flex", gap: 10, marginTop: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "#94A3B8" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }} />เลือก
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "#94A3B8" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#D1D5DB" }} />ไม่ว่าง
                  </div>
                </div>
              </div>
            </div>

            {/* Time slots — ดึงจาก Backend */}
            <div style={{ borderRadius: 16, backgroundColor: "white", padding: "14px 16px", boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#1A365D", marginBottom: 10 }}>
                {selDay ? `⏰ เวลาว่าง — วันที่ ${selDay}` : "⏰ เลือกวันในปฏิทินก่อน"}
              </p>
              {selDay ? (
                <>
                  {loadingSlots ? (
                    <div style={{ height: 80, borderRadius: 12, backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ fontSize: 12, color: "#94A3B8" }}>กำลังโหลดเวลาว่าง...</p>
                    </div>
                  ) : availableTimes.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableTimes.map(({ t, canBook }) => {
                        const isSelected = selTime && t >= selTime && t < endTimeStr;
                        return (
                          <button key={t} disabled={!canBook} onClick={() => setSelTime(t)}
                            style={{
                              padding: "8px 4px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                              border: canBook && !isSelected ? "1.5px solid rgba(255,140,154,0.2)" : "none",
                              cursor: canBook ? "pointer" : "not-allowed",
                              transition: "all 0.15s",
                              backgroundColor: isSelected ? "#FF8C9A" : !canBook ? "#F9FAFB" : "white",
                              color: isSelected ? "white" : !canBook ? "#D1D5DB" : "#1A365D",
                              boxShadow: canBook && !isSelected ? "0 1px 4px rgba(26,54,93,0.1)" : "none",
                            }}>
                            {t}
                            {!canBook && <span style={{ display: "block", fontSize: 9, color: "#D1D5DB" }}>เวลาไม่พอ</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ height: 80, borderRadius: 12, backgroundColor: "#FFF0F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ fontSize: 12, color: "#E0314C" }}>ไม่มีเวลาว่างในวันนี้</p>
                    </div>
                  )}
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
              { label: "บริการ", val: servicesData[selService!]?.title || "ไม่ระบุ" },
              { label: "ทันตแพทย์", val: (selDoctor === "any" || selDoctor === null) ? "จัดแพทย์ให้อัตโนมัติ" : (landingDoctors.find((d) => d.id === selDoctor)?.name || "ไม่ระบุ") },
              { label: "แผนชำระเงิน", val: paymentPlans.length > 0 && selPaymentPlan ? (paymentPlans.find((p) => p.plan_id === selPaymentPlan)?.plan_name || "ชำระปกติ") : "ชำระปกติ" },
              { label: "วันที่", val: `${selDay} ${today.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}` },
              { label: "เวลา", val: `${selTime} – ${endTimeStr} น.` },
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
