import React, { useState, useEffect } from "react";
import { Calendar, AlertCircle, Plus, Trash2, Clock, MapPin } from "lucide-react";
import { DentistInfo, StaffInfo, Shift, SpecialClosure } from "../../shared/data";
import { getDentists, getStaff, getShifts, updateShift, getClinicClosures, addClinicClosure, deleteClinicClosure } from "../../shared/supabaseApi";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_TH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

const DAY_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },   // SUN - amber
  1: { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },   // MON - gold
  2: { bg: "#D1FAE5", text: "#065F46", border: "#34D399" },   // TUE - teal
  3: { bg: "#DBEAFE", text: "#1E40AF", border: "#60A5FA" },   // WED - blue
  4: { bg: "#EDE9FE", text: "#5B21B6", border: "#8B5CF6" },   // THU - purple
  5: { bg: "#E0E7FF", text: "#3730A3", border: "#818CF8" },   // FRI - indigo
  6: { bg: "#FFE4E6", text: "#9F1239", border: "#FB7185" },   // SAT - rose
};

// Fake room assignment based on person for demo
function getRoom(personId: number, personType: string): string {
  if (personType === 'dentist') {
    const rooms = ['ห้อง A-101', 'ห้อง B-202', 'ห้อง C-303'];
    return rooms[(personId - 1) % rooms.length];
  }
  return 'เคาน์เตอร์ต้อนรับ';
}

export default function ScheduleManagement() {
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [closures, setClosures] = useState<SpecialClosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<string>("all");

  const [newClosure, setNewClosure] = useState({ date: "", reason: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dData, sData, shData, cData] = await Promise.all([
        getDentists(),
        getStaff(),
        getShifts(),
        getClinicClosures()
      ]);
      setDentists(dData);
      setStaffList(sData);
      setShifts(shData);
      setClosures(cData);
    } catch (err) {
      console.error("Error fetching schedule data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShiftChange = async (shift: Shift, field: 'start_time' | 'end_time' | 'is_off', value: any) => {
    if (!shift.id) return;
    try {
      const updated = await updateShift(shift.id, { [field]: value });
      setShifts(shifts.map(s => s.id === updated.id ? updated : s));
    } catch (err) {
      console.error("Error updating shift", err);
      alert("ไม่สามารถอัปเดตตารางเวรได้");
    }
  };

  const handleAddClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClosure.date || !newClosure.reason) return;
    try {
      const added = await addClinicClosure(newClosure);
      setClosures([...closures, added].sort((a, b) => a.date.localeCompare(b.date)));
      setNewClosure({ date: "", reason: "" });
    } catch (err) {
      console.error("Error adding closure", err);
    }
  };

  const handleDeleteClosure = async (id?: number) => {
    if (!id) return;
    if (!confirm("คุณต้องการลบวันหยุดพิเศษนี้?")) return;
    try {
      await deleteClinicClosure(id);
      setClosures(closures.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting closure", err);
    }
  };

  // Build person list for filter
  const allPersons = [
    ...dentists.map(d => ({ id: d.id, name: d.name, type: 'dentist' as const })),
    ...staffList.map(s => ({ id: s.id, name: s.name, type: 'staff' as const })),
  ];

  // Filter shifts
  const filteredShifts = selectedPerson === "all" 
    ? shifts 
    : shifts.filter(s => {
        const [type, id] = selectedPerson.split('-');
        return s.person_type === type && s.person_id === parseInt(id);
      });

  // Group shifts by person
  const shiftsByPerson: Record<string, { name: string; type: string; shifts: Shift[] }> = {};
  filteredShifts.forEach(s => {
    const key = `${s.person_type}-${s.person_id}`;
    if (!shiftsByPerson[key]) {
      const person = s.person_type === 'dentist' 
        ? dentists.find(d => d.id === s.person_id)
        : staffList.find(st => st.id === s.person_id);
      shiftsByPerson[key] = {
        name: person?.name || 'ไม่ระบุ',
        type: s.person_type,
        shifts: []
      };
    }
    shiftsByPerson[key].shifts.push(s);
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลดตารางเวร...</div>;
  }

  return (
    <div style={{ fontFamily: "Prompt, sans-serif" }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการตารางเวร</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>รูปแบบเวรปกติรายสัปดาห์ (มีผลตลอดปี)</p>
        </div>
        <select 
          value={selectedPerson} 
          onChange={e => setSelectedPerson(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
          style={{ borderColor: "rgba(26,54,93,0.15)", minWidth: 200 }}
        >
          <option value="all">แสดงทุกคน</option>
          {allPersons.map(p => (
            <option key={`${p.type}-${p.id}`} value={`${p.type}-${p.id}`}>
              {p.type === 'dentist' ? '🦷' : '👤'} {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule Cards — Horizontal Layout */}
      <div className="space-y-6">
        {Object.entries(shiftsByPerson).map(([key, person]) => {
          const sortedShifts = [...person.shifts].sort((a, b) => a.day_of_week - b.day_of_week);
          const workingShifts = sortedShifts.filter(s => !s.is_off);
          const room = getRoom(
            parseInt(key.split('-')[1]), 
            key.split('-')[0]
          );

          return (
            <div key={key} className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(26,54,93,0.07)" }}>
              {/* Person Header */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(26,54,93,0.06)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: person.type === 'dentist' ? "#FF8C9A" : "#1A365D" }}>
                    {person.name[0] ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1A365D" }}>{person.name}</p>
                    <p className="text-xs" style={{ color: "#4A6080" }}>
                      {person.type === 'dentist' ? 'ทันตแพทย์' : 'พนักงาน'} • ทำงาน {workingShifts.length} วัน/สัปดาห์
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>
                  <MapPin size={12} />
                  {room}
                </div>
              </div>

              {/* Day Cards */}
              <div className="p-4 space-y-2">
                {sortedShifts.map(shift => {
                  const dayNum = shift.day_of_week;
                  const color = DAY_COLORS[dayNum];
                  const startTime = shift.start_time?.substring(0, 5) || "09:00";
                  const endTime = shift.end_time?.substring(0, 5) || "17:00";

                  return (
                    <div
                      key={shift.id ?? dayNum}
                      className="flex items-stretch rounded-xl overflow-hidden transition-all hover:shadow-md"
                      style={{
                        border: `1px solid ${shift.is_off ? '#E5E7EB' : color.border}22`,
                        opacity: shift.is_off ? 0.6 : 1,
                      }}
                    >
                      {/* Day Label + Time */}
                      <div
                        className="flex flex-col items-center justify-center px-5 py-3"
                        style={{
                          backgroundColor: shift.is_off ? "#F3F4F6" : color.bg,
                          minWidth: 130,
                          borderRight: `3px solid ${shift.is_off ? '#D1D5DB' : color.border}`,
                        }}
                      >
                        <span
                          className="text-[10px] font-bold tracking-wider uppercase mb-1 px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: shift.is_off ? "#D1D5DB" : color.border,
                            color: "#fff",
                          }}
                        >
                          {DAY_LABELS[dayNum]}
                        </span>
                        {shift.is_off ? (
                          <span className="text-xs font-medium mt-1" style={{ color: "#9CA3AF" }}>หยุด</span>
                        ) : (
                          <span className="text-lg font-bold mt-1" style={{ color: color.text }}>
                            {startTime}
                            <span className="text-xs font-normal mx-1">-</span>
                            {endTime}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex items-center justify-between px-5 py-3 bg-white">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#1A365D" }}>
                              {DAY_TH[dayNum]}
                            </p>
                            {!shift.is_off && (
                              <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-xs" style={{ color: "#4A6080" }}>
                                  <Clock size={11} />
                                  {startTime} - {endTime} น.
                                </span>
                                <span className="flex items-center gap-1 text-xs" style={{ color: "#4A6080" }}>
                                  <MapPin size={11} />
                                  {room}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Edit Controls */}
                        <div className="flex items-center gap-2">
                          {shift.is_off ? (
                            <button
                              onClick={() => handleShiftChange(shift, 'is_off', false)}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80"
                              style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
                            >
                              เปลี่ยนเป็นทำงาน
                            </button>
                          ) : (
                            <>
                              <input
                                type="time"
                                value={startTime}
                                onChange={e => handleShiftChange(shift, 'start_time', e.target.value)}
                                className="text-xs px-2 py-1.5 border rounded-lg w-[90px] text-center focus:outline-none focus:ring-1"
                                style={{ borderColor: "rgba(26,54,93,0.15)" }}
                              />
                              <span className="text-gray-400 text-xs">ถึง</span>
                              <input
                                type="time"
                                value={endTime}
                                onChange={e => handleShiftChange(shift, 'end_time', e.target.value)}
                                className="text-xs px-2 py-1.5 border rounded-lg w-[90px] text-center focus:outline-none focus:ring-1"
                                style={{ borderColor: "rgba(26,54,93,0.15)" }}
                              />
                              <button
                                onClick={() => handleShiftChange(shift, 'is_off', true)}
                                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80 ml-2"
                                style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                              >
                                ตั้งเป็นหยุด
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {Object.keys(shiftsByPerson).length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-white" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-400">ไม่พบข้อมูลตารางเวร</p>
            <p className="text-xs text-gray-400 mt-1">กรุณาตรวจสอบว่า Schema SQL ได้ถูกรันบน Supabase แล้ว</p>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 rounded-xl flex items-center gap-2 text-sm" style={{ backgroundColor: "#E8F4FF", color: "#1D6FA4" }}>
        <AlertCircle size={14} />
        การเปลี่ยนแปลงรูปแบบเวรจะมีผลทันที ระบบบันทึกอัตโนมัติเมื่อเปลี่ยนเวลา
      </div>

      {/* Special Closures Panel */}
      <div className="mt-6 rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <h2 className="font-semibold mb-4" style={{ color: "#1A365D" }}>วันหยุดพิเศษ (Clinic Closures)</h2>

        <form onSubmit={handleAddClosure} className="flex gap-3 mb-6 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <label className="block text-xs text-gray-500 mb-1">วันที่หยุด</label>
            <input type="date" required value={newClosure.date} onChange={e => setNewClosure({...newClosure, date: e.target.value})} className="px-3 py-2 text-sm border rounded-lg" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">สาเหตุการหยุด / ชื่อเทศกาล</label>
            <input type="text" required value={newClosure.reason} onChange={e => setNewClosure({...newClosure, reason: e.target.value})} placeholder="เช่น วันปีใหม่" className="w-full px-3 py-2 text-sm border rounded-lg" />
          </div>
          <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: "#1A365D" }}>
            <Plus size={16} /> เพิ่มวันหยุด
          </button>
        </form>

        <div className="space-y-2">
          {closures.length === 0 ? <p className="text-sm text-gray-500">ไม่มีวันหยุดพิเศษที่ตั้งไว้</p> : closures.map(c => (
            <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ backgroundColor: "#FFF3E0" }}>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F59E0B" }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "#92400E" }}>{c.reason}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#B45309" }}>
                    {new Date(c.date).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#FED7AA", color: "#92400E" }}>หยุดพิเศษ</span>
                <button onClick={() => handleDeleteClosure(c.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
