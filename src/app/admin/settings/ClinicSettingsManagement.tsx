import React, { useState, useEffect } from "react";
import { getClinicSettings, updateClinicSetting, getWeeklyOffDays, updateWeeklyOffDays, getDailyHours, updateDailyHours, DayHours } from "../../shared/supabaseApi";
import { Clock, Save, Info, AlertTriangle, CalendarOff, Lock, X } from "lucide-react";

const DAY_LABELS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const DAY_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export default function ClinicSettingsManagement() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0]);
  const [dailyHours, setDailyHours] = useState<Record<string, DayHours>>({});

  // Confirm Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // default form state if not in DB
  const [formData, setFormData] = useState({
    leave_quota_days: "15"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [data, offDays, dHours] = await Promise.all([
        getClinicSettings(),
        getWeeklyOffDays(),
        getDailyHours()
      ]);
      setSettings(data);
      setWeeklyOffDays(offDays);
      setDailyHours(dHours);
      setFormData({
        leave_quota_days: data.leave_quota_days || "15"
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOffDay = (dayIndex: number) => {
    setWeeklyOffDays(prev => {
      if (prev.includes(dayIndex)) {
        return prev.filter(d => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
  };

  const updateDayHour = (dayIndex: number, field: 'open' | 'close', value: string) => {
    setDailyHours(prev => ({
      ...prev,
      [String(dayIndex)]: {
        ...prev[String(dayIndex)],
        [field]: value
      }
    }));
  };

  const handleSaveClick = () => {
    setShowConfirmModal(true);
    setAdminPassword("");
    setPasswordError("");
  };

  const executeSave = async () => {
    // Basic mock validation for demo purposes
    if (adminPassword !== "admin123" && adminPassword.length < 4) {
      setPasswordError("รหัสผ่านไม่ถูกต้อง (ทดสอบ: พิมพ์อะไรก็ได้ 4 ตัวอักษรขึ้นไป)");
      return;
    }
    
    setShowConfirmModal(false);
    setSaving(true);
    try {
      // Save regular form data
      for (const [key, value] of Object.entries(formData)) {
        if (settings[key] !== value) {
          await updateClinicSetting(key, value);
        }
      }
      // Save weekly off days and daily hours
      await Promise.all([
        updateWeeklyOffDays(weeklyOffDays),
        updateDailyHours(dailyHours)
      ]);
      alert("บันทึกการตั้งค่าเรียบร้อยแล้ว");
      fetchSettings();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const workingDayIndices = [0,1,2,3,4,5,6].filter(i => !weeklyOffDays.includes(i));
  const workingDaysDisplay = workingDayIndices.map(i => DAY_SHORT[i]).join(" ");

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-4xl animate-fade-in relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ตั้งค่าระบบคลินิก</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>จัดการเวลาเปิด-ปิด และการตั้งค่าพื้นฐานของคลินิก</p>
        </div>
        <button 
          onClick={handleSaveClick} 
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1A365D] text-white rounded-xl text-sm font-medium hover:bg-[#122847] transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>
      </div>

      {/* Operating Hours Card - Per Day */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Clock size={18} className="text-[#FF8C9A]" />
          <div>
            <h2 className="font-semibold text-slate-800">เวลาเปิด-ปิดทำการ (Operating Hours)</h2>
            <p className="text-xs text-slate-500 mt-0.5">กำหนดเวลาเปิด-ปิดแยกรายวันเพื่อความยืดหยุ่น</p>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 flex items-start gap-3">
            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              ค่าที่ตั้งไว้นี้จะถูกนำไปใช้แสดงผลในป้ายสถานะคลินิก ("เปิดให้บริการ" / "ปิดให้บริการ") รวมถึงระบบการจองคิวออนไลน์ เพื่อให้คนไข้ทราบเวลาที่ถูกต้อง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {DAY_LABELS.map((dayName, idx) => {
              const isOff = weeklyOffDays.includes(idx);
              const dH = dailyHours[String(idx)] || { open: "09:00", close: "20:00" };
              return (
                <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${isOff ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'}`}>
                  <div className="font-medium text-sm text-slate-700 w-24">{dayName}</div>
                  {isOff ? (
                    <div className="text-sm text-red-500 font-medium">หยุดประจำสัปดาห์</div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input 
                        type="time" 
                        value={dH.open} 
                        onChange={(e) => updateDayHour(idx, 'open', e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" 
                      />
                      <span className="text-slate-400">-</span>
                      <input 
                        type="time" 
                        value={dH.close} 
                        onChange={(e) => updateDayHour(idx, 'close', e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" 
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Off Days Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <CalendarOff size={18} className="text-red-400" />
          <div>
            <h2 className="font-semibold text-slate-800">วันหยุดประจำสัปดาห์ (Weekly Off Days)</h2>
            <p className="text-xs text-slate-500 mt-0.5">เลือกวันที่คลินิกปิดทำการประจำทุกสัปดาห์ — จะมีผลต่อปฏิทินหมอ, พนักงาน และแดชบอร์ดทั้งระบบ</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {DAY_LABELS.map((dayName, idx) => {
              const isOff = weeklyOffDays.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleOffDay(idx)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all hover:shadow-sm"
                  style={{
                    borderColor: isOff ? "#EF4444" : "#E2E8F0",
                    backgroundColor: isOff ? "#FEF2F2" : "#FAFBFC",
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: isOff ? "#B91C1C" : "#64748B" }}>
                    {dayName}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      backgroundColor: isOff ? "#EF4444" : "#E2E8F0",
                      color: isOff ? "#fff" : "#94A3B8",
                    }}
                  >
                    {isOff ? "หยุด" : "เปิด"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Summary */}
          <div className="p-3 rounded-xl flex items-center gap-2 text-sm" style={{ backgroundColor: "#F0F9FF", color: "#0369A1" }}>
            <Info size={14} className="flex-shrink-0" />
            <span>
              คลินิกเปิดทำการ: <strong>{workingDaysDisplay}</strong>
              {weeklyOffDays.length > 0 && (
                <> • หยุด: <strong style={{ color: "#DC2626" }}>{weeklyOffDays.map(d => DAY_SHORT[d]).join(" ")}</strong></>
              )}
            </span>
          </div>
        </div>
      </div>
      
      {/* HR Settings Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <AlertTriangle size={18} className="text-orange-500" />
          <h2 className="font-semibold text-slate-800">การตั้งค่าทรัพยากรบุคคล (HR Settings)</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">โควตาวันลาพักร้อน (วัน/ปี)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={formData.leave_quota_days} 
                  onChange={e => setFormData({...formData, leave_quota_days: e.target.value})}
                  className="w-32 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FF8C9A]" 
                />
                <span className="text-sm text-slate-500">วัน</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 text-amber-600">
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">ยืนยันการเปลี่ยนแปลง</h3>
                </div>
                <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-sm text-slate-600 mb-6">
                การแก้ไขเวลาเปิด-ปิด และวันหยุดคลินิก จะส่งผลกระทบต่อตารางงานของแพทย์ พนักงาน และหน้าบ้านของคนไข้ กรุณายืนยันด้วยรหัสผ่านผู้ดูแลระบบ
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">รหัสผ่าน Admin</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="ใส่รหัสผ่านเพื่อยืนยัน"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50"
                  />
                </div>
                {passwordError && <p className="text-xs text-red-500 mt-2">{passwordError}</p>}
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={executeSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors"
                >
                  ยืนยันการบันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
