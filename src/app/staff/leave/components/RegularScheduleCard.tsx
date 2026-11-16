import { Shift } from "@/app/shared/data";

interface RegularScheduleCardProps {
  shifts: Shift[];
  showSchedule?: boolean;
  onToggleSchedule?: () => void;
}

const DAYS = [
  { name: "จันทร์", day: 1 },
  { name: "อังคาร", day: 2 },
  { name: "พุธ", day: 3 },
  { name: "พฤหัส", day: 4 },
  { name: "ศุกร์", day: 5 },
  { name: "เสาร์", day: 6 },
  { name: "อาทิตย์", day: 0 },
];

/**
 * ⏰ [CONTENT COMPONENT] ตารางเวรประจำของพนักงาน (ขนาดกะทัดรัด แสดงครบ 7 วันในแถวเดียว)
 */
export default function RegularScheduleCard({ shifts }: RegularScheduleCardProps) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-3.5 h-full flex flex-col justify-between"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-gray-800 leading-tight">ตารางเวรประจำของฉัน</h2>
        <p className="text-[11px] text-gray-400">รูปแบบการทำงานปกติรายสัปดาห์</p>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((d) => {
          const shift = shifts.find((s) => s.day_of_week === d.day);
          const isWorking = shift && !shift.is_off;
          return (
            <div
              key={d.day}
              className={`rounded-xl p-1.5 text-center border transition-all ${
                isWorking
                  ? "bg-blue-50/60 border-blue-100 text-blue-900"
                  : "bg-gray-50/80 border-gray-100 text-gray-400"
              }`}
            >
              <div className={`text-[11px] font-bold ${isWorking ? "text-blue-700" : "text-gray-500"}`}>
                {d.name}
              </div>
              <div className="text-[10px] font-semibold mt-0.5">
                {isWorking ? (
                  <span className="block text-gray-700 leading-tight">
                    {shift.start_time?.slice(0, 5)}-{shift.end_time?.slice(0, 5)}
                  </span>
                ) : (
                  <span className="block text-gray-400 leading-tight">หยุด</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
