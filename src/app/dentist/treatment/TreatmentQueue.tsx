import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Filter, Play, CheckCircle, Clock, FileText, Plus, X, AlertTriangle, ChevronRight, Check, Send, ClipboardList } from "lucide-react";

import { Appointment, STATUS_COLORS, ServiceInfo, AppointmentStatus, DentistInfo, hasHealthAlert } from "../../shared/data";
import { getAppointments, getServices, updateAppointmentStatus, saveTreatment, getPatientLatestOdontogram, getPatientActiveTreatmentPlan, supabase } from "../../shared/supabaseApi";
import Odontogram, { ToothStatus } from "./Odontogram";
import TreatmentPlanBuilder from "./TreatmentPlanBuilder";

export default function TreatmentQueue({ 
  doctor,
  appointments: initialAppointments
}: { 
  doctor: DentistInfo | null;
  appointments?: Appointment[];
}) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientIdForPlan, setSelectedPatientIdForPlan] = useState<number | null>(null);
  const [activePlan, setActivePlan] = useState<any | null>(null);
  const [selectedPlanMonth, setSelectedPlanMonth] = useState<number | null>(null);

  useEffect(() => {
    if (initialAppointments) {
      setAppointments(initialAppointments);
    }
  }, [initialAppointments]);

  useEffect(() => {
    const fetchData = () => {
      if (!initialAppointments) {
        getAppointments().then(apps => setAppointments(apps)).catch(console.error);
      }
      getServices().then(svcs => setServices(svcs.filter(s => s.active))).catch(console.error).finally(() => setLoading(false));
    };
    
    fetchData();
  }, []);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [recording, setRecording] = useState<number | null>(null);
  const [form, setForm] = useState<{ notes: string; recommendations: string; services: string[]; actualCost: number | "" }>({ notes: "", recommendations: "", services: [], actualCost: "" });
  const [toothData, setToothData] = useState<Record<number, ToothStatus>>({});
  const [isChild, setIsChild] = useState(false);
  const [isWholeMouth, setIsWholeMouth] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "all">("today");
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  const today = new Date();
  const todayString = today.toLocaleDateString('en-CA');
  const formattedDate = today.toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric' });

  const getWeekRange = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    const end = new Date(d.setDate(start.getDate() + 6));
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  };

  const getMonthRange = () => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  };

  const filteredAppts = appointments
    .filter(a => {
      if (a.doctorId !== doctor?.id) return false;
      if (timeFilter === "today") return a.date === todayString;
      if (timeFilter === "week") {
        const { start, end } = getWeekRange();
        return a.date >= start && a.date <= end;
      }
      if (timeFilter === "month") {
        const { start, end } = getMonthRange();
        return a.date >= start && a.date <= end;
      }
      return true; // all
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

  const toggleService = (s: string) => {
    setForm(f => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s],
    }));
  };

  useEffect(() => {
    const cost = form.services.reduce((sum, s) => {
      const svc = services.find(ms => ms.name === s);
      return sum + (svc?.basePrice ?? 0);
    }, 0);
    
    const treatedTeeth = Object.values(toothData).filter(s => s !== "normal").length;
    const suggestedCost = cost === 0 && treatedTeeth > 0 ? treatedTeeth * 800 : cost;
    
    setForm(f => ({ ...f, actualCost: suggestedCost > 0 ? suggestedCost : "" }));
  }, [form.services, toothData, services]);

  const onUpdateAppt = async (id: number, updates: Partial<Appointment>) => {
    try {
      if (updates.status) {
        if (updates.status === "รอชำระเงิน" && updates.treatmentNotes !== undefined) {
          // บันทึก Supabase ก่อน แล้วค่อยอัปเดต UI
          await saveTreatment(id, updates.treatmentNotes, updates.recommendations || "", updates.treatmentServices || [], updates.cost || 0, updates.odontogramData, doctor?.id, activePlan?.plan_id, selectedPlanMonth || undefined);
        } else {
          await updateAppointmentStatus(id, updates.status);
        }

        // อัปเดต local state หลัง Supabase บันทึกสำเร็จ
        setAppointments(apps => apps.map(a => a.id === id ? {
          ...a,
          status: updates.status!,
          treatmentNotes: updates.treatmentNotes || a.treatmentNotes,
          treatmentServices: updates.treatmentServices || a.treatmentServices,
          recommendations: updates.recommendations || a.recommendations,
          cost: updates.cost || a.cost
        } : a));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment");
    }
  };

  const handleStartRecording = async (a: Appointment) => {
    setRecording(a.id);
    setActivePlan(null);
    setSelectedPlanMonth(null);
    if (a.patientId) {
      const historyOdontogram = await getPatientLatestOdontogram(a.patientId);
      const { wholeMouth, ...rest } = historyOdontogram;
      setToothData(rest as any);
      setIsWholeMouth(!!wholeMouth);
      
      const planData = await getPatientActiveTreatmentPlan(a.patientId);
      if (planData) {
        setActivePlan(planData);
        if (planData.plan_details && planData.plan_details.length > 0) {
          const nextMonth = planData.plan_details.find((d: any) => d.status !== 'completed');
          if (nextMonth) {
            setSelectedPlanMonth(nextMonth.month);
          }
        }
      }
    } else {
      setToothData({});
      setIsWholeMouth(false);
    }
  };

  const submitTreatment = async (appt: Appointment) => {
    await onUpdateAppt(appt.id, {
      status: "รอชำระเงิน",
      treatmentNotes: form.notes,
      treatmentServices: form.services,
      recommendations: form.recommendations,
      cost: Number(form.actualCost) || 0,
      odontogramData: { ...toothData, wholeMouth: isWholeMouth } as any
    });
    setRecording(null);
    setForm({ notes: "", recommendations: "", services: [], actualCost: "" });
    setToothData({});
    setIsWholeMouth(false);
  };

  const handleToothClick = (tooth: number, status?: ToothStatus) => {
    setToothData(prev => {
      const current = prev[tooth] || "normal";
      
      let next: ToothStatus = "normal";
      if (status) {
        next = current === status ? "normal" : status;
      } else {
        next = current === "normal" ? "red" : current === "red" ? "blue" : current === "blue" ? "cross" : "normal";
      }
      
      return { ...prev, [tooth]: next };
    });
  };

  const statusActions: Record<string, { label: string; next: AppointmentStatus; color: string }> = {
    "เช็คอินเรียบร้อย": { label: "เรียกเข้าห้องตรวจ", next: "กำลังรักษา", color: "#A21CAF" },
    "กำลังรักษา": { label: "บันทึกการรักษา", next: "รอชำระเงิน", color: "#7C3AED" },
  };

  return (
    <div>
      {selectedPatientIdForPlan && (
        <TreatmentPlanBuilder 
          patientId={selectedPatientIdForPlan} 
          existingPlan={isEditingPlan ? activePlan : undefined}
          onClose={(newPlan) => {
            setSelectedPatientIdForPlan(null);
            setIsEditingPlan(false);
            if (newPlan) {
              setActivePlan(newPlan);
              setSelectedPlanMonth(1);
              
              // Auto pull month 1 data
              if (newPlan.plan_details && newPlan.plan_details.length > 0) {
                const m1 = newPlan.plan_details.find((d: any) => d.month === 1) || newPlan.plan_details[0];
                if (m1) {
                  setForm(f => ({
                    ...f,
                    notes: m1.notes || f.notes,
                    services: Array.from(new Set([...f.services, ...(m1.services || []).map((s: any) => s.service_name)]))
                  }));
                }
              }
            }
          }} 
        />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>คิวการรักษา</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>
            {timeFilter === "today" ? `วันที่ ${formattedDate}` : timeFilter === "week" ? "สัปดาห์นี้" : timeFilter === "month" ? "เดือนนี้" : "คิวทั้งหมด"} • {filteredAppts.length} ราย
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {[
            { id: "today", label: "วันนี้" },
            { id: "week", label: "สัปดาห์นี้" },
            { id: "month", label: "เดือนนี้" },
            { id: "all", label: "ทั้งหมด" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timeFilter === f.id ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAppts.map(a => {
          const sc  = STATUS_COLORS[a.status] ?? { bg: "#F0F4F8", text: "#4A6080", dot: "#ccc" };
          const act = statusActions[a.status];
          const isExp = expanded === a.id;
          const isRec = recording === a.id;
          const hasAlert = hasHealthAlert(a.allergies, a.conditions);

          return (
            <div key={a.id} className="rounded-2xl bg-white overflow-hidden transition-all" style={{ boxShadow: "0 2px 16px rgba(26,54,93,0.08)" }}>
              {/* Main row */}
              <div className="p-5 flex items-start gap-4">
                <div className="flex flex-col items-center justify-center flex-shrink-0">
                  <div className="text-[10px] font-medium text-gray-400 mb-1">
                    {a.date === todayString ? "วันนี้" : new Date(a.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                    {a.time}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{a.patientName}</p>
                    <span className="text-xs" style={{ color: "#4A6080" }}>HN: {a.hn}</span>
                    {hasAlert && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
                        <AlertTriangle size={10} /> แจ้งเตือนสุขภาพ
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{a.service}</p>
                  {hasHealthAlert(undefined, a.conditions) && <p className="text-xs mt-1" style={{ color: "#E65100" }}>⚠ {a.conditions}</p>}
                  {hasHealthAlert(a.allergies) && <p className="text-xs"    style={{ color: "#E65100" }}>💊 แพ้: {a.allergies}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
                  <button onClick={async () => {
                    if (isExp) setExpanded(null);
                    else {
                      setExpanded(a.id);
                      if (a.patientId) {
                        const planData = await getPatientActiveTreatmentPlan(a.patientId);
                        setActivePlan(planData || null);
                      }
                    }
                  }} style={{ color: "#4A6080" }}>
                    <ChevronRight size={16} className="transition-transform" style={{ transform: isExp ? "rotate(90deg)" : "none" }} />
                  </button>
                </div>
              </div>

              {/* Expanded: health info + actions */}
              {isExp && !isRec && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: "rgba(26,54,93,0.06)" }}>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>โรคประจำตัว</p>
                      <p className="text-sm" style={{ color: hasHealthAlert(a.conditions) ? "#E65100" : "#1A365D" }}>{a.conditions}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>ประวัติแพ้ยา</p>
                      <p className="text-sm" style={{ color: hasHealthAlert(a.allergies) ? "#E65100" : "#1A365D" }}>{a.allergies}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>บริการที่นัด</p>
                      <p className="text-sm" style={{ color: "#1A365D" }}>{a.service}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>เบอร์โทร</p>
                      <p className="text-sm" style={{ color: "#1A365D" }}>{a.patientPhone}</p>
                    </div>
                  </div>
                  
                  {activePlan && activePlan.plan_details && (
                    <div className="mb-4 bg-teal-50/50 rounded-xl p-3 border border-teal-100 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-teal-800">
                          แผนการรักษา: {activePlan.plan_name}
                        </p>
                        <button 
                          onClick={() => {
                            setIsEditingPlan(true);
                            setSelectedPatientIdForPlan(a.patientId);
                          }}
                          className="bg-white border border-teal-200 text-teal-600 text-[10px] px-2.5 py-1 rounded-md hover:bg-teal-50 transition-colors flex items-center gap-1 shadow-sm"
                        >
                          ✏️ แก้ไขแผน
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap pb-2">
                        {activePlan.plan_details.map((plan: any) => {
                          const isCompleted = plan.status === 'completed';
                          return (
                            <div
                              key={plan.month}
                              className={`flex flex-col items-center justify-center w-9 h-9 rounded-md border transition-all ${
                                isCompleted ? "bg-teal-600 border-teal-600 text-white" :
                                "bg-white border-slate-200 text-slate-600"
                              }`}
                            >
                              <span className="text-sm font-bold">{plan.month}</span>
                              {!isCompleted && plan.services?.length > 0 && <div className="w-1 h-1 rounded-full bg-teal-400 mt-0.5"></div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    {act && (
                      <button
                        onClick={() => act.next === "รอชำระเงิน"
                          ? handleStartRecording(a)
                          : onUpdateAppt(a.id, { status: act.next })}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: act.color }}>
                        {act.next === "รอชำระเงิน" ? <><ClipboardList size={14} /> {act.label}</> : <><Clock size={14} /> {act.label}</>}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Treatment recording form */}
              {isRec && (
                <div className="px-5 pb-3 border-t" style={{ borderColor: "rgba(26,54,93,0.06)" }}>
                  <div className="flex items-center justify-between py-2">
                    <p className="text-sm font-semibold" style={{ color: "#1A365D" }}>บันทึกการรักษา — {a.patientName}</p>
                    
                    {/* Toggle whole mouth */}
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                      {!activePlan && (
                        <button 
                          onClick={() => setSelectedPatientIdForPlan(a.patientId)}
                          className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all text-teal-700 bg-teal-50 hover:bg-teal-100 mr-2"
                        >
                          + สร้างแผนการรักษา
                        </button>
                      )}
                      <button onClick={() => setIsWholeMouth(false)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${!isWholeMouth ? 'bg-white shadow text-blue-900' : 'text-gray-500'}`}>
                        ระบุซี่ฟัน
                      </button>
                      <button onClick={() => setIsWholeMouth(true)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${isWholeMouth ? 'bg-white shadow text-blue-900' : 'text-gray-500'}`}>
                        ทำทั้งปาก (Whole Mouth)
                      </button>
                    </div>
                  </div>
                  
                  {activePlan && activePlan.plan_details && (
                    <div className="mb-4 bg-teal-50/50 rounded-xl p-3 border border-teal-100">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-teal-800">
                          แผนการรักษา: {activePlan.plan_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setIsEditingPlan(true);
                              setSelectedPatientIdForPlan(a.patientId);
                            }}
                            className="bg-white border border-teal-200 text-teal-600 text-[10px] px-2.5 py-1 rounded-md hover:bg-teal-50 transition-colors flex items-center gap-1 shadow-sm"
                          >
                            ✏️ แก้ไขแผน
                          </button>
                          {selectedPlanMonth && (
                          <button 
                            onClick={() => {
                              const monthData = activePlan.plan_details.find((d: any) => d.month === selectedPlanMonth);
                              if (monthData) {
                                setForm(f => ({
                                  ...f,
                                  notes: monthData.notes || f.notes,
                                  services: Array.from(new Set([...f.services, ...(monthData.services || []).map((s: any) => s.service_name)]))
                                }));
                                if (monthData.odontogram_data) {
                                  setToothData(prev => ({ ...prev, ...monthData.odontogram_data }));
                                }
                              }
                            }}
                            className="bg-teal-600 text-white text-[10px] px-2.5 py-1 rounded-md hover:bg-teal-700 transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle size={12} /> ดึงข้อมูลเดือนนี้
                          </button>
                        )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap pb-2">
                        {activePlan.plan_details.map((plan: any) => {
                          const isSelected = selectedPlanMonth === plan.month;
                          const isCompleted = plan.status === 'completed';
                          return (
                            <button
                              key={plan.month}
                              onClick={() => setSelectedPlanMonth(plan.month)}
                              className={`flex flex-col items-center justify-center w-9 h-9 rounded-md border transition-all ${
                                isCompleted ? "bg-teal-600 border-teal-600 text-white" :
                                isSelected ? "bg-teal-100 border-teal-500 text-teal-800 shadow-sm ring-1 ring-teal-500" : 
                                "bg-white border-slate-200 text-slate-600 hover:border-teal-300"
                              }`}
                            >
                              <span className="text-sm font-bold">{plan.month}</span>
                              {!isCompleted && plan.services?.length > 0 && <div className="w-1 h-1 rounded-full bg-teal-400 mt-0.5"></div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <Odontogram
                        key={`odontogram-${recording}`}
                        toothData={toothData}
                        onToothClick={handleToothClick}
                        isChild={isChild}
                        setIsChild={setIsChild}
                        isWholeMouth={isWholeMouth}
                      />
                    </div>

                    <div className="space-y-2">
                    <div>
                      <p className="text-[11px] font-medium mb-1" style={{ color: "#4A6080" }}>บริการที่ทำ (เลือกได้หลายรายการ)</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                        {services.map(s => (
                          <button key={s.id} onClick={() => toggleService(s.name)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-left transition-all leading-tight"
                            style={{
                              backgroundColor: form.services.includes(s.name) ? "#FFE8EC" : "#F0F4F8",
                              color: form.services.includes(s.name) ? "#1A365D" : "#4A6080",
                              border: form.services.includes(s.name) ? "1.5px solid #FF8C9A" : "1.5px solid transparent",
                            }}>
                            {form.services.includes(s.name) && <Check size={11} style={{ color: "#FF8C9A" }} />}
                            <span>{s.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>บันทึกหัตถการ / สิ่งที่ทำ</label>
                      <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        rows={2} placeholder="อธิบายขั้นตอนการรักษาที่ดำเนินการ..."
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                        style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1" style={{ color: "#4A6080" }}>คำแนะนำสำหรับคนไข้</label>
                      <textarea value={form.recommendations} onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
                        rows={1} placeholder="คำแนะนำการดูแลหลังรักษา..."
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                        style={{ backgroundColor: "#F0F4F8", color: "#1A365D" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-end pt-1">
                      <div>
                        <label className="text-[11px] font-medium block mb-1" style={{ color: "#4A6080" }}>ประเมินค่ารักษา (บาท) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500 font-medium">฿</span>
                          <input type="number" required min="0" value={form.actualCost} onChange={e => setForm(f => ({ ...f, actualCost: e.target.value === "" ? "" : Number(e.target.value) }))}
                            placeholder="0"
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-sm outline-none font-bold"
                            style={{ backgroundColor: "#F0F4F8", color: "#1A365D", border: "1px solid #E2E8F0" }} />
                        </div>
                        {form.services.length > 0 && (
                          <div className="mt-1.5 text-[10px] text-gray-500 leading-tight">
                            ค่าบริการเริ่มต้น: ฿{form.services.map(s => services.find(x => x.name === s)?.basePrice || 0).reduce((a, b) => a + b, 0).toLocaleString()}
                            <div className="text-[9px] text-gray-400 mt-0.5">
                              ({form.services.map(s => {
                                const svc = services.find(x => x.name === s);
                                return `${s} ฿${svc?.basePrice || 0}`;
                              }).join(', ')})
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => submitTreatment(a)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
                          <Send size={14} /> ส่งข้อมูลให้พนักงาน
                        </button>
                        <button onClick={() => setRecording(null)}
                          className="px-5 py-2.5 rounded-xl text-sm font-medium"
                          style={{ border: "1.5px solid rgba(26,54,93,0.2)", color: "#4A6080" }}>
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
