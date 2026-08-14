import React, { useState, useEffect, useMemo } from "react";
import {
  Play, CheckCircle, Search, Filter, Users, CreditCard, AlertTriangle,
  Clock, ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Calendar as CalendarIcon, UserCheck
} from "lucide-react";

import { Appointment, SpecialClosure, STATUS_COLORS, StaffView, LeaveRequest, Shift } from "../../shared/data";
import { getAppointments, getClinicClosures, updateAppointmentStatus, getDentists, getLeaveRequests, getShifts } from "../../shared/supabaseApi";

type ViewMode = "daily" | "weekly" | "monthly";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const thaiDay = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const thaiDayShort = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const thaiMonth = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function getMonday(d: Date) {
  const r = new Date(d);
  const day = r.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + diff);
  return r;
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards({ appts, setView }: { appts: Appointment[]; setView: (v: StaffView) => void }) {
  const waitCheckin = appts.filter(a => a.status === "ยืนยันการจอง").length;
  const checkedIn = appts.filter(a => a.status === "เช็คอินเรียบร้อย").length;
  const pending = appts.filter(a => a.status === "รอชำระเงิน").length;
  const done = appts.filter(a => a.status === "เสร็จสิ้น").length;

  const stats = [
    { label: "รอเช็คอิน", val: waitCheckin, icon: UserCheck, bg: "#E8F4FF", ic: "#1D6FA4", action: null },
    { label: "เช็คอินเรียบร้อย", val: checkedIn, icon: Clock, bg: "#FDF4FF", ic: "#A21CAF", action: null },
    { label: "รอชำระเงิน", val: pending, icon: CreditCard, bg: "#FFFDE7", ic: "#B45309", action: "payment" as StaffView },
    { label: "เสร็จสิ้น", val: done, icon: CheckCircle, bg: "#E8FFF0", ic: "#1B7A3E", action: null },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(s => (
        <div key={s.label}
          className={`rounded-2xl bg-white p-4 ${s.action ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
          style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
          onClick={() => s.action && setView(s.action)}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
            <s.icon size={18} style={{ color: s.ic }} />
          </div>
          <div className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>{s.val}</div>
          <div className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}


// ─── Appointment List Table ───────────────────────────────────────────────────
function AppointmentList({ appts }: { appts: Appointment[] }) {
  if (appts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <CalendarDays size={48} style={{ color: "#CBD5E1" }} className="mx-auto mb-4" />
        <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>ไม่มีนัดหมายในวันนี้</p>
        <p className="text-xs mt-1" style={{ color: "#CBD5E1" }}>ยังไม่มีคิวที่จองไว้</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(26,54,93,0.06)", backgroundColor: "#F8F9FA" }}>
        <div className="grid grid-cols-5 gap-4 text-xs font-semibold" style={{ color: "#4A6080" }}>
          <span>เวลา</span><span className="col-span-2">คนไข้ / บริการ</span><span>ทันตแพทย์</span><span>สถานะ</span>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: "rgba(26,54,93,0.04)" }}>
        {appts.map(a => {
          const sc = STATUS_COLORS[a.status] ?? { bg: "#F0F4F8", text: "#4A6080", dot: "#ccc" };
          return (
            <div key={a.id} className="px-5 py-3.5 grid grid-cols-5 gap-4 items-center hover:bg-gray-50/50 transition-colors">
              <span className="text-sm font-semibold" style={{ color: "#FF8C9A" }}>{a.time?.substring(0, 5)}</span>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: "#1A365D" }}>{a.patientName}</p>
                  {(a.allergies !== "ไม่มี" || a.conditions !== "ไม่มี") && (a.allergies || a.conditions) && (
                    <AlertTriangle size={12} style={{ color: "#E65100" }} />
                  )}
                </div>
                <p className="text-xs" style={{ color: "#4A6080" }}>{a.service}</p>
              </div>
              <p className="text-xs" style={{ color: "#4A6080" }}>{a.doctorName?.split(" ")[1] ?? a.doctorName ?? "-"}</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium justify-self-start"
                style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Today's Kanban Board ─────────────────────────────────────────────────────
function TodayKanbanBoard({ appts, onUpdate, setView }: { appts: Appointment[], onUpdate: (id: number, s: Partial<Appointment>) => void, setView?: (v: StaffView) => void }) {
  const toCheckIn = appts.filter(a => a.status === "ยืนยันการจอง");
  const inQueue = appts.filter(a => a.status === "เช็คอินเรียบร้อย" || a.status === "กำลังรักษา");
  const toPay = appts.filter(a => a.status === "รอชำระเงิน");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Column 1: To Check-in */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
            <UserCheck size={16} />
          </div>
          <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>รอเช็คอิน ({toCheckIn.length})</h2>
        </div>

        {toCheckIn.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-gray-200">
            <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>ไม่มีคนไข้รอเช็คอิน</p>
          </div>
        ) : (
          toCheckIn.map(a => (
            <div key={a.id} className="rounded-2xl bg-white p-4 shadow-sm border border-blue-50 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold" style={{ color: "#1D6FA4" }}>{a.time} น.</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>ยืนยันแล้ว</span>
              </div>
              <p className="font-bold mb-1" style={{ color: "#1A365D" }}>{a.patientName}</p>
              <p className="text-xs mb-3" style={{ color: "#4A6080" }}>{a.service} • ทพ. {a.doctorName}</p>

              {(a.conditions !== "ไม่มี" || a.allergies !== "ไม่มี") && (
                <div className="flex items-center gap-1 mb-3 bg-orange-50 p-1.5 rounded-lg">
                  <AlertTriangle size={11} style={{ color: "#E65100" }} />
                  <span className="text-[10px] font-medium" style={{ color: "#E65100" }}>
                    {a.conditions !== "ไม่มี" && a.conditions}
                    {a.conditions !== "ไม่มี" && a.allergies !== "ไม่มี" && " • "}
                    {a.allergies !== "ไม่มี" && `แพ้: ${a.allergies}`}
                  </span>
                </div>
              )}

              <button
                onClick={() => onUpdate(a.id, { status: "เช็คอินเรียบร้อย" })}
                className="w-full flex justify-center items-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:bg-blue-600"
                style={{ backgroundColor: "#3B82F6" }}>
                <UserCheck size={16} /> กดเช็คอิน (คนไข้มาถึงแล้ว)
              </button>
            </div>
          ))
        )}
      </div>

      {/* Column 2: In Queue / Treating */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100 text-orange-600">
            <Clock size={16} />
          </div>
          <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>เช็คอินแล้ว / ระหว่างรักษา ({inQueue.length})</h2>
        </div>

        {inQueue.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-gray-200">
            <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>ไม่มีคิวในห้องตรวจ</p>
          </div>
        ) : (
          inQueue.map(a => {
            const colorObj = STATUS_COLORS[a.status] || { bg: "#F0F4F8", text: "#4A6080", dot: "#ccc" };

            return (
              <div key={a.id} className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: colorObj.dot }}></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold" style={{ color: "#1A365D" }}>{a.time} น.</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ backgroundColor: colorObj.bg, color: colorObj.text }}>
                    {a.status}
                  </span>
                </div>
                <p className="font-bold mb-1" style={{ color: "#1A365D" }}>{a.patientName}</p>
                <p className="text-xs mb-3" style={{ color: "#4A6080" }}>ห้องตรวจ: ทพ. {a.doctorName}</p>
                {a.status === "เช็คอินเรียบร้อย" && (
                  <button
                    onClick={() => onUpdate(a.id, { status: "กำลังรักษา" })}
                    className="w-full flex justify-center items-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ backgroundColor: "#A21CAF" }}>
                    เรียกเข้าห้องตรวจ
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Column 3: To Pay */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-600">
            <CreditCard size={16} />
          </div>
          <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>รอชำระเงิน ({toPay.length})</h2>
        </div>

        {toPay.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-gray-200">
            <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>ไม่มีคิวรอชำระเงิน</p>
          </div>
        ) : (
          toPay.map(a => (
            <div
              key={a.id}
              onClick={() => setView && setView("payment")}
              className="rounded-2xl bg-white p-4 shadow-sm border border-green-50 relative overflow-hidden cursor-pointer hover:shadow-md hover:border-green-200 transition-all active:scale-[0.98]"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold" style={{ color: "#1A365D" }}>{a.time} น.</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFFDE7", color: "#B45309" }}>{a.status}</span>
              </div>
              <p className="font-bold mb-1" style={{ color: "#1A365D" }}>{a.patientName}</p>
              <div className="mt-3 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                <p className="text-xs text-gray-500 mb-0.5">ยอดประเมินเบื้องต้น</p>
                <p className="text-lg font-bold text-green-600">฿{a.cost?.toLocaleString() || "1,200"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── View Mode Toggle ─────────────────────────────────────────────────────────
function ViewToggle({ mode, setMode }: { mode: ViewMode; setMode: (m: ViewMode) => void }) {
  const items: { key: ViewMode; label: string; icon: React.ElementType }[] = [
    { key: "daily", label: "รายวัน", icon: CalendarDays },
    { key: "weekly", label: "รายสัปดาห์", icon: CalendarRange },
    { key: "monthly", label: "รายเดือน", icon: CalendarIcon },
  ];
  return (
    <div className="inline-flex rounded-xl p-1" style={{ backgroundColor: "#F0F4F8" }}>
      {items.map(({ key, label, icon: Icon }) => (
        <button key={key} onClick={() => setMode(key)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            backgroundColor: mode === key ? "white" : "transparent",
            color: mode === key ? "#1A365D" : "#94A3B8",
            boxShadow: mode === key ? "0 1px 4px rgba(26,54,93,0.1)" : "none",
          }}>
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Daily View ───────────────────────────────────────────────────────────────
function DailyView({
  selectedDate, setSelectedDate, appointments, closures, dentists, leaves, shifts, setView, onUpdateAppt
}: {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  appointments: Appointment[];
  closures: SpecialClosure[];
  dentists: any[];
  leaves: LeaveRequest[];
  shifts: Shift[];
  setView: (v: StaffView) => void;
  onUpdateAppt: (id: number, s: Partial<Appointment>) => void;
}) {
  const dateStr = fmtDate(selectedDate);
  const todayStr = fmtDate(new Date());
  const isToday = dateStr === todayStr;
  const closure = closures.find(c => c.date === dateStr);

  const dayAppts = appointments
    .filter(a => a.date === dateStr)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));


  return (
    <div>
      {/* Date Navigator */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
            style={{ color: "#4A6080" }}>
            <ChevronLeft size={20} />
          </button>
          <div className="text-center min-w-[200px]">
            <p className="font-bold text-lg flex items-center justify-center gap-2" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
              {isToday && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FF8C9A", color: "white" }}>วันนี้</span>}
              {thaiDay[selectedDate.getDay()]}
            </p>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <p className="text-sm" style={{ color: "#4A6080" }}>
                {selectedDate.getDate()} {thaiMonth[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
              </p>
              <div className="relative overflow-hidden w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center cursor-pointer">
                <CalendarIcon size={14} style={{ color: "#4A6080" }} />
                <input
                  type="date"
                  value={fmtDate(selectedDate)}
                  onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
            style={{ color: "#4A6080" }}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {!isToday && (
            <button onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>
              กลับวันนี้
            </button>
          )}
        </div>

      </div>

      {/* Closure Banner */}
      {closure && (
        <div className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3" style={{ backgroundColor: "#FFF3E0", border: "1px solid #FED7AA" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFCC80" }}>
            <CalendarIcon size={16} style={{ color: "#E65100" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#E65100" }}>คลินิกปิดทำการ</p>
            <p className="text-xs" style={{ color: "#BF360C" }}>{closure.reason}</p>
          </div>
        </div>
      )}

      {/* Doctors on Duty */}
      {!closure && (
        <div className="mb-5 flex flex-col gap-3 bg-white p-4 rounded-2xl border border-gray-100" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.04)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm" style={{ color: "#1A365D" }}>แพทย์ออกตรวจวันนี้</h3>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
            {dentists.map((doc, idx) => {
              // Extract just the first name if formatted with title
              const docNameStr = doc.name.split(" ")[1] || doc.name;
              const isOnLeave = leaves.some(l => l.doctorId === doc.userId && l.startDate === dateStr && l.status === "อนุมัติแล้ว");
              const docAppts = dayAppts.filter(a => (a.doctorName || "").includes(docNameStr));
              
              // Check shift schedule
              const shift = shifts.find(s => s.person_type === 'dentist' && s.person_id === doc.id && s.day_of_week === selectedDate.getDay());
              
              const isWorking = (shift && !shift.is_off && !isOnLeave) || docAppts.length > 0;
              const isOff = !isWorking && !isOnLeave;
              
              let bg = "#F8F9FA", text = "#94A3B8", border = "#E2E8F0";
              if (isWorking) { bg = "#E8F4FF"; text = "#1D6FA4"; border = "#BAE6FD"; }
              else if (isOnLeave) { bg = "#FFF1F2"; text = "#E11D48"; border = "#FECDD3"; }
              
              return (
                <div key={idx} className="flex flex-col items-center min-w-[100px] p-2 rounded-xl border flex-shrink-0" style={{ backgroundColor: bg, borderColor: border }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 shadow-sm bg-white" style={{ color: text }}>
                    {docNameStr.charAt(0)}
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap mb-0.5" style={{ color: text }}>{docNameStr}</span>
                  <span className="text-[10px] font-medium" style={{ color: text, opacity: 0.8 }}>
                    {isWorking ? `มี ${docAppts.length} คิว` : isOnLeave ? "ลาพัก" : "ไม่มีเวร"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content based on isToday */}
      {isToday && !closure ? (
        <>
          <TodayKanbanBoard appts={dayAppts} onUpdate={onUpdateAppt} setView={setView} />
          
          <div className="mt-8 mb-3">
            <h3 className="font-bold text-sm" style={{ color: "#1A365D" }}>
              รายการนัดหมายทั้งหมดของวันนี้ • {dayAppts.length} ราย
            </h3>
            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              (รวมคิวที่เสร็จสิ้นและชำระเงินแล้ว)
            </p>
          </div>
          <AppointmentList appts={dayAppts} />
        </>
      ) : (
        <>
          {/* Stat Cards */}
          <StatCards appts={dayAppts} setView={setView} />

          {/* Appointment List */}
          <div className="mb-3">
            <p className="text-xs font-medium mb-3" style={{ color: "#94A3B8" }}>
              รายการนัดหมาย • {dayAppts.length} ราย
            </p>
          </div>
          <AppointmentList appts={dayAppts} />
        </>
      )}
    </div>
  );
}

// ─── Weekly View ──────────────────────────────────────────────────────────────
function WeeklyView({
  selectedDate, setSelectedDate, appointments, closures, setMode
}: {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  appointments: Appointment[];
  closures: SpecialClosure[];
  setMode: (m: ViewMode) => void;
}) {
  const monday = getMonday(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const todayStr = fmtDate(new Date());

  const handleDayClick = (d: Date) => {
    setSelectedDate(d);
    setMode("daily");
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 09:00 - 20:00

  return (
    <div className="h-full flex flex-col">
      {/* Week Navigator */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setSelectedDate(addDays(selectedDate, -7))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
          style={{ color: "#4A6080" }}>
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="font-bold text-lg" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
            สัปดาห์ที่ {Math.ceil(monday.getDate() / 7)}
          </p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <p className="text-sm" style={{ color: "#4A6080" }}>
              {weekDays[0].getDate()} - {weekDays[6].getDate()} {thaiMonth[weekDays[0].getMonth()]} {weekDays[0].getFullYear() + 543}
            </p>
            <div className="relative overflow-hidden w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center cursor-pointer">
              <CalendarIcon size={14} style={{ color: "#4A6080" }} />
              <input
                type="date"
                value={fmtDate(selectedDate)}
                onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        </div>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 7))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
          style={{ color: "#4A6080" }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Week Time-Grid */}
      <div className="flex bg-white rounded-2xl overflow-hidden border border-gray-100 flex-1" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        {/* Time labels */}
        <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/50">
          <div className="h-14 border-b border-gray-100"></div> {/* Header spacer */}
          {hours.map(h => (
            <div key={h} className="h-24 border-b border-gray-100 p-2 text-right relative">
              <span className="text-xs font-medium text-gray-400 absolute -top-2.5 right-2 bg-gray-50 px-1">{String(h).padStart(2, '0')}:00</span>
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="flex-1 grid grid-cols-7 overflow-x-auto">
          {weekDays.map(day => {
            const ds = fmtDate(day);
            const isToday = ds === todayStr;
            const dayAppts = appointments.filter(a => a.date === ds);
            const closure = closures.find(c => c.date === ds);

            return (
              <div key={ds} className="border-r border-gray-100 last:border-r-0 relative min-w-[120px]">
                {/* Day Header */}
                <div className="h-14 border-b border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleDayClick(day)}>
                  <span className="text-[11px] text-gray-500 font-medium">{thaiDayShort[day.getDay()]}</span>
                  <div className={`mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-pink-500 text-white" : "text-gray-700"}`}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Day Body */}
                <div className="relative flex flex-col" style={{ height: `${12 * 6}rem` /* 12 hours * 6rem (h-24) */ }}>
                  {/* Appointments */}
                  {closure ? (
                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center" style={{ backgroundColor: "rgba(255, 243, 224, 0.4)", zIndex: 5 }}>
                      <span className="text-[11px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">ปิด: {closure.reason}</span>
                    </div>
                  ) : (
                    hours.map(h => {
                      const hAppts = dayAppts.filter(a => parseInt((a.time || "09:00").split(":")[0]) === h);
                      return (
                        <div key={h} className="h-24 border-b border-gray-50 box-border p-1 flex gap-1 flex-wrap overflow-y-auto content-start custom-scrollbar">
                          {hAppts.map(a => {
                            const sc = STATUS_COLORS[a.status] || { bg: "#F0F4F8", text: "#4A6080", dot: "#ccc" };
                            return (
                              <div key={a.id} onClick={() => handleDayClick(day)}
                                className="flex-auto min-w-[45%] h-[40px] rounded-lg p-1.5 overflow-hidden border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow group flex flex-col justify-center"
                                style={{ backgroundColor: sc.bg, borderColor: sc.dot }}
                                title={`${a.time} - ${a.patientName} (${a.service})`}
                              >
                                <p className="text-[10px] font-bold leading-tight truncate mb-0.5" style={{ color: sc.text }}>
                                  {a.time} {a.patientName.split(" ")[0]}
                                </p>
                                <p className="text-[9px] truncate leading-tight opacity-75" style={{ color: sc.text }}>{a.service}</p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Monthly View ─────────────────────────────────────────────────────────────
function MonthlyView({
  selectedDate, setSelectedDate, appointments, closures, setMode
}: {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  appointments: Appointment[];
  closures: SpecialClosure[];
  setMode: (m: ViewMode) => void;
}) {
  const [monthDate, setMonthDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const todayStr = fmtDate(new Date());

  const handleDayClick = (d: number) => {
    setSelectedDate(new Date(year, month, d));
    setMode("daily");
  };

  return (
    <div>
      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setMonthDate(new Date(year, month - 1, 1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
          style={{ color: "#4A6080" }}>
          <ChevronLeft size={20} />
        </button>
        <p className="font-bold text-lg" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          {thaiMonth[month]} {year + 543}
        </p>
        <button onClick={() => setMonthDate(new Date(year, month + 1, 1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
          style={{ color: "#4A6080" }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl bg-white p-5" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        {/* Header Row */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {thaiDayShort.map(d => (
            <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: "#94A3B8" }}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells */}
          {[...Array(firstDow)].map((_, i) => <div key={`e${i}`} />)}

          {/* Day cells */}
          {[...Array(daysInMonth)].map((_, i) => {
            const d = i + 1;
            const ds = fmtDate(new Date(year, month, d));
            const isToday = ds === todayStr;
            const closure = closures.find(c => c.date === ds);
            const dayAppts = appointments.filter(a => a.date === ds);
            const isSunday = new Date(year, month, d).getDay() === 0;

            return (
              <button key={d} onClick={() => handleDayClick(d)}
                className="relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:shadow-md hover:ring-2 hover:ring-pink-200 group"
                title={closure ? `ปิดทำการ: ${closure.reason}` : isSunday ? "วันหยุด" : `${dayAppts.length} นัดหมาย`}
                style={{
                  backgroundColor: closure ? "#FFF8F0" : isToday ? "#FFE8EC" : isSunday ? "#F8F9FA" : "#FAFBFC",
                  border: isToday ? "2px solid #FF8C9A" : "1px solid #F0F2F5",
                }}>
                <span className="text-sm font-semibold" style={{
                  color: closure ? "#E65100" : isToday ? "#FF6B7E" : isSunday ? "#CBD5E1" : "#1A365D"
                }}>
                  {d}
                </span>

                {/* Appointment count badge */}
                {dayAppts.length > 0 && !closure && (
                  <span className="absolute bottom-1 text-xs font-bold px-1.5 py-0 rounded-full"
                    style={{ backgroundColor: "#FF8C9A", color: "white", fontSize: "9px" }}>
                    {dayAppts.length}
                  </span>
                )}

                {/* Closure indicator */}
                {closure && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#E65100" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 px-2">
        {[
          { color: "#FF8C9A", label: "วันนี้" },
          { color: "#FF8C9A", label: "มีนัดหมาย", isBadge: true },
          { color: "#E65100", label: "ปิดทำการ" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            {l.isBadge ? (
              <span className="text-xs font-bold px-1.5 rounded-full" style={{ backgroundColor: l.color, color: "white", fontSize: "9px" }}>3</span>
            ) : (
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            )}
            <span className="text-xs" style={{ color: "#94A3B8" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main QueueBoard ──────────────────────────────────────────────────────────
export default function QueueBoard({
  setView,
  appointments: initialAppointments
}: {
  setView: (v: StaffView) => void;
  appointments?: Appointment[];
}) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Update state if props change (Realtime from PatientPortal)
  useEffect(() => {
    if (initialAppointments) {
      setAppointments(initialAppointments);
    }
  }, [initialAppointments]);

  useEffect(() => {
    Promise.all([
      getClinicClosures(),
      getDentists(),
      getLeaveRequests(),
      getShifts()
    ])
      .then(([cls, dents, lvs, shfts]) => {
        setClosures(cls);
        setDentists(dents);
        setLeaves(lvs);
        setShifts(shfts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 rounded-full" style={{ borderColor: "#F0F4F8", borderTopColor: "#FF8C9A" }} />
      </div>
    );
  }

  const handleUpdateAppt = async (id: number, updates: Partial<Appointment>) => {
    try {
      if (updates.status) {
        const updated = await updateAppointmentStatus(id, updates.status);
        setAppointments(apps => apps.map(a => a.id === id ? { ...a, status: updated.status } : a));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
            คิวงาน
          </h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>
            จัดการนัดหมายและติดตามสถานะการรักษา
          </p>
        </div>
        <ViewToggle mode={viewMode} setMode={setViewMode} />
      </div>

      {/* Views */}
      {viewMode === "daily" && (
        <DailyView
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          appointments={appointments}
          closures={closures}
          dentists={dentists}
          leaves={leaves}
          shifts={shifts}
          setView={setView}
          onUpdateAppt={handleUpdateAppt}
        />
      )}
      {viewMode === "weekly" && (
        <WeeklyView
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          appointments={appointments}
          closures={closures}
          setMode={setViewMode}
        />
      )}
      {viewMode === "monthly" && (
        <MonthlyView
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          appointments={appointments}
          closures={closures}
          setMode={setViewMode}
        />
      )}
    </div>
  );
}
