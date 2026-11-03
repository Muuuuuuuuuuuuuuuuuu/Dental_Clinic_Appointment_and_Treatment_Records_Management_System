import React, { useState } from "react";
import {
  Scan, 
  Trash2, 
  X, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  Plus, 
  AlertCircle, 
  ClipboardList, 
  Eye, 
  Stethoscope, 
  Activity, 
  Calendar, 
  User, 
  History, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Clock
} from "lucide-react";
import {
  TOOTH_SHAPES,
  PRESET_SUPERNUMERARY,
  SupernumeraryTooth,
  ToothPathData,
  TOOTH_BADGE_POSITIONS,
  getExtraToothLocation,
  getAdjacentToothBoxes,
  getUpperToothRowItems,
  getLowerToothRowItems,
  ToothGridItem,
  createCustomSupernumerary,
  getActiveExtrasForTooth
} from "./ToothGeometry";

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

export interface OdontogramProps {
  toothData: Record<number | string, ToothStatus>;
  onToothClick?: (tooth: number | string, status?: ToothStatus) => void;
  isChild: boolean;
  setIsChild?: (val: boolean) => void;
  readonly?: boolean;
  extraTeeth?: SupernumeraryTooth[];
  onAddExtraTooth?: (tooth: SupernumeraryTooth) => void;
  onRemoveExtraTooth?: (id: string) => void;
onSaveToothManager?: (
    updatedToothData: Record<number | string, ToothStatus>,
    updatedExtraTeeth: SupernumeraryTooth[]
  ) => void;
  viewMode?: "treatment" | "patient";
  onViewModeChange?: (mode: "treatment" | "patient") => void;
  historyRecords?: any[];
  patientName?: string;
}

const TOOTH_NAMES_TH: Record<number, string> = {
  11: "11 (ฟันหน้ากลางบนขวา)",
  12: "12 (ฟันหน้าข้างบนขวา)",
  13: "13 (ฟันเขี้ยวบนขวา)",
  14: "14 (ฟันกรามน้อยที่ 1 บนขวา)",
  15: "15 (ฟันกรามน้อยที่ 2 บนขวา)",
  16: "16 (ฟันกรามแท้ที่ 1 บนขวา)",
  17: "17 (ฟันกรามแท้ที่ 2 บนขวา)",
  18: "18 (ฟันคุด/กรามแท้ที่ 3 บนขวา)",
  21: "21 (ฟันหน้ากลางบนซ้าย)",
  22: "22 (ฟันหน้าข้างบนซ้าย)",
  23: "23 (ฟันเขี้ยวบนซ้าย)",
  24: "24 (ฟันกรามน้อยที่ 1 บนซ้าย)",
  25: "25 (ฟันกรามน้อยที่ 2 บนซ้าย)",
  26: "26 (ฟันกรามแท้ที่ 1 บนซ้าย)",
  27: "27 (ฟันกรามแท้ที่ 2 บนซ้าย)",
  28: "28 (ฟันคุด/กรามแท้ที่ 3 บนซ้าย)",
  31: "31 (ฟันหน้ากลางล่างซ้าย)",
  32: "32 (ฟันหน้าข้างล่างซ้าย)",
  33: "33 (ฟันเขี้ยวล่างซ้าย)",
  34: "34 (ฟันกรามน้อยที่ 1 ล่างซ้าย)",
  35: "35 (ฟันกรามน้อยที่ 2 ล่างซ้าย)",
  36: "36 (ฟันกรามแท้ที่ 1 ล่างซ้าย)",
  37: "37 (ฟันกรามแท้ที่ 2 ล่างซ้าย)",
  38: "38 (ฟันคุด/กรามแท้ที่ 3 ล่างซ้าย)",
  41: "41 (ฟันหน้ากลางล่างขวา)",
  42: "42 (ฟันหน้าข้างล่างขวา)",
  43: "43 (ฟันเขี้ยวล่างขวา)",
  44: "44 (ฟันกรามน้อยที่ 1 ล่างขวา)",
  45: "45 (ฟันกรามน้อยที่ 2 ล่างขวา)",
  46: "46 (ฟันกรามแท้ที่ 1 ล่างขวา)",
  47: "47 (ฟันกรามแท้ที่ 2 ล่างขวา)",
  48: "48 (ฟันคุด/กรามแท้ที่ 3 ล่างขวา)",
  51: "51 (ฟันน้ำนมหน้ากลางบนขวา)",
  52: "52 (ฟันน้ำนมหน้าข้างบนขวา)",
  53: "53 (ฟันน้ำนมเขี้ยวบนขวา)",
  54: "54 (ฟันน้ำนมกรามที่ 1 บนขวา)",
  55: "55 (ฟันน้ำนมกรามที่ 2 บนขวา)",
  61: "61 (ฟันน้ำนมหน้ากลางบนซ้าย)",
  62: "62 (ฟันน้ำนมหน้าข้างบนซ้าย)",
  63: "63 (ฟันน้ำนมเขี้ยวบนซ้าย)",
  64: "64 (ฟันน้ำนมกรามที่ 1 บนซ้าย)",
  65: "65 (ฟันน้ำนมกรามที่ 2 บนซ้าย)",
  71: "71 (ฟันน้ำนมหน้ากลางล่างซ้าย)",
  72: "72 (ฟันน้ำนมหน้าข้างล่างซ้าย)",
  73: "73 (ฟันน้ำนมเขี้ยวล่างซ้าย)",
  74: "74 (ฟันน้ำนมกรามที่ 1 ล่างซ้าย)",
  75: "75 (ฟันน้ำนมกรามที่ 2 ล่างซ้าย)",
  81: "81 (ฟันน้ำนมหน้ากลางล่างขวา)",
  82: "82 (ฟันน้ำนมหน้าข้างล่างขวา)",
  83: "83 (ฟันน้ำนมเขี้ยวล่างขวา)",
  84: "84 (ฟันน้ำนมกรามที่ 1 ล่างขวา)",
  85: "85 (ฟันน้ำนมกรามที่ 2 ล่างขวา)",
};

function getExtraToothInsertOptionLabel(num: number): string {
  if (num === 11) {
    return "+11S: กึ่งกลางฟันหน้าบน (Mesiodens - แทรกระหว่าง 11 กับ 21)";
  }
  if (num === 13) {
    return "+13S: ฟันเขี้ยวซ้อนบนขวา (แทรกระหว่าง 13 กับ 12)";
  }
  if (num === 23) {
    return "+23S: ฟันเขี้ยวซ้อนบนซ้าย (แทรกระหว่าง 22 กับ 23)";
  }
  if (num === 43) {
    return "+43S: ฟันเขี้ยวซ้อนล่างขวา (แทรกระหว่าง 43 กับ 42)";
  }
  if (num === 33) {
    return "+33S: ฟันเขี้ยวซ้อนล่างซ้าย (แทรกระหว่าง 32 กับ 33)";
  }
  if (num === 18) {
    return "+18S: ฟันเกินคุดบนขวา (Distomolar - ต่อท้ายซี่ 18)";
  }
  if (num === 28) {
    return "+28S: ฟันเกินคุดบนซ้าย (Distomolar - ต่อท้ายซี่ 28)";
  }
  if (num === 48) {
    return "+48S: ฟันเกินคุดล่างขวา (Distomolar - ต่อท้ายซี่ 48)";
  }
  if (num === 38) {
    return "+38S: ฟันเกินคุดล่างซ้าย (Distomolar - ต่อท้ายซี่ 38)";
  }

  const quad = Math.floor(num / 10);
  if (quad === 1) {
    const next = num - 1;
    return `+${num}S: ฟันเกิน/ซ้อนข้างซี่ ${num} (แทรกระหว่าง ${num} กับ ${next})`;
  }
  if (quad === 2) {
    const next = num + 1;
    return `+${num}S: ฟันเกิน/ซ้อนข้างซี่ ${num} (แทรกระหว่าง ${num} กับ ${next})`;
  }
  if (quad === 4) {
    const next = num === 41 ? 31 : num - 1;
    return `+${num}S: ฟันเกิน/ซ้อนข้างซี่ ${num} (แทรกระหว่าง ${num} กับ ${next})`;
  }
  if (quad === 3) {
    const next = num === 31 ? 41 : num + 1;
    return `+${num}S: ฟันเกิน/ซ้อนข้างซี่ ${num} (แทรกระหว่าง ${num} กับ ${next})`;
  }

  return `+${num}S: ฟันเกิน/ซ้อนบริเวณซี่ ${num}`;
}

export default function Odontogram({
  toothData,
  isChild,
  setIsChild,
  readonly = false,
  onToothClick,
  extraTeeth = [],
  onAddExtraTooth,
  onRemoveExtraTooth,
  onSaveToothManager,
  viewMode,
  onViewModeChange,
  historyRecords = [],
  patientName
}: OdontogramProps) {
  const [internalViewMode, setInternalViewMode] = useState<"treatment" | "patient">(
    readonly ? "patient" : (viewMode || "treatment")
  );
  const currentMode = readonly ? "patient" : (viewMode !== undefined ? viewMode : internalViewMode);

  const handleModeChange = (mode: "treatment" | "patient") => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
    setInternalViewMode(mode);
  };

  const [selectedToothForInspection, setSelectedToothForInspection] = useState<string | null>(null);
  const [showFullTimeline, setShowFullTimeline] = useState(false);
  const [showToothManagerModal, setShowToothManagerModal] = useState(false);
const [customToothToAdd, setCustomToothToAdd] = useState<string>('');
  const [internalExtraTeeth, setInternalExtraTeeth] = useState<SupernumeraryTooth[]>([]);

  // Draft state for Tooth Manager Modal (ไม่เขียนลงบันทึกหัตถการหรือเซฟจนกว่าจะกดเสร็จสิ้น)
  const [draftToothData, setDraftToothData] = useState<Record<number | string, ToothStatus>>({});
  const [draftExtraTeeth, setDraftExtraTeeth] = useState<SupernumeraryTooth[]>([]);

  const activeExtraTeeth = extraTeeth && extraTeeth.length > 0 ? extraTeeth : internalExtraTeeth;

  const handleResetAllToFullMouth = () => {
    // ล้างฟันที่ถูกมาร์กว่าถอน/หาย (cross) ออกทั้งหมด คืนสถานะฟันครบ 32 ซี่
    const cleaned: Record<number | string, ToothStatus> = {};
    Object.entries(toothData).forEach(([k, v]) => {
      if (v !== 'cross') cleaned[k] = v;
    });
    if (onSaveToothManager) {
      onSaveToothManager(cleaned, []);
    } else if (onToothClick) {
      missingTeeth.forEach(t => {
        const num = parseInt(t.replace('teeth-', ''), 10);
        onToothClick(num, "cross");
      });
    }
  };

  const handleOpenToothManager = () => {
    setDraftToothData({ ...toothData });
    setDraftExtraTeeth([...activeExtraTeeth]);
    setShowToothManagerModal(true);
  };

  const handleFinishToothManager = () => {
    if (onSaveToothManager) {
      onSaveToothManager(draftToothData, draftExtraTeeth);
    } else {
      // Fallback
      if (onAddExtraTooth || onRemoveExtraTooth) {
        draftExtraTeeth.forEach(t => {
          if (!activeExtraTeeth.find(x => x.id === t.id) && onAddExtraTooth) onAddExtraTooth(t);
        });
        activeExtraTeeth.forEach(t => {
          if (!draftExtraTeeth.find(x => x.id === t.id) && onRemoveExtraTooth) onRemoveExtraTooth(t.id);
        });
      }
    }
    setShowToothManagerModal(false);
  };

  const handleToggleDraftTooth = (id: number | string) => {
    setDraftToothData(prev => {
      const next = { ...prev };
      if (next[id] === "cross") {
        delete next[id];
      } else {
        next[id] = "cross";
      }
      return next;
    });
  };

  const handleAddDraftExtra = (newTooth: SupernumeraryTooth) => {
    setDraftExtraTeeth(prev => {
      if (prev.find(x => x.id === newTooth.id)) return prev;
      return [...prev, newTooth];
    });
  };

  const handleRemoveDraftExtra = (id: string) => {
    setDraftExtraTeeth(prev => prev.filter(x => x.id !== id));
    setDraftToothData(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleAddExtra = (newTooth: SupernumeraryTooth) => {
    if (onAddExtraTooth) onAddExtraTooth(newTooth);
    else {
      setInternalExtraTeeth(prev => {
        if (prev.find(x => x.id === newTooth.id)) return prev;
        return [...prev, newTooth];
      });
    }
  };

  const handleRemoveExtra = (id: string) => {
    if (onRemoveExtraTooth) onRemoveExtraTooth(id);
    else setInternalExtraTeeth(prev => prev.filter(x => x.id !== id));
  };

  const hasMesiodens = activeExtraTeeth.some(t => t.id === "mesiodens" || t.id === "11S" || t.id.startsWith("11S-") || t.id.startsWith("mesiodens-"));
  const maxTeeth = isChild ? 5 : 8;

  const missingTeeth = Object.entries(toothData)
    .filter(([_, s]) => s === 'cross')
    .map(([n]) => `teeth-${n}`);

  // Render an individual tooth with clean SVG paths and instant status styling
  const renderToothSvg = (
    toothNum: number | string,
    shape: ToothPathData,
    transform?: string,
    extraLabel?: string,
    isExtraTooth?: boolean
  ) => {
    const status = toothData[toothNum] || "normal";

    let baseFill = "rgba(230, 230, 230, 0.95)";
    let innerFill = "#FFFFFF";
    let strokeColor = "#1e3a6e";
    let strokeWidth = "2";
    let opacity = 1;

    if (status === "red") {
      baseFill = "rgba(230, 230, 230, 0.95)";
      innerFill = "#FFE4E6"; // โรสซอฟต์ = มีปัญหา (ไม่แดงจัดจนแสบตา)
      strokeColor = "#F43F5E";
      strokeWidth = "2.2";
    } else if (status === "blue") {
      baseFill = "rgba(230, 230, 230, 0.95)";
      innerFill = "#BDE0FE"; // ฟ้าอ่อน = รักษาแล้ว
      strokeColor = "#023E8A";
      strokeWidth = "2.2";
    } else if (status === "cross") {
      baseFill = "transparent";
      innerFill = "transparent";
      strokeColor = "#94a3b8"; // เทาโบ๋ = ถอน/ผ่าออกแล้ว
      strokeWidth = "1.5";
      opacity = 0.45;
    } else if (isExtraTooth) {
      // ฟันเกินในสถานะปกติ: สีขาวนวลเนื้อฟันธรรมชาติแบบเดียวกับฟันปกติ
      baseFill = "rgba(230, 230, 230, 0.95)";
      innerFill = "#FFFFFF";
      strokeColor = "#1e3a6e";
    }

    const titleText = extraLabel
      ? `${extraLabel} (${status === 'red' ? 'พบปัญหา' : status === 'blue' ? 'รักษาแล้ว' : status === 'cross' ? 'ถอน/สูญเสีย' : 'ปกติ'})`
      : `ซี่ ${TOOTH_NAMES_TH[Number(toothNum)] || toothNum} (${status === 'red' ? 'พบปัญหา' : status === 'blue' ? 'รักษาแล้ว' : status === 'cross' ? 'ถอน/สูญเสีย' : 'ปกติ'})`;

    return (
      <g
        key={String(toothNum)}
        transform={transform}
        className={`cursor-pointer ${onToothClick ? 'hover:scale-[1.03] hover:brightness-110' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (currentMode === "patient") {
            setSelectedToothForInspection(String(toothNum));
          } else if (onToothClick) {
            onToothClick(toothNum, undefined);
          }
        }}
        style={{
          transformOrigin: "center",
          transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)"
        }}
      >
        <title>{titleText}</title>

        {/* Outer base outline */}
        <path
          d={shape.outlinePath}
          fill={baseFill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={opacity}
        />

        {/* Inner condition fill */}
        {status !== "cross" && (
          <path
            d={shape.shadowPath}
            fill={innerFill}
            opacity={status === "normal" && !isExtraTooth ? 0.35 : 0.9}
          />
        )}

        {/* Surface groove fissures */}
        {status !== "cross" && (
          Array.isArray(shape.lineHighlightPath) ? (
            shape.lineHighlightPath.map((lp, idx) => (
              <path
                key={idx}
                d={lp}
                fill="none"
                stroke={strokeColor}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.65}
              />
            ))
          ) : typeof shape.lineHighlightPath === "string" ? (
            <path
              d={shape.lineHighlightPath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.65}
            />
          ) : null
        )}
      </g>
    );
  };

  // Render a luxury clickable "+S" badge marker for a supernumerary tooth (Method 1 - Zero Jitter)
  const renderExtraBadge = (
    extra: SupernumeraryTooth,
    pos: { x: number; y: number },
    unmirrorX?: boolean,
    unmirrorY?: boolean
  ) => {
    const status = toothData[extra.id] || "normal";
    let bg = "#D97706"; // amber-600 (Golden Amber)
    let borderColor = "#FEF3C7"; // Light gold border
    if (status === "red") {
      bg = "#E11D48"; // rose-600 (Problem)
      borderColor = "#FFE4E6";
    } else if (status === "blue") {
      bg = "#2563EB"; // blue-600 (Treated)
      borderColor = "#DBEAFE";
    } else if (status === "cross") {
      bg = "#64748B"; // slate-500 (Extracted)
      borderColor = "#F1F5F9";
    }

    const scaleTransform = (unmirrorX && unmirrorY)
      ? "scale(-1, -1)"
      : unmirrorX
        ? "scale(-1, 1)"
        : unmirrorY
          ? "scale(1, -1)"
          : "";

    const locationText = getExtraToothLocation(extra.id);
    const statusLabel = status === 'red' ? 'พบปัญหา' : status === 'blue' ? 'รักษาแล้ว' : status === 'cross' ? 'ถอนแล้ว' : 'ฟันปกติ';
    const tooltipText = `${locationText} [สถานะ: ${statusLabel}] • คลิกเพื่อบันทึกการรักษา`;

    return (
      <g
        key={`badge-${extra.id}`}
        transform={`translate(${pos.x}, ${pos.y})`}
        className="cursor-pointer group select-none"
        onClick={(e) => {
          e.stopPropagation();
          if (currentMode === "patient") {
            setSelectedToothForInspection(String(extra.id));
          } else if (onToothClick) {
            onToothClick(extra.id, undefined);
          }
        }}
      >
        <title>{tooltipText}</title>

        {/* Generous invisible hit-box to guarantee ZERO jitter when mouse moves near edges */}
        <rect
          x="-18"
          y="-13"
          width="36"
          height="26"
          fill="transparent"
        />

        <g transform={scaleTransform}>
          {/* Badge shadow & pill background with smooth in-place highlight (no origin jump!) */}
          <rect
            x="-13"
            y="-8"
            width="26"
            height="16"
            rx="8"
            fill={bg}
            stroke={borderColor}
            strokeWidth="1.6"
            className="transition-all duration-150 group-hover:brightness-125 group-hover:stroke-white"
            style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.45))" }}
          />
          {/* Badge text "+S" */}
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="9"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            className="pointer-events-none"
          >
            +S
          </text>
        </g>
      </g>
    );
  };

  // Summary counts for patient view mode
  const cariesCount = Object.entries(toothData).filter(([k, s]) => s === 'red' && k !== 'extraTeeth' && k !== 'wholeMouth').length;
  const filledCount = Object.entries(toothData).filter(([k, s]) => s === 'blue' && k !== 'extraTeeth' && k !== 'wholeMouth').length;
  const missingCount = Object.entries(toothData).filter(([k, s]) => s === 'cross' && k !== 'extraTeeth' && k !== 'wholeMouth').length;
  const extraCount = activeExtraTeeth.length;

  return (
    <div className="bg-white p-4 rounded-2xl" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
      {/* Header Row: Title, Mode Switcher, and Mini Adult/Child Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="font-bold text-base whitespace-nowrap" style={{ color: "#1A365D" }}>
            {readonly ? "แผนผังสุขภาพฟัน" : "Odontogram (แผนผังฟัน)"}
          </h3>
          {patientName && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
              {patientName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Mode Switcher: โหมดรักษา VS มุมมองคนไข้ */}
          {!readonly ? (
            <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleModeChange("treatment")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentMode === "treatment"
                    ? "bg-[#1A365D] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="คลิกฟันเพื่อเปิดเมนูบันทึกหัตถการและแผนการรักษา"
              >
                <Stethoscope size={13} />
                <span>โหมดรักษา</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("patient")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentMode === "patient"
                    ? "bg-[#FF8C9A] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="ดูสถานะฟันและประวัติการรักษาในมุมมองเหมือนที่คนไข้เห็น"
              >
                <Eye size={13} />
                <span>มุมมองคนไข้</span>
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Eye size={13} /> มุมมองคนไข้
            </span>
          )}

          {/* ปุ่มสลับ ฟันแท้ / ฟันน้ำนม */}
          {setIsChild && (
            <div className="inline-flex items-center bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/80 shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => setIsChild(false)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold leading-tight whitespace-nowrap transition-all ${
                  !isChild
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="ชุดฟันแท้ (Adult)"
              >
                ฟันแท้
              </button>
              <button
                type="button"
                onClick={() => setIsChild(true)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold leading-tight whitespace-nowrap transition-all ${
                  isChild
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="ชุดฟันน้ำนม (Child)"
              >
                ฟันน้ำนม
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Patient View Mode Banner: สรุปภาพรวมสถานะฟันเหมือนหน้าคนไข้ */}
      {currentMode === "patient" && (
        <div className="mb-4 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100 text-[11px] text-blue-900">
            <span className="flex items-center gap-1.5 font-medium">
              <Eye size={13} className="text-blue-600 shrink-0" />
              <span>โหมดมุมมองคนไข้: คลิกที่ซี่ฟันเพื่อตรวจดูสถานะและประวัติการรักษาของซี่นั้น</span>
            </span>
{historyRecords.length > 0 && (
              <button
                type="button"
                onClick={() => setShowFullTimeline(!showFullTimeline)}
                className="text-blue-700 hover:text-blue-900 font-bold underline shrink-0 ml-2"
              >
                {showFullTimeline ? "ซ่อนประวัติทั้งหมด" : `ดูประวัติทั้งหมด (${historyRecords.length})`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ปุ่มบันทึกตำแหน่งฟันตามสภาพจริง: แสดงเฉพาะในโหมดรักษา */}
      {!readonly && onToothClick && currentMode === "treatment" && (
        <div className="flex justify-center mb-3">
          <button
            type="button"
            onClick={handleOpenToothManager}
            className="w-fit flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 border border-slate-700 transition-all shadow-sm hover:shadow active:scale-[0.99]"
            title="บันทึกตำแหน่งฟันอ้างอิงจากสภาพช่องปากจริงของคนไข้ (ลบฟันที่เคยถอนจากที่อื่น / เพิ่มฟันเกิน) โดยไม่คิดค่ารักษาในบิล"
          >
            <ClipboardList size={14} className="text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">บันทึกตำแหน่งฟันตามสภาพจริง</span>
            {(missingTeeth.length > 0 || activeExtraTeeth.length > 0) && (
              <span className="flex items-center gap-1 ml-0.5 shrink-0">
                {missingTeeth.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    -{missingTeeth.length}
                  </span>
                )}
                {activeExtraTeeth.length > 0 && (
                  <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    +{activeExtraTeeth.length}S
                  </span>
                )}
              </span>
            )}
          </button>
        </div>
      )}      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs text-slate-600 mb-3 px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFE4E6] border border-[#F43F5E] inline-block"></span>
          <span>พบปัญหา {currentMode === "patient" && <span className="font-bold text-rose-600">({cariesCount})</span>}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#BDE0FE] border border-[#023E8A] inline-block"></span>
          <span>รักษาแล้ว {currentMode === "patient" && <span className="font-bold text-blue-600">({filledCount})</span>}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0] border border-[#64748B] inline-block"></span>
          <span>ถอน/สูญเสีย {currentMode === "patient" && <span className="font-bold text-slate-600">({missingCount})</span>}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEF9C3] border-2 border-amber-500 inline-block"></span>
          <span>ฟันเกิน/ซ้อน {currentMode === "patient" && <span className="font-bold text-amber-700">({extraCount})</span>}</span>
        </div>
      </div>

      {/* Dark Background Box for Odontogram */}
      <div className="pb-4 flex justify-center">
        <div
          style={{
            background: "linear-gradient(160deg, #0f1729 0%, #0d2145 40%, #0a1a3a 100%)",
            boxShadow: "0 0 0 1px rgba(99,161,255,0.18), 0 4px 20px rgba(10,20,60,0.45), inset 0 1px 0 rgba(99,161,255,0.1)",
            borderRadius: "14px",
            padding: "10px 10px 6px",
          }}
        >
          {/* Fixed-width wrapper — SVG fills this width, height is auto-proportional */}
          <div className="relative" style={{ width: "220px" }}>
            {/* Separator Line & Labels */}
            <div
              className="absolute pointer-events-none z-0"
              style={{ top: "49%", left: 0, right: 0, borderTop: "1px dashed rgba(255,255,255,0.15)" }}
            >
              <div style={{ position: "absolute", top: "-14px", width: "100%", textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.06em" }}>ฟันบน (Upper)</div>
              <div style={{ position: "absolute", top: "3px", width: "100%", textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.06em" }}>ฟันล่าง (Lower)</div>
            </div>

            {/* Pure SVG Dental Arch with Dynamic Tooth Spacing */}
            <div className="relative z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 409 694"
                className="w-full h-auto select-none"
                style={{ overflow: "visible" }}
              >
                {/* Upper Arch */}
                {/* Q1: Upper Right (teeth 11..18, or 51..55 in child) - Anatomic arch remains 100% fixed */}
                <g>
                  {Array.from({ length: maxTeeth }).map((_, i) => {
                    const toothNum = isChild ? 51 + i : 11 + i;
                    const shape = TOOTH_SHAPES[i];
                    return renderToothSvg(toothNum, shape);
                  })}

                  {/* Luxury Badges (+S) for Q1 Extra Teeth ONLY */}
                  {activeExtraTeeth.filter(t => t.quadrant === 1 && t.id !== "mesiodens" && !t.id.startsWith("11S")).map(tooth => {
                    const toothInQuad = (parseInt(tooth.id.replace(/\D/g, ''), 10) % 10) || (tooth.shapeIndex + 1);
                    const idx = Math.max(0, Math.min(7, toothInQuad - 1));
                    const pos = TOOTH_BADGE_POSITIONS[idx] || { x: 88, y: 32 };
                    return renderExtraBadge(tooth, pos);
                  })}
                </g>

                {/* Q2: Upper Left (teeth 21..28, or 61..65 in child) - Anatomic arch remains 100% fixed */}
                <g transform="scale(-1, 1) translate(-409, 0)">
                  {Array.from({ length: maxTeeth }).map((_, i) => {
                    const toothNum = isChild ? 61 + i : 21 + i;
                    const shape = TOOTH_SHAPES[i];
                    return renderToothSvg(toothNum, shape);
                  })}

                  {/* Luxury Badges (+S) for Q2 Extra Teeth ONLY (unmirrored text) */}
                  {activeExtraTeeth.filter(t => t.quadrant === 2).map(tooth => {
                    const toothInQuad = (parseInt(tooth.id.replace(/\D/g, ''), 10) % 10) || (tooth.shapeIndex + 1);
                    const idx = Math.max(0, Math.min(7, toothInQuad - 1));
                    const pos = TOOTH_BADGE_POSITIONS[idx] || { x: 88, y: 32 };
                    return renderExtraBadge(tooth, pos, true, false);
                  })}
                </g>

                {/* MESIODENS: Luxury Badge (+S) at Midline between 11 & 21 ONLY when recorded */}
                {(() => {
                  const mesioTeeth = getActiveExtrasForTooth(11, activeExtraTeeth);
                  if (mesioTeeth.length === 0) return null;
                  return mesioTeeth.map((mesio, mIdx) => {
                    const offset = (mIdx - (mesioTeeth.length - 1) / 2) * 26;
                    return (
                      <React.Fragment key={mesio.id}>
                        {renderExtraBadge(mesio, { x: 204.5 + offset, y: -4 })}
                      </React.Fragment>
                    );
                  });
                })()}

                {/* Lower Arch */}
                {/* Q4: Lower Right (teeth 41..48, or 81..85 in child) - Anatomic arch remains 100% fixed */}
                <g transform="scale(1, -1) translate(0, -694)">
                  {Array.from({ length: maxTeeth }).map((_, i) => {
                    const toothNum = isChild ? 81 + i : 41 + i;
                    const shape = TOOTH_SHAPES[i];
                    return renderToothSvg(toothNum, shape);
                  })}

                  {/* Luxury Badges (+S) for Q4 Extra Teeth ONLY */}
                  {activeExtraTeeth.filter(t => t.quadrant === 4).map(tooth => {
                    const toothInQuad = (parseInt(tooth.id.replace(/\D/g, ''), 10) % 10) || (tooth.shapeIndex + 1);
                    const idx = Math.max(0, Math.min(7, toothInQuad - 1));
                    const pos = TOOTH_BADGE_POSITIONS[idx] || { x: 88, y: 32 };
                    return renderExtraBadge(tooth, pos, false, true);
                  })}
                </g>

                {/* Q3: Lower Left (teeth 31..38, or 71..75 in child) - Anatomic arch remains 100% fixed */}
                <g transform="scale(-1, -1) translate(-409, -694)">
                  {Array.from({ length: maxTeeth }).map((_, i) => {
                    const toothNum = isChild ? 71 + i : 31 + i;
                    const shape = TOOTH_SHAPES[i];
                    return renderToothSvg(toothNum, shape);
                  })}

                  {/* Luxury Badges (+S) for Q3 Extra Teeth ONLY */}
                  {activeExtraTeeth.filter(t => t.quadrant === 3).map(tooth => {
                    const toothInQuad = (parseInt(tooth.id.replace(/\D/g, ''), 10) % 10) || (tooth.shapeIndex + 1);
                    const idx = Math.max(0, Math.min(7, toothInQuad - 1));
                    const pos = TOOTH_BADGE_POSITIONS[idx] || { x: 88, y: 32 };
                    return renderExtraBadge(tooth, pos, true, true);
                  })}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>



      {/* Summary of Deleted/Missing Teeth Below Chart */}
      {missingTeeth.length > 0 && (
        <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700">ฟันที่ถูกลบ/เคยถอนแล้ว ({missingTeeth.length} ซี่):</span>
            <div className="flex flex-wrap gap-1">
              {missingTeeth.map(t => {
                const num = parseInt(t.replace('teeth-', ''), 10);
                return (
                  <span key={num} className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200 font-bold flex items-center gap-1">
                    <span>ซี่ {num}</span>
                    {!readonly && onToothClick && (
                      <button
                        type="button"
                        onClick={() => onToothClick(num, "cross")}
                        className="text-rose-400 hover:text-rose-700 font-bold ml-1 text-sm leading-none"
                        title="คลิกเพื่อยกเลิกการลบฟันซี่นี้"
                      >
                        ×
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
          {!readonly && onToothClick && (
            <button
              type="button"
              onClick={handleOpenToothManager}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline"
            >
              แก้ไขการลบฟัน
            </button>
          )}
        </div>
      )}

      {/* Summary of Extra / Supernumerary Teeth Below Chart */}
      {activeExtraTeeth.length > 0 && (
        <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-amber-900">ฟันเกิน/ฟันซ้อน ({activeExtraTeeth.length} ซี่):</span>
            <div className="flex flex-wrap gap-1">
              {activeExtraTeeth.map(t => {
                const loc = getExtraToothLocation(t.id);
                const st = toothData[t.id] || "normal";
                const stLabel = st === 'red' ? ' (มีปัญหา)' : st === 'blue' ? ' (รักษาแล้ว)' : st === 'cross' ? ' (ถอนแล้ว)' : '';
                const displayBadge = t.id === "mesiodens" ? "+11S (Mesiodens)" : `+${t.id}`;
                return (
                  <span
                    key={t.id}
                    className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1 cursor-pointer hover:bg-amber-200 transition-colors"
                    title={`${loc} • คลิกดูรายละเอียด`}
                    onClick={() => {
                      if (onToothClick) onToothClick(t.id);
                    }}
                  >
                    <span>{displayBadge}{stLabel}</span>
                    {!readonly && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRemoveExtraTooth) onRemoveExtraTooth(t.id);
                        }}
                        className="text-amber-600 hover:text-amber-900 font-bold ml-1 text-sm leading-none"
                        title="คลิกเพื่อยกเลิกฟันเกินซี่นี้"
                      >
                        ×
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
          {!readonly && onToothClick && (
            <button
              type="button"
              onClick={handleOpenToothManager}
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold underline"
            >
              แก้ไขฟันเกิน
            </button>
          )}
        </div>
      )}



      {/* Modal: ผังประวัติเดิม & ฟันเกิน (+S) (รวมศูนย์จุดเดียวจบ - ไม่บันทึกลง notes จนกว่าจะกดเสร็จสิ้น) */}
      {showToothManagerModal && (() => {
        const draftMissingTeeth = Object.entries(draftToothData)
          .filter(([_, s]) => s === 'cross')
          .map(([n]) => String(n).replace('teeth-', ''));

        return (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[110] p-3 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[88vh]">
              {/* Header */}
              <div className="bg-slate-800 text-white px-4 py-2.5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-sm leading-tight">บันทึกตำแหน่งฟันตามสภาพช่องปากจริง</div>
                    <div className="text-[11px] text-slate-300 font-normal">คลิกเลขซี่เพื่อลบฟันที่ไม่มี (✕) หรือเลือกแทรกฟันเกิน (+S)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowToothManagerModal(false)}
                  className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
                  title="ปิดโดยไม่บันทึก"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Clean Single View */}
              <div className="p-3.5 space-y-3 overflow-y-auto flex-1">
                {/* Upper Teeth Row */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2 px-1">
                    <span className="text-blue-700 font-bold">◀ ขวาคนไข้ (18 - 11)</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span>ฟันบน (UPPER)</span>
                      {draftExtraTeeth.some(t => t.quadrant === 1 || t.quadrant === 2 || t.id === "mesiodens") && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded-full font-medium">
                          มีฟันเกิน
                        </span>
                      )}
                    </span>
                    <span className="text-blue-700 font-bold">ซ้ายคนไข้ (21 - 28) ▶</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 flex-wrap sm:flex-nowrap">
                    {getUpperToothRowItems(draftExtraTeeth, false, false).map(item => {
                      const isRemoved = draftToothData[item.id] === "cross";
                      const showUpperMidline = item.id === 21;

                      if (item.isExtra) {
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleRemoveDraftExtra(String(item.id))}
                            className="h-8 min-w-[34px] px-1 shrink-0 rounded-lg text-[10px] font-bold border-2 bg-amber-100 text-amber-950 border-amber-400 hover:bg-rose-100 hover:border-rose-400 hover:text-rose-900 transition-all flex flex-col items-center justify-center shadow-xs"
                            title={`${item.locationTip || item.label} (คลิกเพื่อนำออกจากผัง)`}
                          >
                            <span className="leading-tight font-extrabold">{item.label}</span>
                            <span className="text-[7px] text-amber-800 font-medium leading-none">✕ เอาออก</span>
                          </button>
                        );
                      }

                      return (
                        <div key={item.id} className="flex items-center gap-1">
                          {showUpperMidline && (
                            <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" title="แนวกึ่งกลางฟัน (Midline)" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleDraftTooth(item.id)}
                            className={`w-7 sm:w-8 h-8 shrink-0 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center leading-none ${isRemoved
                              ? "bg-rose-600 text-white border-rose-700 shadow-xs scale-105"
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50 shadow-2xs"
                              }`}
                            title={`ซี่ ${item.id} ${isRemoved ? '(ลบแล้ว - คลิกคืนค่า)' : '(คลิกเพื่อลบฟัน)'}`}
                          >
                            <span>{item.label}</span>
                            {isRemoved && <span className="text-[7px] text-rose-200 font-extrabold leading-none mt-0.5">✕</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lower Teeth Row */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2 px-1">
                    <span className="text-blue-700 font-bold">◀ ขวาคนไข้ (48 - 41)</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span>ฟันล่าง (LOWER)</span>
                      {draftExtraTeeth.some(t => t.quadrant === 3 || t.quadrant === 4) && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded-full font-medium">
                          มีฟันเกิน
                        </span>
                      )}
                    </span>
                    <span className="text-blue-700 font-bold">ซ้ายคนไข้ (31 - 38) ▶</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 flex-wrap sm:flex-nowrap">
                    {getLowerToothRowItems(draftExtraTeeth, false, false).map(item => {
                      const isRemoved = draftToothData[item.id] === "cross";
                      const showLowerMidline = item.id === 31;

                      if (item.isExtra) {
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleRemoveDraftExtra(String(item.id))}
                            className="h-8 min-w-[34px] px-1 shrink-0 rounded-lg text-[10px] font-bold border-2 bg-amber-100 text-amber-950 border-amber-400 hover:bg-rose-100 hover:border-rose-400 hover:text-rose-900 transition-all flex flex-col items-center justify-center shadow-xs"
                            title={`${item.locationTip || item.label} (คลิกเพื่อนำออกจากผัง)`}
                          >
                            <span className="leading-tight font-extrabold">{item.label}</span>
                            <span className="text-[7px] text-amber-800 font-medium leading-none">✕ เอาออก</span>
                          </button>
                        );
                      }

                      return (
                        <div key={item.id} className="flex items-center gap-1">
                          {showLowerMidline && (
                            <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" title="แนวกึ่งกลางฟัน (Midline)" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleDraftTooth(item.id)}
                            className={`w-7 sm:w-8 h-8 shrink-0 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center leading-none ${isRemoved
                              ? "bg-rose-600 text-white border-rose-700 shadow-xs scale-105"
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50 shadow-2xs"
                              }`}
                            title={`ซี่ ${item.id} ${isRemoved ? '(ลบแล้ว - คลิกคืนค่า)' : '(คลิกเพื่อลบฟัน)'}`}
                          >
                            <span>{item.label}</span>
                            {isRemoved && <span className="text-[7px] text-rose-200 font-extrabold leading-none mt-0.5">✕</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Extra Tooth Dropdown Bar */}
                <div className="py-2.5 px-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-amber-950 shrink-0">
                        ✨ แทรกฟันเกิน / ฟันซ้อน (+S):
                      </span>
                      <select
                        value={customToothToAdd}
                        onChange={e => {
                          const val = e.target.value;
                          if (val) {
                            if (val === "11S") {
                              const p = PRESET_SUPERNUMERARY.find(x => x.id === "11S");
                              if (p) handleAddDraftExtra(p);
                            } else if (val.endsWith("S") && ["13S", "23S", "43S", "33S", "18S", "28S", "48S", "38S"].includes(val)) {
                              const p = PRESET_SUPERNUMERARY.find(x => x.id === val);
                              if (p) handleAddDraftExtra(p);
                              else {
                                const num = parseInt(val.replace("S", ""), 10);
                                handleAddDraftExtra(createCustomSupernumerary(num));
                              }
                            } else {
                              const tNum = parseInt(val, 10);
                              const existingCount = draftExtraTeeth.filter(t => t.id === `${tNum}S` || t.id.startsWith(`${tNum}S-`)).length;
                              handleAddDraftExtra(createCustomSupernumerary(tNum, existingCount + 1));
                            }
                            setCustomToothToAdd('');
                          }
                        }}
                        className="bg-white border border-amber-800 text-slate-800 rounded-lg px-3 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-800 shadow-2xs flex-1 min-w-[260px] max-w-full truncate"
                      >
                        <option value="">-- คลิกเลือกตำแหน่งที่พบ (ระบุว่าจะแทรกระหว่างซี่ไหนในผัง) --</option>
                        <optgroup label="⚡ ตำแหน่งที่พบบ่อย (Mesiodens / เขี้ยวซ้อน / ฟันเกินคุด)">
                          <option value="11S">{getExtraToothInsertOptionLabel(11)}</option>
                          <option value="13S">{getExtraToothInsertOptionLabel(13)}</option>
                          <option value="23S">{getExtraToothInsertOptionLabel(23)}</option>
                          <option value="43S">{getExtraToothInsertOptionLabel(43)}</option>
                          <option value="33S">{getExtraToothInsertOptionLabel(33)}</option>
                          <option value="18S">{getExtraToothInsertOptionLabel(18)}</option>
                          <option value="28S">{getExtraToothInsertOptionLabel(28)}</option>
                          <option value="48S">{getExtraToothInsertOptionLabel(48)}</option>
                          <option value="38S">{getExtraToothInsertOptionLabel(38)}</option>
                        </optgroup>
                        <optgroup label="ฟันบนขวา (18 - 11)">
                          {[18, 17, 16, 15, 14, 13, 12, 11].map(n => (
                            <option key={n} value={n}>{getExtraToothInsertOptionLabel(n)}</option>
                          ))}
                        </optgroup>
                        <optgroup label="ฟันบนซ้าย (21 - 28)">
                          {[21, 22, 23, 24, 25, 26, 27, 28].map(n => (
                            <option key={n} value={n}>{getExtraToothInsertOptionLabel(n)}</option>
                          ))}
                        </optgroup>
                        <optgroup label="ฟันล่างขวา (48 - 41)">
                          {[48, 47, 46, 45, 44, 43, 42, 41].map(n => (
                            <option key={n} value={n}>{getExtraToothInsertOptionLabel(n)}</option>
                          ))}
                        </optgroup>
                        <optgroup label="ฟันล่างซ้าย (31 - 38)">
                          {[31, 32, 33, 34, 35, 36, 37, 38].map(n => (
                            <option key={n} value={n}>{getExtraToothInsertOptionLabel(n)}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div className="text-[11px] text-amber-900 font-semibold shrink-0">
                      {draftExtraTeeth.length === 0 ? "ยังไม่มีฟันเกิน" : `มีฟันเกินในผัง ${draftExtraTeeth.length} ซี่`}
                    </div>
                  </div>
                  <div className="text-[10px] text-amber-800/90 leading-tight">
                    💡 ในช่องปากจริงฟันเกินอาจซ้อนอยู่ด้านในหรือด้านนอก แต่ในผังบันทึกจะแสดงแทรกคั่นระหว่างเลขซี่ฟันให้อัตโนมัติ
                  </div>
                </div>

                {/* Summary of currently deleted teeth & active extra teeth with removable chips */}
                <div className="py-2 px-3 bg-slate-100/90 rounded-xl text-[11px] flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-semibold text-slate-700">รายการฟันที่ลบ: </span>
                    <span className="text-rose-700 font-bold">
                      {draftMissingTeeth.length > 0
                        ? draftMissingTeeth.map(t => {
                          const isEx = t.endsWith('S') || t === 'mesiodens';
                          return isEx ? `${t} (+S)` : t;
                        }).join(', ') + ' (' + draftMissingTeeth.length + ' ซี่)'
                        : 'ไม่มี (ฟันครบ 32 ซี่)'}
                    </span>
                  </div>
                  {draftExtraTeeth.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-700">ฟันเกินในผัง: </span>
                      {draftExtraTeeth.map(t => {
                        const toothId = t.id === "mesiodens" ? "11S" : t.id;
                        const locTip = getExtraToothLocation(t.id);
                        return (
                          <span
                            key={t.id}
                            title={locTip}
                            className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 border border-amber-300 px-1.5 py-0.5 rounded-md font-bold text-[10px] shadow-2xs cursor-help"
                          >
                            <span>+{toothId}</span>
                            <span className="text-[9px] font-normal text-amber-800">
                              ({locTip.includes("Mesiodens") ? "กึ่งกลางหน้าบน" : locTip.includes("เขี้ยว") ? "เขี้ยวซ้อน" : "ฟันเกินคุด"})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDraftExtra(t.id)}
                              className="text-amber-800 hover:text-rose-600 hover:bg-rose-100/70 rounded px-0.5 transition-colors leading-none"
                              title={`นำ ${t.id} ออกจากผังฟัน`}
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Fixed Footer: บันทึก/เสร็จสิ้นทันที ไม่ต้องเลื่อนจอ */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const cleaned: Record<number | string, ToothStatus> = {};
                    Object.entries(draftToothData).forEach(([k, v]) => {
                      if (v !== 'cross') cleaned[k] = v;
                    });
                    setDraftToothData(cleaned);
                    setDraftExtraTeeth([]);
                  }}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                  title="ล้างค่าทั้งหมดและคืนฟันครบ 32 ซี่ปกติ"
                >
                  <RotateCcw size={12} />
                  <span>คืนฟันครบ 32 ซี่</span>
                </button>
                <div className="text-[11px] text-slate-600 truncate">
                  {draftMissingTeeth.length > 0 ? (
                    <span>
                      ลบออกแล้ว <strong className="text-rose-600 font-bold">{draftMissingTeeth.length} ซี่</strong>
                      {draftExtraTeeth.length > 0 && (
                        <span> | ฟันเกิน <strong className="text-amber-700 font-bold">{draftExtraTeeth.length} ซี่</strong></span>
                      )}
                    </span>
                  ) : (
                    <span>
                      {draftExtraTeeth.length > 0 ? (
                        <span>ฟันเกิน <strong className="text-amber-700 font-bold">{draftExtraTeeth.length} ซี่</strong> (ไม่มีฟันถูกลบ)</span>
                      ) : (
                        "ฟันครบ 32 ซี่ปกติ"
                      )}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleFinishToothManager}
                  className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm active:scale-98 shrink-0 flex items-center gap-1.5"
                >
                  <span>✓ เสร็จสิ้น / บันทึก</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Modal: รายละเอียดและประวัติการรักษาของซี่ฟันที่คลิก (ในโหมดมุมมองคนไข้) */}
      {selectedToothForInspection && (() => {
        const cleanKey = selectedToothForInspection.replace('teeth-', '').trim();
        const isExtra = cleanKey === 'mesiodens' || cleanKey.endsWith('S') || cleanKey.includes('S-') || activeExtraTeeth.some(t => t.id === cleanKey);
        
        let toothDisplayNum = cleanKey;
        let toothName = "";
        let extraLocationDesc = "";

        if (isExtra) {
          toothDisplayNum = cleanKey === "mesiodens" ? "+11S" : (cleanKey.startsWith('+') ? cleanKey : `+${cleanKey}`);
          toothName = cleanKey === "mesiodens" 
            ? "ฟันเกินกึ่งกลางฟันหน้าบน (Mesiodens)" 
            : `ฟันเกิน / ฟันซ้อน (${toothDisplayNum})`;
          extraLocationDesc = getExtraToothLocation(cleanKey);
        } else {
          const num = parseInt(cleanKey, 10);
          toothName = TOOTH_NAMES_TH[num] || `ซี่ ${cleanKey}`;
        }

        const status = toothData[cleanKey] || "normal";
        let statusStr = isExtra ? "ตรวจพบฟันเกิน (ปกติ/ติดตาม)" : "ปกติ (Normal)";
        let colorStr = isExtra ? "#D97706" : "#10B981"; // Amber or Green
        let statusBg = isExtra ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200";

        if (status === "red") {
          statusStr = "พบปัญหา / ต้องรักษา";
          colorStr = "#EF4444";
          statusBg = "bg-rose-50 text-rose-800 border-rose-200";
        } else if (status === "blue") {
          statusStr = "รักษาแล้ว (Treated)";
          colorStr = "#2563EB";
          statusBg = "bg-blue-50 text-blue-800 border-blue-200";
        } else if (status === "cross") {
          statusStr = "ถอน / ผ่าออกแล้ว (Extracted)";
          colorStr = "#64748B";
          statusBg = "bg-slate-100 text-slate-800 border-slate-300";
        }

        const toothHistory = getToothHistory(cleanKey, historyRecords);

        return (
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 animate-in fade-in duration-150"
            onClick={() => setSelectedToothForInspection(null)}
          >
            <div 
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-[#1A365D] text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm shrink-0 border"
                    style={{ backgroundColor: colorStr + "25", color: "#FFFFFF", borderColor: colorStr }}
                  >
                    {toothDisplayNum}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight">{toothName}</h3>
                    <p className="text-[11px] text-blue-200">มุมมองสถานะคนไข้ & ประวัติการรักษา</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedToothForInspection(null)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
                {/* Current Status Badge */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-semibold text-slate-600">สถานะปัจจุบัน:</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBg}`}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorStr }}></span>
                    {statusStr}
                  </span>
                </div>

                {extraLocationDesc && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    <span className="font-bold block mb-0.5">ตำแหน่งฟันเกิน:</span>
                    {extraLocationDesc}
                  </div>
                )}

                {/* Tooth Treatment History */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <History size={14} className="text-blue-600" />
                      <span>ประวัติการรักษาของซี่นี้</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {toothHistory.length > 0 ? `พบ ${toothHistory.length} รายการ` : "ไม่มีบันทึก"}
                    </span>
                  </div>

                  {toothHistory.length > 0 ? (
                    <div className="space-y-2">
                      {toothHistory.map((h, idx) => (
                        <div 
                          key={h.id || idx}
                          className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#1A365D] flex items-center gap-1.5">
                              <Calendar size={13} className="text-blue-500" />
                              {new Date(h.date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100 flex items-center gap-1">
                              <User size={10} />
                              {h.doctor}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {h.services.map((srv, sIdx) => (
                              <span 
                                key={sIdx}
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-100"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>

                          {h.notes && (
                            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="font-semibold text-slate-500">บันทึก: </span>
                              {h.notes}
                            </div>
                          )}

                          {h.recommendations && (
                            <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-100">
                              <span className="font-semibold text-amber-700">คำแนะนำ: </span>
                              {h.recommendations}
                            </div>
                          )}

                          {/* Audit Trail: ข้อมูลการเงินและผู้รับชำระเงิน */}
                          {(h.cashier || h.paymentMethod || h.cost) && (
                            <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 text-slate-600 mt-1">
                              <span className="flex items-center gap-1 font-medium">
                                <CreditCard size={12} className="text-emerald-600" />
                                <span>{h.paymentMethod ? `ชำระผ่าน ${h.paymentMethod}` : "ชำระเงินเรียบร้อย"}</span>
                                {h.cost && <strong className="text-slate-800 ml-1">฿{h.cost}</strong>}
                              </span>
                              {h.cashier && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  รับชำระโดย: <span className="text-slate-700 font-semibold">{h.cashier}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                      <Clock size={24} className="mx-auto text-slate-300 mb-1.5" />
                      <p className="text-xs font-semibold text-slate-600">ยังไม่เคยมีบันทึกการทำหัตถการในซี่นี้</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">หากคนไข้เคยรับบริการ ระบบจะแสดงรายการหัตถการและบันทึกของแพทย์ที่นี่</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedToothForInspection(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium rounded-xl text-xs transition-colors shadow-2xs"
                >
                  ปิด
                </button>

                {!readonly && onToothClick && (
                  <button
                    type="button"
                    onClick={() => {
                      const toothToTreat = cleanKey;
                      setSelectedToothForInspection(null);
                      handleModeChange("treatment");
                      onToothClick(toothToTreat, undefined);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FF8C9A] hover:bg-[#ff7a8a] text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    <Stethoscope size={14} />
                    <span>ไปที่โหมดรักษาซี่นี้ ({toothDisplayNum})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Accordion: ไทม์ไลน์ประวัติการรักษาทั้งหมดของคนไข้ */}
      {currentMode === "patient" && showFullTimeline && historyRecords.length > 0 && (
        <div className="mt-4 p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <History size={15} className="text-blue-600" />
              <span>ประวัติการรักษาทั้งหมด ({historyRecords.length} ครั้ง)</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowFullTimeline(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              ปิด
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {historyRecords.map((rec) => (
              <div key={rec.id} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1A365D]">
                    {new Date(rec.date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                    {rec.doctor}
                  </span>
                </div>
                {rec.treatmentServices && rec.treatmentServices.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rec.treatmentServices.map((s: string) => (
                      <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-700">{rec.service}</p>
                )}
                {rec.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100 mt-1">
                    {rec.notes}
                  </p>
                )}
                {(rec.cashier || rec.paymentMethod || rec.cost) && (
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100 mt-1">
                    <span>
                      {rec.paymentMethod ? `ชำระ: ${rec.paymentMethod}` : "ชำระแล้ว"} {rec.cost && <b className="text-slate-700">฿{rec.cost}</b>}
                    </span>
                    {rec.cashier && <span>ผู้รับเงิน: <b className="text-slate-700">{rec.cashier}</b></span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
</div>
  );
}