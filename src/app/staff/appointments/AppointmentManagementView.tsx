import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle, Clock, AlertTriangle, PhoneCall, XCircle, Search, Filter, Calendar as CalendarIcon, ArrowRightLeft, User, CalendarDays, X, UserX } from "lucide-react";
import { Appointment, DentistInfo, STATUS_COLORS } from "../../shared/data";
import { getAppointments, getDentists, updateAppointmentStatus } from "../../shared/supabaseApi";
import { supabase } from "../../shared/utils/supabaseClient";

type TabView = "confirm" | "reschedule" | "transfer" | "all";

export default function AppointmentManagementView({
  appointments: initialAppointments
}: {
  appointments?: Appointment[];
}) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabView>("confirm");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [transferAppt, setTransferAppt] = useState<Appointment | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  
  // Form state
  const [newDoctorId, setNewDoctorId] = useState<string>("");
  const [newDate, setNewDate] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");

  useEffect(() => {
    fetchData();
    
    const channel = supabase.channel('staff_mgmt_appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointment' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update state if props change (Realtime from PatientPortal)
  useEffect(() => {
    if (initialAppointments) {
      setAppointments(initialAppointments);
    }
  }, [initialAppointments]);

  const fetchData = () => {
    setLoading(true);
    getDentists()
      .then(docs => {
        setDentists(docs);
        if (!initialAppointments) {
          getAppointments().then(setAppointments).catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onUpdateAppt = async (id: number, updates: Partial<Appointment>) => {
    try {
      if (updates.status) {
        const updated = await updateAppointmentStatus(id, updates.status);
        setAppointments(apps => apps.map(a => a.id === id ? { ...a, ...updates, status: updated.status } : a));
      } else {
        // Mock update for non-status changes
        setAppointments(apps => apps.map(a => a.id === id ? { ...a, ...updates } : a));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment");
    }
  };

  const handleTransferSubmit = () => {
    if (!transferAppt || !newDoctorId) return;
    const doctor = dentists.find(d => d.id.toString() === newDoctorId);
    if (doctor) {
      onUpdateAppt(transferAppt.id, { doctorId: doctor.id, doctorName: doctor.name });
    }
    setTransferAppt(null);
    setNewDoctorId("");
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleAppt || !newDate || !newTime) return;
    onUpdateAppt(rescheduleAppt.id, { date: newDate, time: newTime });
    setRescheduleAppt(null);
    setNewDate("");
    setNewTime("");
  };

  const handleCancelAppt = (appt: Appointment) => {
    if (confirm(`ยืนยันยกเลิกนัดหมายของคุณ ${appt.patientName} ใช่ไหม?`)) {
      onUpdateAppt(appt.id, { status: "ยกเลิก" });
      setRescheduleAppt(null);
    }
  };

  const handleNoShowAppt = (appt: Appointment) => {
    if (confirm(`ยืนยันว่าคุณ ${appt.patientName} ไม่มาตามนัดใช่ไหม?`)) {
      onUpdateAppt(appt.id, { status: "ไม่มาตามนัด" });
      setRescheduleAppt(null);
    }
  };

  // Derived state
  const pendingAppointments = appointments.filter(a => a.status === "รอการยืนยัน");
  const activeAppointments = appointments.filter(a => !["เสร็จสิ้น", "ยกเลิก", "ชำระเงินแล้ว", "รอการยืนยัน"].includes(a.status));
  
  const displayAppointments = useMemo(() => {
    let list = appointments;
    if (activeTab === "confirm") list = pendingAppointments;
    else if (activeTab === "reschedule" || activeTab === "transfer") list = activeAppointments;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.patientName.toLowerCase().includes(q) || a.hn.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q));
    }
    
    // Sort by date/time
    return list.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }, [appointments, activeTab, searchQuery, pendingAppointments, activeAppointments]);

  const TABS = [
    { key: "confirm" as TabView, label: "ยืนยันเคสพิเศษ", count: pendingAppointments.length, icon: CheckCircle },
    { key: "transfer" as TabView, label: "ย้ายเคส", icon: ArrowRightLeft },
    { key: "reschedule" as TabView, label: "เลื่อน/ยกเลิกนัด", icon: Clock },
    { key: "all" as TabView, label: "นัดหมายทั้งหมด", icon: CalendarDays }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 rounded-full" style={{ borderColor: "#F0F4F8", borderTopColor: "#FF8C9A" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการนัดหมาย</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>ยืนยันเคสพิเศษ, ย้ายเคส, เลื่อนคิว และยกเลิกนัดหมาย</p>
        </div>
        {(activeTab === "all" || activeTab === "transfer" || activeTab === "reschedule") && (
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อคนไข้, HN, ชื่อหมอ..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2" style={{ scrollbarWidth: "none" }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearchQuery(""); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.key ? 'shadow-md' : 'hover:bg-white/50'}`}
            style={{
              backgroundColor: activeTab === tab.key ? "white" : "transparent",
              color: activeTab === tab.key ? "#1A365D" : "#4A6080",
            }}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white ml-1" style={{ backgroundColor: "#F57F17" }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content List */}
      <div className="space-y-4">
        {displayAppointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 flex flex-col items-center justify-center text-center" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#F0F4F8" }}>
              <Filter size={32} style={{ color: "#94A3B8" }} />
            </div>
            <p className="font-semibold text-lg" style={{ color: "#1A365D" }}>ไม่พบรายการนัดหมาย</p>
            <p className="text-sm mt-1" style={{ color: "#4A6080" }}>{searchQuery ? "ลองค้นหาด้วยคำอื่น" : "ไม่มีรายการในหมวดหมู่นี้"}</p>
          </div>
        ) : (
          displayAppointments.map(a => (
            <div key={a.id} className="rounded-2xl bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:shadow-md" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.04)", borderLeft: activeTab === "confirm" ? "4px solid #F57F17" : "none" }}>
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                {/* Date & Time block */}
                <div className="bg-gray-50 px-4 py-3 rounded-xl flex flex-col items-center justify-center min-w-[120px] border border-gray-100">
                  <span className="text-xs font-bold mb-1" style={{ color: "#4A6080" }}>{a.date}</span>
                  <span className="text-lg font-black" style={{ color: "#1A365D" }}>{a.time} น.</span>
                </div>
                
                {/* Info block */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-bold" style={{ color: "#1A365D" }}>{a.patientName}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">HN: {a.hn}</span>
                    {activeTab === "all" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" 
                        style={{ backgroundColor: STATUS_COLORS[a.status]?.bg || "#eee", color: STATUS_COLORS[a.status]?.text || "#333" }}>
                        {a.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-2" style={{ color: "#4A6080" }}>
                    <span className="font-semibold text-gray-700">บริการ:</span> {a.service}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm">
                      <User size={14} style={{ color: "#1D6FA4" }} />
                      <span className="font-medium" style={{ color: "#1D6FA4" }}>ทพ. {a.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <PhoneCall size={14} />
                      {a.patientPhone}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons based on Tab */}
              <div className="flex flex-col sm:flex-row gap-2 min-w-[160px] md:justify-end">
                {activeTab === "confirm" && (
                  <>
                    <button onClick={() => onUpdateAppt(a.id, { status: "ยืนยันการจอง" })}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                      style={{ backgroundColor: "#22C55E", boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)" }}>
                      <CheckCircle size={16} /> ยืนยันคิว
                    </button>
                    <button onClick={() => handleCancelAppt(a)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all hover:bg-red-50"
                      style={{ color: "#EF4444", border: "1px solid #FECACA" }}>
                      <XCircle size={16} /> ปฏิเสธ
                    </button>
                  </>
                )}
                
                {activeTab === "transfer" && (
                  <button onClick={() => setTransferAppt(a)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#1D6FA4,#1A365D)", boxShadow: "0 4px 12px rgba(26,54,93,0.2)" }}>
                    <ArrowRightLeft size={16} /> ย้ายเคส
                  </button>
                )}

                {activeTab === "reschedule" && (
                  <button onClick={() => {
                    setRescheduleAppt(a);
                    setNewDate(a.date);
                    setNewTime(a.time);
                  }}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 w-full sm:w-auto"
                    style={{ backgroundColor: "#F57F17", boxShadow: "0 4px 12px rgba(245, 127, 23, 0.2)" }}>
                    <Clock size={16} /> เลื่อน/ยกเลิกนัด
                  </button>
                )}
                
                {activeTab === "all" && (
                  <button className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-gray-100 border border-gray-200 text-gray-600">
                    ดูรายละเอียด
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transfer Modal */}
      {transferAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ย้ายเคส (Transfer)</h2>
              <button onClick={() => setTransferAppt(null)} className="p-1.5 rounded-lg hover:bg-gray-200"><X size={16} style={{ color: "#4A6080" }} /></button>
            </div>
            <div className="p-6">
              <div className="mb-5 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm font-bold text-blue-900 mb-1">{transferAppt.patientName}</p>
                <p className="text-xs text-blue-700">บริการ: {transferAppt.service}</p>
                <p className="text-xs text-blue-700 mt-1">คิวปัจจุบัน: {transferAppt.date} | {transferAppt.time} น.</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-md w-fit">
                  <AlertTriangle size={12} /> หมอเดิม: ทพ. {transferAppt.doctorName}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: "#4A6080" }}>เลือกทันตแพทย์ท่านใหม่</label>
                <select 
                  value={newDoctorId} 
                  onChange={e => setNewDoctorId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 text-sm font-medium"
                >
                  <option value="" disabled>-- เลือกทันตแพทย์ --</option>
                  {dentists.filter(d => d.name !== transferAppt.doctorName).map(doc => (
                    <option key={doc.id} value={doc.id}>ทพ. {doc.name} ({doc.specialty})</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleTransferSubmit}
                disabled={!newDoctorId}
                className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#1D6FA4,#1A365D)" }}>
                <ArrowRightLeft size={18} /> ยืนยันการย้ายเคส
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule / Cancel Modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,54,93,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>เลื่อน/ยกเลิกนัด</h2>
              <button onClick={() => setRescheduleAppt(null)} className="p-1.5 rounded-lg hover:bg-gray-200"><X size={16} style={{ color: "#4A6080" }} /></button>
            </div>
            <div className="p-6">
              <div className="mb-5 bg-orange-50 p-4 rounded-xl border border-orange-100">
                <p className="text-sm font-bold text-orange-900 mb-1">{rescheduleAppt.patientName}</p>
                <p className="text-xs text-orange-800">บริการ: {rescheduleAppt.service}</p>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-orange-700">
                  <CalendarIcon size={14} /> คิวเดิม: {rescheduleAppt.date} | {rescheduleAppt.time} น.
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: "#4A6080" }}>วันที่ใหม่</label>
                  <input 
                    type="date" 
                    value={newDate} 
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: "#4A6080" }}>เวลาใหม่</label>
                  <input 
                    type="time" 
                    value={newTime} 
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleCancelAppt(rescheduleAppt)}
                    className="flex-[1] py-3.5 rounded-xl font-bold text-red-600 bg-red-50 border border-red-200 transition-all hover:bg-red-100 flex items-center justify-center gap-2">
                    <XCircle size={18} /> ยกเลิกนัด
                  </button>
                  <button 
                    onClick={() => handleNoShowAppt(rescheduleAppt)}
                    className="flex-[1] py-3.5 rounded-xl font-bold text-gray-700 bg-gray-100 border border-gray-300 transition-all hover:bg-gray-200 flex items-center justify-center gap-2">
                    <UserX size={18} /> ไม่มาตามนัด
                  </button>
                </div>
                <button 
                  onClick={handleRescheduleSubmit}
                  disabled={!newDate || !newTime || (newDate === rescheduleAppt.date && newTime === rescheduleAppt.time)}
                  className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#F57F17", boxShadow: "0 4px 12px rgba(245, 127, 23, 0.2)" }}>
                  <Clock size={18} /> ยืนยันเลื่อนนัด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
