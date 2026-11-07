import React from "react";
import { X, CheckCircle } from "lucide-react";
import { Appointment } from "@/app/shared/data";
import { TimeSlotStatus } from "@/app/shared/supabaseApi";

interface FollowUpModalProps {
  followUp: Appointment | null;
  onClose: () => void;
  showLink: boolean;
  isBound: boolean;
  setIsBound: (val: boolean) => void;
  openTicketId: number | null;
  isOpenTicket: boolean;
  setIsOpenTicket: (val: boolean) => void;
  followUpDate: string;
  setFollowUpDate: (val: string) => void;
  followUpTime: string;
  setFollowUpTime: (val: string) => void;
  isLoadingSlots: boolean;
  timeSlots: TimeSlotStatus[];
  isSubmitting: boolean;
  onSubmit: () => void;
  onResetAndBackToReceipt: () => void;
}

/**
 * 📅 [MODAL COMPONENT] หน้าต่างสร้างนัดหมายครั้งถัดไป / ใบนัดแบบเปิด
 */
export default function FollowUpModal({
  followUp,
  onClose,
  showLink,
  isBound,
  setIsBound,
  openTicketId,
  isOpenTicket,
  setIsOpenTicket,
  followUpDate,
  setFollowUpDate,
  followUpTime,
  setFollowUpTime,
  isLoadingSlots,
  timeSlots,
  isSubmitting,
  onSubmit,
  onResetAndBackToReceipt,
}: FollowUpModalProps) {
  if (!followUp) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(26,54,93,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden relative">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "Sarabun, sans-serif", color: "#1A365D" }}
            >
              สร้างนัดหมายครั้งถัดไป
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              <X size={16} style={{ color: "#4A6080" }} />
            </button>
          </div>

          {showLink ? (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#E8FFF0", color: "#22C55E" }}
              >
                <CheckCircle size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "#1A365D" }}>
                สร้างใบนัดแบบเปิดสำเร็จ
              </h3>
              <p className="text-sm mb-6" style={{ color: "#4A6080" }}>
                ระบบได้บันทึก {isBound ? "(พร้อมตั้งเป็นหมอประจำเคส) " : ""}
                และสร้างลิงก์สำหรับเลือกวันเวลาแล้ว
              </p>
              <div className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between mb-6">
                <span className="text-xs text-gray-500 truncate mr-3">{`https://suphat.clinic/booking?openTicketId=${openTicketId}`}</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `https://suphat.clinic/booking?openTicketId=${openTicketId}`
                    );
                    alert("คัดลอกลิงก์สำเร็จ");
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#1D6FA4" }}
                >
                  คัดลอกลิงก์
                </button>
              </div>

              <button
                onClick={onResetAndBackToReceipt}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#1A365D" }}
              >
                กลับไปหน้าใบเสร็จ
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <p className="text-xs mb-1" style={{ color: "#4A6080" }}>
                  สำหรับคนไข้:
                </p>
                <p className="font-bold text-base" style={{ color: "#1A365D" }}>
                  {followUp.patientName}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {/* การผูกเคสรักษาต่อเนื่อง */}
                <label
                  className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all"
                  style={{
                    backgroundColor: isBound ? "#F0FDF4" : "white",
                    borderColor: isBound ? "#22C55E" : "#E2E8F0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isBound}
                    onChange={(e) => setIsBound(e.target.checked)}
                    className="w-4 h-4 rounded mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-bold block" style={{ color: "#1A365D" }}>
                      ตั้ง {followUp.doctorName} เป็นแพทย์ประจำเคส
                    </span>
                    <span className="text-xs text-gray-500">
                      คนไข้จะได้คิวเฉพาะวันที่หมอท่านนี้เข้าเวรเท่านั้น
                    </span>
                  </div>
                </label>

                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: "#4A6080" }}>
                    บริการที่ต้องการนัด
                  </label>
                  <input
                    value={followUp.service}
                    onChange={(e) => {
                      // Allow changing service description if needed
                    }}
                    disabled
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none border border-gray-200 bg-gray-50 text-gray-700"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <input
                      type="checkbox"
                      checked={isOpenTicket}
                      onChange={(e) => setIsOpenTicket(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-bold" style={{ color: "#1A365D" }}>
                      สร้างเป็น "ใบนัดแบบเปิด" (รอคนไข้ระบุวันทีหลัง)
                    </span>
                  </label>

                  {!isOpenTicket && (
                    <div className="grid grid-cols-1 gap-3 p-4 rounded-xl border border-gray-200 bg-white">
                      <div>
                        <label className="text-xs font-bold block mb-1" style={{ color: "#4A6080" }}>
                          วันที่นัด
                        </label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => {
                            setFollowUpDate(e.target.value);
                            setFollowUpTime("");
                          }}
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none border border-gray-200"
                          style={{ color: "#1A365D" }}
                        />
                      </div>
                      {followUpDate && (
                        <div>
                          <label className="text-xs font-bold block mb-2" style={{ color: "#4A6080" }}>
                            เวลาที่ว่าง
                          </label>
                          {isLoadingSlots ? (
                            <div className="text-xs text-center py-4 text-gray-500">
                              กำลังตรวจสอบคิวว่าง...
                            </div>
                          ) : timeSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                              {timeSlots.map((s, i) => {
                                const isAvail = s.status === "available";
                                return (
                                  <button
                                    key={i}
                                    disabled={!isAvail}
                                    onClick={() => setFollowUpTime(s.time)}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border-2 transition-all ${
                                      followUpTime === s.time
                                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                                        : !isAvail
                                        ? "border-gray-100 bg-gray-50 text-gray-400 opacity-60 cursor-not-allowed"
                                        : "border-transparent bg-gray-100 text-[#4A6080] hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                                  >
                                    {s.time}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-xs text-center py-4 text-red-500 bg-red-50 rounded-lg border border-red-100">
                              ไม่มีคิวว่างในวันนี้ หรือหมอไม่ได้เข้าเวร
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-1/3 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-sm disabled:opacity-50"
                >
                  กลับไปหน้าใบเสร็จ
                </button>

                <button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="w-2/3 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#1D6FA4,#1A365D)" }}
                >
                  {isSubmitting
                    ? "กำลังดำเนินการ..."
                    : isOpenTicket
                    ? "สร้างใบนัดแบบเปิด & รับลิงก์"
                    : "ยืนยันการนัดหมาย"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

