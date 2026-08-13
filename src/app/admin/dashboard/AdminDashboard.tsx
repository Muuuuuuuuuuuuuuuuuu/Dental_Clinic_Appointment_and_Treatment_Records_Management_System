import React, { useState, useEffect } from "react";
import { Users, UserPlus, FileText, Settings, Calendar, Play, TrendingUp, UserCheck, AlertCircle, RefreshCw, X, ChevronRight, List } from "lucide-react";

import { Appointment, AppointmentStatus, DentistInfo, LeaveRequest, STATUS_COLORS, AdminView } from "../../shared/data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { getAppointments, getDentists, getLeaveRequests } from "../../shared/supabaseApi";

type Timeframe = "today" | "week" | "month";

export default function AdminDashboard({ setView }: { setView: (v: AdminView) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApptModal, setShowApptModal] = useState(false);
  
  const [timeframe, setTimeframe] = useState<Timeframe>("today");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    Promise.all([
      getAppointments(),
      getDentists(),
      getLeaveRequests()
    ]).then(([appts, dents, lvs]) => {
      setAppointments(appts);
      setDentists(dents);
      setLeaves(lvs);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getLocalDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  const targetDateStr = getLocalDateStr(selectedDate);
  
  // Filter appointments based on timeframe and selectedDate
  const filteredAppts = appointments.filter(a => {
    if (timeframe === "today") {
      return a.date === targetDateStr;
    } else if (timeframe === "week") {
      const pastWeek = new Date(selectedDate);
      pastWeek.setDate(selectedDate.getDate() - 6);
      const pastWeekStr = getLocalDateStr(pastWeek);
      return a.date >= pastWeekStr && a.date <= targetDateStr;
    } else {
      const targetYearMonth = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
      return a.date.startsWith(targetYearMonth);
    }
  });

  const revenue = filteredAppts.filter(a => a.status === "เสร็จสิ้นเรียบร้อย").reduce((s, a) => s + (a.cost ?? 0), 0);
  const pending = leaves.filter(l => l.status === "รอการอนุมัติ").length;

  // Chart data
  const chartData = timeframe === "today" ? 
    Array.from({ length: 12 }).map((_, i) => {
      const hour = i + 9;
      const hourPrefix = hour.toString().padStart(2, '0');
      const timeLabel = `${hourPrefix}:00`;
      const hourAppts = filteredAppts.filter(a => a.time.startsWith(`${hourPrefix}:`));
      const hourRev = hourAppts.filter(a => a.status === "เสร็จสิ้นเรียบร้อย").reduce((s, a) => s + (a.cost ?? 0), 0);
      return { day: timeLabel, appts: hourAppts.length, revenue: hourRev, fullDate: targetDateStr };
    })
  : timeframe === "month" ? (() => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }).map((_, i) => {
      const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
      const dStr = getLocalDateStr(d);
      const dayLabel = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      const dayAppts = appointments.filter(a => a.date === dStr);
      const dayRev = dayAppts.filter(a => ["ชำระเงินแล้ว", "เสร็จสิ้น"].includes(a.status)).reduce((s, a) => s + (a.cost ?? 0), 0);
      return { day: dayLabel, appts: dayAppts.length, revenue: dayRev, fullDate: dStr };
    });
  })()
  : Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - ((chartDays ?? 7) - 1 - i));
    const dStr = getLocalDateStr(d);
    const dayLabel = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    const dayAppts = appointments.filter(a => a.date === dStr);
    const dayRev = dayAppts.filter(a => a.status === "เสร็จสิ้นเรียบร้อย").reduce((s, a) => s + (a.cost ?? 0), 0);
    return { day: dayLabel, appts: dayAppts.length, revenue: dayRev, fullDate: dStr };
  });

  const handleChartClick = (data: any) => {
    if (timeframe !== "today" && data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload;
      if (payload.fullDate) {
        setSelectedDate(new Date(payload.fullDate));
        setTimeframe("today");
      }
    }
  };

  // Status Breakdown
  const completedCnt = filteredAppts.filter(a => a.status === "เสร็จสิ้นเรียบร้อย").length;
  const scheduledCnt = filteredAppts.filter(a => ["ยืนยันการจอง", "เช็คอินเรียบร้อย", "รอชำระเงิน"].includes(a.status)).length;
  const cancelledCnt = filteredAppts.filter(a => a.status === "ยกเลิก").length;
  const postponedCnt = filteredAppts.filter(a => a.status === "ไม่มาตามนัด").length;
  const totalCnt = filteredAppts.length || 1;

  // Continuous Cases
  const activeOrtho = appointments.filter(a => (a.service.includes("จัดฟัน") || a.service.includes("รากเทียม")) && !["ยกเลิก", "เสร็จสิ้นเรียบร้อย"].includes(a.status)).length;

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
      {/* Row 1: Header + Controls — compact single row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ภาพรวมระบบ</h1>
          <p className="text-xs" style={{ color: "#4A6080" }}>
            {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date" value={targetDateStr}
            onChange={(e) => { if (e.target.value) setSelectedDate(new Date(e.target.value)); }}
            className="px-2 py-1 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 outline-none focus:border-[#1A365D]"
          />
          <div className="flex items-center bg-white rounded-lg p-0.5 shadow-sm border border-slate-100">
            {[
              { id: "today", label: "วัน" },
              { id: "week", label: "สัปดาห์" },
              { id: "month", label: "เดือน" }
            ].map(t => (
              <button key={t.id} onClick={() => setTimeframe(t.id as Timeframe)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeframe === t.id ? "bg-[#1A365D] text-white" : "text-slate-500 hover:text-slate-800"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: KPI Cards — compact horizontal */}
      <div className="grid grid-cols-4 gap-3 mb-3 flex-shrink-0">
        {[
          { label: "นัดหมาย",      val: filteredAppts.length,            icon: Calendar,    bg: "#E8F4FF", ic: "#1D6FA4" },
          { label: "รายได้",       val: `฿${revenue.toLocaleString()}`,  icon: TrendingUp,  bg: "#E8FFF0", ic: "#1B7A3E" },
          { label: "แพทย์ออกตรวจ",  val: new Set(filteredAppts.map(a => a.doctorId).filter(Boolean)).size, icon: UserCheck,   bg: "#FFE8EC", ic: "#FF6B7E" },
          { label: "รออนุมัติลา",   val: pending,                         icon: AlertCircle, bg: "#FFF3E0", ic: "#E65100" },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-white px-4 py-3 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-3"
            style={{ boxShadow: "0 2px 8px rgba(26,54,93,0.05)" }}
            onClick={() => s.label.includes("ลา") ? setView("schedule-hub") : undefined}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon size={18} style={{ color: s.ic }} />
            </div>
            <div>
              <div className="text-2xl font-bold leading-tight" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>{s.val}</div>
              <div className="text-xs font-medium" style={{ color: "#4A6080" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 3: Charts side by side — flex-1 fills remaining */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3 flex-1 min-h-0">
        {/* Appointment chart */}
        <div className="rounded-xl bg-white p-4 flex flex-col" style={{ boxShadow: "0 2px 8px rgba(26,54,93,0.05)" }}>
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h2 className="font-semibold text-xs" style={{ color: "#1A365D" }}>
                กราฟนัดหมาย ({timeframe === "today" ? "รายชั่วโมง" : timeframe === "month" ? "รายเดือน" : "7 วัน"})
              </h2>
            {timeframe !== "today" && (
              <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">💡 คลิกแท่ง</span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={timeframe === "month" ? 10 : timeframe === "today" ? 10 : 16} 
                        onClick={handleChartClick} style={{ cursor: timeframe !== "today" ? 'pointer' : 'default' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,54,93,0.06)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#4A6080" }} axisLine={false} tickLine={false} minTickGap={15} />
                <YAxis tick={{ fontSize: 9, fill: "#4A6080" }} axisLine={false} tickLine={false} width={25} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(26,54,93,0.15)", fontSize: 10 }}
                  formatter={(v: number) => [`${v} ราย`, "นัดหมาย"]} />
                <Bar dataKey="appts" fill="#FF8C9A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="rounded-xl bg-white p-4 flex flex-col" style={{ boxShadow: "0 2px 8px rgba(26,54,93,0.05)" }}>
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="font-semibold text-xs" style={{ color: "#1A365D" }}>
                กราฟรายได้ ({timeframe === "today" ? "รายชั่วโมง" : timeframe === "month" ? "รายเดือน" : "7 วัน"})
              </h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} onClick={handleChartClick} style={{ cursor: timeframe !== "today" ? 'pointer' : 'default' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,54,93,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#4A6080" }} axisLine={false} tickLine={false} minTickGap={15} />
                <YAxis tick={{ fontSize: 9, fill: "#4A6080" }} axisLine={false} tickLine={false} width={25} />
                <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: "#22C55E", r: 2.5 }} />
                <Tooltip formatter={(v: number) => [`฿${v.toLocaleString()}`, "รายได้"]}
                  contentStyle={{ borderRadius: 10, border: "none", fontSize: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Bottom bar — Status + Active Cases + Appointment CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-shrink-0">
        {/* Status Breakdown — compact horizontal */}
        <div className="lg:col-span-5 rounded-xl bg-white px-4 py-3 flex flex-col justify-center" style={{ boxShadow: "0 2px 8px rgba(26,54,93,0.05)" }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm" style={{ color: "#1A365D" }}>สัดส่วนสถานะ</h3>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden mb-2.5 bg-slate-100">
            <div style={{ width: `${(completedCnt/totalCnt)*100}%`, backgroundColor: "#22C55E" }} />
            <div style={{ width: `${(scheduledCnt/totalCnt)*100}%`, backgroundColor: "#3B82F6" }} />
            <div style={{ width: `${(postponedCnt/totalCnt)*100}%`, backgroundColor: "#9CA3AF" }} />
            <div style={{ width: `${(cancelledCnt/totalCnt)*100}%`, backgroundColor: "#EF4444" }} />
          </div>
          <div className="flex items-center gap-5 text-xs font-medium" style={{ color: "#4A6080" }}>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> สำเร็จ <b className="text-slate-800">{completedCnt}</b></span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> รอคิว <b className="text-slate-800">{scheduledCnt}</b></span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" /> เลื่อน <b className="text-slate-800">{postponedCnt}</b></span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> ยกเลิก <b className="text-red-600">{cancelledCnt}</b></span>
          </div>
        </div>

        {/* Active Cases — compact */}
        <div className="lg:col-span-3 rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #1A365D 0%, #29538A 100%)", boxShadow: "0 2px 8px rgba(26,54,93,0.1)" }}>
          <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
            <RefreshCw size={16} className="text-[#FF8C9A]" />
          </div>
          <div>
            <div className="text-[10px] text-white/60">เคสต่อเนื่อง</div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>{activeOrtho}</span>
            <span className="text-xs text-white/70 ml-1">เคส</span>
          </div>
        </div>

        {/* Appointment List CTA — clickable card */}
        <button onClick={() => setShowApptModal(true)}
          className="lg:col-span-4 rounded-xl px-4 py-3 flex items-center justify-between text-left group transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #FF8C9A 0%, #FF6B7E 100%)", boxShadow: "0 2px 8px rgba(255,107,126,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
              <List size={16} color="white" />
            </div>
            <div>
              <div className="text-[10px] text-white/80">รายการนัดหมาย</div>
              <div className="text-lg font-bold text-white">{filteredAppts.length} รายการ</div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
            <ChevronRight size={16} color="white" />
          </div>
        </button>
      </div>

      {/* Appointment Slide-out Panel */}
      {showApptModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowApptModal(false)} />
          <div className="fixed inset-y-4 right-4 w-full max-w-xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ animation: "slideInRight 0.25s ease-out" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(26,54,93,0.08)" }}>
              <div>
                <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>รายการนัดหมาย</h2>
                <p className="text-xs" style={{ color: "#4A6080" }}>
                  {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} • {filteredAppts.length} รายการ
                </p>
              </div>
              <button onClick={() => setShowApptModal(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                <X size={18} style={{ color: "#4A6080" }} />
              </button>
            </div>
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: "thin" }}>
              {filteredAppts.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">ไม่มีรายการนัดหมายในช่วงเวลานี้</div>
              ) : (
                <div className="space-y-2">
                  {[...filteredAppts].sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()).map(a => {
                    const sc = STATUS_COLORS[a.status] ?? { bg: "#F0F4F8", text: "#4A6080" };
                    return (
                      <div key={a.id} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                        style={{ border: "1px solid rgba(26,54,93,0.06)" }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFE8EC" }}>
                          <span className="text-sm font-bold" style={{ color: "#FF6B7E" }}>{a.time.slice(0, 5)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate" style={{ color: "#1A365D" }}>{a.patientName}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap" style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
                          </div>
                          <div className="text-xs mt-0.5 truncate" style={{ color: "#4A6080" }}>
                            {a.service} {a.doctorName ? `• ${a.doctorName.split(" ")[1] ?? a.doctorName}` : ""}
                          </div>
                        </div>
                        {a.cost != null && a.cost > 0 && (
                          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: "#1B7A3E" }}>
                            ฿{a.cost.toLocaleString()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
