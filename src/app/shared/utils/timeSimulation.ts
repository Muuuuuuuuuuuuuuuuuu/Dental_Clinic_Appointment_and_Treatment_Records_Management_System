/**
 * ============================================================================
 * 🕒 TIME SIMULATION UTILS (ฟังก์ชันจำลองเวลาสำหรับการทดสอบระบบ)
 * ============================================================================
 * สวิตช์เปิด-ปิดระบบจำลองเวลา:
 * - ตั้งเป็น true:  เปิดใช้งานปุ่มจำลองเวลาที่มุมขวาล่าง
 * - ตั้งเป็น false: ปิดระบบจำลองเวลาทั้งหมดทันที (กลับเป็นเวลาจริงของเครื่อง 100%)
 */
export const ENABLE_TIME_SIMULATION = true;

export const STORAGE_KEY = "supat_mock_date";

/**
 * ฟังก์ชันเริ่มต้นจำลองเวลา (เรียกใช้ครั้งเดียวใน main.tsx)
 * ทำหน้าที่ Override คลาส Date ของเบราว์เซอร์ให้เป็นวันและเวลาจำลอง
 */
export function initTimeSimulation() {
  if (!ENABLE_TIME_SIMULATION || typeof window === "undefined") return;

  const mockDateStr = localStorage.getItem(STORAGE_KEY);
  if (!mockDateStr) return;

  const OriginalDate = Date;
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
    console.log(`[TimeSimulation] ระบบกำลังจำลองเวลาเป็น: ${mockDateStr}`);
  }
}

/**
 * ดึงเวลาปัจจุบันโดยรองรับเวลาจำลอง (Helper สำหรับฟังก์ชันทั่วไป)
 */
export function getSimulatedNow(): Date {
  if (ENABLE_TIME_SIMULATION && typeof window !== "undefined") {
    const mock = localStorage.getItem(STORAGE_KEY);
    if (mock) {
      const parsed = new Date(mock);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }
  return new Date();
}

// Re-export UI Widget เพื่อความสะดวกและการเข้ากันได้แบบย้อนหลัง (Backward compatibility)
export { TimeSimulationWidget, TimeTravelWidget } from "../components/TimeSimulationWidget";
export { default as TimeSimulationWidgetDefault } from "../components/TimeSimulationWidget";
