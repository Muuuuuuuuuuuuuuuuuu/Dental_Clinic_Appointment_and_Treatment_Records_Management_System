import React, { useState, useEffect } from "react";
import { Search, Filter, Play, CheckCircle, Clock, FileText, Plus, X, AlertTriangle, ChevronRight, Check, Send, ClipboardList } from "lucide-react";

import { Appointment, STATUS_COLORS, ServiceInfo, AppointmentStatus, DentistInfo } from "../../shared/data";
import { getAppointments, getServices, updateAppointmentStatus, saveTreatment, getPatientLatestOdontogram, supabase } from "../../shared/supabaseApi";
import Odontogram, { ToothStatus } from "./Odontogram";

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
        let updatedStatus = updates.status;
        if (updates.status === "รอชำระเงิน" && updates.treatmentNotes !== undefined) {
          await saveTreatment(id, updates.treatmentNotes, updates.recommendations || "", updates.treatmentServices || [], updates.cost || 0, updates.odontogramData);
        } else {
          const res = await updateAppointmentStatus(id, updates.status);
          updatedStatus = res.status;
        }
        
        setAppointments(apps => apps.map(a => a.id === id ? { 
          ...a, 
          status: updatedStatus, 
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
    if (a.patientId) {
      const historyOdontogram = await getPatientLatestOdontogram(a.patientId);
      setToothData(historyOdontogram);
      // Check if history was whole mouth
      if (historyOdontogram.wholeMouth) {
        setIsWholeMouth(true);
        setToothData({});
      } else {
        setIsWholeMouth(false);
      }
    } else {
      setToothData({});
      setIsWholeMouth(false);
    }
  };

  const submitTreatment = (appt: Appointment) => {
    onUpdateAppt(appt.id, {
      status: "รอชำระเงิน",
      treatmentNotes: form.notes,
      treatmentServices: form.services,
      recommendations: form.recommendations,
      cost: Number(form.actualCost) || 0,
      odontogramData: isWholeMouth ? { wholeMouth: true } as any : toothData
    });
    setRecording(null);
    setForm({ notes: "", recommendations: "", services: [], actualCost: "" });
    setToothData({});
    setIsWholeMouth(false);
  };

  const handleToothClick = (tooth: number) => {
    setToothData(prev => {
      const current = prev[tooth] || "normal";
      const next = current === "normal" ? "red" : current === "red" ? "blue" : current === "blue" ? "cross" : "normal";
      return { ...prev, [tooth]: next };
    });
  };

  const statusActions: Record<string, { label: string; next: AppointmentStatus; color: string }> = {
    "เช็คอินเรียบร้อย": { label: "เริ่มรักษา", next: "รอชำระเงิน", color: "#7C3AED" },
  };

  return (
    <div>
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
          const hasAlert = a.allergies !== "ไม่มี" || a.conditions !== "ไม่มี";

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
                  {a.conditions !== "ไม่มี" && <p className="text-xs mt-1" style={{ color: "#E65100" }}>⚠ {a.conditions}</p>}
                  {a.allergies  !== "ไม่มี" && <p className="text-xs"    style={{ color: "#E65100" }}>💊 แพ้: {a.allergies}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
                  <button onClick={() => setExpanded(isExp ? null : a.id)} style={{ color: "#4A6080" }}>
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
                      <p className="text-sm" style={{ color: "#1A365D" }}>{a.conditions}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#4A6080" }}>ประวัติแพ้ยา</p>
                      <p className="text-sm" style={{ color: a.allergies !== "ไม่มี" ? "#E65100" : "#1A365D" }}>{a.allergies}</p>
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
                  <div className="flex gap-2">
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
                    <div className="flex bg-gray-100 rounded-xl p-1">
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
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <Odontogram 
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
