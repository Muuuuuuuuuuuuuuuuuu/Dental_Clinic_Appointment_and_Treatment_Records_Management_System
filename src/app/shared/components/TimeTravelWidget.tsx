import { useState, useEffect } from "react";
import { Clock, Calendar, RefreshCw, X } from "lucide-react";

export default function TimeTravelWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("08:00");
  const [isActive, setIsActive] = useState(false);
  const [activeLabel, setActiveLabel] = useState("");

  useEffect(() => {
    const savedDatetime = localStorage.getItem("supat_mock_date");
    if (savedDatetime) {
      // savedDatetime อาจเป็น "YYYY-MM-DD" (เก่า) หรือ "YYYY-MM-DDTHH:MM" (ใหม่)
      if (savedDatetime.includes("T")) {
        const [datePart, timePart] = savedDatetime.split("T");
        setSelectedDate(datePart);
        setSelectedTime(timePart.slice(0, 5)); // HH:MM
        setActiveLabel(`${datePart} ${timePart.slice(0, 5)}`);
      } else {
        setSelectedDate(savedDatetime);
        setSelectedTime("08:00");
        setActiveLabel(`${savedDatetime} 08:00`);
      }
      setIsActive(true);
    } else {
      const now = new Date();
      setSelectedDate(now.toISOString().split("T")[0]);
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setSelectedTime(`${hh}:${mm}`);
    }
  }, []);

  const handleApply = () => {
    if (!selectedDate || !selectedTime) return;
    const datetimeValue = `${selectedDate}T${selectedTime}`;
    localStorage.setItem("supat_mock_date", datetimeValue);
    // ยิง storage event แบบ manual เพื่อให้ same-tab component รับรู้ทันที
    window.dispatchEvent(new StorageEvent("storage", { key: "supat_mock_date", newValue: datetimeValue }));
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.removeItem("supat_mock_date");
    window.location.reload();
  };

  // ตัวเลือกตั้งเวลาด่วน
  const timePresets = [
    { label: "เช้า", time: "08:00" },
    { label: "เที่ยง", time: "12:00" },
    { label: "บ่าย", time: "14:00" },
    { label: "เย็น", time: "17:00" },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 ${
          isActive ? "bg-amber-500 text-white animate-pulse" : "bg-slate-800 text-white"
        }`}
        style={{ fontFamily: "Sarabun, sans-serif" }}
      >
        <Clock size={18} />
        {isActive ? `จำลองเวลา: ${activeLabel}` : "Time Travel"}
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-80"
      style={{ fontFamily: "Sarabun, sans-serif" }}
    >
      {/* ส่วนหัว */}
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <Clock size={16} className="text-amber-500" /> Time Travel (จำลองเวลา)
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {/* ช่องเลือกวันที่ */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            เลือกวันที่ต้องการทดสอบ
          </label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* ช่องเลือกเวลา */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            เลือกเวลาที่ต้องการทดสอบ
          </label>
          <div className="relative">
            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* ปุ่มลัดเลือกเวลา */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            เวลาด่วน (Quick Set)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {timePresets.map((preset) => (
              <button
                key={preset.time}
                onClick={() => setSelectedTime(preset.time)}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedTime === preset.time
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600"
                }`}
              >
                <div className="text-[10px] opacity-75">{preset.label}</div>
                <div>{preset.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* แสดงตัวอย่างเวลาที่จำลอง */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
          <p className="text-xs text-amber-700 font-medium">
            จะจำลองเป็น:{" "}
            <span className="font-bold">
              {selectedDate || "---"} เวลา {selectedTime || "--:--"} น.
            </span>
          </p>
        </div>

        {/* ปุ่มดำเนินการ */}
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Clock size={14} /> นำไปใช้ (Reload)
          </button>

          {isActive && (
            <button
              onClick={handleReset}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} /> กลับสู่เวลาจริง
            </button>
          )}
        </div>

        <p className="text-[10px] text-slate-400 leading-tight text-center">
          *การตั้งเวลานี้จะส่งผลกับระบบจำลองในเบราว์เซอร์นี้เท่านั้น (ส่งผลทุก Role)
        </p>
      </div>
    </div>
  );
}
