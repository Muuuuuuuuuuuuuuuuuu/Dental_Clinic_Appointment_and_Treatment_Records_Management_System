import React, { useState, useEffect } from "react";
import { Plus, Edit3, Check, Clock, Settings2 } from "lucide-react";
import StatusBadge from "../../shared/components/StatusBadge";
import { ServiceInfo, SERVICE_CATEGORIES } from "../../shared/data";
import {
  getServices, updateService, addService, updateServiceActiveStatus, updateServicePublicStatus
} from "../../shared/supabaseApi";

export default function ServiceManagement() {
  const [activeTab, setActiveTab] = useState<'services'>('services');

  // Data States
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Services Edit States
  const [editId, setEditId] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [maxPrices, setMaxPrices] = useState<Record<number, string>>({});
  const [times, setTimes] = useState<Record<number, string>>({});
  const [names, setNames] = useState<Record<number, string>>({});
  const [descs, setDescs] = useState<Record<number, string>>({});
  const [cats, setCats] = useState<Record<number, string>>({});
  const [applyTos, setApplyTos] = useState<Record<number, string>>({});
  const [benefitsMap, setBenefitsMap] = useState<Record<number, string>>({});
  const [proceduresMap, setProceduresMap] = useState<Record<number, string>>({});
  const [careMap, setCareMap] = useState<Record<number, string>>({});

  // Services Add States
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({
    name: "", desc: "", price: "", maxPrice: "", time: "30", category: SERVICE_CATEGORIES[0] as string, 
    applyTo: "MOUTH",
    benefits: "", procedures: "", care: ""
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
    const mpStr = maxPrices[id];
    const mp = mpStr !== undefined && mpStr !== "" ? parseInt(mpStr, 10) : p;
    const t = parseInt(times[id] ?? "30", 10);
    const n = names[id];
    const d = descs[id];
    const at = applyTos[id];
    const b = benefitsMap[id];
    const p_arr = proceduresMap[id];
    const c_arr = careMap[id];

    if (!isNaN(p) && !isNaN(t)) {
      try {
        const payload: any = { basePrice: p, maxPrice: mp, estimatedTime: t };
        if (n !== undefined) payload.name = n;
        if (d !== undefined) payload.description = d;
        if (at !== undefined) payload.applyTo = at;

        if (b !== undefined || p_arr !== undefined || c_arr !== undefined) {
          payload.details = {};
          if (b !== undefined) payload.details.benefits = b.split('\n').map((x: string) => x.trim()).filter(Boolean);
          if (p_arr !== undefined) payload.details.procedures = p_arr.split('\n').map((x: string) => x.trim()).filter(Boolean);
          if (c_arr !== undefined) payload.details.care = c_arr.split('\n').map((x: string) => x.trim()).filter(Boolean);
        }

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
    const confirmMsg = `ต้องการ${actionText}ใช้งานบริการ "${s.name}" (ในระบบ) ใช่หรือไม่?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateServiceActiveStatus(s.id, !s.active);
      setServices(ss => ss.map(x => x.id === s.id ? { ...x, active: !s.active } : x));
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะบริการ");
    }
  };

  const togglePublicService = async (s: ServiceInfo) => {
    if (!s.id) return;
    const isPublic = s.isPublic ?? true;
    const actionText = isPublic ? "ซ่อนจาก" : "แสดงบน";
    const confirmMsg = `ต้องการ${actionText}หน้าเว็บจองคิว สำหรับบริการ "${s.name}" ใช่หรือไม่?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateServicePublicStatus(s.id, !isPublic);
      setServices(ss => ss.map(x => x.id === s.id ? { ...x, isPublic: !isPublic } : x));
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะหน้าเว็บ");
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.time || !newService.category) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    const p = parseInt(newService.price, 10);
    const mp = newService.maxPrice ? parseInt(newService.maxPrice, 10) : p;
    const t = parseInt(newService.time, 10);
    if (isNaN(p) || isNaN(t)) return alert("ราคาและเวลาต้องเป็นตัวเลข");

    try {
      await addService({
        name: newService.name,
        description: newService.desc,
        basePrice: p,
        maxPrice: mp,
        category: newService.category,
        estimatedTime: t,
        active: true,
        applyTo: newService.applyTo,
        details: {
          benefits: newService.benefits.split('\n').map(x => x.trim()).filter(Boolean),
          procedures: newService.procedures.split('\n').map(x => x.trim()).filter(Boolean),
          care: newService.care.split('\n').map(x => x.trim()).filter(Boolean)
        }
      });
      fetchData();
      setIsAdding(false);
      setNewService({ ...newService, name: "", desc: "", price: "", maxPrice: "", benefits: "", procedures: "", care: "" });
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                  <label className="block text-xs font-medium text-slate-500 mb-1">ราคาเริ่มต้น (บาท)</label>
                  <input type="number" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">ราคาสูงสุด (บาท)</label>
                  <input type="number" value={newService.maxPrice} onChange={e => setNewService({ ...newService, maxPrice: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="เว้นว่างถ้าเท่ากับราคาเริ่มต้น" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">เวลา (นาที)</label>
                  <input type="number" value={newService.time} onChange={e => setNewService({ ...newService, time: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="30" />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">บริเวณที่ทำ (Odontogram)</label>
                  <select
                    value={newService.applyTo}
                    onChange={e => setNewService({ ...newService, applyTo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
                  >
                    <option value="MOUTH">ทำทั้งปาก (เช่น ขูดหินปูน)</option>
                    <option value="TOOTH">ระบุซี่ฟัน (เช่น อุดฟัน)</option>
                    <option value="ARCH">ขากรรไกร บน/ล่าง</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">คำอธิบาย</label>
                  <input type="text" value={newService.desc} onChange={e => setNewService({ ...newService, desc: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="คำอธิบายสั้นๆ" />
                </div>

                <div className="md:col-span-4 flex flex-col gap-3 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">ข้อดี (บรรทัดละ 1 ข้อ)</label>
                    <textarea value={newService.benefits} onChange={e => setNewService({ ...newService, benefits: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#FF8C9A]" placeholder="เช่น ช่วยให้ฟันขาวขึ้น"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">ขั้นตอน (บรรทัดละ 1 ข้อ)</label>
                    <textarea value={newService.procedures} onChange={e => setNewService({ ...newService, procedures: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#FF8C9A]" placeholder="เช่น 1. ตรวจประเมิน..."></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">การดูแลรักษา (บรรทัดละ 1 ข้อ)</label>
                    <textarea value={newService.care} onChange={e => setNewService({ ...newService, care: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#FF8C9A]" placeholder="เช่น ก่อนทำ: งดน้ำ..."></textarea>
                  </div>
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
                      <div className="flex-1 min-w-0 pr-4">
                        {editId === s.id ? (
                          <div key={`edit-${s.id}`} className="flex flex-col gap-2 w-full">
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
                            <div className="mt-1">
                              <select
                                defaultValue={s.applyTo || 'MOUTH'}
                                onChange={e => setApplyTos(at => ({ ...at, [s.id]: e.target.value }))}
                                className="w-full px-2 py-1 rounded-lg text-xs outline-none border border-slate-200"
                              >
                                <option value="MOUTH">ทำทั้งปาก (MOUTH)</option>
                                <option value="TOOTH">ระบุซี่ฟัน (TOOTH)</option>
                                <option value="ARCH">ขากรรไกร (ARCH)</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-slate-100">
                              <p className="text-[11px] font-bold text-[#1A365D]">รายละเอียดเพิ่มเติม</p>
                              <div>
                                <label className="block text-[10px] font-medium text-slate-500 mb-1">ข้อดี (บรรทัดละ 1 ข้อ)</label>
                                <textarea
                                  defaultValue={s.details?.benefits?.join('\n') || ''}
                                  onChange={e => setBenefitsMap(b => ({ ...b, [s.id]: e.target.value }))}
                                  rows={2}
                                  className="w-full px-2 py-1.5 rounded-lg text-xs outline-none border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#FF8C9A]"
                                  placeholder="เช่น ช่วยให้ฟันขาวขึ้น"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-slate-500 mb-1">ขั้นตอน (บรรทัดละ 1 ข้อ)</label>
                                <textarea
                                  defaultValue={s.details?.procedures?.join('\n') || ''}
                                  onChange={e => setProceduresMap(p => ({ ...p, [s.id]: e.target.value }))}
                                  rows={2}
                                  className="w-full px-2 py-1.5 rounded-lg text-xs outline-none border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#FF8C9A]"
                                  placeholder="เช่น 1. ตรวจประเมิน..."
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-slate-500 mb-1">การดูแลรักษา (บรรทัดละ 1 ข้อ)</label>
                                <textarea
                                  defaultValue={s.details?.care?.join('\n') || ''}
                                  onChange={e => setCareMap(c => ({ ...c, [s.id]: e.target.value }))}
                                  rows={2}
                                  className="w-full px-2 py-1.5 rounded-lg text-xs outline-none border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#FF8C9A]"
                                  placeholder="เช่น ก่อนทำ: งดน้ำ..."
                                />
                              </div>
                            </div>

                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm" style={{ color: "#1A365D" }}>{s.name}</p>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>{s.description}</p>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-5 flex-shrink-0">
                        {editId === s.id ? (
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs text-slate-500">ราคาเริ่มต้น</span>
                              <input
                                type="number"
                                defaultValue={s.basePrice}
                                onChange={e => setPrices(p => ({ ...p, [s.id]: e.target.value }))}
                                className="w-20 px-2 py-1.5 rounded-lg text-sm outline-none border border-slate-200"
                              />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs text-slate-500">ราคาสูงสุด</span>
                              <input
                                type="number"
                                defaultValue={s.maxPrice || s.basePrice}
                                onChange={e => setMaxPrices(p => ({ ...p, [s.id]: e.target.value }))}
                                className="w-20 px-2 py-1.5 rounded-lg text-sm outline-none border border-slate-200"
                              />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock size={14} className="text-slate-400" />
                                <span>เวลา</span>
                              </div>
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
                              <span className="text-sm font-semibold" style={{ color: "#FF8C9A" }}>฿{s.basePrice.toLocaleString()}{s.maxPrice && s.maxPrice > s.basePrice ? ` - ${s.maxPrice.toLocaleString()}` : ''}</span>
                              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                <Clock size={12} />
                                {s.estimatedTime || 30} นาที
                              </div>
                            </div>
                            <button onClick={() => {
                              setEditId(s.id);
                              setPrices(p => ({ ...p, [s.id]: String(s.basePrice) }));
                              setMaxPrices(p => ({ ...p, [s.id]: String(s.maxPrice || s.basePrice) }));
                              setTimes(t => ({ ...t, [s.id]: String(s.estimatedTime || 30) }));
                              setNames(n => ({ ...n, [s.id]: s.name }));
                              setDescs(d => ({ ...d, [s.id]: s.description }));
                              setCats(c => ({ ...c, [s.id]: s.category }));
                            }} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }}>
                              <Edit3 size={15} />
                            </button>
                          </div>
                        )}
                        <div className="flex flex-col gap-2 items-end">
                          <button onClick={() => toggleActiveService(s)} title={s.active ? "ปิดใช้งานระบบ" : "เปิดใช้งานระบบ"}>
                            <StatusBadge label={s.active ? "ระบบ: เปิด" : "ระบบ: ปิด"} active={s.active} />
                          </button>
                          <button onClick={() => togglePublicService(s)} title={(s.isPublic ?? true) ? "ซ่อนจากเว็บ" : "แสดงบนเว็บ"}>
                            <StatusBadge label={(s.isPublic ?? true) ? "เว็บ: แสดง" : "เว็บ: ซ่อน"} active={s.isPublic ?? true} />
                          </button>
                        </div>
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
