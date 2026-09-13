import { useState, useEffect } from "react";
import { Search, Calendar, Bell, Send, CheckCircle, Clock, AlertTriangle, ArrowRight, User } from "lucide-react";
import { getActiveTreatmentTrackings, sendAppointmentSlip, addAppointment, getServices } from "../../shared/supabaseApi";
import { useRealtimeAppointments } from "../../shared/useRealtimeAppointments";

export default function TreatmentTrackingView() {
  const [trackings, setTrackings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { appointments } = useRealtimeAppointments(); // to trigger re-renders if needed

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getActiveTreatmentTrackings();
      setTrackings(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [appointments]);

  const handleSendSlip = async (t: any) => {
    if (!confirm("ยืนยันการส่งใบนัดแบบเปิด (Open Ticket) ให้คนไข้เลือกวันเวลาเอง?")) return;
    try {
      const services = await getServices();
      const serviceName = t.nextService || t.planName;
      let matchedServiceId = 1;
      
      if (services && services.length > 0) {
        // Find by name containing or exact match
        const match = services.find((s:any) => s.name === serviceName || s.name.includes(serviceName) || serviceName.includes(s.name));
        if (match) matchedServiceId = match.id;
      }

      await addAppointment({
        patientId: t.patientId,
        hn: '',
        patientName: t.patientName,
        patientPhone: t.patientPhone,
        service: serviceName,
        serviceId: matchedServiceId,
        doctorName: t.doctorName,
        doctorId: t.doctorId,
        date: '',
        time: '',
        status: 'รอการยืนยัน',
        source: 'doctor',
        treatmentPlanId: t.planId,
        planItemId: t.planItemId,
        note: `นัดหมายตามแผนการรักษา: ${t.planName} (เดือนที่ ${t.month})`
      } as any);

      await sendAppointmentSlip(t.id);
      loadData();
      alert("ระบบได้สร้างใบนัดแบบเปิดและอัปเดตสถานะแล้ว");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const filtered = trackings.filter(t => {
    const matchSearch = t.patientName.includes(search) || t.patientPhone.includes(search) || t.planName.includes(search);
    const matchStatus = filterStatus === "all" || t.trackingStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === "รอติดตาม") {
      return <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold flex items-center gap-1.5"><AlertTriangle size={14} /> ต้องติดตาม</div>;
    }
    if (status === "ส่งใบนัดแล้ว") {
      return <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold flex items-center gap-1.5"><Clock size={14} /> รอคนไข้เลือกวัน</div>;
    }
    if (status === "นัดหมายแล้ว") {
      return <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold flex items-center gap-1.5"><CheckCircle size={14} /> นัดหมายแล้ว</div>;
    }
    return <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{status}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ติดตามเคสต่อเนื่อง (Treatment Tracking)</h2>
          <p className="text-sm text-slate-500 mt-1">ตรวจสอบคนไข้ที่ถึงกำหนดรับบริการรายเดือน แต่ยังไม่มีการนัดหมาย</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, เบอร์โทร..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="all">สถานะทั้งหมด</option>
            <option value="รอติดตาม">🔴 ต้องติดตาม</option>
            <option value="ส่งใบนัดแล้ว">🟠 รอคนไข้เลือกวัน</option>
            <option value="นัดหมายแล้ว">🟢 นัดหมายแล้ว</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 gap-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            กำลังโหลดข้อมูล...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <CheckCircle size={48} className="mb-4 text-slate-300" />
            <p>ไม่มีเคสที่ต้องติดตามในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => (
              <div key={t.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                {t.trackingStatus === 'รอติดตาม' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      {t.patientName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{t.patientPhone || 'ไม่มีเบอร์โทร'}</p>
                  </div>
                  {getStatusBadge(t.trackingStatus)}
                </div>

                <div className="space-y-3 mb-5">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 font-medium mb-1">แผนการรักษา</p>
                    <p className="text-sm font-bold text-slate-700">{t.planName}</p>
                    <p className="text-xs text-slate-500 mt-1">ทันตแพทย์: {t.doctorName}</p>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <div>
                      <p className="text-xs text-slate-500">รอบเดือนที่</p>
                      <p className="text-lg font-bold text-blue-600">เดือน {t.month}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">บริการรอบนี้</p>
                      <p className="text-sm font-semibold text-slate-700">{t.nextService || 'ตามแผน'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  {t.trackingStatus === 'รอติดตาม' && (
                    <button onClick={() => handleSendSlip(t)} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                      <Send size={16} /> ส่งใบนัดให้คนไข้
                    </button>
                  )}
                  {t.trackingStatus === 'ส่งใบนัดแล้ว' && (
                    <button className="flex-1 bg-slate-50 text-slate-400 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                      <Clock size={16} /> รอคนไข้ตอบรับ...
                    </button>
                  )}
                  {t.trackingStatus === 'นัดหมายแล้ว' && (
                    <button className="flex-1 bg-green-50 text-green-600 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                      <CheckCircle size={16} /> นัดหมายเรียบร้อย
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
