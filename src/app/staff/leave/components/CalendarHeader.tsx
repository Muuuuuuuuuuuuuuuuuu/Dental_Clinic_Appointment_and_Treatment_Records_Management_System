
interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
  onChangeMonth: (m: number) => void;
  onChangeYear: (y: number) => void;
}

/**
 * 🎛️ [CALENDAR COMPONENT] ส่วนควบคุมเดือน/ปี และคำอธิบายสัญลักษณ์สี
 */
export default function CalendarHeader({
  currentDate,
  onChangeMonth,
  onChangeYear,
}: CalendarHeaderProps) {
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  return (
    <div>
      {/* แถบเลือกเดือน/ปี */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2">
          <select
            value={currentDate.getMonth()}
            onChange={(e) => onChangeMonth(Number(e.target.value))}
            className="text-base font-bold text-gray-800 bg-transparent border-none cursor-pointer focus:ring-0 p-0 pr-4"
          >
            {monthNames.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={currentDate.getFullYear()}
            onChange={(e) => onChangeYear(Number(e.target.value))}
            className="text-base font-bold text-gray-800 bg-transparent border-none cursor-pointer focus:ring-0 p-0 pr-4"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() + i - 1;
              return (
                <option key={year} value={year}>
                  {year + 543}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* คำอธิบายสัญลักษณ์สี */}
      <div className="flex flex-wrap gap-4 mb-3 text-[11px]">
        <div className="flex items-center gap-1.5 text-gray-600">
          <div className="w-2 h-2 rounded-full bg-red-500" /> ลาเต็มวัน
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <div className="w-2 h-2 rounded-full bg-yellow-400" /> รออนุมัติ
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <div className="w-2 h-2 rounded-full bg-orange-500" /> คลินิกปิด
        </div>
      </div>
    </div>
  );
}
