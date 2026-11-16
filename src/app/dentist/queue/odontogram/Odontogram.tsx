import React, { useState } from "react";
import { SupernumeraryTooth } from "./ToothGeometry";
import { ToothStatus, ToothHistoryItem, getToothHistory, isValidToothId } from "./toothHistory";
import OdontogramLegend from "./OdontogramLegend";
import OdontogramChart from "./OdontogramChart";
import ToothInspectionModal from "./ToothInspectionModal";

export type { ToothStatus, ToothHistoryItem };
export { getToothHistory };
export interface OdontogramProps {
  toothData: Record<number | string, ToothStatus>;
  onToothClick?: (tooth: number | string, status?: ToothStatus) => void;
  isChild: boolean;
  setIsChild?: (val: boolean) => void;
  readonly?: boolean;
  extraTeeth?: SupernumeraryTooth[];
  historyRecords?: any[];
  patientName?: string;
  onSelectHistoricalTeeth?: (
    teeth: Record<string, ToothStatus>,
    extras: SupernumeraryTooth[],
    date: string,
    rec?: string,
    recordId?: number
  ) => void;
  activeRecordId?: number | null;
  onResetToLatest?: () => void;
}

export default function Odontogram({
  toothData,
  isChild,
  setIsChild,
  readonly = false,
  onToothClick,
  extraTeeth = [],
  historyRecords = [],
  patientName,
}: OdontogramProps) {
  const currentMode = readonly ? "patient" : "treatment";

  const [selectedToothForInspection, setSelectedToothForInspection] = useState<string | null>(null);

  const activeExtraTeeth = extraTeeth && extraTeeth.length > 0 ? extraTeeth : [];

  // Summary counts for patient view mode (นับเฉพาะซี่ฟันแท้/ฟันน้ำนม/ฟันเกินที่ถูกต้องเท่านั้น)
  const cariesCount = Object.entries(toothData).filter(([k, s]) => s === 'red' && isValidToothId(k)).length;
  const filledCount = Object.entries(toothData).filter(([k, s]) => s === 'blue' && isValidToothId(k)).length;
  const missingCount = Object.entries(toothData).filter(([k, s]) => s === 'cross' && isValidToothId(k)).length;
  const extraCount = activeExtraTeeth.length;

  return (
    <div className="bg-white p-4 rounded-2xl" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
      {/* Header and Legend */}
      <OdontogramLegend
        currentMode={currentMode}
        patientName={patientName}
        readonly={readonly}
        isChild={isChild}
        setIsChild={setIsChild}
        cariesCount={cariesCount}
        filledCount={filledCount}
        missingCount={missingCount}
        extraCount={extraCount}
      />

      {/* Dark SVG Odontogram Canvas */}
      <OdontogramChart
        toothData={toothData}
        isChild={isChild}
        activeExtraTeeth={activeExtraTeeth}
        currentMode={currentMode}
        historyRecords={historyRecords}
        onToothClick={onToothClick}
        onSelectForInspection={setSelectedToothForInspection}
      />

      {/* Patient Detail Modal for clicked tooth */}
      <ToothInspectionModal
        selectedTooth={selectedToothForInspection}
        onClose={() => setSelectedToothForInspection(null)}
        toothData={toothData}
        activeExtraTeeth={activeExtraTeeth}
        historyRecords={historyRecords}
        readonly={readonly}
        onStartTreatment={(tooth) => {
          if (onToothClick) {
            onToothClick(tooth, undefined);
          }
        }}
      />
    </div>
  );
}
