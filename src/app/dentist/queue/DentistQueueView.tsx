import React from "react";
import { Appointment, DentistInfo } from "@/app/shared/data";
import { useTreatmentQueue } from "./useTreatmentQueue";
import { ToothActionModal } from "./odontogram";
import { MedicineModal, QueueHeader, QueueItem } from "./treatment";

export default function DentistQueueView({
  doctor,
  appointments: initialAppointments,
}: {
  doctor: DentistInfo | null;
  appointments?: Appointment[];
}) {
  const {
    appointments,
    services,
    products,
    expanded,
    setExpanded,
    recording,
    setRecording,
    isSubmitting,
    form,
    setForm,
    toothData,
    setToothData,
    extraTeeth,
    setExtraTeeth,
    isChild,
    setIsChild,
    timeFilter,
    setTimeFilter,
    selectedToothForAction,
    setSelectedToothForAction,
    showMedModal,
    setShowMedModal,
    patientHistoryRecords,
    medList,
    setMedList,
    todayString,
    formattedDate,
    filteredAppts,
    incrementService,
    incrementMedicine,
    decrementMedicine,
    onUpdateAppt,
    handleStartRecording,
    saveDraftTreatment,
    submitTreatment,
    handleToothClick,
    handleSaveToothManager,
    addMed,
    removeMed,
    applyMedsToNotes,
  } = useTreatmentQueue(doctor, initialAppointments);

  return (
    <div>
      {/* หน้าต่างเลือกสั่งยา */}
      <MedicineModal
        isOpen={showMedModal !== null}
        medList={medList}
        onClose={() => {
          setShowMedModal(null);
          setMedList([]);
        }}
        onAddMed={addMed}
        onRemoveMed={removeMed}
        onApply={applyMedsToNotes}
      />

      {/* หน้าต่างจัดการสภาพฟันเฉพาะซี่ */}
      {selectedToothForAction && (
        <ToothActionModal
          tooth={selectedToothForAction}
          toothLabel={
            typeof selectedToothForAction === "string"
              ? extraTeeth.find(x => x.id === selectedToothForAction)?.label || `ฟันพิเศษ ${selectedToothForAction}`
              : `ซี่ ${selectedToothForAction}`
          }
          currentStatus={toothData[selectedToothForAction]}
          services={services}
          onClose={() => setSelectedToothForAction(null)}
          onRemoveExtraTooth={
            typeof selectedToothForAction === "string"
              ? () => {
                  setExtraTeeth(prev => prev.filter(x => x.id !== selectedToothForAction));
                  setToothData(prev => {
                    const next = { ...prev };
                    delete next[selectedToothForAction];
                    return next;
                  });
                  setSelectedToothForAction(null);
                }
              : extraTeeth.some(x => x.id === `${selectedToothForAction}S` || (selectedToothForAction === 11 && x.id === "mesiodens"))
              ? () => {
                  const targetIds = [`${selectedToothForAction}S`, ...(selectedToothForAction === 11 ? ["mesiodens"] : [])];
                  setExtraTeeth(prev => prev.filter(x => !targetIds.includes(x.id)));
                  setToothData(prev => {
                    const next = { ...prev };
                    targetIds.forEach(id => delete next[id]);
                    return next;
                  });
                  setSelectedToothForAction(null);
                }
              : undefined
          }
          onAddExtraTooth={(newTooth) => {
            setExtraTeeth(prev => [...prev.filter(x => x.id !== newTooth.id), newTooth]);
            setForm(f => ({
              ...f,
              notes: f.notes ? `${f.notes}\n- ตรวจพบฟันเกิน/ฟันซ้อน: ${newTooth.label}` : `- ตรวจพบฟันเกิน/ฟันซ้อน: ${newTooth.label}`
            }));
            setSelectedToothForAction(null);
          }}
          hasExtraTooth={extraTeeth.some(x => x.id === `${selectedToothForAction}S` || (selectedToothForAction === 11 && x.id === "mesiodens"))}
          initialNotes={
            form.notes
              ? form.notes
                  .split('\n')
                  .find(l => l.includes(`ซี่ ${selectedToothForAction}`) || l.includes(` ${selectedToothForAction}:`))
                  ?.replace(/^-\s*(?:พบปัญหา|พบผุ\/มีปัญหา)\s*[^:]*:\s*/, '')
                  .replace(/^-\s*/, '')
              : ""
          }
          onAction={(status, service, notes) => {
            setToothData(prev => {
              if (status === "normal") {
                const next = { ...prev };
                delete next[selectedToothForAction];
                return next;
              }
              return { ...prev, [selectedToothForAction]: status };
            });
            if (service) {
              incrementService(service, selectedToothForAction);
            }
            if (notes) {
              setForm(f => ({ ...f, notes: f.notes ? `${f.notes}\n- ${notes}` : `- ${notes}` }));
            }
            setSelectedToothForAction(null);
          }}
        />
      )}

      {/* แถบหัวเรื่องและตัวกรอง */}
      <QueueHeader
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        formattedDate={formattedDate}
        count={filteredAppts.length}
      />

      {/* รายการคิว */}
      <div className="space-y-4">
        {filteredAppts.map(a => (
          <QueueItem
            key={a.id}
            appointment={a}
            todayString={todayString}
            isExpanded={expanded === a.id}
            isRecording={recording === a.id}
            allAppointments={appointments}
            services={services}
            products={products}
            toothData={toothData}
            extraTeeth={extraTeeth}
            isChild={isChild}
            setIsChild={setIsChild}
            patientHistoryRecords={patientHistoryRecords}
            form={form}
            setForm={setForm}
            isSubmitting={isSubmitting}
            onToggleExpand={() => setExpanded(expanded === a.id ? null : a.id)}
            onStartRecording={handleStartRecording}
            onUpdateAppt={onUpdateAppt}
            onToothClick={handleToothClick}
            onAddExtraTooth={(newTooth) => {
              setExtraTeeth(prev => {
                if (prev.find(x => x.id === newTooth.id)) return prev;
                return [...prev, newTooth];
              });
            }}
            onRemoveExtraTooth={(id) => {
              setExtraTeeth(prev => prev.filter(x => x.id !== id));
              setToothData(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
              });
            }}
            onSaveToothManager={handleSaveToothManager}
            incrementService={incrementService}
            incrementMedicine={incrementMedicine}
            decrementMedicine={decrementMedicine}
            onSaveDraft={saveDraftTreatment}
            onSubmitTreatment={submitTreatment}
            onCloseRecording={() => setRecording(null)}
          />
        ))}
      </div>
    </div>
  );
}
