import React, { useState, useEffect } from "react";
import { Clock, UserPlus, CheckCircle, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import { Appointment, DentistInfo, ServiceInfo } from "../../shared/data";
import { 
  getDentists, getServices, addAppointment, getClinicTimeSlots,
  getClinicClosures, getWeeklyOffDays, getDoctorSchedules, getUpcomingLeaves, getPatients
} from "../../shared/supabaseApi";

export default function WalkInBooking({ onAddAppt }: { onAddAppt?: (appt: Appointment) => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ 
    service: "", doctorId: 0, date: "", time: "", note: "", openAppt: false 
  });
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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

  useEffect(() => {
    Promise.all([
      getDentists(), getServices(),
      getClinicClosures(), getWeeklyOffDays(), getDoctorSchedules(), getUpcomingLeaves(), getPatients()
    ]).then(([d, s, cData, offData, dsData, leavesData, patData]) => {
      setDentists(d.filter(x => x.active));
      setServices(s.filter(x => x.active));
      setClosures(cData);
      setWeeklyOffDays(offData);
      setDoctorSchedules(dsData);
      setUpcomingLeaves(leavesData);
      setAllPatients(patData);
    }).catch(console.error);
  }, []);

  const [timeSlots, setTimeSlots] = useState<{ time: string, status: string, canBook: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const getEstMins = (serviceName: string) => {
    if (serviceName.includes("จัดฟัน") || serviceName.includes("รากฟันเทียม")) return 60;
    if (serviceName.includes("ฟอกสีฟัน") || serviceName.includes("รักษารากฟัน")) return 45;
    return 30;
  };
  
  const estMins = form.service ? getEstMins(form.service) : 30;
  const reqSlots = Math.ceil(estMins / 30);

  const selectedServiceId = services.find(s => s.name === form.service)?.id;
  const filteredDentists = selectedServiceId 
    ? dentists.filter(d => d.serviceIds?.includes(selectedServiceId))
    : dentists;

  // ดึงช่วงเวลาว่างเมื่ออยู่ในขั้นตอนเลือกเวลาและเลือกวันที่เรียบร้อยแล้ว
  useEffect(() => {
    if (step === 1 && form.date && !form.openAppt) {
      setLoadingSlots(true);
      // สำหรับคิวหน้าร้าน (Walk-in) กรณีไม่ระบุแพทย์จะใช้รหัสเป็น 0
      // ระบบจะดึงช่วงเวลาว่างของทันตแพทย์ทุกท่านที่เข้าเวร
      getClinicTimeSlots(form.date, selectedServiceId, form.doctorId || undefined).then(slots => {
        const processed = slots.map((slot, i) => {
          if (slot.status !== 'available') return { ...slot, canBook: false };
          let canBook = true;
          for (let j = 0; j < reqSlots; j++) {
            if (i + j >= slots.length || slots[i + j].status !== 'available') {
              canBook = false;
              break;
            }
          }
          return { ...slot, canBook };
        });
        setTimeSlots(processed);
      }).catch(console.error).finally(() => setLoadingSlots(false));
    }
  }, [step, form.date, form.doctorId, form.openAppt, selectedServiceId, reqSlots]);

  const handleServiceChange = (serviceName: string) => {
    setForm(f => {
      const newForm = { ...f, service: serviceName };
      const sId = services.find(s => s.name === serviceName)?.id;
      if (sId && f.doctorId) {
        const doc = dentists.find(d => d.id === f.doctorId);
        if (doc && !doc.serviceIds?.includes(sId)) {
          newForm.doctorId = 0;
        }
      }
      return newForm;
    });
  };

  // ฟังก์ชันช่วยจัดการปฏิทิน
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
    if (weeklyOffDays.includes(dayOfWk)) return { status: "past" as const, reason: "วันหยุดประจำสัปดาห์" };
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const closure = closures.find((c) => c.date === dateStr);
    if (closure) return { status: "past" as const, reason: closure.reason };
    
    // ตรวจสอบตารางเวรของทันตแพทย์
    if (form.doctorId > 0) {
      const selDocData = dentists.find(fd => fd.id === form.doctorId);
      const shift = doctorSchedules.find(s => s.dentistId === form.doctorId && s.dayOfWeek === dayOfWk);
      const isFullLeave = selDocData ? upcomingLeaves.some(l => l.user_id === selDocData.userId && l.leave_date === dateStr && l.leave_period === 'เต็มวัน') : false;
      
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
    
    // ค้นหาและกรองรายชื่อคนไข้
    const filtered = allPatients.filter(p => 
      p.name.toLowerCase().includes(keyword) || 
      p.hn.toLowerCase().includes(keyword) ||
      (p.phone && p.phone.includes(keyword)) ||
      (p.email && p.email.toLowerCase().includes(keyword)) ||
      (p.citizenId && p.citizenId.includes(keyword))
    );

    setPatientResults(filtered);
    if (filtered.length === 0 && !patientInfo) {
      setSearchError("ไม่พบข้อมูลคนไข้ในระบบ กรุณาตรวจสอบอีกครั้ง หรือไปที่เมนูลงทะเบียนคนไข้ใหม่");
    } else {
      setSearchError("");
    }
  }, [searchKeyword, allPatients]);

  const confirm = async () => {
    const doctorName = dentists.find(d => d.id === form.doctorId)?.name ?? "ท่านใดก็ได้";
    const hasHealthRisk = (patientInfo?.underlyingDisease && patientInfo.underlyingDisease !== "ไม่มี" && patientInfo.underlyingDisease !== "ไม่มีโรคประจำตัว") || 
                          (patientInfo?.allergyHistory && patientInfo.allergyHistory !== "ไม่มี");
    const newAppt: Omit<Appointment, "id"> = {
      hn: patientInfo?.hn || `HN${Date.now().toString().slice(-3)}`,
      patientId: patientInfo?.id,
      patientName: patientInfo?.name || "Unknown", 
      patientPhone: patientInfo?.phone || "",
      service: form.service, doctorName,
      doctorId: form.doctorId,
      date: form.openAppt ? "" : form.date,
      time: form.openAppt ? "" : form.time, 
      status: form.openAppt ? "ยืนยันการจอง" : "เช็คอินเรียบร้อย",
      conditions: patientInfo?.underlyingDisease || "ไม่มี", 
      allergies: patientInfo?.allergyHistory || "ไม่มี",
      note: form.note
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

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#E8FFF0" }}>
          <CheckCircle size={28} style={{ color: "#22C55E" }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>จอง Walk-in สำเร็จ!</h2>
        <p className="text-sm mb-1" style={{ color: "#4A6080" }}>{patientInfo?.name}</p>
        <p className="text-sm mb-6" style={{ color: "#4A6080" }}>{form.service} • {form.openAppt ? "รอคนไข้ระบุวัน-เวลา" : `เวลา ${form.time} น.`}</p>
        <button onClick={() => { setStep(0); setForm({ service: "", doctorId: 0, date: "", time: "", note: "", openAppt: false }); setPatientInfo(null); setPatientResults([]); setSearchKeyword(""); setDone(false); }}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          จองรายต่อไป
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>จองคิว Walk-in</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>จองคิวสำหรับคนไข้ที่มาหน้าร้าน</p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* แถบแสดงขั้นตอน */}
        <div className="flex items-center gap-2 mb-6">
          {["ข้อมูลคนไข้", "รายละเอียดและเวลา", "ยืนยัน"].map((l, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium`}
                style={{
                  backgroundColor: i < step ? "#E8FFF0" : i === step ? "#FF8C9A" : "rgba(26,54,93,0.06)",
                  color: i < step ? "#1B7A3E" : i === step ? "white" : "#4A6080",
                }}>
                <span>{i + 1}. {l}</span>
              </div>
              {i < 2 && <div className="w-3 sm:w-10 h-0.5" style={{ backgroundColor: i < step ? "#22C55E" : "rgba(26,54,93,0.1)" }} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
          {step === 0 && (
            <div className="space-y-4 max-w-xl mx-auto py-8">
              <div className="text-center mb-6">
                 <h3 className="text-lg font-bold text-[#1A365D] mb-2">ค้นหาประวัติคนไข้</h3>
                 <p className="text-sm text-[#4A6080]">กรุณากรอกชื่อ-สกุล, เลขบัตรประชาชน, เบอร์โทรศัพท์ หรืออีเมลเพื่อดึงข้อมูล</p>
              </div>
              {!patientInfo && (
                <div className="flex gap-2">
                   <div className="relative flex-1">
                     <input 
                       type="text" 
                       value={searchKeyword} 
                       onChange={e => {
                         setSearchKeyword(e.target.value);
                         if (patientInfo) setPatientInfo(null); // ล้างคนไข้ที่เลือกไว้หากพิมพ์ค้นหาใหม่
                       }}
                       placeholder="พิมพ์ชื่อ-สกุล / เลขบัตรฯ / เบอร์โทร / อีเมล" 
                       className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#FF8C9A]/30"
                       style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} 
                     />
                   </div>
                </div>
              )}
              {searchError && (
                 <div className="p-4 rounded-xl mt-4 text-sm flex items-center justify-between" style={{ backgroundColor: "#FFF0F2", color: "#E63946" }}>
                   <span>{searchError}</span>
                 </div>
              )}
              {patientResults.length > 0 && !patientInfo && (
                 <div className="mt-4 space-y-2">
                   <p className="text-sm font-medium text-[#1A365D]">พบข้อมูลคนไข้ {patientResults.length} รายการ กรุณาเลือก:</p>
                   {patientResults.map((p: any) => (
                     <button key={p.id} onClick={() => setPatientInfo(p)} className="w-full text-left p-4 rounded-xl border flex items-center justify-between transition-colors hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
                       <div>
                         <p className="font-bold text-[#1A365D] text-sm">{p.name}</p>
                         <p className="text-xs text-[#4A6080]">{p.hn} • {p.phone}</p>
                       </div>
                       <ChevronRight size={16} className="text-[#4A6080]" />
                     </button>
                   ))}
                 </div>
              )}
              {patientInfo && (
                 <div className="p-4 rounded-xl mt-4 border flex items-center justify-between" style={{ borderColor: "rgba(26,54,93,0.1)", backgroundColor: "#FAFCFF" }}>
                   <div>
                     <p className="font-bold text-[#1A365D] text-lg">{patientInfo.name}</p>
                     <p className="text-sm text-[#4A6080]">{patientInfo.hn} • {patientInfo.phone}</p>
                   </div>
                   <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E8FFF0] text-[#1B7A3E]">
                     <CheckCircle size={20} />
                   </div>
                 </div>
              )}
              {patientInfo && patientResults.length > 1 && (
                 <button onClick={() => setPatientInfo(null)} className="text-xs text-[#4A6080] underline mt-3 block w-full text-center">
                   เลือกคนไข้รายอื่น
                 </button>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1.1fr_1fr] gap-6 items-start">
              {/* คอลัมน์ที่ 1: เลือกบริการ */}
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "#4A6080" }}>เลือกบริการ *</p>
                  <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
                    {services.map(s => (
                      <button key={s.id} onClick={() => handleServiceChange(s.name)}
                        className="px-3 py-2.5 rounded-xl text-xs text-left transition-all"
                        style={{
                          backgroundColor: form.service === s.name ? "#FFD6DC" : "#F0F4F8",
                          border: form.service === s.name ? "1.5px solid #FF8C9A" : "1.5px solid transparent",
                          color: "#1A365D",
                        }}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {form.service && (
                  <div className="p-4 rounded-xl" style={{ background: "linear-gradient(135deg,#FFF0F2,#FFF8F9)", border: "1px solid rgba(255,140,154,0.25)" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#1A365D", marginBottom: 2 }}>{form.service}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4A6080", marginBottom: 2 }}>
                      <Clock size={12} style={{ color: "#FF8C9A" }} />
                      <span>ใช้เวลาประมาณ {estMins} นาที</span>
                    </div>
                  </div>
                )}
              </div>

              {/* คอลัมน์ที่ 2: เลือกทันตแพทย์และวันที่ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                
                {/* ช่องเลือกทันตแพทย์ */}
                <div style={{ borderRadius: 16, backgroundColor: "white", overflow: "hidden", boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}>
                  <div style={{ padding: "10px 14px" }}>
                    <p className="text-xs font-medium mb-2" style={{ color: "#4A6080" }}>เลือกทันตแพทย์ (ตัวเลือกเสริม)</p>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                      <button onClick={() => setForm(f => ({ ...f, doctorId: 0, date: "", time: "" }))}
                        style={{ flexShrink: 0, width: 86, borderRadius: 12, overflow: "hidden", textAlign: "left", cursor: "pointer", backgroundColor: "white", border: form.doctorId === 0 ? "2px solid #FF8C9A" : "2px solid rgba(26,54,93,0.1)", boxShadow: form.doctorId === 0 ? "0 3px 12px rgba(255,140,154,0.3)" : "none" }}>
                        <div style={{ height: 64, backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <UserPlus size={24} style={{ color: "#1A365D", opacity: 0.2 }} />
                        </div>
                        <div style={{ padding: "5px 7px" }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#1A365D" }}>ท่านใดก็ได้</p>
                          <p style={{ fontSize: 9, color: "#FF8C9A", marginTop: 1 }}>คิวเร็วสุด</p>
                        </div>
                      </button>
                      {filteredDentists.map((d) => {
                        const imgUrl = d.imageUrl || 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&auto=format';
                        return (
                          <button key={d.id} onClick={() => setForm(f => ({ ...f, doctorId: d.id, date: "", time: "" }))}
                            style={{ flexShrink: 0, width: 86, borderRadius: 12, overflow: "hidden", textAlign: "left", cursor: "pointer", backgroundColor: "white", border: form.doctorId === d.id ? "2px solid #FF8C9A" : "2px solid rgba(26,54,93,0.1)", boxShadow: form.doctorId === d.id ? "0 3px 12px rgba(255,140,154,0.3)" : "none" }}>
                            <img src={imgUrl} alt={d.name} style={{ width: "100%", height: 64, objectFit: "cover", display: "block" }} />
                            <div style={{ padding: "5px 7px" }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#1A365D", lineHeight: 1.3 }}>{d.name}</p>
                              <p style={{ fontSize: 9, color: "#FF8C9A", marginTop: 1 }}>{d.specialty}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ปฏิทิน */}
                <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 16px rgba(26,54,93,0.10)" }}>
                  {/* ส่วนหัว */}
                  <div style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", padding: "9px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={() => setMonthOffset((m) => m - 1)}
                      style={{ width: 24, height: 24, borderRadius: 6, border: "none", backgroundColor: "rgba(255,255,255,0.2)", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ChevronLeft size={12} />
                    </button>
                    <p style={{ fontWeight: 700, fontSize: 12, color: "white", letterSpacing: "0.02em" }}>
                      {targetDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
                    </p>
                    <button onClick={() => setMonthOffset((m) => m + 1)}
                      style={{ width: 24, height: 24, borderRadius: 6, border: "none", backgroundColor: "rgba(255,255,255,0.2)", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  {/* ตารางวันที่ */}
                  <div style={{ backgroundColor: "white", padding: "8px 10px 10px" }}>
                    {/* ชื่อวันในสัปดาห์ */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
                      {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d, i) => {
                        const dayColors = ["#EF4444", "#FBBF24", "#F472B6", "#34D399", "#F97316", "#3B82F6", "#A855F7"];
                        return <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 600, color: dayColors[i], paddingBottom: 2 }}>{d}</div>;
                      })}
                    </div>
                    {/* ช่องวันที่ */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                      {[...Array(firstDow)].map((_, i) => <div key={`e${i}`} />)}
                      {[...Array(daysInMonth)].map((_, i) => {
                        const d = i + 1;
                        const ds = dayStatus(d);
                        const st = ds.status;
                        const reason = ds.reason;
                        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                        const sel = form.date === dateStr;
                        const isAvailable = st === "available";
                        return (
                          <button key={d} disabled={!isAvailable} onClick={() => setForm(f => ({ ...f, date: dateStr, time: "" }))}
                            title={reason}
                            style={{
                              height: 30, borderRadius: 6, border: "none", width: "100%",
                              fontSize: 10, fontWeight: sel ? 700 : 500,
                              cursor: isAvailable ? "pointer" : "not-allowed",
                              backgroundColor: sel ? "#FF8C9A" : isAvailable ? "rgba(26,54,93,0.03)" : "transparent",
                              color: sel ? "white" : isAvailable ? "#1A365D" : "#CBD5E1",
                            }}>
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 p-3 rounded-xl" style={{ backgroundColor: "#F8F9FA", border: "1px solid rgba(26,54,93,0.06)" }}>
                  <input type="checkbox" id="openAppt" checked={form.openAppt} onChange={e => setForm(f => ({ ...f, openAppt: e.target.checked, time: "" }))} className="w-4 h-4 rounded text-pink-500" />
                  <label htmlFor="openAppt" className="text-sm font-medium" style={{ color: "#1A365D" }}>นัดแบบเปิด (ให้คนไข้ไปเลือกวัน-เวลาทีหลัง)</label>
                </div>
                
                <div className="mt-4">
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "#4A6080" }}>หมายเหตุ / รายละเอียดนัดหมาย (ตัวเลือก)</label>
                  <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="เช่น อุดฟันซี่ 13, 14 ต่อ" className="w-full px-3 py-3 rounded-xl text-sm outline-none resize-none h-16"
                    style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                </div>
              </div>

              {/* คอลัมน์ที่ 3: เลือกเวลา */}
              <div>
                {!form.openAppt && form.date && (
                  <div style={{ borderRadius: 16, backgroundColor: "white", padding: "14px 16px", boxShadow: "0 1px 8px rgba(26,54,93,0.07)" }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#1A365D", marginBottom: 10 }}>เวลาที่ต้องการนัดหมาย</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                      {loadingSlots ? (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "10px 0", fontSize: 12, color: "#4A6080" }}>กำลังโหลดเวลาที่ว่าง...</div>
                      ) : timeSlots.length === 0 ? (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "10px 0", fontSize: 12, color: "#4A6080" }}>ไม่มีคิวว่าง / หมอไม่ได้เข้าเวร</div>
                      ) : timeSlots.map(({ time, status, canBook }) => {
                        const isBooked = status === 'booked';
                        const isPast = status === 'past';
                        const isOutside = status === 'outside_shift';
                        const notAvailable = isBooked || isPast || isOutside || !canBook;
                        return (
                          <button key={time} disabled={notAvailable} onClick={() => setForm(f => ({ ...f, time: time }))}
                            className="py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{
                              backgroundColor: form.time === time ? "#FF8C9A" : notAvailable ? "#F0F4F8" : "white",
                              color: form.time === time ? "white" : notAvailable ? "#ccc" : "#1A365D",
                              border: form.time === time ? "none" : notAvailable ? "1px solid transparent" : "1.5px solid rgba(26,54,93,0.12)",
                              cursor: notAvailable ? "not-allowed" : "pointer",
                              opacity: (isBooked || isPast || isOutside) ? 0.4 : (!canBook ? 0.6 : 1)
                            }}>
                            {time}
                            {isBooked && <div className="text-[10px] opacity-80 mt-1 line-clamp-1 overflow-hidden overflow-ellipsis">จองแล้ว</div>}
                            {isPast && <div className="text-[10px] opacity-80 mt-1 line-clamp-1 overflow-hidden overflow-ellipsis">เลยเวลาแล้ว</div>}
                            {isOutside && <div className="text-[10px] opacity-80 mt-1 line-clamp-1 overflow-hidden overflow-ellipsis">-</div>}
                            {!isBooked && !isPast && !isOutside && !canBook && <div className="text-[10px] opacity-80 mt-1 line-clamp-1 overflow-hidden overflow-ellipsis">เวลาไม่พอ</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold mb-4" style={{ color: "#1A365D" }}>ยืนยันการจอง Walk-in</h3>
              {[
                ["คนไข้", patientInfo?.name || "-"],
                ["รหัสคนไข้", patientInfo?.hn || "-"],
                ["เบอร์โทร", patientInfo?.phone || "-"],
                ["บริการ", form.service],
                ["ทันตแพทย์", form.doctorId ? dentists.find(d => d.id === form.doctorId)?.name ?? "-" : "ท่านใดก็ได้"],
                ["วัน-เวลา", form.openAppt ? "รอระบุวัน-เวลา" : `วันที่ ${form.date} เวลา ${form.time} น.`],
                ["หมายเหตุ", form.note || "-"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 text-sm" style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}>
                  <span style={{ color: "#4A6080" }}>{k}</span>
                  <span className="font-medium" style={{ color: "#1A365D" }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}>
                ย้อนกลับ
              </button>
            )}
            <button
              onClick={() => step < 2 ? setStep(s => s + 1) : confirm()}
              disabled={
                isSubmitting ||
                (step === 0 && !patientInfo) ||
                (step === 1 && (!form.service || (!form.openAppt && (!form.date || !form.time))))
              }
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
              {step < 2 ? <><span>ถัดไป</span><ArrowRight size={14} /></> : (isSubmitting ? "กำลังบันทึก..." : "ยืนยันการจอง")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
