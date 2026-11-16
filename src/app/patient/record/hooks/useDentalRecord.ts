import { useState, useEffect } from "react";
import { ToothStatus } from "@/app/dentist/queue/odontogram/Odontogram";
import { SupernumeraryTooth } from "@/app/dentist/queue/odontogram/ToothGeometry";
import { getPatientTreatmentRecords } from "@/app/shared/supabaseApi";

// ตรวจสอบความถูกต้องของรหัสซี่ฟันตามระบบสากล FDI (11-48, 51-85 หรือฟันเกิน)
export const isValidToothId = (val: any): boolean => {
  if (!val) return false;
  const s = String(val).replace(/^teeth-/, "").trim();
  const n = parseInt(s, 10);
  if (!isNaN(n) && String(n) === s) {
    const q = Math.floor(n / 10);
    const t = n % 10;
    // ฟันแท้ 11-18, 21-28, 31-38, 41-48
    if (q >= 1 && q <= 4 && t >= 1 && t <= 8) return true;
    // ฟันน้ำนม 51-55, 61-65, 71-75, 81-85
    if (q >= 5 && q <= 8 && t >= 1 && t <= 5) return true;
    return false;
  }
  return s === "mesiodens" || s.endsWith("S") || s.includes("S-");
};

export const getToothNameTh = (numStr: string, isChild: boolean) => {
  const n = parseInt(numStr, 10);
  if (isNaN(n)) return "";
  const q = Math.floor(n / 10);
  const t = n % 10;

  let pos = "";
  if (q === 1 || q === 5) pos = "ขวาบน";
  else if (q === 2 || q === 6) pos = "ซ้ายบน";
  else if (q === 3 || q === 7) pos = "ซ้ายล่าง";
  else if (q === 4 || q === 8) pos = "ขวาล่าง";

  let type = "";
  if (isChild) {
    if (t === 1 || t === 2) type = "ฟันหน้า";
    else if (t === 3) type = "ฟันเขี้ยว";
    else if (t === 4 || t === 5) type = "ฟันกราม";
  } else {
    if (t === 1 || t === 2) type = "ฟันหน้า";
    else if (t === 3) type = "ฟันเขี้ยว";
    else if (t === 4 || t === 5) type = "ฟันกรามน้อย";
    else if (t === 6 || t === 7 || t === 8) type = "ฟันกราม";
  }

  return `${type}${pos} (ซี่ ${n})`;
};

export interface UseDentalRecordProps {
  user?: any;
  toothData?: Record<number | string, any>;
  lastUpdated?: string;
  advice?: string;
}

export function useDentalRecord(propsOrUser?: UseDentalRecordProps | any) {
  // รองรับทั้งแบบส่งเป็น Object { user, toothData, ... } หรือแบบ Positional (user, toothData, ...)
  const isObj =
    propsOrUser &&
    typeof propsOrUser === "object" &&
    ("user" in propsOrUser || "toothData" in propsOrUser || "lastUpdated" in propsOrUser);

  const actualUser = isObj ? propsOrUser.user : propsOrUser;
  const initialToothData = (isObj ? propsOrUser.toothData : arguments[1]) || {};
  const initialLastUpdated = (isObj ? propsOrUser.lastUpdated : arguments[2]) || "-";
  const initialAdvice = (isObj ? propsOrUser.advice : arguments[3]) || "ยังไม่มีคำแนะนำ";

  const [isChild, setIsChild] = useState(false);

  const { extraTeeth: initialExtras = [], wholeMouth: _, ...cleanInitialTeeth } =
    (initialToothData as any) || {};
  const [localToothData, setLocalToothData] = useState<Record<number | string, ToothStatus>>(
    cleanInitialTeeth || {}
  );
  const [extraTeeth, setExtraTeeth] = useState<SupernumeraryTooth[]>(
    Array.isArray(initialExtras) ? initialExtras : []
  );

  const [localLastUpdated, setLocalLastUpdated] = useState<string>(initialLastUpdated || "-");
  const [localAdvice, setLocalAdvice] = useState<string>(initialAdvice || "ยังไม่มีคำแนะนำ");
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [clickedTooth, setClickedTooth] = useState<string | null>(null);

  // แคชสถานะล่าสุด (Latest State) เพื่อให้สามารถสลับกลับมาดูสภาพฟันปัจจุบันได้ตลอดเวลา
  const [latestTeethData, setLatestTeethData] = useState<Record<number | string, ToothStatus>>(cleanInitialTeeth || {});
  const [latestExtrasData, setLatestExtrasData] = useState<SupernumeraryTooth[]>(Array.isArray(initialExtras) ? initialExtras : []);
  const [latestDateText, setLatestDateText] = useState<string>(initialLastUpdated || "-");
  const [activeRecordId, setActiveRecordId] = useState<number | null>(null);

  useEffect(() => {
    const patientId = actualUser?.patientId;
    if (!patientId) return;

    getPatientTreatmentRecords(patientId)
      .then((records) => {
        setHistoryRecords(records || []);

        if (records && records.length > 0) {
          // 1. เรียงตามวันที่รักษาล่าสุดเพื่อหาวัน-เวลาที่รักษาหรือชำระเงินล่าสุด
          const sortedAll = [...records].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const latestRecord = sortedAll[0];
          let formattedDate = "-";

          if (latestRecord.paidAt) {
            const pd = new Date(latestRecord.paidAt);
            formattedDate = pd.toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          } else if (latestRecord.date) {
            const dd = new Date(latestRecord.date);
            formattedDate = dd.toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          }

          setLocalLastUpdated(formattedDate);
          setLatestDateText(formattedDate);

          // 2. ดึงข้อมูลแผนผังฟันจากการรักษาล่าสุดที่มีการบันทึก
          const withTeeth = records.filter(
            (r: any) => r.odontogramData && Object.keys(r.odontogramData).length > 0
          );
          if (withTeeth.length > 0) {
            const sortedWithTeeth = withTeeth.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            const latest = sortedWithTeeth[0];
            const raw = latest.odontogramData || {};
            const { extraTeeth: savedExtras = [], wholeMouth: _wm, ...cleanTeeth } = raw;
            setLocalToothData(cleanTeeth);
            setExtraTeeth(Array.isArray(savedExtras) ? savedExtras : []);
            setLatestTeethData(cleanTeeth);
            setLatestExtrasData(Array.isArray(savedExtras) ? savedExtras : []);
            setLocalAdvice(latest.recommendations || "ดูแลรักษาความสะอาดตามปกติ");
          }
        }
      })
      .catch(console.error);
  }, [actualUser?.patientId]);

  // ตรวจจับฟันที่ถูกถอนหรือผ่าคุดจากประวัติการทำหัตถการ
  const inferredMissingTeeth = new Set<string>();

  const addIfValidTooth = (val: any) => {
    if (!val) return;
    const clean = String(val).replace(/^teeth-/, "").trim();
    if (isValidToothId(clean)) {
      inferredMissingTeeth.add(clean);
    }
  };

  historyRecords.forEach((record) => {
    // 1. ตรวจจับจาก treatmentServices (เช่น "ผ่าฟันคุด (ซี่ 48)", "ถอนฟัน ซี่ที่ 48", "ผ่าคุด (48)")
    if (record.treatmentServices) {
      record.treatmentServices.forEach((s: string) => {
        if (!s) return;
        const isExtraction = s.includes("ถอน") || s.includes("ผ่าฟันคุด") || s.includes("ผ่าคุด");
        if (isExtraction) {
          // ดักเฉพาะเลขซี่ 2 หลักที่มีคำว่า ซี่ / ซี่ที่ หรืออยู่ในวงเล็บเฉพาะเลขซี่
          const m1 = s.matchAll(/(?:ซี่ที่:?|ซี่)\s*(\d{2})\b/g);
          for (const m of m1) addIfValidTooth(m[1]);

          const m2 = s.matchAll(/\(\s*(?:ซี่)?\s*(\d{2})\s*\)/g);
          for (const m of m2) addIfValidTooth(m[1]);
        }
      });
    }

    // 2. ตรวจจับจาก detailedServices
    if (record.detailedServices) {
      record.detailedServices.forEach((ds: any) => {
        const isExtraction =
          ds.name?.includes("ถอน") ||
          ds.name?.includes("ผ่าฟันคุด") ||
          ds.name?.includes("ผ่าคุด") ||
          ds.serviceName?.includes("ถอน") ||
          ds.serviceName?.includes("ผ่าฟันคุด") ||
          ds.serviceName?.includes("ผ่าคุด");
        if (isExtraction && ds.locationCode) {
          addIfValidTooth(ds.locationCode);
        }
      });
    }

    // 3. ตรวจจับจาก notes / treatmentNotes
    const noteText = record.notes || record.treatmentNotes || "";
    if (noteText) {
      noteText.split(/\r?\n/).forEach((line: string) => {
        if (line.includes("ถอน") || line.includes("ผ่าฟันคุด") || line.includes("ผ่าคุด")) {
          const m1 = line.matchAll(/(?:ซี่ที่:?|ซี่)\s*(\d{2})\b/g);
          for (const m of m1) addIfValidTooth(m[1]);

          const m2 = line.matchAll(/\(\s*(?:ซี่)?\s*(\d{2})\s*\)/g);
          for (const m of m2) addIfValidTooth(m[1]);
        }
      });
    }
  });

  const explicitMissing = Object.entries(localToothData)
    .filter(([k, s]) => s === "cross" && isValidToothId(k))
    .map(([n]) => String(n).replace("teeth-", ""));
  const missingTeeth = Array.from(new Set([...explicitMissing, ...inferredMissingTeeth]));

  const mergedToothData: Record<number | string, ToothStatus> = { ...localToothData };
  missingTeeth.forEach((t) => {
    // กำหนดให้เป็นสถานะ cross (ถอน/สูญเสีย) เฉพาะซี่ที่ถูกต้อง
    mergedToothData[t] = "cross";
  });

  // สลับดูแผนผังฟันย้อนหลังตามวันที่ที่เลือกในกล่องประวัติ
  const handleSelectHistoricalTeeth = (
    histTeeth: Record<string, ToothStatus>,
    histExtras: SupernumeraryTooth[],
    date: string,
    rec?: string,
    recordId?: number
  ) => {
    setLocalToothData(histTeeth);
    setExtraTeeth(Array.isArray(histExtras) ? histExtras : []);
    const d = new Date(date);
    setLocalLastUpdated(
      !isNaN(d.getTime())
        ? d.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : date
    );
    if (rec) setLocalAdvice(rec);
    if (recordId !== undefined) setActiveRecordId(recordId);
  };

  // รีเซ็ตกลับไปแสดงแผนผังฟันปัจจุบัน (ล่าสุด)
  const handleResetToLatest = () => {
    setLocalToothData(latestTeethData);
    setExtraTeeth(latestExtrasData);
    setLocalLastUpdated(latestDateText);
    setActiveRecordId(null);
  };

  return {
    isChild,
    setIsChild,
    localToothData,
    setLocalToothData,
    extraTeeth,
    setExtraTeeth,
    localLastUpdated,
    setLocalLastUpdated,
    localAdvice,
    setLocalAdvice,
    historyRecords,
    clickedTooth,
    setClickedTooth,
    missingTeeth,
    mergedToothData,
    handleSelectHistoricalTeeth,
    activeRecordId,
    handleResetToLatest,
  };
}
