import React, { useState, useEffect } from "react";
import { Calendar, FileText, ArrowLeft, ChevronRight, Bell, Settings } from "lucide-react";
import { getLeaveRequests } from "../../shared/supabaseApi";
import ScheduleManagement from "../schedule/ScheduleManagement";
import LeaveApprovals from "../leave/LeaveApprovals";
import ClinicSettingsManagement from "../settings/ClinicSettingsManagement";

type ScheduleSubView = null | "schedule" | "leaves" | "clinic_settings";

export default function ScheduleHub() {
  const [subView, setSubView] = useState<ScheduleSubView>(null);
  const [prevSubView, setPrevSubView] = useState<ScheduleSubView>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getLeaveRequests()
      .then(leaves => setPendingCount(leaves.filter(l => l.status === "รออนุมัติ").length))
      .catch(console.error);
  }, []);

  const handleNavigate = (view: ScheduleSubView) => {
    setPrevSubView(subView);
    setSubView(view);
  };

  const handleBack = () => {
    setSubView(prevSubView);
    setPrevSubView(null); // ล้างค่าหน้าก่อนหน้าหลังจากกดย้อนกลับ
  };

  // แสดงผลหน้าย่อยที่เลือก
  if (subView === "schedule") return <SubViewWrapper onBack={() => setSubView(null)}><ScheduleManagement onNavigateToSettings={() => handleNavigate("clinic_settings")} /></SubViewWrapper>;
  if (subView === "leaves") return <SubViewWrapper onBack={() => setSubView(null)}><LeaveApprovals /></SubViewWrapper>;
  if (subView === "clinic_settings") return <SubViewWrapper onBack={handleBack}><ClinicSettingsManagement /></SubViewWrapper>;

  // การ์ดเมนูเลือกหมวดหมู่การจัดการ
  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}>
            ตารางเวรและการลา
          </h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>จัดการตารางเวรบุคลากรและอนุมัติคำขอลา</p>
        </div>
        <button
          onClick={() => handleNavigate("clinic_settings")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium hover:bg-gray-50 transition-colors"
          style={{ color: "#1A365D" }}
        >
          <Settings size={16} />
          ตั้งค่าคลินิก
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* การ์ดจัดการตารางเวร */}
        <button
          onClick={() => setSubView("schedule")}
          className="group text-left bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          style={{ borderColor: "rgba(26,54,93,0.08)" }}
        >
          <div className="p-6 pb-4" style={{ background: "linear-gradient(135deg, #1A365D 0%, #2D5F9A 100%)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
              <Calendar size={24} color="white" />
            </div>
            <h3 className="text-lg font-bold text-white">จัดการตารางเวร</h3>
          </div>
          <div className="p-6 pt-4">
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "#4A6080" }}>
              กำหนดวันทำงานและเวลาเข้าเวรของทันตแพทย์และพนักงาน
            </p>
            <div className="flex items-center justify-end">
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                style={{ backgroundColor: "#F0F4F8" }}>
                <ChevronRight size={16} style={{ color: "#4A6080" }} />
              </div>
            </div>
          </div>
        </button>

        {/* การ์ดอนุมัติการลางาน */}
        <button
          onClick={() => setSubView("leaves")}
          className="group text-left bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
          style={{ borderColor: pendingCount > 0 ? "#F59E0B" : "rgba(26,54,93,0.08)" }}
        >
          {/* ป้ายแจ้งเตือนจำนวนรายการ */}
          {pendingCount > 0 && (
            <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-xs font-bold shadow-lg animate-pulse"
              style={{ backgroundColor: "#EF4444" }}>
              <Bell size={12} />
              {pendingCount}
            </div>
          )}

          <div className="p-6 pb-4" style={{ background: pendingCount > 0 ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" : "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
              <FileText size={24} color="white" />
            </div>
            <h3 className="text-lg font-bold text-white">อนุมัติการลา</h3>
          </div>
          <div className="p-6 pt-4">
            <p className="text-sm mb-4 leading-relaxed" style={{ color: "#4A6080" }}>
              ตรวจสอบและอนุมัติคำขอลาของบุคลากร
            </p>
            <div className="flex items-center justify-between">
              {pendingCount > 0 ? (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                  รอดำเนินการ {pendingCount} รายการ
                </span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "#E8FFF0", color: "#1B7A3E" }}>
                  ไม่มีรายการรอ
                </span>
              )}
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                style={{ backgroundColor: "#F0F4F8" }}>
                <ChevronRight size={16} style={{ color: "#4A6080" }} />
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function SubViewWrapper({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium mb-4 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/80"
        style={{ color: "#4A6080" }}>
        <ArrowLeft size={16} />
        กลับไปเลือกหมวดหมู่
      </button>
      {children}
    </div>
  );
}
