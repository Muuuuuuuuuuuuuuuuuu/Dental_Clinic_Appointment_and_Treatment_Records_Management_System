import { useDentalRecord } from "./hooks/useDentalRecord";
import {
  DentalRecordTitleBar,
  OdontogramView,
  ToothDetailModal,
} from "./components";

export interface DentalRecordViewProps {
  onBack?: () => void;
  onBookAppointment?: () => void;
  toothData?: Record<number | string, any>;
  lastUpdated?: string;
  advice?: string;
  user?: any;
}

/**
 * Patient Dental Record Module - Flat & Clean Architecture
 */
export default function PatientDentalRecordView({
  onBack,
  toothData = {},
  lastUpdated = "-",
  advice = "",
  user,
}: DentalRecordViewProps) {
  const {
    isChild,
    setIsChild,
    localLastUpdated,
    historyRecords,
    clickedTooth,
    setClickedTooth,
    mergedToothData,
    extraTeeth,
    handleSelectHistoricalTeeth,
    activeRecordId,
    handleResetToLatest,
  } = useDentalRecord({
    toothData,
    user,
    lastUpdated,
    advice,
  });

  return (
    <div>
      {/* 1. ส่วนหัว (Header) */}
      <DentalRecordTitleBar onBack={onBack} lastUpdated={localLastUpdated} />

      {/* 2. ส่วนเนื้อหา: แผนผังฟัน (แสดงเต็มตา กึ่งกลางจอ พร้อมกล่องประวัติในตัว) */}
      <div className="space-y-8">
        <div className="w-full">
          <OdontogramView
            mergedToothData={mergedToothData}
            extraTeeth={extraTeeth}
            isChild={isChild}
            setIsChild={setIsChild}
            historyRecords={historyRecords}
            patientName={user?.name}
            onToothClick={(tooth) => setClickedTooth(String(tooth))}
            onSelectHistoricalTeeth={handleSelectHistoricalTeeth}
            activeRecordId={activeRecordId}
            onResetToLatest={handleResetToLatest}
          />
        </div>
      </div>

      {/* 3. หน้าต่างป็อปอัปแสดงรายละเอียดซี่ฟันเดี่ยว */}
      <ToothDetailModal
        clickedTooth={clickedTooth}
        onClose={() => setClickedTooth(null)}
        mergedToothData={mergedToothData}
        extraTeeth={extraTeeth}
        isChild={isChild}
        historyRecords={historyRecords}
      />
    </div>
  );
}
