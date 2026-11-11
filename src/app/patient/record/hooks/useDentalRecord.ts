import { useState, useEffect } from "react";
import { ToothStatus } from "@/app/dentist/queue/Odontogram";
import { SupernumeraryTooth } from "@/app/dentist/queue/ToothGeometry";
import { getPatientTreatmentRecords } from "@/app/shared/supabaseApi";

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

  const cariesCount = Object.entries(localToothData).filter(
    ([k, s]) => s === "red" && k !== "extraTeeth" && k !== "wholeMouth"
  ).length;

  const filledCount = Object.entries(localToothData).filter(
    ([k, s]) => s === "blue" && k !== "extraTeeth" && k !== "wholeMouth"
  ).length;

  // ตรวจจับฟันที่ถูกถอนจากประวัติการทำหัตถการ
  const inferredMissingTeeth = new Set<string>();
  historyRecords.forEach((record) => {
    if (record.treatmentServices) {
      record.treatmentServices.forEach((s: string) => {
        const match = s.match(/ถอนฟัน.*?ซี่ที่:\s*(\d+)/);
        if (match) inferredMissingTeeth.add(match[1]);
      });
    }
    if (record.detailedServices) {
      record.detailedServices.forEach((ds: any) => {
        if (ds.name?.includes("ถอนฟัน") && ds.locationCode && ds.locationCode !== "MOUTH") {
          inferredMissingTeeth.add(String(ds.locationCode));
        }
      });
    }
  });

  const explicitMissing = Object.entries(localToothData)
    .filter(([k, s]) => s === "cross" && k !== "extraTeeth" && k !== "wholeMouth")
    .map(([n]) => String(n).replace("teeth-", ""));
  const missingTeeth = Array.from(new Set([...explicitMissing, ...inferredMissingTeeth]));

  const mergedToothData: Record<number | string, ToothStatus> = { ...localToothData };
  missingTeeth.forEach((t) => {
    if (!mergedToothData[t]) {
      mergedToothData[t] = "cross";
    }
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
    cariesCount,
    filledCount,
    missingTeeth,
    mergedToothData,
    handleSelectHistoricalTeeth,
    activeRecordId,
    handleResetToLatest,
  };
}
