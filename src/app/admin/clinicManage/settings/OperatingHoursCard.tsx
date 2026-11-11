import { DayHours } from "@/app/shared/supabaseApi";

const DAY_LABELS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

interface OperatingHoursCardProps {
  dailyHours: Record<string, DayHours>;
  weeklyOffDays: number[];
  onUpdateHour: (dayIndex: number, field: "open" | "close", value: string) => void;
}

export default function OperatingHoursCard({
  dailyHours,
  weeklyOffDays,
  onUpdateHour,
}: OperatingHoursCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col justify-between h-full">
      {/* ส่วนหัวการ์ด - ขนาดเท่ากับหน้าตารางเวรและการลา */}
      <div className="p-3.5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-base font-bold text-[#1A365D]">
          เวลาเปิด-ปิดทำการ (Operating Hours)
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          กำหนดเวลาเปิด-ปิดแยกรายวันเพื่อความยืดหยุ่น
        </p>
      </div>

      {/* เนื้อหารายการ 7 วัน */}
      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        {DAY_LABELS.map((dayName, idx) => {
          const isOff = weeklyOffDays.includes(idx);
          const dH = dailyHours[String(idx)] || { open: "09:00", close: "20:00" };
          return (
            <div
              key={idx}
              className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                isOff ? "bg-gray-50/70 border-gray-100 opacity-60" : "bg-white border-gray-200"
              }`}
            >
              <span className="font-semibold text-gray-700 text-xs sm:text-sm w-24">{dayName}</span>
              {isOff ? (
                <span className="text-xs text-red-500 font-medium">หยุดประจำสัปดาห์</span>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={dH.open}
                    onChange={(e) => onUpdateHour(idx, "open", e.target.value)}
                    className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#FF8C9A]"
                  />
                  <span className="text-gray-400 text-xs">-</span>
                  <input
                    type="time"
                    value={dH.close}
                    onChange={(e) => onUpdateHour(idx, "close", e.target.value)}
                    className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#FF8C9A]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
