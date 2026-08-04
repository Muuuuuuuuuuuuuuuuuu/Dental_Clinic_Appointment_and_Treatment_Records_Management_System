import { useState, useEffect } from "react";
import PaymentView from "./payment/PaymentView";

import WalkInBooking from "./booking/WalkInBooking";
import AppointmentManagementView from "./appointments/AppointmentManagementView";
import PatientManagementView from "./patients/PatientManagementView";

import QueueBoard from "./queue/QueueBoard";
import StaffLeaveView from "./leave/StaffLeaveView";
import AnnouncementView from "../shared/components/AnnouncementView";

import {
  Home, Search, Calendar, Users, FileText, LogOut, Smile,
  CheckCircle, Clock, CreditCard, Menu, UserCheck,
  AlertTriangle, Plus, Printer, ArrowRight, X, UserPlus, CalendarX,
  Megaphone, Lock, ShieldCheck, Fingerprint, Wifi, WifiOff, Settings
} from "lucide-react";
import {
  Appointment, LeaveRequest, STATUS_COLORS,
  getClinicStatus, StaffView, ClinicStatus
} from "../shared/data";
import { getWeeklyOffDays, getClinicClosures, getClinicSettings, getDailyHours } from "../shared/supabaseApi";

function StaffStatusBanner() {
  const [s, setS] = useState<ClinicStatus | null>(null);
  useEffect(() => {
    Promise.all([getWeeklyOffDays(), getClinicClosures(), getClinicSettings(), getDailyHours()]).then(([offDays, closures, settings, dh]) => {
      setS(getClinicStatus(new Date(), closures, offDays, settings, dh));
    }).catch(console.error);
  }, []);
  if (!s || s.type === "open") return null;
  return (
    <div className="px-5 lg:px-8 pt-4">
      <div className="rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-sm"
        style={{ backgroundColor: s.type === "special" ? "#FFF3E0" : "#F1F5F9", border: `1px solid ${s.type === "special" ? "#FED7AA" : "#E2E8F0"}` }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.dotColor }} />
        <span className="font-medium" style={{ color: s.type === "special" ? "#92400E" : "#475569" }}>{s.label}</span>
        <span className="text-xs" style={{ color: s.type === "special" ? "#B45309" : "#64748B" }}>— {s.sublabel}</span>
      </div>
    </div>
  );
}

const STAFF_NAV = [
  { key: "queue" as StaffView, label: "คิวงาน", icon: Home, isOperational: true },
  { key: "appointments" as StaffView, label: "จัดการนัดหมาย", icon: CheckCircle, isOperational: true },
  { key: "patients" as StaffView, label: "จัดการคนไข้", icon: Users, isOperational: true },
  { key: "walkin" as StaffView, label: "จองคิว Walk-in", icon: Plus, isOperational: true },
  { key: "payment" as StaffView, label: "รับชำระเงิน", icon: CreditCard, isOperational: true },
  { key: "leave" as StaffView, label: "ขอลางาน", icon: CalendarX, isOperational: false },
  { key: "announcements" as StaffView, label: "ประกาศจากคลินิก", icon: Megaphone, isOperational: false },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function StaffSidebar({ 
  view, 
  setView, 
  onLogout,
  isClockedIn,
  staffName,
  staffRole,
  staffInitial,
  onChangePassword
}: { 
  view: StaffView; 
  setView: (v: StaffView) => void; 
  onLogout: () => void;
  isClockedIn: boolean;
  staffName?: string;
  staffRole?: string;
  staffInitial?: string;
  onChangePassword?: () => void;
}) {
  return (
    <div className="flex flex-col h-full py-6 px-4" style={{ backgroundColor: "#1A365D" }}>
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}>
          <Smile size={16} color="white" />
        </div>
        <div>
          <div className="font-bold text-sm text-white" style={{ fontFamily: "Playfair Display, serif" }}>คลินิกสุภัทร</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>พนักงานต้อนรับ</div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-3 py-3 rounded-2xl mb-6 relative overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        {/* Clock In Indicator */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isClockedIn ? 'bg-green-400' : 'bg-gray-400'}`} />
        
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: "#1D6FA4" }}>
          {staffInitial || "ส"}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-white flex items-center gap-1.5">
            {staffName || "กำลังโหลด..."}
            {isClockedIn && <ShieldCheck size={12} className="text-green-400" />}
          </p>
          <p className="text-[10px]" style={{ color: isClockedIn ? "#4ADE80" : "rgba(255,255,255,0.5)" }}>
            {staffRole || "พนักงาน"}
          </p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        {STAFF_NAV.map(({ key, label, icon: Icon, isOperational }) => {
          const isLocked = isOperational && !isClockedIn;
          
          return (
            <button key={key} onClick={() => setView(key)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group"
              style={{ 
                backgroundColor: view === key ? (isLocked ? "rgba(255,140,154,0.2)" : "#FF8C9A") : "transparent", 
                color: view === key ? (isLocked ? "#FF8C9A" : "white") : "rgba(255,255,255,0.65)" 
              }}>
              <div className="flex items-center gap-3">
                <Icon size={17} className={isLocked ? "opacity-50" : ""} /> 
                <span className={isLocked ? "opacity-70" : ""}>{label}</span>
              </div>
              {isLocked && <Lock size={14} className="opacity-40 group-hover:opacity-70 transition-opacity" />}
            </button>
          )
        })}
      </nav>
      
      <div className="mt-4 pt-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {onChangePassword && (
          <button onClick={onChangePassword} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-all text-white/70">
            <Settings size={16} /> เปลี่ยนรหัสผ่าน
          </button>
        )}
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-500/10" style={{ color: "rgba(255,140,154,0.8)" }}>
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

// ─── Clock In Screen (With Demo IP Whitelisting) ─────────────────────────────

function ClockInScreen({ 
  onClockIn, 
  mockNetwork, 
  setMockNetwork 
}: { 
  onClockIn: () => void;
  mockNetwork: "clinic" | "home";
  setMockNetwork: (val: "clinic" | "home") => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleClockInClick = () => {
    setLoading(true);
    setErrorMsg("");
    
    // Simulate network check delay
    setTimeout(() => {
      setLoading(false);
      if (mockNetwork === "home") {
        setErrorMsg("ปฏิเสธการเข้าถึง: ระบบตรวจพบว่าคุณไม่ได้เชื่อมต่อ Wi-Fi ของคลินิก (IP: 124.122.x.x ไม่อยู่ในระบบ)");
      } else {
        onClockIn();
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-10 px-4 relative">
      
      {/* Demo Controls (For Professor Presentation) */}
      <div className="absolute top-0 right-0 bg-white p-4 rounded-2xl border-2 border-dashed border-gray-300 shadow-sm z-10 w-64">
        <div className="flex items-center gap-2 mb-3 text-gray-500 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle size={14} /> โหมดจำลองสำหรับพรีเซนต์
        </div>
        <p className="text-xs text-gray-500 mb-3">จำลองตำแหน่งเครือข่ายอินเทอร์เน็ตที่พนักงานกำลังใช้งานอยู่</p>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button 
            onClick={() => { setMockNetwork("home"); setErrorMsg(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${mockNetwork === "home" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}>
            <WifiOff size={14} /> อยู่บ้าน
          </button>
          <button 
            onClick={() => { setMockNetwork("clinic"); setErrorMsg(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${mockNetwork === "clinic" ? "bg-white shadow-sm text-green-600" : "text-gray-500"}`}>
            <Wifi size={14} /> อยู่คลินิก
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-10 max-w-md w-full flex flex-col items-center text-center relative overflow-hidden mt-12 lg:mt-0" 
        style={{ boxShadow: "0 10px 40px rgba(26,54,93,0.08)" }}>
        
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-2" style={{ background: "linear-gradient(90deg, #1D6FA4, #FF8C9A)" }} />
        
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "#F0F4F8" }}>
          <Fingerprint size={40} style={{ color: "#1D6FA4" }} />
        </div>
        
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>
          ระงับการเข้าถึงชั่วคราว
        </h2>
        
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "#4A6080" }}>
          ตามนโยบาย PDPA คุณจำเป็นต้อง <strong>ลงเวลาเข้างาน</strong> และเชื่อมต่อ <strong>Wi-Fi ของคลินิก</strong> ก่อนเพื่อเข้าถึงข้อมูลคนไข้
        </p>
        
        {errorMsg && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-3 text-left">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <span className="font-medium leading-tight">{errorMsg}</span>
          </div>
        )}
        
        <button 
          onClick={handleClockInClick}
          disabled={loading}
          className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          style={{ background: "linear-gradient(135deg, #1D6FA4, #1A365D)", boxShadow: "0 8px 20px rgba(29, 111, 164, 0.3)" }}>
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              กำลังตรวจสอบเครือข่าย...
            </>
          ) : (
            <>
              <Clock size={20} />
              ลงเวลาเริ่มงาน (Clock In)
            </>
          )}
        </button>
        
        <p className="text-xs mt-6" style={{ color: "#94A3B8" }}>
          *หากต้องการขอลางาน สามารถเข้าใช้เมนู "ขอลางาน" ได้ที่แถบด้านซ้าย
        </p>
      </div>
    </div>
  );
}

// ─── Staff Portal Root ────────────────────────────────────────────────────────

export default function StaffPortal({
  appointments,
  onUpdateAppt,
  onAddAppt,
  onLogout,
  loginEmail,
}: {
  appointments?: Appointment[];
  onUpdateAppt?: (id: number, updates: Partial<Appointment>) => void;
  onAddAppt?: (a: Appointment) => void;
  onLogout: () => void;
  loginEmail?: string;
}) {
  const [view, setView] = useState<StaffView>("announcements"); // Default to non-operational view
  const [sideOpen, setSideOpen] = useState(false);
  
  // Clock-in & Network State
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [mockNetwork, setMockNetwork] = useState<"home"|"clinic">("home");
  
  // Password Change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState("");
  
  // Staff Data
  const [staffInfo, setStaffInfo] = useState<{name: string, role: string, initial: string} | null>(null);

  useEffect(() => {
    if (loginEmail) {
      import("../shared/supabaseApi").then(({ getStaff }) => {
        getStaff().then(staffList => {
          const matched = staffList.find(s => s.email === loginEmail);
          if (matched) {
            setStaffInfo({
              name: matched.name,
              role: matched.role,
              initial: matched.name.charAt(0)
            });
          }
        }).catch(console.error);
      });
    }
  }, [loginEmail]);

  const currentNav = STAFF_NAV.find(n => n.key === view);
  const isOperationalView = currentNav?.isOperational ?? false;
  const showLockScreen = isOperationalView && !isClockedIn;

  const handleChangePassword = async () => {
    if (!oldPassword) {
      setChangeError("กรุณากรอกรหัสผ่านเดิม");
      return;
    }
    if (newPassword.length < 6) {
      setChangeError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setIsChanging(true);
    setChangeError("");
    try {
      const { changePassword } = await import("../shared/supabaseApi");
      await changePassword(oldPassword, newPassword);
      alert("เปลี่ยนรหัสผ่านสำเร็จ!");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setChangeError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Prompt, sans-serif", backgroundColor: "#F0F4F8" }}>
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSideOpen(false)} />}

      <aside className="fixed top-0 left-0 h-full z-40 hidden lg:block" style={{ width: 250 }}>
        <StaffSidebar view={view} setView={setView} onLogout={onLogout} isClockedIn={isClockedIn} staffName={staffInfo?.name} staffRole={staffInfo?.role} staffInitial={staffInfo?.initial} onChangePassword={() => setShowPasswordModal(true)} />
      </aside>
      {sideOpen && (
        <aside className="fixed top-0 left-0 h-full z-40" style={{ width: 250 }}>
          <StaffSidebar view={view} setView={v => { setView(v); setSideOpen(false); }} onLogout={onLogout} isClockedIn={isClockedIn} staffName={staffInfo?.name} staffRole={staffInfo?.role} staffInitial={staffInfo?.initial} onChangePassword={() => setShowPasswordModal(true)} />
        </aside>
      )}

      <div className="flex-1 flex flex-col lg:ml-[250px]">
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b bg-white" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
          <button onClick={() => setSideOpen(true)} style={{ color: "#1A365D" }}><Menu size={20} /></button>
          <span className="font-bold text-sm" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>คลินิกสุภัทร • พนักงาน</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#1D6FA4" }}>
              {staffInfo?.initial || "ส"}
            </div>
          </div>
        </div>
        
        <StaffStatusBanner />
        
        <main className="flex-1 p-5 lg:p-8 h-full">
          {showLockScreen ? (
            <ClockInScreen 
              onClockIn={() => setIsClockedIn(true)} 
              mockNetwork={mockNetwork}
              setMockNetwork={setMockNetwork}
            />
          ) : (
            <>
              {view === "queue" && <QueueBoard setView={setView} appointments={appointments} />}
              {view === "appointments" && <AppointmentManagementView appointments={appointments} />}
              {view === "patients" && <PatientManagementView />}
              {view === "walkin" && <WalkInBooking />}
              {view === "payment" && <PaymentView />}
              {view === "leave" && <StaffLeaveView />}
              {view === "announcements" && <AnnouncementView role="staff" />}
            </>
          )}
        </main>
      </div>
      
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>เปลี่ยนรหัสผ่านใหม่</h3>
            
            {changeError && <p className="text-red-500 text-xs mb-3">{changeError}</p>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">รหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="พิมพ์ให้ตรงกันอีกครั้ง"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => { setShowPasswordModal(false); setChangeError(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold border text-gray-600 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleChangePassword}
                disabled={isChanging}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #1D6FA4, #1A365D)" }}
              >
                {isChanging ? "กำลังบันทึก..." : "บันทึกรหัสผ่าน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
