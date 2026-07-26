import React, { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Percent, X, Calendar as CalendarIcon, DollarSign } from "lucide-react";
import { Promotion } from "../../shared/data";
import { getPromotions, addPromotion, deletePromotion } from "../../shared/supabaseApi";

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    originalPrice: "",
    salePrice: "",
    validUntil: "",
    tag: "โปรโมชั่น",
    tagColor: "#FF6B7E",
    highlight: "#FFE8EC",
    icon: "✨"
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const data = await getPromotions();
      setPromotions(data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPromo = await addPromotion({
        title: formData.title,
        desc: formData.desc,
        originalPrice: Number(formData.originalPrice),
        salePrice: Number(formData.salePrice),
        validUntil: formData.validUntil,
        tag: formData.tag,
        tagColor: formData.tagColor,
        highlight: formData.highlight,
        icon: formData.icon
      });
      setPromotions([...promotions, newPromo]);
      setShowForm(false);
      setFormData({
        title: "", desc: "", originalPrice: "", salePrice: "",
        validUntil: "", tag: "โปรโมชั่น", tagColor: "#FF6B7E", highlight: "#FFE8EC", icon: "✨"
      });
    } catch (error) {
      console.error("Error adding promotion:", error);
      alert("Failed to add promotion. Please check your connection.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await deletePromotion(id);
      setPromotions(promotions.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert("Failed to delete promotion.");
    }
  };

  const daysLeft = (until: string) => {
    const diff = Math.ceil((new Date(until).getTime() - Date.now()) / 86400000);
    if (diff <= 0) return "หมดอายุแล้ว";
    if (diff === 1) return "หมดพรุ่งนี้!";
    return `เหลือ ${diff} วัน`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการโปรโมชั่น</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>เพิ่มและจัดการข้อเสนอพิเศษสำหรับลูกค้า</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium shadow-sm transition-transform hover:scale-105"
          style={{ backgroundColor: "#FF6B7E" }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "ยกเลิก" : "สร้างโปรโมชั่นใหม่"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm mb-6 border" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#1A365D" }}>
            <Percent size={20} /> สร้างโปรโมชั่นใหม่
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>ชื่อโปรโมชั่น *</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:border-[#FF6B7E]" placeholder="เช่น จัดฟันใสลดพิเศษ 10%" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>ป้ายกำกับ (Tag)</label>
              <input required type="text" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:border-[#FF6B7E]" placeholder="เช่น โปรโมชั่น, จัดฟัน" />
            </div>
            
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>รายละเอียด *</label>
              <textarea required rows={2} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:border-[#FF6B7E]" placeholder="รายละเอียดโปรโมชั่นและเงื่อนไข..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>ราคาปกติ (฿) *</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                <input required type="number" min="0" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-[#FF6B7E]" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>ราคาโปรโมชั่น (฿) *</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                <input required type="number" min="0" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-[#FF6B7E]" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>วันหมดอายุ *</label>
              <div className="relative">
                <CalendarIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                <input required type="date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-[#FF6B7E]" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-[#FF6B7E] text-white font-medium rounded-xl hover:bg-[#E05B6E] transition-colors">
              บันทึกโปรโมชั่น
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">กำลังโหลดโปรโมชั่น...</div>
        ) : promotions.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">ไม่มีโปรโมชั่นในระบบ</div>
        ) : (
          promotions.map(p => {
            const original = Number(p.originalPrice);
            const sale = Number(p.salePrice);
            const saved = original - sale;
            const pct = Math.round((saved / original) * 100);
            
            return (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm border relative" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
                <button onClick={() => handleDelete(p.id)} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                  <Trash2 size={14} />
                </button>
                <div className="p-4 pb-3" style={{ backgroundColor: p.highlight || '#FFE8EC' }}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xl">{p.icon || '✨'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: p.tagColor || '#FF6B7E' }}>{p.tag}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#1A365D" }}>-{pct}%</span>
                  </div>
                  <h3 className="font-bold text-sm leading-snug pr-6" style={{ color: "#1A365D" }}>{p.title}</h3>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs leading-relaxed mb-4 flex-1 text-gray-500 line-clamp-3">{p.desc}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] line-through text-gray-400">฿{original.toLocaleString()}</div>
                      <div className="text-lg font-bold" style={{ color: "#FF8C9A" }}>฿{sale.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-medium" style={{ color: "#1B7A3E" }}>ประหยัด ฿{saved.toLocaleString()}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: daysLeft(p.validUntil).includes("หมด") ? "#E74C3C" : "#64748B" }}>
                        {daysLeft(p.validUntil)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
