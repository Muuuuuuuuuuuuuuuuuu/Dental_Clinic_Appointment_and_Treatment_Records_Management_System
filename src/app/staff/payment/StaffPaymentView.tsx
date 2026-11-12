import { Appointment } from "@/app/shared/data";
import { usePaymentData } from "./hooks/usePaymentData";
import {
  PaymentQueueList,
  PaymentBillingPanel,
  ReceiptModal,
  FollowUpModal,
} from "./components";

interface PaymentProps {
  appointments?: Appointment[];
  onUpdateAppt?: (id: number, updates: Partial<Appointment>) => void;
  initialApptId?: number | null;
}

/**
 * 💳 [STAFF PAYMENT VIEW]
 * ระบบชำระเงินและออกใบเสร็จ (Flat & Clean Architecture)
 */
export default function StaffPaymentView({
  appointments: initialAppointments,
  onUpdateAppt,
  initialApptId,
}: PaymentProps) {
  const {
    payable,
    paid,
    selectedApptId,
    setSelectedApptId,
    selectedAppt,
    discount,
    setDiscount,
    paymentMethod,
    setPaymentMethod,
    servicesData,
    adjustedPrices,
    adjustedQuantities,
    extraProducts,
    setExtraProducts,
    allProducts,
    showProductSelect,
    setShowProductSelect,
    totalBaseCost,
    netTotal,
    handleQtyChange,
    handlePriceChange,
    prepareReceipt,
    receiptData,
    setReceiptData,
    confirmAndCompletePayment,
    followUp,
    setFollowUp,
    openFollowUpModal,
    isBound,
    setIsBound,
    followUpDate,
    setFollowUpDate,
    followUpTime,
    setFollowUpTime,
    isSubmitting,
    timeSlots,
    isLoadingSlots,
    handleCreateFollowUp,
    servicesList,
    handleFollowUpServiceChange,
  } = usePaymentData(initialAppointments, onUpdateAppt, initialApptId);

  return (
    <>
      {/* 1. เนื้อหาหลักแบ่ง 2 ฝั่ง: คิวรอชำระ (ซ้าย) + แผงคิดเงิน (ขวา) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 xl:col-span-5">
          <PaymentQueueList
            payable={payable}
            paid={paid}
            selectedApptId={selectedApptId}
            onSelectAppt={setSelectedApptId}
          />
        </div>

        <div className="lg:col-span-7 xl:col-span-7">
          <PaymentBillingPanel
            selectedAppt={selectedAppt}
            onCancel={() => setSelectedApptId(null)}
            servicesData={servicesData}
            adjustedPrices={adjustedPrices}
            adjustedQuantities={adjustedQuantities}
            onPriceChange={handlePriceChange}
            onQtyChange={handleQtyChange}
            extraProducts={extraProducts}
            setExtraProducts={setExtraProducts}
            allProducts={allProducts}
            showProductSelect={showProductSelect}
            setShowProductSelect={setShowProductSelect}
            totalBaseCost={totalBaseCost}
            discount={discount}
            setDiscount={setDiscount}
            netTotal={netTotal}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onPrepareReceipt={prepareReceipt}
          />
        </div>
      </div>

      {/* 2. ป๊อปอัปใบเสร็จรับเงิน */}
      <ReceiptModal
        receiptData={receiptData}
        onClose={() => setReceiptData(null)}
        onOpenFollowUp={() => openFollowUpModal(receiptData)}
        onConfirmAndPrint={confirmAndCompletePayment}
      />

      {/* 3. ป๊อปอัปสร้างนัดหมายติดตามผล */}
      <FollowUpModal
        followUp={followUp}
        onClose={() => setFollowUp(null)}
        isBound={isBound}
        setIsBound={setIsBound}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        followUpTime={followUpTime}
        setFollowUpTime={setFollowUpTime}
        isLoadingSlots={isLoadingSlots}
        timeSlots={timeSlots}
        isSubmitting={isSubmitting}
        onSubmit={handleCreateFollowUp}
        servicesList={servicesList}
        onServiceChange={handleFollowUpServiceChange}
      />
    </>
  );
}
