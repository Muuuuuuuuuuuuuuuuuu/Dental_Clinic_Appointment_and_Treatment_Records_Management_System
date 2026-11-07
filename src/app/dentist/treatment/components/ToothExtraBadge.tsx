import React from "react";
import { SupernumeraryTooth, getExtraToothLocation } from "../ToothGeometry";
import { ToothStatus } from "../utils/toothHistory";

interface ToothExtraBadgeProps {
  extra: SupernumeraryTooth;
  pos: { x: number; y: number };
  status: ToothStatus;
  currentMode: "treatment" | "patient";
  unmirrorX?: boolean;
  unmirrorY?: boolean;
  onToothClick?: (tooth: number | string, status?: ToothStatus) => void;
  onSelectForInspection: (tooth: string) => void;
}

export default function ToothExtraBadge({
  extra,
  pos,
  status = "normal",
  currentMode,
  unmirrorX,
  unmirrorY,
  onToothClick,
  onSelectForInspection,
}: ToothExtraBadgeProps) {
  let bg = "#D97706";
  let borderColor = "#FEF3C7";
  if (status === "red") {
    bg = "#E11D48";
    borderColor = "#FFE4E6";
  } else if (status === "blue") {
    bg = "#2563EB";
    borderColor = "#DBEAFE";
  } else if (status === "cross") {
    bg = "#64748B";
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
          onSelectForInspection(String(extra.id));
        } else if (onToothClick) {
          onToothClick(extra.id, undefined);
        }
      }}
    >
      <title>{tooltipText}</title>

      {/* พื้นที่รับเมาส์แบบโปร่งใส */}
      <rect
        x="-18"
        y="-13"
        width="36"
        height="26"
        fill="transparent"
      />

      <g transform={scaleTransform}>
        {/* พื้นหลังป้ายฟันเกิน */}
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
        {/* ข้อความ "+S" บนป้ายฟันเกิน */}
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
}

