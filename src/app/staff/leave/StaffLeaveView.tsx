import React, { useState, useEffect } from "react";
import { CheckCircle, Send, Clock, CalendarX, X } from "lucide-react";
import { LeaveRequest } from "../../shared/data";
import WorkCalendar from "../../shared/components/WorkCalendar";
import { getLeaveRequests, addLeaveRequest, getStaff } from "../../shared/supabaseApi";

export default function StaffLeaveView() {
  const staffId = 1;
  const [staffName, setStaffName] = useState("พนักงานต้อนรับ (รัตนา)");
  
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app we fetch this staff's leaves
    getLeaveRequests().then(data => setLeaves(data.filter(l => l.doctorId === staffId))).catch(console.error).finally(() => setLoading(false));
  }, []);

  const [form, setForm] = useState({ start: "", end: "", reason: "" });
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.start || !form.end || !form.reason) return;
    const nl: Omit<LeaveRequest, "id"> = {
      doctorId: staffId, doctorName: staffName,
      startDate: form.start, endDate: form.end, reason: form.reason,
      status: "รอการอนุมัติ", createdAt: new Date().toISOString().split("T")[0],
    };
    try {
      const added = await addLeaveRequest(nl);
      setLeaves(l => [added, ...l]);
      setForm({ start: "", end: "", reason: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit leave request");
    }
  };

  const handleSelectDate = (date: string) => {
    setForm(f => ({ ...f, start: date, end: date }));
  };

  const lsc: Record<string, { bg: string; text: string }> = { 
    "รอการอนุมัติ": { bg: "#FFF3E0", text: "#E65100" }, 
    "อนุมัติแล้ว": { bg: "#E8FFF0", text: "#1B7A3E" }, 
    "ปฏิเสธ": { bg: "#FEF2F2", text: "#B91C1C" } 
  };

  const pendingDates = leaves.filter(l => l.status === "รอการอนุมัติ").map(l => l.startDate);
  const approvedDates = leaves.filter(l => l.status === "อนุมัติแล้ว").map(l => l.startDate);

  // Mock quota logic
  const quotaUsedTimes = leaves.filter(l => l.status === "อนุมัติแล้ว").length;
  const quotaMaxTimes = 12;
  const quotaUsedDays = leaves.filter(l => l.status === "อนุมัติแล้ว").reduce((acc, curr) => {
    const d1 = new Date(curr.startDate).getTime();
    const d2 = new Date(curr.endDate).getTime();
    return acc + Math.max(1, Math.ceil((d2 - d1) / (1000 * 3600 * 24)) + 1);
  }, 0);
  const quotaMaxDays = 15;

  const isOverQuota = quotaUsedTimes >= quotaMaxTimes || quotaUsedDays >= quotaMaxDays;

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ขอลางาน</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>คลิกเลือกวันที่ในปฏิทินเพื่อระบุวันลา และตรวจสอบสถานะการอนุมัติ</p>
        </div>
        
        {/* Quota Box */}
        <div className="bg-white rounded-2xl p-5 flex gap-6 shadow-sm border" style={{ borderColor: isOverQuota ? "#FF8C9A" : "rgba(26,54,93,0.1)", boxShadow: "0 4px 20px rgba(26,54,93,0.05)" }}>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>โควตาการลา (ครั้ง)</p>
            <p className="text-xl font-bold" style={{ color: quotaUsedTimes >= quotaMaxTimes ? "#E60000" : "#1A365D" }}>
              {quotaUsedTimes} <span className="text-sm font-medium text-gray-400">/ {quotaMaxTimes} ครั้ง</span>
            </p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>โควตาการลา (วัน)</p>
            <p className="text-xl font-bold" style={{ color: quotaUsedDays >= quotaMaxDays ? "#E60000" : "#1A365D" }}>
              {quotaUsedDays} <span className="text-sm font-medium text-gray-400">/ {quotaMaxDays} วัน</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Calendar Section */}
        <div className="xl:col-span-5 flex flex-col min-h-[500px]">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2" style={{ background: "linear-gradient(90deg, #1D6FA4, #1A365D)" }} />
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "#1A365D" }}>
              <CalendarX size={20} /> ปฏิทินวันหยุด
            </h2>
            <WorkCalendar 
              onSelectDate={handleSelectDate} 
              pendingDates={pendingDates} 
              approvedDates={approvedDates} 
              offDates={[]} 
              specialHolidays={['2026-07-28', '2026-08-12']} 
            />
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-200" /> รออนุมัติ</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-200" /> อนุมัติแล้ว</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-100" /> วันหยุดนักขัตฤกษ์</div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Leave Form */}
          <div className="rounded-3xl bg-white p-6 md:p-8 relative overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(26,54,93,0.06)" }}>
            <div className="absolute top-0 left-0 w-full h-2" style={{ background: "linear-gradient(90deg, #FF8C9A, #FF6B7E)" }} />
            <h2 className="font-bold text-lg mb-5 flex items-center gap-2" style={{ color: "#1A365D" }}>
               ยื่นคำขอลางานใหม่
            </h2>
            
            {submitted && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold mb-6 animate-pulse" style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E", border: "1px solid #BBF7D0" }}>
                <CheckCircle size={16} /> ส่งคำขอเรียบร้อยแล้ว แอดมินจะแจ้งผลให้ทราบเร็วๆ นี้
              </div>
            )}
            
            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-1.5" style={{ color: "#1A365D" }}>วันที่เริ่มลา *</label>
                  <input type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all focus:border-blue-400" 
                    style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", color: "#1A365D" }} required />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5" style={{ color: "#1A365D" }}>ถึงวันที่ *</label>
                  <input type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all focus:border-blue-400" 
                    style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", color: "#1A365D" }} required />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: "#1A365D" }}>ประเภท และ เหตุผลการลา *</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  rows={3} placeholder="เช่น ลาป่วย (มีใบรับรองแพทย์), ลากิจไปทำธุระครอบครัว..." 
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none border transition-all focus:border-blue-400"
                  style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", color: "#1A365D" }} required />
              </div>
              
              <div className="pt-2">
                <button type="submit" className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", boxShadow: "0 8px 16px rgba(255,107,126,0.25)" }}>
                  <Send size={16} /> ส่งคำขอลางาน
                </button>
              </div>
            </form>
          </div>

          {/* Leave History */}
          <div className="rounded-3xl bg-white p-6 md:p-8 flex-1" style={{ boxShadow: "0 4px 24px rgba(26,54,93,0.06)" }}>
            <h2 className="font-bold text-lg mb-5 flex items-center gap-2" style={{ color: "#1A365D" }}>
              <Clock size={20} /> ประวัติการลางาน
            </h2>
            <div className="space-y-4">
              {leaves.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm font-medium">ยังไม่มีประวัติการลางาน</p>
                </div>
              ) : leaves.map(l => (
                <div key={l.id} className="p-4 rounded-2xl border transition-all hover:shadow-md" style={{ backgroundColor: "#fff", borderColor: "#F1F5F9" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-bold" style={{ color: "#1A365D" }}>
                          {l.startDate === l.endDate ? l.startDate : `${l.startDate} – ${l.endDate}`}
                        </p>
                        <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0"
                          style={{ backgroundColor: lsc[l.status]?.bg, color: lsc[l.status]?.text }}>
                          {l.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium" style={{ color: "#4A6080" }}>{l.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
