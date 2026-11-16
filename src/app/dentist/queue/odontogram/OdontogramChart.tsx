import React, { useRef, useState } from "react";
import {
  TOOTH_SHAPES,
  SupernumeraryTooth,
  TOOTH_BADGE_POSITIONS,
  getActiveExtrasForTooth,
} from "./ToothGeometry";
import { ToothStatus, getToothHistory, formatThaiDate } from "./toothHistory";
import ToothSvg from "./ToothSvg";
import ToothExtraBadge from "./ToothExtraBadge";

interface OdontogramChartProps {
  toothData: Record<number | string, ToothStatus>;
  isChild: boolean;
  activeExtraTeeth: SupernumeraryTooth[];
  currentMode: "treatment" | "patient";
  historyRecords: any[];
  onToothClick?: (tooth: number | string, status?: ToothStatus) => void;
  onSelectForInspection: (tooth: string) => void;
}

export default function OdontogramChart({
  toothData,
  isChild,
  activeExtraTeeth,
  currentMode,
  historyRecords,
  onToothClick,
  onSelectForInspection,
}: OdontogramChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredTooth, setHoveredTooth] = useState<{ tooth: string | number; left: number; top: number } | null>(null);

  const maxTeeth = isChild ? 5 : 8;

  const handleHoverTooth = (e: React.MouseEvent<SVGGElement>, tooth: number | string) => {
    if (chartContainerRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = chartContainerRef.current.getBoundingClientRect();
      setHoveredTooth({
        tooth,
        left: rect.left - containerRect.left + rect.width / 2,
        top: rect.top - containerRect.top,
      });
    }
  };

  const handleLeaveTooth = () => setHoveredTooth(null);

  return (
    <div ref={chartContainerRef} className="pb-4 flex justify-center relative">
      <div
        style={{
          background: "linear-gradient(160deg, #0f1729 0%, #0d2145 40%, #0a1a3a 100%)",
          boxShadow: "0 0 0 1px rgba(99,161,255,0.18), 0 4px 20px rgba(10,20,60,0.45), inset 0 1px 0 rgba(99,161,255,0.1)",
          borderRadius: "14px",
          padding: "10px 10px 6px",
        }}
      >
        <div className="relative" style={{ width: "220px" }}>
          {/* เส้นแบ่งจตุภาค */}
          <div
            className="absolute pointer-events-none z-0"
            style={{ top: "49%", left: 0, right: 0, borderTop: "1px dashed rgba(255,255,255,0.15)" }}
          >
            <div style={{ position: "absolute", top: "-14px", width: "100%", textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.06em" }}>ฟันบน (Upper)</div>
            <div style={{ position: "absolute", top: "3px", width: "100%", textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.06em" }}>ฟันล่าง (Lower)</div>
          </div>

          {/* ผังฟันรูปโค้ง SVG */}
          <div className="relative z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 409 694"
              className="w-full h-auto select-none"
              style={{ overflow: "visible" }}
            >
              {/* ขากรรไกรบน */}
              {/* จตุภาคที่ 1: ฟันบนขวา */}
              <g>
                {Array.from({ length: maxTeeth }).map((_, i) => {
                  const toothNum = isChild ? 51 + i : 11 + i;
                  const shape = TOOTH_SHAPES[i];
                  return (
                    <ToothSvg
                      key={toothNum}
                      toothNum={toothNum}
                      shape={shape}
                      status={toothData[toothNum] || "normal"}
                      currentMode={currentMode}
                      historyRecords={historyRecords}
                      onToothClick={onToothClick}
                      onSelectForInspection={onSelectForInspection}
                      onHoverTooth={handleHoverTooth}
                      onLeaveTooth={handleLeaveTooth}
                    />
                  );
                })}

                {/* ป้ายฟันเกิน (+S) จตุภาคที่ 1 */}
                {activeExtraTeeth.filter(t => t.quadrant === 1 && t.id !== "mesiodens" && !t.id.startsWith("11S")).map(tooth => {
                  const toothInQuad = (parseInt(tooth.id.replace(/\D/g, ''), 10) % 10) || (tooth.shapeIndex + 1);
                  const idx = Math.max(0, Math.min(7, toothInQuad - 1));
                  const pos = TOOTH_BADGE_POSITIONS[idx] || { x: 88, y: 32 };
                  return (
                    <ToothExtraBadge
                      key={`badge-${tooth.id}`}
                      extra={tooth}
                      pos={pos}
                      status={toothData[tooth.id] || "normal"}
                      currentMode={currentMode}
                      onToothClick={onToothClick}
                      onSelectForInspection={onSelectForInspection}
                    />
                  );
                })}
              </g>

              {/* จตุภาคที่ 2: ฟันบนซ้าย */}
              <g transform="scale(-1, 1) translate(-409, 0)">
                {Array.from({ length: maxTeeth }).map((_, i) => {
                  const toothNum = isChild ? 61 + i : 21 + i;
                  const shape = TOOTH_SHAPES[i];
                  return (
                    <ToothSvg
                      key={toothNum}
                      toothNum={toothNum}
                      shape={shape}
                      status={toothData[toothNum] || "normal"}
                      currentMode={currentMode}
                      historyRecords={historyRecords}
                      onToothClick={onToothClick}
                      onSelectForInspection={onSelectForInspection}
                      onHoverTooth={handleHoverTooth}
                      onLeaveTooth={handleLeaveTooth}
                    />
                  );
                })}

                {/* ป้ายฟันเกิน (+S) จตุภาคที่ 2 */}
                {activeExtraTeeth.filter(t => t.quadrant === 2).map(tooth => {
                  const toothInQuad = (parseInt(tooth.id.replace(/\D/g, ''), 10) % 10) || (tooth.shapeIndex + 1);
                  const idx = Math.max(0, Math.min(7, toothInQuad - 1));
                  const pos = TOOTH_BADGE_POSITIONS[idx] || { x: 88, y: 32 };
                  return (
                    <ToothExtraBadge
                      key={`badge-${tooth.id}`}
                      extra={tooth}
                      pos={pos}
                      status={toothData[tooth.id] || "normal"}
                      currentMode={currentMode}
                      unmirrorX
                      onToothClick={onToothClick}
                      onSelectForInspection={onSelectForInspection}
                    />
                  );
                })}
              </g>

              {/* ป้ายฟันเกินกึ่งกลาง (Mesiodens / 11S) */}
              {(() => {
                const mesioTeeth = getActiveExtrasForTooth(11, activeExtraTeeth);
                if (mesioTeeth.length === 0) return null;
                return mesioTeeth.map((mesio, mIdx) => {
                  const offset = (mIdx - (mesioTeeth.length - 1) / 2) * 26;
                  return (
                    <React.Fragment key={mesio.id}>
                      <ToothExtraBadge
                        extra={mesio}
                        pos={{ x: 204.5 + offset, y: -4 }}
                        status={toothData[mesio.id] || "normal"}
                        currentMode={currentMode}
                        onToothClick={onToothClick}
                        onSelectForInspection={onSelectForInspection}
                      />
                    </React.Fragment>
                  );
                });
              })()}

              {/* ขากรรไกรล่าง */}
              {/* จตุภาคที่ 4: ฟันล่างขวา */}
              <g transform="scale(1, -1) translate(0, -694)">
                {Array.from({ length: maxTeeth }).map((_, i) => {
                  const toothNum = isChild ? 81 + i : 41 + i;
                  const shape = TOOTH_SHAPES[i];
                  return (
                    <ToothSvg
                      key={toothNum}
                      toothNum={toothNum}
                      shape={shape}
                      status={toothData[toothNum] || "normal"}
                      currentMode={currentMode}
                      historyRecords={historyRecords}
                      onToothClick={onToothClick}
                      onSelectForInspection={onSelectForInspection}
                      onHoverTooth={handleHoverTooth}
                      onLeaveTooth={handleLeaveTooth}
                    />
                  );
                })}

                {/* ป้ายฟันเกิน (+S) จตุภาคที่ 4 */}
                {activeExtraTeeth.filter(t => t.quadrant === 4).map(tooth => {
                  const toothInQuad = (parseInt(tooth.id.replace(/\D/g, ''), 10) % 10) || (tooth.shapeIndex + 1);
                  const idx = Math.max(0, Math.min(7, toothInQuad - 1));
                  const pos = TOOTH_BADGE_POSITIONS[idx] || { x: 88, y: 32 };
                  return (
                    <ToothExtraBadge
                      key={`badge-${tooth.id}`}
                      extra={tooth}
                      pos={pos}
                      status={toothData[tooth.id] || "normal"}
                      currentMode={currentMode}
                      unmirrorY
                      onToothClick={onToothClick}
                      onSelectForInspection={onSelectForInspection}
                    />
                  );
                })}
              </g>

              {/* จตุภาคที่ 3: ฟันล่างซ้าย */}
              <g transform="scale(-1, -1) translate(-409, -694)">
                {Array.from({ length: maxTeeth }).map((_, i) => {
                  const toothNum = isChild ? 71 + i : 31 + i;
                  const shape = TOOTH_SHAPES[i];
                  return (
                    <ToothSvg
                      key={toothNum}
                      toothNum={toothNum}
                      shape={shape}
                      status={toothData[toothNum] || "normal"}
                      currentMode={currentMode}
                      historyRecords={historyRecords}
                      onToothClick={onToothClick}
                      onSelectForInspection={onSelectForInspection}
                      onHoverTooth={handleHoverTooth}
                      onLeaveTooth={handleLeaveTooth}
                    />
                  );
                })}

                {/* ป้ายฟันเกิน (+S) จตุภาคที่ 3 */}
                {activeExtraTeeth.filter(t => t.quadrant === 3).map(tooth => {
                  const toothInQuad = (parseInt(tooth.id.replace(/\D/g, ''), 10) % 10) || (tooth.shapeIndex + 1);
                  const idx = Math.max(0, Math.min(7, toothInQuad - 1));
                  const pos = TOOTH_BADGE_POSITIONS[idx] || { x: 88, y: 32 };
                  return (
                    <ToothExtraBadge
                      key={`badge-${tooth.id}`}
                      extra={tooth}
                      pos={pos}
                      status={toothData[tooth.id] || "normal"}
                      currentMode={currentMode}
                      unmirrorX
                      unmirrorY
                      onToothClick={onToothClick}
                      onSelectForInspection={onSelectForInspection}
                    />
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* กล่องข้อความแสดงประวัติเมื่อชี้เมาส์ */}
      {hoveredTooth && (() => {
        const historyItems = getToothHistory(hoveredTooth.tooth, historyRecords);
        const status = toothData[hoveredTooth.tooth];
        const fallbackStatusText =
          status === "blue"
            ? "รักษาแล้ว"
            : status === "red"
              ? "พบฟันผุ / มีปัญหา"
              : status === "cross"
                ? "ถอน / สูญเสียฟัน"
                : "";

        return (
          <div
            className="pointer-events-none z-50 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg min-w-[160px] max-w-[240px]"
            style={{
              position: "absolute",
              left: `${hoveredTooth.left}px`,
              top: `${hoveredTooth.top - 8}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="font-semibold border-b border-slate-600 pb-1 mb-1">
              ซี่ {hoveredTooth.tooth}
            </div>
            {historyItems.length > 0 ? (
              <div className="space-y-1.5">
                {historyItems.map((item, idx) => (
                  <div key={item.id || idx} className={idx > 0 ? "pt-1 border-t border-slate-700" : ""}>
                    <div>การรักษา: {item.services.join(", ")}</div>
                    {item.date && item.date !== "-" && (
                      <div className="text-slate-300">วันที่: {formatThaiDate(item.date)}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>การรักษา: {fallbackStatusText}</div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

