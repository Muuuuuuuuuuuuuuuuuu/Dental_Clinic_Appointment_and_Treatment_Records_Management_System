import { X } from "lucide-react";

interface ActualDayDetailModalProps {
  selectedDayInfo: { dateObj: Date; dateStr: string } | null;
  onClose: () => void;
  getDailyData: (dateObj: Date) => any;
  filterRole: "all" | "dentist" | "staff";
}

/**
 * 🪟 [ACTUAL DAY DETAIL MODAL]
 * ป๊อปอัปดูรายชื่อผู้เข้าเวรและผู้ลารายวัน (เปิดเมื่อคลิกวันที่ใน ActualCalendarCard)
 */
export default function ActualDayDetailModal({
  selectedDayInfo,
  onClose,
  getDailyData,
  filterRole,
}: ActualDayDetailModalProps) {
  if (!selectedDayInfo) return null;

  const data = getDailyData(selectedDayInfo.dateObj);
  const displayWorking = data.working.filter(
    (p: any) => filterRole === "all" || p.type === filterRole
  );
  const displayLeave = data.onLeave.filter(
    (p: any) => filterRole === "all" || p.type === filterRole
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* หัวหน้าต่าง */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-base font-bold text-[#1A365D]">
            รายชื่อบุคลากรประจำวันที่{" "}
            {selectedDayInfo.dateObj.toLocaleDateString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* เนื้อหา */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {data.isClosed ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center font-bold">
              🚫 วันหยุดคลินิก: {data.isClosed.reason}
            </div>
          ) : (
            <>
              {/* รายชื่อผู้เข้าเวร */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  ผู้ปฏิบัติงานจริง ({displayWorking.length} คน)
                </h4>
                {displayWorking.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">ไม่มีผู้เข้าเวรในวันนี้</p>
                ) : (
                  <div className="space-y-2">
                    {displayWorking.map((p: any) => (
                      <div
                        key={`${p.type}-${p.id}`}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{p.name}</p>
                            <p className="text-[10px] text-gray-400">
                              {p.type === "dentist" ? "ทันตแพทย์" : "พนักงาน"}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                          {p.shift?.start_time?.substring(0, 5)} - {p.shift?.end_time?.substring(0, 5)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* รายชื่อผู้ลาหยุด */}
              {displayLeave.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                    ลาหยุด ({displayLeave.length} คน)
                  </h4>
                  <div className="space-y-2">
                    {displayLeave.map((p: any) => (
                      <div
                        key={`${p.type}-${p.id}`}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-amber-100 bg-amber-50/30"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{p.name}</p>
                            <p className="text-[10px] text-amber-600 font-medium">
                              เหตุผล: {p.leave?.reason || "ไม่ระบุ"}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                          {p.leave?.type || "ลาหยุด"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

