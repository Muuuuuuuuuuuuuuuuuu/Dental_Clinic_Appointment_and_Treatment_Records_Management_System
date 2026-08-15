import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Check, Clock, Folder, Settings2 } from "lucide-react";
import StatusBadge from "../../shared/components/StatusBadge";
import { ServiceInfo, ServiceCategory } from "../../shared/data";
import { 
  getServices, updateService, addService, updateServiceActiveStatus,
  getServiceCategories, addServiceCategory, updateServiceCategory, deleteServiceCategory
} from "../../shared/supabaseApi";


const iconEmojiMap: Record<string, string> = {
  Smile: '😊',
  Sparkles: '✨',
  Activity: '📈',
  Shield: '🛡️',
  Layers: '🦷',
  Crown: '👑',
  Scissors: '✂️',
  Zap: '⚡',
  Baby: '👶',
  Syringe: '💉',
  Heart: '❤️',
  Star: '⭐',
  Clock: '🕒',
  Award: '🏆',
};

export default function ServiceManagement() {
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  
  // Data States
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Services Edit States
  const [editId, setEditId] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [times, setTimes] = useState<Record<number, string>>({});
  const [names, setNames] = useState<Record<number, string>>({});
  const [descs, setDescs] = useState<Record<number, string>>({});
  const [catIds, setCatIds] = useState<Record<number, number>>({});
  const [reqConfs, setReqConfs] = useState<Record<number, boolean>>({});
  
  // Services Add States
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({ 
    name: "", desc: "", price: "", time: "30", categoryId: 0, requiresConfirmation: false 
  });

  // Categories Edit States
  const [catEditId, setCatEditId] = useState<number | null>(null);
  const [catNames, setCatNames] = useState<Record<number, string>>({});
  const [catIcons, setCatIcons] = useState<Record<number, string>>({});
  const [catColors, setCatColors] = useState<Record<number, string>>({});
  
  // Categories Add States
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "Smile", color: "#F0F4F8" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [srvs, cats] = await Promise.all([getServices(), getServiceCategories()]);
      setServices(srvs);
      setCategories(cats);
      if (cats.length > 0 && newService.categoryId === 0) {
        setNewService(prev => ({ ...prev, categoryId: cats[0].id }));
      }
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
    const cId = catIds[id];
    const rc = reqConfs[id];
    
    if (!isNaN(p) && !isNaN(t)) {
      try {
        const payload: any = { basePrice: p, estimatedTime: t };
        if (n !== undefined) payload.name = n;
        if (d !== undefined) payload.description = d;
        if (cId !== undefined) payload.categoryId = cId;
        if (rc !== undefined) payload.requiresConfirmation = rc;
        const updated = await updateService(id, payload);
        
        // Refresh to get category names joined properly
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
    if (!newService.name || !newService.price || !newService.time || !newService.categoryId) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    const p = parseInt(newService.price, 10);
    const t = parseInt(newService.time, 10);
    if (isNaN(p) || isNaN(t)) return alert("ราคาและเวลาต้องเป็นตัวเลข");
    
    try {
      await addService({
        name: newService.name,
        description: newService.desc,
        basePrice: p,
        categoryId: newService.categoryId,
        category: "", // unused directly in add payload now
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

  // --- CATEGORY LOGIC ---
  const handleDeleteCategory = async (id: number) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้? (หากมีบริการในหมวดหมู่นี้ อาจจะไม่สามารถลบได้)')) {
      try {
        await deleteServiceCategory(id);
        fetchData();
        alert('ลบหมวดหมู่สำเร็จ');
      } catch (err: any) {
        alert('ไม่สามารถลบหมวดหมู่ได้ เนื่องจากมีบริการที่อยู่ในหมวดหมู่นี้ หรือเกิดข้อผิดพลาดอื่น: ' + (err.message || ''));
      }
    }
  };

  const saveCategoryChanges = async (id: number) => {
    const n = catNames[id];
    const i = catIcons[id];
    const c = catColors[id];
    try {
      const payload: Partial<ServiceCategory> = {};
      if (n !== undefined) payload.name = n;
      if (i !== undefined) payload.icon = i;
      if (c !== undefined) payload.color = c;
      await updateServiceCategory(id, payload);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update category");
    }
    setCatEditId(null);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) return alert("กรุณาระบุชื่อหมวดหมู่");
    try {
      const added = await addServiceCategory(newCategory.name, newCategory.icon, newCategory.color);
      setCategories(prev => [...prev, added]);
      setIsAddingCat(false);
      setNewCategory({ name: "", icon: "Smile", color: "#F0F4F8" });
    } catch (err) {
      console.error(err);
      alert("Failed to add category");
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
        <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          <button onClick={() => setActiveTab('services')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${activeTab === 'services' ? "bg-[#1A365D] text-white" : "text-slate-500 hover:text-slate-800"}`}>
            <Settings2 size={16} /> รายการบริการ
          </button>
          <button onClick={() => setActiveTab('categories')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${activeTab === 'categories' ? "bg-[#1A365D] text-white" : "text-slate-500 hover:text-slate-800"}`}>
            <Folder size={16} /> หมวดหมู่
          </button>
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
                  <input type="text" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="เช่น ขูดหินปูน" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">หมวดหมู่</label>
                  <select 
                    value={newService.categoryId} 
                    onChange={e => setNewService({...newService, categoryId: parseInt(e.target.value)})} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">ราคา (บาท)</label>
                  <input type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">เวลา (นาที)</label>
                  <input type="number" value={newService.time} onChange={e => setNewService({...newService, time: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">คำอธิบาย</label>
                  <input type="text" value={newService.desc} onChange={e => setNewService({...newService, desc: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="คำอธิบายสั้นๆ" />
                </div>
                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-5">
                    <input type="checkbox" checked={newService.requiresConfirmation} onChange={e => setNewService({...newService, requiresConfirmation: e.target.checked})} className="rounded text-[#FF8C9A] focus:ring-[#FF8C9A]" />
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

          {categories.map(cat => (
            <div key={cat.id} className="mb-5">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200/50" style={{ backgroundColor: cat.color }}>
                  <span className="text-[10px]">✨</span>
                </div>
                <h2 className="text-sm font-semibold" style={{ color: "#1A365D" }}>{cat.name}</h2>
              </div>
              <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
                {services.filter(s => s.categoryId === cat.id).length === 0 ? (
                  <div className="px-5 py-4 text-xs text-slate-400">ไม่มีบริการในหมวดหมู่นี้</div>
                ) : (
                  services.filter(s => s.categoryId === cat.id).map((s, i, arr) => (
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
                              defaultValue={s.categoryId}
                              onChange={e => setCatIds(c => ({ ...c, [s.id]: parseInt(e.target.value) }))}
                              className="w-full px-2 py-1 rounded-lg text-sm outline-none border border-slate-200"
                            >
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                              setCatIds(c => ({ ...c, [s.id]: s.categoryId }));
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
                  ))
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === 'categories' && (
        <div className="max-w-4xl">
          <div className="mb-4 text-right">
            <button onClick={() => setIsAddingCat(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A365D] text-white rounded-xl text-sm font-medium hover:bg-[#122847] transition-colors">
              <Plus size={16} /> เพิ่มหมวดหมู่ใหม่
            </button>
          </div>
          
          {isAddingCat && (
            <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-fade-in flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อหมวดหมู่</label>
                <input type="text" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]" placeholder="เช่น ศัลยกรรม" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-slate-500 mb-1">สีพื้นหลัง</label>
                <input type="color" value={newCategory.color} onChange={e => setNewCategory({...newCategory, color: e.target.value})} className="w-full h-9 p-0 border-0 rounded cursor-pointer" />
              </div>
              <div className="w-40">
                <label className="block text-xs font-medium text-slate-500 mb-1">ไอคอน</label>
                <select value={newCategory.icon} onChange={e => setNewCategory({...newCategory, icon: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                  <option value="Smile">😊 Smile</option>
                  <option value="Sparkles">✨ Sparkles</option>
                  <option value="Activity">📈 Activity</option>
                  <option value="Heart">❤️ Heart</option>
                  <option value="Star">⭐ Star</option>
                  <option value="Shield">🛡️ Shield</option>
                  <option value="Clock">🕒 Clock</option>
                  <option value="Award">🏆 Award</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsAddingCat(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">ยกเลิก</button>
                <button onClick={handleAddCategory} className="px-4 py-2 text-sm bg-[#FF8C9A] text-white rounded-lg hover:bg-[#FF7A8A]">บันทึก</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">ชื่อหมวดหมู่</th>
                  <th className="px-5 py-3 font-medium">สี & ไอคอน</th>
                  <th className="px-5 py-3 font-medium text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map(c => (
                  <tr key={c.id}>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {catEditId === c.id ? (
                        <input
                          type="text"
                          defaultValue={c.name}
                          onChange={e => setCatNames(n => ({ ...n, [c.id]: e.target.value }))}
                          className="w-full px-2 py-1 rounded-lg outline-none border border-slate-200"
                        />
                      ) : (
                        c.name
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {catEditId === c.id ? (
                        <div className="flex items-center gap-2">
                          <input type="color" defaultValue={c.color} onChange={e => setCatColors(cc => ({ ...cc, [c.id]: e.target.value }))} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                          <select defaultValue={c.icon} onChange={e => setCatIcons(i => ({ ...i, [c.id]: e.target.value }))} className="w-32 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                            <option value="Smile">😊 Smile (ทั่วไป/จัดฟัน)</option>
                            <option value="Sparkles">✨ Sparkles (ความงาม)</option>
                            <option value="Activity">📈 Activity (ศัลยกรรม)</option>
                            <option value="Shield">🛡️ Shield (ป้องกัน)</option>
                            <option value="Layers">🦷 Layers (ประดิษฐ์/รากเทียม)</option>
                            <option value="Crown">👑 Crown (ครอบฟัน)</option>
                            <option value="Scissors">✂️ Scissors (ผ่าตัด)</option>
                            <option value="Zap">⚡ Zap (เทคโนโลยี)</option>
                            <option value="Baby">👶 Baby (ทันตกรรมเด็ก)</option>
                            <option value="Syringe">💉 Syringe (ฉีดยา)</option>
                            <option value="Heart">❤️ Heart (สุขภาพ)</option>
                            <option value="Star">⭐ Star (แนะนำ)</option>
                            <option value="Clock">🕒 Clock (เวลา/รวดเร็ว)</option>
                            <option value="Award">🏆 Award (พรีเมียม)</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-slate-200/50" style={{ backgroundColor: c.color }}>
                            <span className="text-xs">{iconEmojiMap[c.icon] || '✨'}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{c.color}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {catEditId === c.id ? (
                        <button onClick={() => saveCategoryChanges(c.id)} className="px-3 py-1.5 rounded-lg bg-[#E8FFF0] hover:bg-[#D1FADD] flex items-center gap-1 mx-auto">
                          <Check size={14} style={{ color: "#1B7A3E" }} />
                          <span className="text-sm font-medium" style={{ color: "#1B7A3E" }}>บันทึก</span>
                        </button>
                      ) : (
                        <div className="flex justify-center gap-2">
                            <button onClick={() => {
                              setCatEditId(c.id);
                              setCatNames(n => ({ ...n, [c.id]: c.name }));
                              setCatIcons(i => ({ ...i, [c.id]: c.icon }));
                              setCatColors(cc => ({ ...cc, [c.id]: c.color }));
                            }} className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-500">
                              <Edit3 size={15} />
                            </button>
                            <button onClick={() => handleDeleteCategory(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="ลบหมวดหมู่">
                              <Trash2 size={15} />
                            </button>
                          </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
