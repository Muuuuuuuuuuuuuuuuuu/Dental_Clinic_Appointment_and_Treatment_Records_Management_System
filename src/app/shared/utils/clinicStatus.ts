import { SpecialClosure, ClinicStatus } from "../types/clinic";

export function getClinicStatus(
  now: Date = new Date(),
  specialClosures: SpecialClosure[] = [],
  weeklyOffDays: number[] = [0],
  clinicHours?: Record<string, any> | { open_time?: string; close_time?: string; saturday_close_time?: string },
  dailyHours?: Record<string, { open: string; close: string }>
): ClinicStatus {
  const dateStr = now.toISOString().split("T")[0];
  const special = specialClosures.find(c => c.date === dateStr);
  if (special) {
    return {
      type: "special",
      label: "หยุดพิเศษ",
      sublabel: special.reason,
      color: "#FFF3E0",
      dotColor: "#F59E0B",
      specialReason: special.reason,
    };
  }
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  // ชื่อวันสำหรับแสดงผล
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

  // ตรวจสอบวันหยุดประจำสัปดาห์ของคลินิก
  if (weeklyOffDays.includes(day)) {
    return { type: "closed", label: "หยุดทำการ", sublabel: `วัน${dayNames[day]} — ไม่มีบริการ`, color: "#FEF2F2", dotColor: "#EF4444" };
  }

  // แปลงเวลาเปิด-ปิดทำการของแต่ละวัน
  const parseTime = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
  
  let openTime: number;
  let closeTime: number;
  
  if (dailyHours && dailyHours[String(day)]) {
    openTime = parseTime(dailyHours[String(day)].open);
    closeTime = parseTime(dailyHours[String(day)].close);
  } else {
    // ค่าสำรองกรณีใช้ข้อมูลรูปแบบเดิม
    const legacy = clinicHours as { open_time?: string; close_time?: string; saturday_close_time?: string } | undefined;
    openTime = parseTime(legacy?.open_time || "09:00");
    closeTime = day === 6
      ? parseTime(legacy?.saturday_close_time || legacy?.close_time || "18:00")
      : parseTime(legacy?.close_time || "20:00");
  }

  const closeStr = `${Math.floor(closeTime / 60).toString().padStart(2, '0')}:${(closeTime % 60).toString().padStart(2, '0')}`;
  const openStr = `${Math.floor(openTime / 60).toString().padStart(2, '0')}:${(openTime % 60).toString().padStart(2, '0')}`;
  const hoursStr = `${openStr}–${closeStr} น.`;

  if (mins >= openTime && mins < closeTime) {
    return { type: "open", label: "เปิดให้บริการ", sublabel: `วันนี้ถึง ${closeStr} น.`, color: "#E8FFF0", dotColor: "#22C55E" };
  }

  // ค้นหาวันเปิดทำการถัดไปเพื่อนำมาแสดงข้อความแจ้งคนไข้
  const findNextOpenDay = (): string => {
    if (mins < openTime) return `วันนี้ ${hoursStr}`;
    for (let i = 1; i <= 7; i++) {
      const nextDay = (day + i) % 7;
      if (!weeklyOffDays.includes(nextDay)) {
        const nextOpen = dailyHours?.[String(nextDay)]?.open || openStr;
        return `${dayNames[nextDay]} ${nextOpen} น.`;
      }
    }
    return `${openStr} น.`;
  };

  return { type: "closed", label: "ปิดให้บริการ", sublabel: `เปิดอีกครั้ง ${findNextOpenDay()}`, color: "#F0F4F8", dotColor: "#94A3B8" };
}

