import React, { useState } from "react";
import { SupernumeraryTooth } from "./ToothGeometry";
import { ToothStatus, ToothHistoryItem, getToothHistory } from "./toothHistory";
import OdontogramLegend from "./OdontogramLegend";
import OdontogramChart from "./OdontogramChart";
import ToothInspectionModal from "./ToothInspectionModal";
import PatientTimelineAccordion from "./PatientTimelineAccordion";

// Re-export types and utilities for full backward compatibility across the app
export type { ToothStatus, ToothHistoryItem };
export { getToothHistory };

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
  viewMode,
  onViewModeChange,
  historyRecords = [],
  patientName,
  onSelectHistoricalTeeth,
  activeRecordId,
  onResetToLatest,
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

  const activeExtraTeeth = extraTeeth && extraTeeth.length > 0 ? extraTeeth : [];

  // Summary counts for patient view mode
  const cariesCount = Object.entries(toothData).filter(([k, s]) => s === 'red' && k !== 'extraTeeth' && k !== 'wholeMouth').length;
  const filledCount = Object.entries(toothData).filter(([k, s]) => s === 'blue' && k !== 'extraTeeth' && k !== 'wholeMouth').length;
  const missingCount = Object.entries(toothData).filter(([k, s]) => s === 'cross' && k !== 'extraTeeth' && k !== 'wholeMouth').length;
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
        historyCount={historyRecords.length}
        showFullTimeline={showFullTimeline}
        onToggleFullTimeline={() => setShowFullTimeline(!showFullTimeline)}
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
          handleModeChange("treatment");
          if (onToothClick) {
            onToothClick(tooth, undefined);
          }
        }}
      />

      {/* Full Patient History Accordion */}
      <PatientTimelineAccordion
        isOpen={currentMode === "patient" && showFullTimeline}
        onClose={() => setShowFullTimeline(false)}
        historyRecords={historyRecords}
        onSelectHistoricalTeeth={onSelectHistoricalTeeth}
        activeRecordId={activeRecordId}
        onResetToLatest={onResetToLatest}
      />
    </div>
  );
}
