import React, { useState, useEffect } from "react";
import { ChevronLeft, Check, ChevronRight, CheckCircle, ArrowRight, UserPlus, FileText, Clock } from "lucide-react";

import { View, PatientUser } from "../types";
import { addAppointment, getClinicClosures, getLeaveRequests, getDentists, getLandingServices, getLandingDoctors, getDentistsByService, getAppointments, getPaymentPlans } from "../../shared/supabaseApi";
import { SpecialClosure, LeaveRequest, DentistInfo, Appointment } from "../../shared/data";
import { Smile, Sparkles, Shield, Award, Heart, Calendar, Zap, Scissors, Crown, Layers, Star } from "lucide-react";

const iconMap: Record<string, any> = { Smile, Sparkles, Shield, Award, Heart, Calendar, Zap, Scissors, Crown, Layers, Star };

export default function BookingView({
  setView,
  initialService = null,
  initialDoctor = null,
  isFollowUp = false,
  user
}: {
  setView: (v: View) => void;
  initialService?: number | null;
  initialDoctor?: number | null;
  isFollowUp?: boolean;
  user: PatientUser | null;
}) {
  const [step, setStep] = useState(isFollowUp ? 3 : 0);
  const [selService, setSelService] = useState<number | null>(initialService);
  const [selDoctor, setSelDoctor] = useState<number | "any" | null>(initialDoctor);
  const [matchedDoctor, setMatchedDoctor] = useState<number | null>(null);
  const [preScreen, setPreScreen] = useState({ firstTime: true, notes: "" });
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
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    Promise.all([
      getClinicClosures(),
      getLeaveRequests(),
      getDentists(),
      getLandingServices(),
      getLandingDoctors(),
      getAppointments()
    ]).then(([cData, lData, dData, sData, ldData, apptData]) => {
      setClosures(cData);
      setLeaves(lData.filter(l => l.status === "อนุมัติแล้ว" || l.status === "รอการอนุมัติ"));
      setDentistsData(dData);
      setServicesData(sData);
      setLandingDoctors(ldData);
      setAppointments(apptData.filter(a => a.status !== 'ยกเลิก'));
    }).catch(console.error);
  }, []);

  // Fetch doctors filtered by selected service when entering Step 1
  useEffect(() => {
    if (step === 1 && selService !== null && servicesData[selService]) {
      const serviceId = servicesData[selService].serviceId;
      if (serviceId) {
        setLoadingDoctors(true);
        getDentistsByService(serviceId).then(docs => {
          setFilteredDoctors(docs);
          setLoadingDoctors(false);
        }).catch(err => {
          console.error('Error fetching doctors by service:', err);
          // fallback to all doctors
          setFilteredDoctors(landingDoctors);
          setLoadingDoctors(false);
        });
      } else {
        setFilteredDoctors(landingDoctors);
      }
    }
  }, [step, selService]);

  useEffect(() => {
    if (selService === null || !servicesData[selService]) {
      setPaymentPlans([]);
      setSelPaymentPlan(null);
      return;
    }
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const plans = await getPaymentPlans(servicesData[selService].serviceId);
        setPaymentPlans(plans);
      } catch (err) {
        console.error("Failed to fetch payment plans", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [selService, servicesData]);

  // Re-fetch appointments when entering date/time step to ensure we have the latest booked slots
  useEffect(() => {
    if (step === 3) {
      getAppointments().then(apptData => {
        setAppointments(apptData.filter(a => a.status !== 'ยกเลิก'));
      }).catch(console.error);
    }
  }, [step, selDay]);

  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  
  // Only compare todayN if we are in the current month
  const isCurrentMonth = monthOffset === 0;
  const todayN = today.getDate();

  const dayStatus = (d: number): { status: "past" | "full" | "available", reason?: string } => {
    if (isCurrentMonth && d < todayN) return { status: "past", reason: "วันที่ผ่านมาแล้ว" };
    if (monthOffset < 0) return { status: "past", reason: "ไม่สามารถจองย้อนหลังได้" };
    
    // Check clinic closure
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const closure = closures.find(c => c.date === dateStr);
    if (closure) {
      return { status: "past", reason: `คลินิกปิด: ${closure.reason}` }; // Use past to disable clicking
    }

    // Check doctor leave
    if (selDoctor !== null && selDoctor !== "any") {
      const selectedDocId = selDoctor as number;
      const docDbInfo = dentistsData.find(db => db.id === selectedDocId);
      if (docDbInfo && docDbInfo.userId) {
        const docLeaves = leaves.filter(l => l.doctorId === docDbInfo.userId && l.startDate === dateStr);
        const fullDayLeave = docLeaves.find(l => l.leavePeriod === "เต็มวัน");
        if (fullDayLeave) {
          return { status: "past", reason: `ทันตแพทย์ลาพัก: ${fullDayLeave.reason}` };
        }
      }
    }

    const dateDow = new Date(year, month, d).getDay();
    // ปิดชั่วคราวเพื่อให้ทดสอบจองวันอาทิตย์ (วันนี้) ได้
    // if (dateDow === 0) return { status: "past", reason: "คลินิกปิดทำการวันอาทิตย์" };
    
    return { status: "available" };
  };

  const BASE_TIMES = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30"
  ];

  const estTime = selService !== null && servicesData[selService] ? servicesData[selService].baseTimeMins : 30;
  const reqSlots = Math.ceil((estTime + 15) / 30); // Including 15 min buffer
  
  const endTimeStr = selTime ? (() => {
    const [h, m] = selTime.split(":").map(Number);
    const totalMins = h * 60 + m + estTime;
    return `${String(Math.floor(totalMins / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`;
  })() : "";

  const processedTimes = BASE_TIMES.map(t => {
    let isBlockedByLeave = false;
    let isBooked = false;
    
    if (selDay) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`;
      const dayAppts = appointments.filter(a => a.date === dateStr);

      if (selDoctor !== null && selDoctor !== "any") {
        const selectedDocId = selDoctor as number;
        const docDbInfo = dentistsData.find(db => db.id === selectedDocId);
        
        // 1. Check leave
        if (docDbInfo && docDbInfo.userId) {
          const docLeaves = leaves.filter(l => l.doctorId === docDbInfo.userId && l.startDate === dateStr);
          if (docLeaves.some(l => l.leavePeriod === "ครึ่งวันเช้า")) {
            if (t < "13:00") isBlockedByLeave = true;
          }
          if (docLeaves.some(l => l.leavePeriod === "ครึ่งวันบ่าย")) {
            if (t >= "13:00") isBlockedByLeave = true;
          }
          if (docLeaves.some(l => l.leavePeriod === "เต็มวัน")) {
            isBlockedByLeave = true;
          }
        }

        // 2. Check appointments (check if slot t falls within any appointment's start and end time)
        if (dayAppts.some(a => a.doctorId === selectedDocId && t >= a.time && (a.endTime ? t < a.endTime : a.time.startsWith(t)))) {
          isBooked = true;
        }

      } else if (selDoctor === "any") {
        // If any doctor is selected, assume there are 3 doctors total.
        // It's booked only if there are 3 appointments overlapping at that time.
        const apptsAtTime = dayAppts.filter(a => t >= a.time && (a.endTime ? t < a.endTime : a.time.startsWith(t))).length;
        if (apptsAtTime >= filteredDoctors.length || apptsAtTime >= 3) {
          isBooked = true;
        }
      }
    }
    return { t, booked: isBooked || isBlockedByLeave };
  });

  const availableTimes = processedTimes.map((slot, i) => {
    if (slot.booked) return { ...slot, canBook: false };
    let canBook = true;
    for (let j = 0; j < reqSlots; j++) {
      if (i + j >= processedTimes.length || processedTimes[i + j].booked) {
        canBook = false;
        break;
      }
    }
    return { ...slot, canBook };
  });

  const canNext = () => {
    if (step === 0) return selService !== null;
    if (step === 1) return selDoctor !== null;
    if (step === 1.5) return selPaymentPlan !== null;
    if (step === 2) return true; // pre-screen is optional/has defaults
    if (step === 3) return selDay !== null && selTime !== null;
    return false;
  };

  const handleNext = () => {
    if (!canNext()) return;
    if (step === 1 && paymentPlans.length > 0) {
      setStep(1.5);
    } else if (step === 1.5) {
      setStep(2);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step === 2 && paymentPlans.length > 0) {
      setStep(1.5);
    } else if (step === 1.5) {
      setStep(1);
    } else {
      setStep(s => s - 1);
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Complex services (like Orthodontics, Implant) require staff approval
    const serviceTitle = servicesData[selService!]?.title || "";
    const requiresApproval = serviceTitle.includes("จัดฟัน") || serviceTitle.includes("รากฟันเทียม") || serviceTitle.includes("ผ่าฟันคุด");
    setIsPending(requiresApproval);
    
    let finalDoctor = { name: "ไม่ระบุแพทย์", id: 1 };
    if (selDoctor === "any") {
      const randomIdx = Math.floor(Math.random() * (filteredDoctors.length || 1));
      if (filteredDoctors[randomIdx]) {
        finalDoctor = { name: filteredDoctors[randomIdx].name, id: filteredDoctors[randomIdx].id };
      }
      setMatchedDoctor(finalDoctor.id); // set ID
    } else {
      const doc = landingDoctors.find(d => d.id === selDoctor);
      if (doc) {
        finalDoctor = { name: doc.name, id: doc.id };
      }
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
        date: `${year}-${String(month + 1).padStart(2, '0')}-${selDay?.toString().padStart(2, "0")}`,
        time: selTime || "",
        durationMins: estTime,
        status: requiresApproval ? "รอการยืนยัน" : "ยืนยันการจอง",
        source: "patient",
        cost: 0,
        paid: false,
        treatmentNotes: "",
        treatmentServices: [],
        recommendations: "",
        allergies: "ไม่มี",
        conditions: preScreen.notes || "ไม่มี",
        paymentPlanId: selPaymentPlan || undefined
      });
      setDone(true);
    } catch (err: any) {
      console.error("Booking error:", err);
      alert("Failed to book appointment: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: isPending ? "#FFF3E0" : "#E8FFF0" }}>
          {isPending ? <FileText size={36} style={{ color: "#E65100" }} /> : <CheckCircle size={36} style={{ color: "#22C55E" }} />}
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          {isPending ? "ส่งคำขอจองนัดหมายแล้ว" : "จองนัดหมายสำเร็จ!"}
        </h2>
        <p className="text-sm mb-2" style={{ color: "#4A6080" }}>
          {servicesData[selService!]?.title || ""} กับ {
            selDoctor === "any" && landingDoctors.find(d => d.id === matchedDoctor) 
              ? `ทพ. ${landingDoctors.find(d => d.id === matchedDoctor)?.name}`
              : selDoctor !== "any" && landingDoctors.find(d => d.id === selDoctor)
                ? `ทพ. ${landingDoctors.find(d => d.id === selDoctor)?.name}`
                : "ไม่ระบุแพทย์"
          }
        </p>
        <p className="text-sm font-semibold mb-6" style={{ color: "#1A365D" }}>
          วันที่ {selDay} {today.toLocaleDateString("th-TH", { month: "long", year: "numeric" })} เวลา {selTime} - {endTimeStr} น.
        </p>
        
        {isPending && (
          <p className="text-sm mb-6 px-4 py-3 rounded-xl text-left" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
            บริการนี้เป็นบริการเฉพาะทางหรือมีความซับซ้อน คำขอของคุณกำลังรอให้พนักงานยืนยันคิวอีกครั้ง เราจะแจ้งให้ทราบทาง SMS หรือคุณสามารถติดตามสถานะได้ในหน้ารายการนัดหมาย
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <button onClick={() => setView("appointments")}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
            ดูรายการนัดหมาย
          </button>
          {!isFollowUp && (
            <button onClick={() => { setStep(0); setSelService(null); setSelDoctor(null); setSelDay(null); setSelTime(null); setDone(false); setIsPending(false); }}
              className="px-6 py-2.5 rounded-xl text-sm font-medium"
              style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#1A365D" }}>
              จองอีกครั้ง
            </button>
          )}
        </div>
      </div>
    );
  }

  const steps = [
    { id: 0, label: "บริการ" },
    { id: 1, label: "แพทย์" }
  ];
  if (paymentPlans.length > 0) {
    steps.push({ id: 1.5, label: "แผนชำระเงิน" });
  }
  steps.push(
    { id: 2, label: "คัดกรอง" },
    { id: 3, label: "วัน-เวลา" },
    { id: 4, label: "ยืนยัน" }
  );

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {step > (isFollowUp ? 3 : 0) && (
          <button onClick={handleBack} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-all" style={{ color: "#1A365D" }}>
            <ChevronLeft size={18} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จองนัดหมาย</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>
            {isFollowUp ? "เลือกวัน-เวลาสำหรับการนัดหมายต่อเนื่อง" : steps.find(s => s.id === step)?.label ? `เลือก${steps.find(s => s.id === step)?.label}` : "ดำเนินการจอง"}
          </p>
        </div>
      </div>

      {/* Step pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: i < currentStepIndex ? "#E8FFF0" : i === currentStepIndex ? "#FF8C9A" : "rgba(26,54,93,0.06)",
                color: i < currentStepIndex ? "#1B7A3E" : i === currentStepIndex ? "white" : "#4A6080",
              }}>
              {i < currentStepIndex ? <Check size={11} /> : <span>{i + 1}</span>}
              <span className="inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={12} style={{ color: "#ccc" }} />}
          </div>
        ))}
      </div>

      {/* Step 0: Select service */}
      {step === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicesData.map((s, i) => {
            const Icon = iconMap[s.iconName] || Smile;
            return (
            <button key={i} onClick={() => setSelService(i)}
              className="p-5 rounded-2xl text-left transition-all"
              style={{
                backgroundColor: "white",
                border: selService === i ? "2px solid #FF8C9A" : "2px solid transparent",
                boxShadow: selService === i ? "0 8px 24px rgba(255,140,154,0.2)" : "0 2px 12px rgba(26,54,93,0.06)",
              }}>
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

      {/* Step 1: Select doctor */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loadingDoctors ? (
            <div className="col-span-full text-center py-12">
              <p className="text-sm" style={{ color: "#4A6080" }}>กำลังโหลดข้อมูลทันตแพทย์...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-sm font-medium" style={{ color: "#E0314C" }}>ไม่มีทันตแพทย์ที่รองรับบริการนี้</p>
              <p className="text-xs mt-2" style={{ color: "#4A6080" }}>กรุณาเลือกบริการอื่น หรือติดต่อคลินิก</p>
            </div>
          ) : (
            <>
          {/* Any Doctor option */}
          <button onClick={() => setSelDoctor("any")}
            className="rounded-2xl overflow-hidden text-left transition-all md:col-span-1"
            style={{
              backgroundColor: "white",
              border: selDoctor === "any" ? "2px solid #FF8C9A" : "2px solid transparent",
              boxShadow: selDoctor === "any" ? "0 8px 24px rgba(255,140,154,0.2)" : "0 2px 12px rgba(26,54,93,0.06)",
            }}>
            <div className="w-full flex items-center justify-center bg-gray-50" style={{ height: 160 }}>
              <UserPlus size={48} style={{ color: "#1A365D", opacity: 0.3 }} />
            </div>
            <div className="p-4">
              <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>แพทย์ท่านใดก็ได้</p>
              <p className="text-xs mt-0.5" style={{ color: "#FF8C9A" }}>ระบบจะจัดคิวที่เร็วที่สุดให้</p>
              <p className="text-xs mt-1" style={{ color: "#4A6080" }}>แนะนำสำหรับคิวเร่งด่วน</p>
            </div>
          </button>
          
          {landingDoctors.map((d) => {
            const isAvailable = filteredDoctors.some(fd => fd.id === d.id);
            return (
            <button key={d.id} onClick={() => isAvailable && setSelDoctor(d.id)}
              disabled={!isAvailable}
              className={`rounded-2xl overflow-hidden text-left transition-all ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                backgroundColor: "white",
                border: selDoctor === d.id ? "2px solid #FF8C9A" : "2px solid transparent",
                boxShadow: selDoctor === d.id ? "0 8px 24px rgba(255,140,154,0.2)" : "0 2px 12px rgba(26,54,93,0.06)",
              }}>
              <img src={d.img} alt={d.name} className="w-full object-cover" style={{ height: 160 }} />
              <div className="p-4">
                <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{d.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#FF8C9A" }}>{d.specialty}</p>
                <p className="text-xs mt-1" style={{ color: "#4A6080" }}>{d.years}</p>
                {!isAvailable && <p className="text-[11px] mt-2 font-medium" style={{ color: "#E0314C" }}>ไม่รองรับบริการนี้</p>}
              </div>
            </button>
            );
          })}
            </>
          )}
        </div>
      )}

      {/* Step 1.5: Payment Plan */}
      {step === 1.5 && (
        <div className="max-w-xl">
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 className="font-semibold text-base mb-2" style={{ color: "#1A365D" }}>เลือกรูปแบบการชำระเงิน</h3>
            <p className="text-sm mb-5" style={{ color: "#4A6080" }}>บริการที่คุณเลือกมีแผนการชำระเงินที่สามารถแบ่งจ่ายได้ กรุณาเลือกรูปแบบที่คุณต้องการ</p>
            
            {loadingPlans ? (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: "#4A6080" }}>กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentPlans.map((plan) => (
                  <button key={plan.plan_id} onClick={() => setSelPaymentPlan(plan.plan_id)}
                    className="w-full text-left p-4 rounded-xl transition-all"
                    style={{
                      border: selPaymentPlan === plan.plan_id ? "2px solid #FF8C9A" : "2px solid rgba(26,54,93,0.06)",
                      backgroundColor: selPaymentPlan === plan.plan_id ? "#FFF0F2" : "white"
                    }}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{plan.plan_name}</p>
                      <p className="font-semibold text-sm" style={{ color: "#FF8C9A" }}>{plan.total_amount?.toLocaleString() || "-"} บาท</p>
                    </div>
                    {plan.installments > 1 && (
                      <div className="text-xs space-y-1" style={{ color: "#4A6080" }}>
                        {plan.down_payment > 0 && <p>ชำระครั้งแรก: {plan.down_payment.toLocaleString()} บาท</p>}
                        <p>แบ่งชำระ: {plan.installments} งวด งวดละ {plan.per_month?.toLocaleString() || "-"} บาท</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Pre-screening */}
      {step === 2 && (
        <div className="max-w-xl">
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 className="font-semibold text-sm mb-5" style={{ color: "#1A365D" }}>คำถามคัดกรองเบื้องต้นเพื่อประเมินเวลา</h3>
            
            <div className="space-y-6">



              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: "#4A6080" }}>อาการผิดปกติ หรือ ข้อสังเกตเพิ่มเติม (ถ้ามี)</label>
                <textarea rows={3} value={preScreen.notes}
                  onChange={e => setPreScreen(p => ({ ...p, notes: e.target.value }))}
                  placeholder="เช่น ปวดฟันซี่ในสุดตอนกลางคืน, มีเลือดออกตอนแปรงฟัน"
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }}
                />
                <div className="mt-4 p-3 rounded-xl flex gap-3 items-start" style={{ backgroundColor: "#FFFBEB" }}>
                  <Smile size={16} style={{ color: "#D97706", flexShrink: 0, marginTop: 2 }} />
                  <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
                    <strong>ไม่ต้องกังวลเรื่องเวลา!</strong> ทันตแพทย์จะทำการตรวจประเมินหน้างานอีกครั้ง หากมีจุดที่ต้องรักษาหลายซี่ คุณหมอจะทำการรักษาเท่าที่เวลาเอื้ออำนวย และนัดหมายทำต่อในครั้งถัดไปครับ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Calendar + time */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Calendar */}
          <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setMonthOffset(m => m - 1)} className="p-1 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }}>
                <ChevronLeft size={20} />
              </button>
              <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>
                {targetDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
              </p>
              <button onClick={() => setMonthOffset(m => m + 1)} className="p-1 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map(d => (
                <div key={d} className="text-center text-xs py-1" style={{ color: "#4A6080" }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(firstDow)].map((_, i) => <div key={`e${i}`} />)}
              {[...Array(daysInMonth)].map((_, i) => {
                const d = i + 1;
                const stObj = dayStatus(d);
                const st = stObj.status;
                const sel = selDay === d;
                return (
                  <button key={d} disabled={st !== "available"} onClick={() => { setSelDay(d); setSelTime(null); }}
                    title={stObj.reason}
                    className="aspect-square rounded-xl flex items-center justify-center text-xs font-medium transition-all"
                    style={{
                      backgroundColor: sel ? "#FF8C9A" : st === "full" ? "#FFE8EC" : st === "past" ? "transparent" : "#F0F4F8",
                      color: sel ? "white" : st === "full" ? "#FF8C9A" : st === "past" ? "#ccc" : "#1A365D",
                      cursor: st === "available" ? "pointer" : "not-allowed",
                      border: st === "full" && !sel ? "1px solid #FFB3BC" : "1px solid transparent",
                    }}>
                    {d}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4">
              {[
                { bg: "#F0F4F8", border: "transparent", label: "ว่าง" },
                { bg: "#FFE8EC", border: "#FFB3BC",     label: "เต็ม" },
                { bg: "#FF8C9A", border: "transparent", label: "เลือก" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: "#4A6080" }}>
                  <div className="w-4 h-4 rounded-md" style={{ backgroundColor: l.bg, border: `1px solid ${l.border}` }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <p className="font-semibold text-sm mb-4" style={{ color: "#1A365D" }}>
              {selDay ? `เวลาว่าง วันที่ ${selDay}` : "เลือกวันก่อน"}
            </p>
            {selDay && (
              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map(({ t, booked, canBook }) => (
                  <button key={t} disabled={!canBook} onClick={() => setSelTime(t)}
                    className="py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      backgroundColor: (selTime && t >= selTime && t < endTimeStr) ? "#FF8C9A" : booked ? "#F0F4F8" : "white",
                      color: (selTime && t >= selTime && t < endTimeStr) ? "white" : !canBook ? "#bbb" : "#1A365D",
                      border: (selTime && t >= selTime && t < endTimeStr) ? "none" : booked ? "1px solid rgba(26,54,93,0.06)" : "1.5px solid rgba(26,54,93,0.12)",
                      cursor: !canBook ? "not-allowed" : "pointer",
                      opacity: !canBook && !booked ? 0.5 : 1
                    }}>
                    {t}
                    {booked && <span className="block text-xs" style={{ color: "#ccc" }}>จองแล้ว</span>}
                    {!booked && !canBook && <span className="block text-xs" style={{ color: "#ccc" }}>เวลาไม่พอ</span>}
                  </button>
                ))}
              </div>
            )}
            {selDay && selTime && (
              <div className="mt-4 p-3 rounded-xl flex gap-2" style={{ backgroundColor: "#FFE8EC" }}>
                <Clock size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#E0314C" }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#E0314C" }}>จอง {selTime} น. เสร็จ {endTimeStr} น.</p>
                  <p className="text-xs mt-1" style={{ color: "#E0314C", opacity: 0.8 }}>ประเมินเวลาการรักษา: {estTime} นาที (รวมเวลาเตรียมตัว 15 นาที)</p>
                </div>
              </div>
            )}
            {selDay && !selTime && (
              <div className="mt-4 p-3 rounded-xl flex gap-2" style={{ backgroundColor: "#F0F4F8" }}>
                <FileText size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#1A365D" }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#1A365D" }}>ประเมินเวลาการรักษา: {estTime} นาที</p>
                  <p className="text-xs mt-1" style={{ color: "#4A6080" }}>กรุณาเลือกเวลาที่ต้องการจอง (ระบบจะคลุมเวลาให้อัตโนมัติ)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="max-w-lg">
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 className="font-semibold text-base mb-5" style={{ color: "#1A365D" }}>สรุปการจองนัดหมาย</h3>
            {[
              { label: "บริการ",     val: servicesData[selService!]?.title || "ไม่ระบุ" },
              { label: "ทันตแพทย์", val: selDoctor === "any" ? "แพทย์ท่านใดก็ได้ (คิวเร็วสุด)" : landingDoctors.find(d => d.id === selDoctor)?.name || "ไม่ระบุ" },
              { label: "แผนชำระเงิน", val: paymentPlans.length > 0 && selPaymentPlan ? paymentPlans.find(p => p.plan_id === selPaymentPlan)?.plan_name : "ชำระปกติ" },
              { label: "วันที่",     val: `${selDay} ${today.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}` },
              { label: "เวลา",       val: `${selTime} - ${endTimeStr} น.` },
              { label: "ราคาเริ่มต้น", val: servicesData[selService!]?.price || "-" },
            ].map((r, idx) => (
              <div key={r.label} className="flex justify-between py-2.5 text-sm" style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}>
                <span style={{ color: "#4A6080" }}>{r.label}</span>
                <span className="font-medium" style={{ color: "#1A365D" }}>{r.val}</span>
              </div>
            ))}
            <button onClick={handleConfirm} disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-semibold text-white mt-5 transition-all hover:opacity-90"
              style={{ 
                background: isSubmitting ? "#ccc" : "linear-gradient(135deg,#FF8C9A,#FF6B7E)", 
                boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(255,140,154,0.4)",
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}>
              {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการจองนัดหมาย"}
            </button>
          </div>
        </div>
      )}

      {/* Next button */}
      {step < 4 && (
        <div className="mt-6">
          <button onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all"
            style={{
              background: canNext() ? "linear-gradient(135deg,#FF8C9A,#FF6B7E)" : "rgba(26,54,93,0.12)",
              color: canNext() ? "white" : "#bbb",
              cursor: canNext() ? "pointer" : "not-allowed",
            }}>
            ถัดไป <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
