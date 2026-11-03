import { createRoot } from "react-dom/client";
import { toast, Toaster } from "sonner";
import App from "./app/patient/PatientPortal";
import TimeTravelWidget from "./app/shared/components/TimeTravelWidget";
import "./styles/index.css";

// แทนที่คำสั่ง alert() ของเบราว์เซอร์ด้วยแถบแจ้งเตือน (Toast) บนหน้าเว็บ
if (typeof window !== "undefined") {
  window.alert = (message?: any) => {
    const text = String(message ?? "");
    const isError = /ผิดพลาด|ไม่สามารถ|ล้มเหลว|ปฏิเสธ|ระงับ|failed|error/i.test(text);
    const isWarning = /กรุณา|ต้อง|แจ้งเตือน|อัตโนมัติ/i.test(text);
    if (isError) {
      toast.error(text);
    } else if (isWarning) {
      toast.warning(text);
    } else {
      toast.success(text);
    }
  };
}

// --- ระบบจำลองเวลาสำหรับการทดสอบ (Time Travel) ---
const mockDateStr = localStorage.getItem("supat_mock_date");
if (mockDateStr) {
  const OriginalDate = Date;
  // รองรับทั้งรูปแบบที่มีเวลาติดมาแล้ว (YYYY-MM-DDTHH:MM) และเฉพาะวันที่ (YYYY-MM-DD)
  const normalizedMockStr = mockDateStr.includes("T") ? mockDateStr : `${mockDateStr}T08:00:00`;
  const targetDate = new OriginalDate(normalizedMockStr);
  const offset = targetDate.getTime() - OriginalDate.now();

  if (!Number.isNaN(offset)) {
    class MockDate extends OriginalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(OriginalDate.now() + offset);
        } else {
          super(...(args as [any]));
        }
      }
      static now() {
        return OriginalDate.now() + offset;
      }
    }
    globalThis.Date = MockDate as any;
    console.log(`[จำลองเวลา] ตั้งค่าเวลาของระบบเป็น: ${mockDateStr}`);
  }
}
// ----------------------------

createRoot(document.getElementById("root")!).render(
  <>
    <Toaster position="top-right" richColors closeButton />
    <App />
    <TimeTravelWidget />
  </>
);
