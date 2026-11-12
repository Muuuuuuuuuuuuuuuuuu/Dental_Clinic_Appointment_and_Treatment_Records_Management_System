export type ToothStatus = "normal" | "red" | "blue" | "cross";

export interface ToothHistoryItem {
  id?: string | number;
  date: string;
  doctor?: string;
  services: string[];
  notes?: string;
  recommendations?: string;
  statusInRecord?: ToothStatus;
  cashier?: string;
  paymentMethod?: string;
  paidAt?: string;
  cost?: string | number;
}

export function getToothHistory(toothId: string | number, records: any[] = []): ToothHistoryItem[] {
  if (!records || !Array.isArray(records) || records.length === 0) return [];
  const rawId = String(toothId).replace("teeth-", "").trim();
  const isMesiodens = rawId === "mesiodens" || rawId === "11S" || rawId.startsWith("11S-") || rawId.startsWith("mesiodens-");

  const results: ToothHistoryItem[] = [];

  records.forEach(rec => {
    const matchedServices: string[] = [];

    // 1. ตรวจจาก detailedServices
    if (Array.isArray(rec.detailedServices)) {
      rec.detailedServices.forEach((ds) => {
        const loc = String(ds.locationCode || "").trim();
        if (loc === rawId || (isMesiodens && (loc === "mesiodens" || loc === "11S"))) {
          const sName = ds.name || "หัตถการ";
          matchedServices.push(ds.qty > 1 ? (sName + " (x" + ds.qty + ")") : sName);
        }
      });
    }

    // 2. ตรวจจาก treatmentServices
    if (Array.isArray(rec.treatmentServices)) {
      rec.treatmentServices.forEach((s) => {
        if (!s) return;
        const sTrim = s.trim();
        const patterns = [
          "ซี่ " + rawId,
          "ซี่ที่: " + rawId,
          "ซี่ที่ " + rawId,
          "(" + rawId + ")",
          "+" + rawId,
          ":" + rawId
        ];
        if (isMesiodens) {
          patterns.push("mesiodens", "Mesiodens", "+11S", "11S", "ฟันเกินกึ่งกลาง");
        }

        const isMatch = patterns.some(p => sTrim.includes(p));
        if (isMatch && !matchedServices.includes(sTrim)) {
          matchedServices.push(sTrim);
        }
      });
    }

    // 2.5 ตรวจจาก notes / treatmentNotes
    const noteText = rec.notes || rec.treatmentNotes || "";
    if (noteText && matchedServices.length === 0) {
      noteText.split(/\r?\n/).forEach((line: string) => {
        const lineTrim = line.trim();
        if (
          lineTrim.includes(`ซี่ ${rawId}`) ||
          lineTrim.includes(`ซี่ที่ ${rawId}`) ||
          lineTrim.includes(`ซี่ที่: ${rawId}`)
        ) {
          const cleaned = lineTrim
            .replace(/^[-•\s]+/, "")
            .replace(/^ทำ\s+/, "")
            .replace(new RegExp(`\\s*\\(?ซี่(?:ที่)?\\s*:?\\s*${rawId}\\)?.*$`), "")
            .trim();
          if (cleaned && !matchedServices.includes(cleaned)) {
            matchedServices.push(cleaned);
          }
        }
      });
    }

    // 3. ตรวจสอบสถานะจาก odontogramData ย้อนหลัง
    const odData = rec.odontogramData || {};
    const statusInRec = odData[rawId] || (isMesiodens ? (odData["mesiodens"] || odData["11S"]) : undefined);

    if (matchedServices.length > 0 || (statusInRec && statusInRec !== "normal")) {
      const statusLabel = statusInRec === "red" ? "พบปัญหา" : statusInRec === "blue" ? "รักษาแล้ว" : statusInRec === "cross" ? "ถอน/ผ่าออก" : "ตรวจติดตาม";
      results.push({
        id: rec.id,
        date: rec.date || "-",
        doctor: rec.doctor || "ไม่ระบุแพทย์",
        services: matchedServices.length > 0 ? matchedServices : ["บันทึกสถานะผัง: " + statusLabel],
        notes: rec.notes,
        recommendations: rec.recommendations,
        statusInRecord: statusInRec,
        cashier: rec.cashier,
        paymentMethod: rec.paymentMethod,
        paidAt: rec.paidAt,
        cost: rec.cost
      });
    }
  });

  return results;
}

export function formatThaiDate(dateStr?: string): string {
  if (!dateStr || dateStr === "-") return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

