import React, { useState, useEffect } from "react";
import { Check, X, Clock, History, BarChart2 } from "lucide-react";
import { LeaveRequest } from "../../shared/data";
import { getLeaveRequests, updateLeaveStatus } from "../../shared/supabaseApi";

type Tab = "pending" | "history";

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  const lsc: Record<string, { bg: string; text: string }> = {
    "รออนุมัติ": { bg: "#FFF3E0", text: "#E65100" },
    "อนุมัติแล้ว": { bg: "#E8FFF0", text: "#1B7A3E" },
    "ไม่อนุมัติ": { bg: "#FEF2F2", text: "#B91C1C" },
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
      setLeaves(ls => ls.map(l => l.id === id ? { ...l, status: updated.status } : l));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update status");
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === "รออนุมัติ");
  const historyLeaves = leaves.filter(l => l.status !== "รออนุมัติ");

  const TabButton = ({ id, label, icon: Icon, count }: { id: Tab, label: string, icon: any, count?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all ${activeTab === id
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
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>อนุมัติการลางาน</h1>
        <p className="text-sm" style={{ color: "#4A6080" }}>จัดการคำขอลางานของพนักงานและแพทย์ทั้งหมด</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <TabButton id="pending" label="รออนุมัติ" icon={Clock} count={pendingLeaves.length} />
        <TabButton id="history" label="ประวัติอนุมัติแล้ว" icon={History} />
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
                    {l.doctorName.replace(/ทพญ\.|ทพ\./g, '').trim()[0] || "พ"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{l.doctorName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
                      {l.startDate === l.endDate ? l.startDate : `${l.startDate} – ${l.endDate}`}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#1A365D" }}>ประเภท: ลา{l.leaveType}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#1A365D" }}>เหตุผล: {l.reason}</p>
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
                    <button onClick={() => update(l.id, "ไม่อนุมัติ")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:bg-red-100"
                      style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}>
                      <X size={12} /> ไม่อนุมัติ
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
                      {l.doctorName.replace(/ทพญ\.|ทพ\./g, '').trim()[0] || "พ"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{l.doctorName}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
                        {l.startDate === l.endDate ? l.startDate : `${l.startDate} – ${l.endDate}`}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#1A365D" }}>ประเภท: ลา{l.leaveType}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#1A365D" }}>เหตุผล: {l.reason}</p>
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

    </div>
  );
}
