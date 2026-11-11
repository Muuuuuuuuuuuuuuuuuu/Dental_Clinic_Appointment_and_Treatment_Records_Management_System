import React from "react";
import { UserCheck, Play, AlertTriangle } from "lucide-react";
import { Appointment, STATUS_COLORS, StaffView, hasHealthAlert } from "@/app/shared/data";

interface TodayKanbanBoardProps {
  appts: Appointment[];
  onUpdate: (id: number, s: Partial<Appointment>) => void;
  setView?: (v: StaffView) => void;
}

/**
 * 🚦 [QUEUE COMPONENT] กระดานคันบัง 3 คอลัมน์สำหรับจัดการคิววันนี้
 * 1. รอเช็คอิน (ปุ่มกดเช็คอิน)
 * 2. เช็คอินแล้ว / ระหว่างรักษา
 * 3. รอชำระเงิน (คลิกเพื่อสลับไปหน้าคิดเงิน)
 */
export default function TodayKanbanBoard({
  appts,
  onUpdate,
  setView,
}: TodayKanbanBoardProps) {
  const toCheckIn = appts.filter(
    (a) => a.status === "ยืนยันการจอง" || a.status === "รอการยืนยัน"
  );
  const inQueue = appts.filter(
    (a) => a.status === "เช็คอินเรียบร้อย" || a.status === "กำลังรักษา"
  );
  const toPay = appts.filter((a) => a.status === "รอชำระเงิน");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* คอลัมน์ที่ 1: รอเช็คอิน */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>
            รอเช็คอิน ({toCheckIn.length})
          </h2>
        </div>

        {toCheckIn.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-gray-200">
            <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>
              ไม่มีคนไข้รอเช็คอิน
            </p>
          </div>
        ) : (
          toCheckIn.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl bg-white p-4 shadow-xs border border-gray-100 group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold" style={{ color: "#1D6FA4" }}>
                  {a.time} น.
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}
                >
                  ยืนยันแล้ว
                </span>
              </div>
              <p className="font-bold mb-1" style={{ color: "#1A365D" }}>
                {a.patientName}
              </p>
              <p className="text-xs mb-3" style={{ color: "#4A6080" }}>
                {a.service} • ทพ. {a.doctorName}
              </p>

              {hasHealthAlert(a.allergies, a.conditions) && (
                <div className="flex items-center gap-1 mb-3 bg-orange-50 p-1.5 rounded-lg">
                  <AlertTriangle size={11} style={{ color: "#E65100" }} />
                  <span className="text-[10px] font-medium" style={{ color: "#E65100" }}>
                    {hasHealthAlert(undefined, a.conditions) && a.conditions}
                    {hasHealthAlert(undefined, a.conditions) &&
                      hasHealthAlert(a.allergies) &&
                      " • "}
                    {hasHealthAlert(a.allergies) && `แพ้: ${a.allergies}`}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => onUpdate(a.id, { status: "เช็คอินเรียบร้อย" })}
                className="w-full flex justify-center items-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:bg-blue-600 cursor-pointer"
                style={{ backgroundColor: "#3B82F6" }}
              >
                <UserCheck size={16} /> กดเช็คอิน (คนไข้มาถึงแล้ว)
              </button>
            </div>
          ))
        )}
      </div>

      {/* คอลัมน์ที่ 2: รอเข้าพบ / กำลังรักษา */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>
            เช็คอินแล้ว / ระหว่างรักษา ({inQueue.length})
          </h2>
        </div>

        {inQueue.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-gray-200">
            <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>
              ไม่มีคิวรอ/กำลังรักษา
            </p>
          </div>
        ) : (
          inQueue.map((a) => {
            const colorObj = STATUS_COLORS[a.status] || {
              bg: "#F0F4F8",
              text: "#4A6080",
              dot: "#ccc",
            };

            return (
              <div
                key={a.id}
                className="rounded-2xl bg-white p-4 shadow-xs border border-gray-100 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold" style={{ color: "#1A365D" }}>
                    {a.time} น.
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ backgroundColor: colorObj.bg, color: colorObj.text }}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="font-bold mb-1" style={{ color: "#1A365D" }}>
                  {a.patientName}
                </p>
                <p className="text-xs mb-3" style={{ color: "#4A6080" }}>
                  แพทย์: ทพ. {a.doctorName}
                </p>
                {a.status === "เช็คอินเรียบร้อย" && (
                  <button
                    type="button"
                    onClick={() => onUpdate(a.id, { status: "กำลังรักษา" })}
                    className="w-full flex justify-center items-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-fuchsia-50 cursor-pointer"
                    style={{ color: "#A21CAF", border: "1px dashed #A21CAF" }}
                  >
                    รอแพทย์เรียก
                  </button>
                )}
                {a.status === "กำลังรักษา" && (
                  <div
                    className="w-full flex justify-center items-center gap-2 py-2 rounded-xl text-xs font-bold"
                    style={{
                      backgroundColor: "#F3E8FF",
                      color: "#7C3AED",
                      border: "1px solid #D8B4FE",
                    }}
                  >
                    <Play size={14} fill="currentColor" /> แพทย์เรียกเข้าพบแล้ว
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* คอลัมน์ที่ 3: รอชำระเงิน */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>
            รอชำระเงิน ({toPay.length})
          </h2>
        </div>

        {toPay.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white border border-dashed border-gray-200">
            <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>
              ไม่มีคิวรอชำระเงิน
            </p>
          </div>
        ) : (
          toPay.map((a) => (
            <div
              key={a.id}
              onClick={() => setView && setView("payment")}
              className="rounded-2xl bg-white p-4 shadow-xs border border-gray-100 cursor-pointer hover:shadow-md hover:border-teal-200 transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold" style={{ color: "#1A365D" }}>
                  {a.time} น.
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#F0FDFA", color: "#0F766E" }}
                >
                  {a.status}
                </span>
              </div>
              <p className="font-bold mb-1" style={{ color: "#1A365D" }}>
                {a.patientName}
              </p>
              <div className="mt-3 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                <p className="text-xs text-gray-500 mb-0.5">ยอดประเมินเบื้องต้น</p>
                <p className="text-lg font-bold text-green-600">
                  ฿{a.cost?.toLocaleString() || "1,200"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
