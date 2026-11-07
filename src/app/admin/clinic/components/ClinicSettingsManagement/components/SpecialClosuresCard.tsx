import React, { useState } from "react";
import { Pencil, Check, Trash2 } from "lucide-react";
import { SpecialClosure } from "@/app/shared/data";

interface SpecialClosuresCardProps {
  closures: SpecialClosure[];
  onAddClosure: (startDate: string, endDate: string, reason: string) => Promise<void>;
  onUpdateClosure: (id: number, newReason: string) => Promise<void>;
  onDeleteClosure: (id?: number) => Promise<void>;
}

export default function SpecialClosuresCard({
  closures,
  onAddClosure,
  onUpdateClosure,
  onDeleteClosure,
}: SpecialClosuresCardProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [editingClosure, setEditingClosure] = useState<{ id: number; reason: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!startDate || !reason.trim()) {
      setError("กรุณาระบุวันที่เริ่มต้น และสาเหตุการหยุด");
      return;
    }
    try {
      await onAddClosure(startDate, endDate || startDate, reason.trim());
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการเพิ่มวันหยุด");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex-1 flex flex-col justify-between">
      {/* ส่วนหัวการ์ด - ขนาดเท่ากับหน้าตารางเวรและการลา */}
      <div className="p-3.5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-base font-bold text-[#1A365D]">
          จัดการวันหยุดพิเศษ (Special Closures)
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          วันปิดทำการพิเศษ เช่น วันหยุดนักขัตฤกษ์ หรือวันอบรม
        </p>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between">
        {error && <div className="mb-2.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">{error}</div>}

        {/* ฟอร์มเพิ่มวันหยุดพิเศษ */}
        <form onSubmit={handleSubmit} className="mb-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-gray-600 mb-1">วันที่เริ่ม *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#1A365D]"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-gray-600 mb-1">สิ้นสุด (ไม่บังคับ)</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#1A365D]"
              />
            </div>
            <div className="sm:col-span-5 flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">สาเหตุการหยุด *</label>
                <input
                  type="text"
                  placeholder="เช่น วันขึ้นปีใหม่"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-[#1A365D]"
                />
              </div>
              <button
                type="submit"
                className="self-end px-4 py-1.5 bg-[#1A365D] hover:bg-[#122847] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                เพิ่ม
              </button>
            </div>
          </div>
        </form>

        {/* รายการวันหยุดพิเศษ - สูงสุด 10 รายการ เลื่อนดูได้ */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 flex-1">
          {closures.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center">ไม่มีวันหยุดพิเศษที่ตั้งไว้</p>
          ) : (
            closures.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-orange-50/60 border border-orange-100 text-xs"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  {editingClosure?.id === c.id ? (
                    <input
                      type="text"
                      className="text-xs px-2 py-0.5 bg-white border rounded-lg w-full max-w-xs outline-none focus:border-blue-500"
                      value={editingClosure.reason}
                      onChange={(e) => setEditingClosure({ ...editingClosure, reason: e.target.value })}
                      autoFocus
                    />
                  ) : (
                    <div className="truncate">
                      <span className="font-semibold text-gray-800">
                        {new Date(c.date).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-orange-700 ml-2 font-medium">{c.reason}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {editingClosure?.id === c.id ? (
                    <button
                      onClick={async () => {
                        await onUpdateClosure(c.id!, editingClosure.reason);
                        setEditingClosure(null);
                      }}
                      className="p-1 text-green-600 hover:bg-green-100 rounded-lg cursor-pointer"
                      title="บันทึก"
                    >
                      <Check size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingClosure({ id: c.id!, reason: c.reason })}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded-lg cursor-pointer"
                      title="แก้ไข"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteClosure(c.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                    title="ลบ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
