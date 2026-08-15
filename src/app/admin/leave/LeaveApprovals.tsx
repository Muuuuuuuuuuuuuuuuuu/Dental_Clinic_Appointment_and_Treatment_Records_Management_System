import React, { useState, useEffect } from "react";
import { Check, X, Clock, History, BarChart2 } from "lucide-react";
import { LeaveRequest } from "../../shared/data";
import { getLeaveRequests, updateLeaveStatus } from "../../shared/supabaseApi";

type Tab = "pending" | "history" | "summary";

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  const lsc: Record<string, { bg: string; text: string }> = {
    "รอการอนุมัติ": { bg: "#FFF3E0", text: "#E65100" },
    "อนุมัติแล้ว":  { bg: "#E8FFF0", text: "#1B7A3E" },
    "ปฏิเสธ":        { bg: "#FEF2F2", text: "#B91C1C" },
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await getLeaveRequests();
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: number, s: string) => {
    try {
      const updated = await updateLeaveStatus(id, s);
      setLeaves(ls => ls.map(l => l.id === id ? updated : l));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update status");
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === "รอการอนุมัติ");
  const historyLeaves = leaves.filter(l => l.status !== "รอการอนุมัติ");

  // Summary aggregation
  const summary = leaves.reduce((acc, curr) => {
    if (curr.status !== "อนุมัติแล้ว") return acc;
    const d1 = new Date(curr.startDate).getTime();
    const d2 = new Date(curr.endDate).getTime();
    const days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 3600 * 24)) + 1);
    
    if (!acc[curr.doctorId]) {
      acc[curr.doctorId] = { name: curr.doctorName, times: 0, days: 0 };
    }
    acc[curr.doctorId].times += 1;
    acc[curr.doctorId].days += days;
    return acc;
  }, {} as Record<number, { name: string; times: number; days: number }>);

  const summaryList = Object.values(summary);

  const TabButton = ({ id, label, icon: Icon, count }: { id: Tab, label: string, icon: any, count?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all ${
        activeTab === id 
          ? "border-b-2 border-[#1A365D] text-[#1A365D]" 
          : "border-b-2 border-transparent text-[#4A6080] hover:text-[#1A365D] hover:bg-black/5"
      }`}
    >
      <Icon size={16} />
      {label}
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === id ? "bg-[#1A365D] text-white" : "bg-gray-100"}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>อนุมัติการลางาน</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>จัดการคำขอลางานและดูสรุปโควตาของพนักงานทั้งหมด</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <TabButton id="pending" label="รออนุมัติ" icon={Clock} count={pendingLeaves.length} />
        <TabButton id="history" label="ประวัติอนุมัติแล้ว" icon={History} />
        <TabButton id="summary" label="สรุปโควตาพนักงาน" icon={BarChart2} />
      </div>

      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingLeaves.length === 0 ? (
             <div className="text-center py-10 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">ไม่มีคำขอลางานที่รออนุมัติ</div>
          ) : pendingLeaves.map(l => (
            <div key={l.id} className="rounded-2xl bg-white p-5 border border-l-4 border-l-[#F59E0B]" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: "#FF8C9A" }}>
                    {l.doctorName[4] ?? "พ"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{l.doctorName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
                      {l.startDate === l.endDate ? l.startDate : `${l.startDate} – ${l.endDate}`}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#1A365D" }}>เหตุผล: {l.reason}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>ยื่นเมื่อ: {l.createdAt}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: lsc[l.status].bg, color: lsc[l.status].text }}>
                    {l.status}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => update(l.id, "อนุมัติแล้ว")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#22C55E" }}>
                      <Check size={12} /> อนุมัติ
                    </button>
                    <button onClick={() => update(l.id, "ปฏิเสธ")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:bg-red-100"
                      style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}>
                      <X size={12} /> ปฏิเสธ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {historyLeaves.length === 0 ? (
             <div className="text-center py-10 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">ไม่มีประวัติการอนุมัติ</div>
          ) : historyLeaves.map(l => {
             const sc = lsc[l.status] ?? { bg: "#F0F4F8", text: "#4A6080" };
             const isApproved = l.status === "อนุมัติแล้ว";
             return (
              <div key={l.id} className={`rounded-2xl bg-white p-5 border border-l-4 ${isApproved ? 'border-l-[#22C55E]' : 'border-l-[#EF4444]'}`} style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: "#FF8C9A" }}>
                      {l.doctorName[4] ?? "พ"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{l.doctorName}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
                        {l.startDate === l.endDate ? l.startDate : `${l.startDate} – ${l.endDate}`}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#1A365D" }}>เหตุผล: {l.reason}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>ยื่นเมื่อ: {l.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
                      {l.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "summary" && (
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
          <h2 className="font-semibold mb-4" style={{ color: "#1A365D" }}>สรุปการลางานของพนักงานและแพทย์</h2>
          {summaryList.length === 0 ? (
            <div className="text-center py-10 text-gray-400">ยังไม่มีข้อมูลการลางานที่ได้รับการอนุมัติ</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
                    <th className="py-3 px-4 font-semibold text-sm" style={{ color: "#4A6080" }}>ชื่อ - นามสกุล</th>
                    <th className="py-3 px-4 font-semibold text-sm text-center" style={{ color: "#4A6080" }}>จำนวนครั้งที่ลา</th>
                    <th className="py-3 px-4 font-semibold text-sm text-center" style={{ color: "#4A6080" }}>จำนวนวันที่ลา</th>
                    <th className="py-3 px-4 font-semibold text-sm" style={{ color: "#4A6080" }}>สถานะโควตา (สมมติ 5 ครั้ง / 14 วัน)</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryList.map((s, i) => {
                    const quotaMaxTimes = 5;
                    const quotaMaxDays = 14;
                    const isOver = s.times > quotaMaxTimes || s.days > quotaMaxDays;
                    const isWarning = s.times === quotaMaxTimes || s.days >= quotaMaxDays - 2;
                    return (
                      <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: "rgba(26,54,93,0.05)" }}>
                        <td className="py-3 px-4 text-sm font-medium" style={{ color: "#1A365D" }}>{s.name}</td>
                        <td className="py-3 px-4 text-sm text-center font-bold" style={{ color: s.times > quotaMaxTimes ? "#E60000" : "#1A365D" }}>{s.times}</td>
                        <td className="py-3 px-4 text-sm text-center font-bold" style={{ color: s.days > quotaMaxDays ? "#E60000" : "#1A365D" }}>{s.days}</td>
                        <td className="py-3 px-4">
                          {isOver ? (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">เกินโควตา</span>
                          ) : isWarning ? (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">ใกล้หมดโควตา</span>
                          ) : (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">ปกติ</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
