import React, { useState, useEffect } from "react";
import { getClinicSettings, updateClinicSetting } from "../../shared/supabaseApi";
import { Clock, Save, Info, AlertTriangle } from "lucide-react";

export default function ClinicSettingsManagement() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // default form state if not in DB
  const [formData, setFormData] = useState({
    open_time: "09:00",
    close_time: "20:00",
    saturday_close_time: "17:00",
    leave_quota_days: "15"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getClinicSettings();
      setSettings(data);
      setFormData({
        open_time: data.open_time || "09:00",
        close_time: data.close_time || "20:00",
        saturday_close_time: data.saturday_close_time || "17:00",
        leave_quota_days: data.leave_quota_days || "15"
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(formData)) {
        if (settings[key] !== value) {
          await updateClinicSetting(key, value);
        }
      }
      alert("บันทึกการตั้งค่าเรียบร้อยแล้ว");
      fetchSettings();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ตั้งค่าระบบคลินิก</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>จัดการเวลาเปิด-ปิด และการตั้งค่าพื้นฐานของคลินิก</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1A365D] text-white rounded-xl text-sm font-medium hover:bg-[#122847] transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Clock size={18} className="text-[#FF8C9A]" />
          <h2 className="font-semibold text-slate-800">เวลาเปิด-ปิดทำการ (Operating Hours)</h2>
        </div>
        <div className="p-6">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 flex items-start gap-3">
            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              ค่าที่ตั้งไว้นี้จะถูกนำไปใช้แสดงผลในป้ายสถานะคลินิก ("เปิดให้บริการ" / "ปิดให้บริการ") รวมถึงระบบการจองคิวออนไลน์ เพื่อให้คนไข้ทราบเวลาที่ถูกต้อง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">เวลาเปิดทำการ (จันทร์ - เสาร์)</label>
              <input 
                type="time" 
                value={formData.open_time} 
                onChange={e => setFormData({...formData, open_time: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FF8C9A]" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">เวลาปิดทำการ (จันทร์ - ศุกร์)</label>
              <input 
                type="time" 
                value={formData.close_time} 
                onChange={e => setFormData({...formData, close_time: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FF8C9A]" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">เวลาปิดทำการ (วันเสาร์)</label>
              <input 
                type="time" 
                value={formData.saturday_close_time} 
                onChange={e => setFormData({...formData, saturday_close_time: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#FF8C9A]" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">วันอาทิตย์</label>
              <div className="w-full px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium cursor-not-allowed">
                ปิดทำการ (วันหยุดประจำสัปดาห์)
              </div>
            </div>
          </div>
        </div>
      </div>
      
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

    </div>
  );
}
