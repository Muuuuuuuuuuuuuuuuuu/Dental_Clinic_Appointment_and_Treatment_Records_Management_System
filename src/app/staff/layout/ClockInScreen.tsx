import React, { useState } from "react";
import {
  AlertTriangle,
  Fingerprint,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ClockInScreenProps {
  onClockIn: () => void;
  mockNetwork: "clinic" | "home";
  setMockNetwork: (val: "clinic" | "home") => void;
}

/**
 * 🔒 [STAFF LAYOUT] หน้าจอระงับการเข้าถึงชั่วคราวและลงเวลาเข้างาน (Clock In)
 */
export function ClockInScreen({
  onClockIn,
  mockNetwork,
  setMockNetwork,
}: ClockInScreenProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleClockInClick = () => {
    setLoading(true);
    setErrorMsg("");

    // จำลองการตรวจสอบเครือข่ายก่อนลงเวลาเข้างาน
    setTimeout(() => {
      setLoading(false);
      if (mockNetwork === "home") {
        setErrorMsg(
          "ปฏิเสธการเข้าถึง: ระบบตรวจพบว่าคุณไม่ได้เชื่อมต่อ Wi-Fi ของคลินิก (IP: 124.122.x.x ไม่อยู่ในระบบ)"
        );
      } else {
        onClockIn();
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-10 px-4 relative">
      {/* แผงควบคุมโหมดจำลองสำหรับการนำเสนอ */}
      <div className="absolute top-0 right-0 bg-white p-4 rounded-2xl border-2 border-dashed border-gray-300 shadow-sm z-10 w-64">
        <div className="flex items-center gap-2 mb-3 text-gray-500 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle size={14} /> โหมดจำลองสำหรับพรีเซนต์
        </div>
        <p className="text-xs text-gray-500 mb-3">
          จำลองตำแหน่งเครือข่ายอินเทอร์เน็ตที่พนักงานกำลังใช้งานอยู่
        </p>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => {
              setMockNetwork("home");
              setErrorMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              mockNetwork === "home"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-500"
            }`}
          >
            <WifiOff size={14} /> อยู่บ้าน
          </button>
          <button
            onClick={() => {
              setMockNetwork("clinic");
              setErrorMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              mockNetwork === "clinic"
                ? "bg-white shadow-sm text-green-600"
                : "text-gray-500"
            }`}
          >
            <Wifi size={14} /> อยู่คลินิก
          </button>
        </div>
      </div>

      <div
        className="bg-white rounded-3xl p-10 max-w-md w-full flex flex-col items-center text-center relative overflow-hidden mt-12 lg:mt-0"
        style={{ boxShadow: "0 10px 40px rgba(26,54,93,0.08)" }}
      >
        <div
          className="absolute top-0 left-0 w-full h-2"
          style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)" }}
        />

        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: "#F0F4F8" }}
        >
          <Fingerprint size={40} style={{ color: "#1D6FA4" }} />
        </div>

        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
        >
          ระงับการเข้าถึงชั่วคราว
        </h2>

        <p
          className="text-sm mb-6 leading-relaxed"
          style={{ color: "#4A6080" }}
        >
          ตามนโยบาย PDPA คุณจำเป็นต้อง <strong>ลงเวลาเข้างาน</strong> และเชื่อมต่อ{" "}
          <strong>Wi-Fi ของคลินิก</strong> ก่อนเพื่อเข้าถึงข้อมูลคนไข้
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
          style={{
            background: "linear-gradient(135deg, #1D6FA4, #1A365D)",
            boxShadow: "0 8px 20px rgba(29, 111, 164, 0.3)",
          }}
        >
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

export default ClockInScreen;

