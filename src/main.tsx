import { createRoot } from "react-dom/client";
import { toast, Toaster } from "sonner";
import App from "./app/patient/PatientPortal";
import { initTimeSimulation, TimeSimulationWidget } from "./app/shared/utils/timeSimulation";
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

// เริ่มต้นระบบจำลองเวลาสำหรับการทดสอบ (Time Simulation)
initTimeSimulation();

createRoot(document.getElementById("root")!).render(
  <>
    <Toaster position="top-right" richColors closeButton />
    <App />
    <TimeSimulationWidget />
  </>
);
