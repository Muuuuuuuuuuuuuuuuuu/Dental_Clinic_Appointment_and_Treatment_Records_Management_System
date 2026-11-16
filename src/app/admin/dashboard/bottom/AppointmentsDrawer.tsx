import { X } from "lucide-react";
import { Appointment, STATUS_COLORS } from "@/app/shared/data";

interface AppointmentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  appointments: Appointment[];
}

/**
 * 🗂️ [MODAL/DRAWER COMPONENT] แผงลิ้นชักแสดงรายการนัดหมายทั้งหมดของวัน
 */
export default function AppointmentsDrawer({
  isOpen,
  onClose,
  selectedDate,
  appointments,
}: AppointmentsDrawerProps) {
  if (!isOpen) return null;

  const sortedAppts = [...appointments].sort(
    (a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div
        className="fixed inset-y-4 right-4 w-full max-w-xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
        style={{ animation: "slideInRight 0.25s ease-out" }}
      >
        {/* ส่วนหัวของหน้าต่างป๊อปอัป */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "rgba(26,54,93,0.08)" }}
        >
          <div>
            <h2 className="font-bold text-lg" style={{ color: "#1A365D" }}>
              รายการนัดหมาย
            </h2>
            <p className="text-xs" style={{ color: "#4A6080" }}>
              {selectedDate.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              • {appointments.length} รายการ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* รายการนัดหมายแบบ Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {sortedAppts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              ไม่มีรายการนัดหมายในวันที่เลือก
            </div>
          ) : (
            sortedAppts.map((appt) => {
              const statusCfg =
                STATUS_COLORS[appt.status] || {
                  bg: "rgba(26,54,93,0.06)",
                  text: "#1A365D",
                  dot: "#1A365D",
                };
              return (
                <div
                  key={appt.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between gap-4"
                  style={{ backgroundColor: "rgba(26,54,93,0.01)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
                      style={{
                        backgroundColor: "#1A365D",
                        color: "white",
                        fontFamily: "monospace",
                      }}
                    >
                      {appt.time}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-800 truncate">
                        {appt.patientName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {appt.service} • ทพ. {appt.doctorName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: statusCfg.bg,
                        color: statusCfg.text,
                      }}
                    >
                      {appt.status}
                    </span>
                    {appt.status === "เสร็จสิ้น" && appt.cost ? (
                      <div className="text-xs font-bold text-slate-700 mt-1">
                        ฿{appt.cost.toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
