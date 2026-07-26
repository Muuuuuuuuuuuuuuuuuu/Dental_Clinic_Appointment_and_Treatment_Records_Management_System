import React, { useState, useEffect } from "react";
import { Users, UserPlus, FileText, Settings, Calendar, Play, TrendingUp, UserCheck, AlertCircle, RefreshCw } from "lucide-react";

import { Appointment, AppointmentStatus, DentistInfo, LeaveRequest, STATUS_COLORS, AdminView } from "../../shared/data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { getAppointments, getDentists, getLeaveRequests } from "../../shared/supabaseApi";

type Timeframe = "today" | "week" | "month";

export default function AdminDashboard({ setView }: { setView: (v: AdminView) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  const targetDateStr = selectedDate.toISOString().split('T')[0];
  
  // Filter appointments based on timeframe and selectedDate
  const filteredAppts = appointments.filter(a => {
    const apptDate = new Date(a.date);
    if (timeframe === "today") {
      return a.date === targetDateStr;
    } else if (timeframe === "week") {
      const pastWeek = new Date(selectedDate);
      pastWeek.setDate(selectedDate.getDate() - 6); // 7 days inclusive
      return apptDate >= pastWeek && apptDate <= selectedDate;
    } else { // month
      const pastMonth = new Date(selectedDate);
      pastMonth.setMonth(selectedDate.getMonth() - 1);
      return apptDate >= pastMonth && apptDate <= selectedDate;
    }
  });

  const revenue = filteredAppts.filter(a => ["ชำระเงินแล้ว", "เสร็จสิ้น"].includes(a.status)).reduce((s, a) => s + (a.cost ?? 0), 0);
  const pending = leaves.filter(l => l.status === "รอการอนุมัติ").length;

  // Chart data
  const chartData = timeframe === "today" ? 
    Array.from({ length: 12 }).map((_, i) => {
      const hour = i + 9; // 09:00 to 20:00
      const hourPrefix = hour.toString().padStart(2, '0');
      const timeLabel = `${hourPrefix}:00`;
      
      const hourAppts = filteredAppts.filter(a => a.time.startsWith(`${hourPrefix}:`));
      const hourRev = hourAppts.filter(a => ["ชำระเงินแล้ว", "เสร็จสิ้น"].includes(a.status)).reduce((s, a) => s + (a.cost ?? 0), 0);
      
      return { day: timeLabel, appts: hourAppts.length, revenue: hourRev, fullDate: targetDateStr };
    })
  : Array.from({ length: timeframe === "month" ? 30 : 7 }).map((_, i) => {
    const chartDays = timeframe === "month" ? 30 : 7;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - ((chartDays - 1) - i));
    const dStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    
    const dayAppts = appointments.filter(a => a.date === dStr);
    const dayRev = dayAppts.filter(a => ["ชำระเงินแล้ว", "เสร็จสิ้น"].includes(a.status)).reduce((s, a) => s + (a.cost ?? 0), 0);
    
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
  const completedCnt = filteredAppts.filter(a => ["เสร็จสิ้น", "ชำระเงินแล้ว"].includes(a.status)).length;
  const scheduledCnt = filteredAppts.filter(a => ["รอการยืนยัน", "ยืนยันการจอง", "รอรักษา", "กำลังรักษา", "รอชำระเงิน"].includes(a.status)).length;
  const cancelledCnt = filteredAppts.filter(a => a.status === "ยกเลิก").length;
  const postponedCnt = filteredAppts.filter(a => a.status === "เลื่อนนัด").length;
  const totalCnt = filteredAppts.length || 1;

  // Continuous Cases (mock detection by keyword)
  const activeOrtho = appointments.filter(a => (a.service.includes("จัดฟัน") || a.service.includes("รากเทียม")) && !["ยกเลิก", "เสร็จสิ้น", "ชำระเงินแล้ว"].includes(a.status)).length;

  return (
    <div className="animate-fade-in">
      {/* Header & Toggle */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ภาพรวมระบบ</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>
            แสดงผลของ: {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        {/* Date Picker & Timeframe Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input 
            type="date" 
            value={targetDateStr}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(new Date(e.target.value));
            }}
            className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 outline-none focus:border-[#1A365D] w-full sm:w-auto"
          />
          <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-full sm:w-auto">
            {[
              { id: "today", label: "รายวัน" },
              { id: "week", label: "รายสัปดาห์" },
              { id: "month", label: "รายเดือน" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id as Timeframe)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  timeframe === t.id 
                    ? "bg-[#1A365D] text-white" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "นัดหมาย (รวม)",       val: filteredAppts.length,    icon: Calendar,    bg: "#E8F4FF", ic: "#1D6FA4" },
          { label: "รายได้ (฿)",    val: `฿${revenue.toLocaleString()}`, icon: TrendingUp, bg: "#E8FFF0", ic: "#1B7A3E" },
          { label: "ทันตแพทย์ออกตรวจ",   val: dentists.length, icon: UserCheck, bg: "#FFE8EC", ic: "#FF6B7E" },
          { label: "รออนุมัติการลา",      val: pending,          icon: AlertCircle, bg: "#FFF3E0", ic: "#E65100" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
            style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
            onClick={() => s.label.includes("การลา") ? setView("leaves") : undefined}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
              <s.icon size={18} style={{ color: s.ic }} />
            </div>
            <div className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>{s.val}</div>
            <div className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Appointment chart */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: "#1A365D" }}>
                กราฟนัดหมาย ({timeframe === "today" ? "รายชั่วโมง ของวันที่เลือก" : timeframe === "month" ? "30 วันย้อนหลัง" : "7 วันย้อนหลัง"})
              </h2>
              {timeframe !== "today" && (
                <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">💡 คลิกที่แท่งกราฟเพื่อดูรายวัน</span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={timeframe === "month" ? 8 : timeframe === "today" ? 16 : 28} 
                        onClick={handleChartClick} style={{ cursor: timeframe !== "today" ? 'pointer' : 'default' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,54,93,0.06)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#4A6080" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#4A6080" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(26,54,93,0.15)", fontSize: 12 }}
                  formatter={(v: number) => [`${v} ราย`, "นัดหมาย"]}
                />
                <Bar dataKey="appts" fill="#FF8C9A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Revenue Chart */}
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "#1A365D" }}>
                กราฟรายได้ ({timeframe === "today" ? "รายชั่วโมง ของวันที่เลือก" : timeframe === "month" ? "30 วันย้อนหลัง" : "7 วันย้อนหลัง"})
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} onClick={handleChartClick} style={{ cursor: timeframe !== "today" ? 'pointer' : 'default' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,54,93,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#4A6080" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#4A6080" }} axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={3} dot={{ fill: "#22C55E", r: 4 }} />
                <Tooltip formatter={(v: number) => [`฿${v.toLocaleString()}`, "รายได้"]}
                  contentStyle={{ borderRadius: 12, border: "none", fontSize: 11 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown widgets */}
        <div className="space-y-5">
          {/* Status Breakdown Widget */}
          <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <h3 className="font-semibold mb-4" style={{ color: "#1A365D" }}>สัดส่วนสถานะเคส</h3>
            
            {/* Progress Bar representation */}
            <div className="flex h-3 rounded-full overflow-hidden mb-6 bg-slate-100">
              <div style={{ width: `${(completedCnt/totalCnt)*100}%`, backgroundColor: "#22C55E" }} title="สำเร็จ"></div>
              <div style={{ width: `${(scheduledCnt/totalCnt)*100}%`, backgroundColor: "#3B82F6" }} title="รอคิว"></div>
              <div style={{ width: `${(postponedCnt/totalCnt)*100}%`, backgroundColor: "#9CA3AF" }} title="เลื่อนนัด"></div>
              <div style={{ width: `${(cancelledCnt/totalCnt)*100}%`, backgroundColor: "#EF4444" }} title="ยกเลิก"></div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-slate-600">สำเร็จแล้ว</span></div>
                <span className="font-bold text-slate-800">{completedCnt} <span className="text-xs text-slate-400 font-normal">({Math.round((completedCnt/totalCnt)*100)}%)</span></span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-slate-600">นัดหมาย/รอคิว</span></div>
                <span className="font-bold text-slate-800">{scheduledCnt} <span className="text-xs text-slate-400 font-normal">({Math.round((scheduledCnt/totalCnt)*100)}%)</span></span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400"></div><span className="text-slate-600">เลื่อนเคส</span></div>
                <span className="font-bold text-slate-800">{postponedCnt} <span className="text-xs text-slate-400 font-normal">({Math.round((postponedCnt/totalCnt)*100)}%)</span></span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-slate-600">ยกเลิก</span></div>
                <span className="font-bold text-red-600">{cancelledCnt} <span className="text-xs text-slate-400 font-normal">({Math.round((cancelledCnt/totalCnt)*100)}%)</span></span>
              </div>
            </div>
          </div>

          {/* Continuous Cases Widget */}
          <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #1A365D 0%, #29538A 100%)", boxShadow: "0 4px 15px rgba(26,54,93,0.15)" }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-white/90 mb-1">เคสต่อเนื่อง (Active)</h3>
                <p className="text-xs text-white/60">จัดฟัน, รากเทียม ฯลฯ</p>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <RefreshCw size={20} className="text-[#FF8C9A]" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>{activeOrtho}</span>
              <span className="text-sm text-white/70 ml-2">เคส</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Recent appointments table */}
      <div className="mt-5 rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: "#1A365D" }}>รายการนัดหมาย (ข้อมูลของวันที่เลือก)</h2>
          <span className="text-xs text-slate-500">แสดงรายการล่าสุด 10 รายการ</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(26,54,93,0.08)" }}>
                {["วันที่", "เวลา", "คนไข้", "บริการ", "ทันตแพทย์", "สถานะ"].map(h => (
                  <th key={h} className="text-left py-3 pr-4 text-xs font-semibold" style={{ color: "#4A6080" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAppts.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()).slice(0, 10).map(a => {
                const sc = STATUS_COLORS[a.status] ?? { bg: "#F0F4F8", text: "#4A6080" };
                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid rgba(26,54,93,0.04)" }} className="hover:bg-slate-50/50">
                    <td className="py-2.5 pr-4 text-xs text-slate-500">{a.date}</td>
                    <td className="py-2.5 pr-4 text-sm font-medium" style={{ color: "#FF8C9A" }}>{a.time}</td>
                    <td className="py-2.5 pr-4 text-sm" style={{ color: "#1A365D" }}>{a.patientName}</td>
                    <td className="py-2.5 pr-4 text-xs" style={{ color: "#4A6080" }}>{a.service}</td>
                    <td className="py-2.5 pr-4 text-xs" style={{ color: "#4A6080" }}>{a.doctorName?.split(" ")[1] ?? a.doctorName ?? "-"}</td>
                    <td className="py-2.5">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap" style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
                    </td>
                  </tr>
                );
              })}
              {filteredAppts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">ไม่มีรายการนัดหมายในช่วงเวลานี้</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
