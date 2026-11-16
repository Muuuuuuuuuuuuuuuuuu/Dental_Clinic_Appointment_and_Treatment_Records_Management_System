import React from "react";
import { ToothPathData } from "./ToothGeometry";
import { ToothStatus, getToothHistory } from "./toothHistory";
import { TOOTH_NAMES_TH } from "./toothNames";

interface ToothSvgProps {
  toothNum: number | string;
  shape: ToothPathData;
  status: ToothStatus;
  transform?: string;
  extraLabel?: string;
  isExtraTooth?: boolean;
  currentMode: "treatment" | "patient";
  historyRecords: any[];
  onToothClick?: (tooth: number | string, status?: ToothStatus) => void;
  onSelectForInspection: (tooth: string) => void;
  onHoverTooth: (e: React.MouseEvent<SVGGElement>, tooth: number | string) => void;
  onLeaveTooth: () => void;
}

export default function ToothSvg({
  toothNum,
  shape,
  status = "normal",
  transform,
  extraLabel,
  isExtraTooth,
  currentMode,
  historyRecords,
  onToothClick,
  onSelectForInspection,
  onHoverTooth,
  onLeaveTooth,
}: ToothSvgProps) {
  let baseFill = "rgba(230, 230, 230, 0.95)";
  let innerFill = "#FFFFFF";
  let strokeColor = "#1e3a6e";
  let strokeWidth = "2";
  let opacity = 1;

  if (status === "red") {
    baseFill = "rgba(230, 230, 230, 0.95)";
    innerFill = "#FFE4E6";
    strokeColor = "#F43F5E";
    strokeWidth = "2.2";
  } else if (status === "blue") {
    baseFill = "rgba(230, 230, 230, 0.95)";
    innerFill = "#BDE0FE";
    strokeColor = "#023E8A";
    strokeWidth = "2.2";
  } else if (status === "cross") {
    baseFill = "rgba(148, 163, 184, 0.38)";
    innerFill = "transparent";
    strokeColor = "#CBD5E1";
    strokeWidth = "2";
    opacity = 0.85;
  } else if (isExtraTooth) {
    baseFill = "rgba(230, 230, 230, 0.95)";
    innerFill = "#FFFFFF";
    strokeColor = "#1e3a6e";
  }

  const titleText = extraLabel
    ? `${extraLabel} (${status === 'red' ? 'พบปัญหา' : status === 'blue' ? 'รักษาแล้ว' : status === 'cross' ? 'ถอน/สูญเสีย' : 'ปกติ'})`
    : `ซี่ ${TOOTH_NAMES_TH[Number(toothNum)] || toothNum} (${status === 'red' ? 'พบปัญหา' : status === 'blue' ? 'รักษาแล้ว' : status === 'cross' ? 'ถอน/สูญเสีย' : 'ปกติ'})`;

  const toothHistoryList = getToothHistory(toothNum, historyRecords);
  const hasHistoryOrStatus = (status && status !== "normal") || toothHistoryList.length > 0;

  return (
    <g
      key={String(toothNum)}
      transform={transform}
      className={`cursor-pointer ${onToothClick ? 'hover:scale-[1.03] hover:brightness-110' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (currentMode === "patient") {
          onSelectForInspection(String(toothNum));
        } else if (onToothClick) {
          onToothClick(toothNum, undefined);
        }
      }}
      onMouseEnter={(e) => {
        if (hasHistoryOrStatus) {
          onHoverTooth(e, toothNum);
        }
      }}
      onMouseLeave={onLeaveTooth}
      style={{
        transformBox: "fill-box", // 
        transformOrigin: "center",
        transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)"
      }}
    >
      {!hasHistoryOrStatus && <title>{titleText}</title>}

      {/* เส้นขอบนอกของซี่ฟัน */}
      <path
        d={shape.outlinePath}
        fill={baseFill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={status === "cross" ? "4 3" : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />

      {/* สีพื้นด้านในตามสถานะของซี่ฟัน */}
      {status !== "cross" && (
        <path
          d={shape.shadowPath}
          fill={innerFill}
          opacity={status === "normal" && !isExtraTooth ? 0.35 : 0.9}
        />
      )}

      {/* เส้นร่องฟันด้านบดเคี้ยว */}
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
}

