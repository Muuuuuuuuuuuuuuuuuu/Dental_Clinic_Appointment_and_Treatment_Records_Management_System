import { Badge } from "../../shared/components/ui/badge";
import React, { useState, useEffect } from "react";
import StatusBadge from "../../shared/components/StatusBadge";
import { Plus, Edit3, Trash2 , Check, Clock } from "lucide-react";

import { ServiceInfo } from "../../shared/data";
import { getServices, updateService, addService, deleteService } from "../../shared/supabaseApi";

export default function ServiceManagement() {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [times, setTimes] = useState<Record<number, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [newService, setNewService] = useState({ name: "", desc: "", price: "", time: "30", category: "ทันตกรรมทั่วไป" });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async (id: number) => {
    const p = parseInt(prices[id] ?? "0", 10);
    const t = parseInt(times[id] ?? "30", 10);
    if (!isNaN(p) && !isNaN(t)) {
      try {
        const updated = await updateService(id, { basePrice: p, estimatedTime: t });
        setServices(ss => ss.map(s => s.id === id ? updated : s));
      } catch (err) {
        console.error(err);
        alert("Failed to update service");
      }
    }
    setEditId(null);
  };

  const toggleActive = async (s: ServiceInfo) => {
    if (!s.id) return;
    try {
      const updated = await updateService(s.id, { active: !s.active });
      setServices(ss => ss.map(x => x.id === s.id ? updated : x));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.time) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    const p = parseInt(newService.price, 10);
    const t = parseInt(newService.time, 10);
    if (isNaN(p) || isNaN(t)) return alert("ราคาและเวลาต้องเป็นตัวเลข");
    
    try {
      const added = await addService({
        name: newService.name,
        description: newService.desc,
        basePrice: p,
        category: newService.category,
        estimatedTime: t,
        active: true
      });
      setServices(prev => [...prev, added]);
      setIsAdding(false);
      setIsCustomCategory(false);
      setNewService({ name: "", desc: "", price: "", time: "30", category: "ทันตกรรมทั่วไป" });
    } catch (err) {
      console.error(err);
      alert("Failed to add service");
    }
  };

  const handleDelete = async (id: number) => {
    // Note: Hard delete removed per user discussion. We use Soft Delete (toggleActive) instead.
  };

  const categories = Array.from(new Set(services.map(s => s.category)));

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการบริการ</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>บริการทั้งหมด {services.length} รายการ</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-[#FF8C9A] text-white rounded-xl text-sm font-medium hover:bg-[#FF7A8A] transition-colors">
          <Plus size={16} />
          เพิ่มบริการใหม่
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
          <h2 className="text-sm font-bold mb-4" style={{ color: "#1A365D" }}>เพิ่มบริการใหม่</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อบริการ</label>
              <input type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="เช่น ขูดหินปูน" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">หมวดหมู่</label>
              {isCustomCategory ? (
                <div className="flex gap-2">
                  <input type="text" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="พิมพ์หมวดหมู่ใหม่" autoFocus />
                  <button onClick={() => { setIsCustomCategory(false); setNewService({...newService, category: categories[0] || "ทันตกรรมทั่วไป"}); }} className="px-2 text-slate-400 hover:text-slate-600">✕</button>
                </div>
              ) : (
                <select 
                  value={categories.includes(newService.category) ? newService.category : ""} 
                  onChange={e => {
                    if (e.target.value === "ADD_NEW") {
                      setIsCustomCategory(true);
                      setNewService({...newService, category: ""});
                    } else {
                      setNewService({...newService, category: e.target.value});
                    }
                  }} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="ADD_NEW" className="font-bold text-blue-600">+ เพิ่มหมวดหมู่ใหม่</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ราคา (บาท)</label>
              <input type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">เวลาที่ใช้ (นาที)</label>
              <input type="number" value={newService.time} onChange={e => setNewService({...newService, time: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">คำอธิบาย</label>
              <input type="text" value={newService.desc} onChange={e => setNewService({...newService, desc: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="คำอธิบายสั้นๆ" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">ยกเลิก</button>
            <button onClick={handleAddService} className="px-4 py-2 text-sm bg-[#1A365D] text-white rounded-lg hover:bg-[#122847]">บันทึก</button>
          </div>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat} className="mb-5">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: "#4A6080" }}>หมวด: {cat}</h2>
          <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            {services.filter(s => s.category === cat).map((s, i, arr) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(26,54,93,0.05)" : "none" }}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: "#1A365D" }}>{s.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{s.description}</p>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  {editId === s.id ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">฿</span>
                        <input
                          type="number"
                          defaultValue={s.basePrice}
                          onChange={e => setPrices(p => ({ ...p, [s.id]: e.target.value }))}
                          className="w-20 px-2 py-1.5 rounded-lg text-sm outline-none border border-slate-200"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-400" />
                        <input
                          type="number"
                          defaultValue={s.estimatedTime || 30}
                          onChange={e => setTimes(t => ({ ...t, [s.id]: e.target.value }))}
                          className="w-16 px-2 py-1.5 rounded-lg text-sm outline-none border border-slate-200"
                        />
                        <span className="text-xs text-slate-500">นาที</span>
                      </div>
                      <button onClick={() => saveChanges(s.id)} className="p-1.5 rounded-lg bg-[#E8FFF0] hover:bg-[#D1FADD] ml-1">
                        <Check size={14} style={{ color: "#1B7A3E" }} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold" style={{ color: "#FF8C9A" }}>฿{s.basePrice.toLocaleString()}</span>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <Clock size={12} />
                          {s.estimatedTime || 30} นาที
                        </div>
                      </div>
                      <button onClick={() => { 
                        setEditId(s.id); 
                        setPrices(p => ({ ...p, [s.id]: String(s.basePrice) })); 
                        setTimes(t => ({ ...t, [s.id]: String(s.estimatedTime || 30) }));
                      }}
                        className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }}>
                        <Edit3 size={15} />
                      </button>
                    </div>
                  )}
                  <button onClick={() => toggleActive(s)}>
                    <StatusBadge label="" active={s.active} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
