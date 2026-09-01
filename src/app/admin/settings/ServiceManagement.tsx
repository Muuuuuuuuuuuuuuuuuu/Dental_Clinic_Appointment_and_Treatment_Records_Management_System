import React, { useState, useEffect } from "react";
import { Plus, Edit3, Check, Clock, Settings2 } from "lucide-react";
import StatusBadge from "../../shared/components/StatusBadge";
import { ServiceInfo, SERVICE_CATEGORIES } from "../../shared/data";
import {
  getServices, updateService, addService, updateServiceActiveStatus
} from "../../shared/supabaseApi";

export default function ServiceManagement() {
  const [activeTab, setActiveTab] = useState<'services'>('services');

  // Data States
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Services Edit States
  const [editId, setEditId] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [times, setTimes] = useState<Record<number, string>>({});
  const [names, setNames] = useState<Record<number, string>>({});
  const [descs, setDescs] = useState<Record<number, string>>({});
  const [cats, setCats] = useState<Record<number, string>>({});
  const [reqConfs, setReqConfs] = useState<Record<number, boolean>>({});

  // Services Add States
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({
    name: "", desc: "", price: "", time: "30", category: SERVICE_CATEGORIES[0] as string, requiresConfirmation: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const srvs = await getServices();
      setServices(srvs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- SERVICE LOGIC ---
  const saveServiceChanges = async (id: number) => {
    const p = parseInt(prices[id] ?? "0", 10);
    const t = parseInt(times[id] ?? "30", 10);
    const n = names[id];
    const d = descs[id];
    const c = cats[id];
    const rc = reqConfs[id];

    if (!isNaN(p) && !isNaN(t)) {
      try {
        const payload: any = { basePrice: p, estimatedTime: t };
        if (n !== undefined) payload.name = n;
        if (d !== undefined) payload.description = d;
        if (c !== undefined) payload.category = c;
        if (rc !== undefined) payload.requiresConfirmation = rc;
        await updateService(id, payload);
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Failed to update service");
      }
    }
    setEditId(null);
  };

  const toggleActiveService = async (s: ServiceInfo) => {
    if (!s.id) return;
    const actionText = s.active ? "ปิด" : "เปิด";
    const confirmMsg = `ต้องการ${actionText}ใช้งานบริการ "${s.name}" ใช่หรือไม่?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateServiceActiveStatus(s.id, !s.active);
      setServices(ss => ss.map(x => x.id === s.id ? { ...x, active: !s.active } : x));
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะบริการ");
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.time || !newService.category) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    const p = parseInt(newService.price, 10);
    const t = parseInt(newService.time, 10);
    if (isNaN(p) || isNaN(t)) return alert("ราคาและเวลาต้องเป็นตัวเลข");

    try {
      await addService({
        name: newService.name,
        description: newService.desc,
        basePrice: p,
        category: newService.category,
        estimatedTime: t,
        active: true,
        requiresConfirmation: newService.requiresConfirmation
      });
      fetchData();
      setIsAdding(false);
      setNewService({ ...newService, name: "", desc: "", price: "", requiresConfirmation: false });
    } catch (err) {
      console.error(err);
      alert("Failed to add service");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลด...</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>ตั้งค่าบริการ</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>จัดการบริการและหมวดหมู่บริการ</p>
        </div>

      </div>

      {activeTab === 'services' && (
        <>
          <div className="mb-4 text-right">
            <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF8C9A] text-white rounded-xl text-sm font-medium hover:bg-[#FF7A8A] transition-colors">
              <Plus size={16} /> เพิ่มบริการใหม่
            </button>
          </div>

          {isAdding && (
            <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
              <h2 className="text-sm font-bold mb-4" style={{ color: "#1A365D" }}>เพิ่มบริการใหม่</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อบริการ</label>
                  <input type="text" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="เช่น ขูดหินปูน" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">หมวดหมู่</label>
                  <select
                    value={newService.category}
                    onChange={e => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
                  >
                    {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">ราคา (บาท)</label>
                  <input type="number" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">เวลา (นาที)</label>
                  <input type="number" value={newService.time} onChange={e => setNewService({ ...newService, time: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">คำอธิบาย</label>
                  <input type="text" value={newService.desc} onChange={e => setNewService({ ...newService, desc: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="คำอธิบายสั้นๆ" />
                </div>
                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-5">
                    <input type="checkbox" checked={newService.requiresConfirmation} onChange={e => setNewService({ ...newService, requiresConfirmation: e.target.checked })} className="rounded text-[#FF8C9A] focus:ring-[#FF8C9A]" />
                    <span className="text-xs font-medium text-slate-700">เคสยาก</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">ยกเลิก</button>
                <button onClick={handleAddService} className="px-4 py-2 text-sm bg-[#1A365D] text-white rounded-lg hover:bg-[#122847]">บันทึก</button>
              </div>
            </div>
          )}

          {SERVICE_CATEGORIES.map(cat => {
            const catServices = services.filter(s => s.category === cat);
            if (catServices.length === 0) return null;

            return (
              <div key={cat} className="mb-5">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <h2 className="text-sm font-semibold" style={{ color: "#1A365D" }}>{cat}</h2>
                </div>
                <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
                  {catServices.map((s, i, arr) => (
                    <div key={s.id} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(26,54,93,0.05)" : "none" }}>
                      <div className="flex-1 min-w-0">
                        {editId === s.id ? (
                          <div className="flex flex-col gap-2 w-full max-w-sm">
                            <input
                              type="text"
                              defaultValue={s.name}
                              onChange={e => setNames(n => ({ ...n, [s.id]: e.target.value }))}
                              className="w-full px-2 py-1 rounded-lg text-sm outline-none border border-slate-200"
                              placeholder="ชื่อบริการ"
                            />
                            <select
                              defaultValue={s.category}
                              onChange={e => setCats(c => ({ ...c, [s.id]: e.target.value }))}
                              className="w-full px-2 py-1 rounded-lg text-sm outline-none border border-slate-200"
                            >
                              {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input
                              type="text"
                              defaultValue={s.description}
                              onChange={e => setDescs(d => ({ ...d, [s.id]: e.target.value }))}
                              className="w-full px-2 py-1 rounded-lg text-sm outline-none border border-slate-200"
                              placeholder="คำอธิบาย"
                            />
                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                              <input
                                type="checkbox"
                                defaultChecked={s.requiresConfirmation}
                                onChange={e => setReqConfs(rc => ({ ...rc, [s.id]: e.target.checked }))}
                                className="rounded text-[#FF8C9A] focus:ring-[#FF8C9A]"
                              />
                              <span className="text-xs font-medium text-slate-700">เคสยาก (รอการยืนยัน)</span>
                            </label>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm" style={{ color: "#1A365D" }}>{s.name}</p>
                              {s.requiresConfirmation && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] rounded-full">เคสยาก</span>
                              )}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{s.description}</p>
                          </>
                        )}
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
                            <button onClick={() => saveServiceChanges(s.id)} className="px-3 py-1.5 rounded-lg bg-[#E8FFF0] hover:bg-[#D1FADD] ml-1 flex items-center gap-1">
                              <Check size={14} style={{ color: "#1B7A3E" }} />
                              <span className="text-sm font-medium" style={{ color: "#1B7A3E" }}>บันทึก</span>
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
                              setNames(n => ({ ...n, [s.id]: s.name }));
                              setDescs(d => ({ ...d, [s.id]: s.description }));
                              setCats(c => ({ ...c, [s.id]: s.category }));
                            }} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }}>
                              <Edit3 size={15} />
                            </button>
                          </div>
                        )}
                        <button onClick={() => toggleActiveService(s)} title={s.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}>
                          <StatusBadge label="" active={s.active} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
