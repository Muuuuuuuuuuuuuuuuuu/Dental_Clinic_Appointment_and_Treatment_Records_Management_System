import { AlertCircle, UserPlus, ChevronRight } from "lucide-react";
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
    unassignedAppts,
    handleClaimAppointment,
    incrementService,
    incrementMedicine,
    decrementMedicine,
    onUpdateAppt,
    handleStartRecording,
    saveDraftTreatment,
    submitTreatment,
    handleToothClick,
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

      {/* แถบแจ้งเตือนสีส้ม: คิวคนไข้ที่เช็คอินแล้วแต่ยังไม่มีหมอรับเคส */}
      {unassignedAppts.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <AlertCircle size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  มีคนไข้เช็คอินรอตรวจ แต่ยังไม่ระบุแพทย์
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-200 text-amber-900 font-semibold">
                    {unassignedAppts.length} คิว
                  </span>
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  คนไข้เดินทางมาถึงคลินิกแล้ว ทันตแพทย์ที่พร้อมสามารถกดรับเคสเพื่อดึงเข้าห้องตรวจของตนเองได้ทันที
                </p>
              </div>
            </div>
          </div>

          {/* รายชื่อคนไข้ที่รอแพทย์รับเคส */}
          <div className="mt-3 divide-y divide-amber-100 bg-white/90 rounded-xl border border-amber-200/60 overflow-hidden shadow-2xs">
            {unassignedAppts.map(appt => (
              <div key={appt.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-amber-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-700 font-mono bg-amber-100/80 px-2 py-1 rounded-md shrink-0">
                    {appt.time || "ไม่ระบุเวลา"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[#1A365D] truncate">
                      {appt.patientName} <span className="text-xs font-normal text-slate-500">({appt.hn})</span>
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      บริการ: <span className="font-medium text-amber-800">{appt.service}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleClaimAppointment(appt.id)}
                  className="self-end sm:self-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <UserPlus size={14} />
                  <span>กดรับเคสนี้</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
