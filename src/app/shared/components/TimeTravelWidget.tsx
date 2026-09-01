import { useState, useEffect } from "react";
import { Clock, Calendar, RefreshCw, X } from "lucide-react";

export default function TimeTravelWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const savedDate = localStorage.getItem("supat_mock_date");
    if (savedDate) {
      setSelectedDate(savedDate);
      setIsActive(true);
    } else {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, []);

  const handleApply = () => {
    if (!selectedDate) return;
    localStorage.setItem("supat_mock_date", selectedDate);
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.removeItem("supat_mock_date");
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 ${
          isActive ? "bg-amber-500 text-white animate-pulse" : "bg-slate-800 text-white"
        }`}
        style={{ fontFamily: "Prompt, sans-serif" }}
      >
        <Clock size={18} />
        {isActive ? `จำลองเวลา: ${selectedDate}` : "Time Travel"}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-72" style={{ fontFamily: "Prompt, sans-serif" }}>
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <Clock size={16} className="text-amber-500" /> Time Travel (จำลองเวลา)
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">เลือกวันที่ต้องการทดสอบ</label>
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

        <div className="flex gap-2 pt-2">
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
