import { DAY_LABELS, DAY_SHORT } from "@/app/shared/constants";

interface WeeklyOffDaysCardProps {
  weeklyOffDays: number[];
  onToggleOffDay: (dayIndex: number) => void;
}

export default function WeeklyOffDaysCard({
  weeklyOffDays,
  onToggleOffDay,
}: WeeklyOffDaysCardProps) {
  const workingDayIndices = [0, 1, 2, 3, 4, 5, 6].filter((i) => !weeklyOffDays.includes(i));
  const workingDaysDisplay = workingDayIndices.map((i) => DAY_SHORT[i]).join(" ");

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
      {/* ส่วนหัวการ์ด - ขนาดเท่ากับหน้าตารางเวรและการลา */}
      <div className="p-3.5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-base font-bold text-[#1A365D]">
          วันหยุดประจำสัปดาห์ (Weekly Off Days)
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          เลือกวันที่คลินิกปิดทำการประจำทุกสัปดาห์
        </p>
      </div>

      <div className="p-3.5">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {DAY_LABELS.map((dayName, idx) => {
            const isOff = weeklyOffDays.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onToggleOffDay(idx)}
                className={`py-2 px-1.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isOff
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-gray-200 bg-gray-50/60 text-gray-600 hover:bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-xs font-semibold">{dayName}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                    isOff ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isOff ? "หยุด" : "เปิด"}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 flex items-center justify-between">
          <span>คลินิกเปิดทำการ: <strong>{workingDaysDisplay || "ไม่มี"}</strong></span>
          {weeklyOffDays.length > 0 && (
            <span className="text-red-600 font-semibold">
              หยุด: {weeklyOffDays.map((d) => DAY_SHORT[d]).join(" ")}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
