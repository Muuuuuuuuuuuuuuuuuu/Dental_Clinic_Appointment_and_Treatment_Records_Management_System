import React from "react";
import Odontogram, { ToothStatus } from "@/app/dentist/treatment/Odontogram";
import { SupernumeraryTooth } from "@/app/dentist/treatment/ToothGeometry";

interface OdontogramViewProps {
  mergedToothData: Record<number | string, ToothStatus>;
  extraTeeth: SupernumeraryTooth[];
  isChild: boolean;
  setIsChild: (isChild: boolean) => void;
  historyRecords: any[];
  patientName?: string;
  onToothClick: (tooth: string | number) => void;
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

/**
 * 🦷 [RECORD COMPONENT] แผนผังฟัน 32 ซี่ และฟันเกิน แบบโต้ตอบได้
 */
export default function OdontogramView({
  mergedToothData,
  extraTeeth,
  isChild,
  setIsChild,
  historyRecords,
  patientName,
  onToothClick,
  onSelectHistoricalTeeth,
  activeRecordId,
  onResetToLatest,
}: OdontogramViewProps) {
  return (
    <div className="flex-grow">
      <Odontogram
        toothData={mergedToothData}
        extraTeeth={extraTeeth}
        readonly={true}
        isChild={isChild}
        setIsChild={setIsChild}
        historyRecords={historyRecords}
        patientName={patientName}
        onToothClick={onToothClick}
        onSelectHistoricalTeeth={onSelectHistoricalTeeth}
        activeRecordId={activeRecordId}
        onResetToLatest={onResetToLatest}
      />
    </div>
  );
}

