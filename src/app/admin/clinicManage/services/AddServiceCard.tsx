import { SERVICE_CATEGORIES } from "@/app/shared/data";

interface AddServiceCardProps {
  newService: {
    name: string;
    desc: string;
    price: string;
    maxPrice: string;
    time: string;
    category: string;
    applyTo: string;
    isPublic?: boolean;
    benefits: string;
    procedures: string;
    care: string;
  };
  onServiceChange: (fields: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function AddServiceCard({
  newService,
  onServiceChange,
  onSubmit,
  onCancel,
}: AddServiceCardProps) {
  return (
    <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
      <h2 className="text-sm font-bold mb-4" style={{ color: "#1A365D" }}>
        เพิ่มบริการใหม่
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อบริการ *</label>
          <input
            type="text"
            value={newService.name}
            onChange={(e) => onServiceChange({ name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
            placeholder="เช่น ขูดหินปูน"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">หมวดหมู่ *</label>
          <select
            value={newService.category}
            onChange={(e) => onServiceChange({ category: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
          >
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">ราคาเริ่มต้น (บาท) *</label>
          <input
            type="number"
            value={newService.price}
            onChange={(e) => onServiceChange({ price: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
            placeholder="500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">ราคาสูงสุด (บาท)</label>
          <input
            type="number"
            value={newService.maxPrice}
            onChange={(e) => onServiceChange({ maxPrice: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
            placeholder="เว้นว่างถ้าเท่ากับราคาเริ่มต้น"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">เวลา (นาที) *</label>
          <input
            type="number"
            value={newService.time}
            onChange={(e) => onServiceChange({ time: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
            placeholder="30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">บริเวณที่ทำ (Odontogram)</label>
          <select
            value={newService.applyTo}
            onChange={(e) => onServiceChange({ applyTo: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
          >
            <option value="MOUTH">ทำทั้งปาก (เช่น ขูดหินปูน)</option>
            <option value="TOOTH">ระบุซี่ฟัน (เช่น อุดฟัน)</option>
            <option value="ARCH">ขากรรไกร บน/ล่าง</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">คำอธิบาย</label>
          <input
            type="text"
            value={newService.desc}
            onChange={(e) => onServiceChange({ desc: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#FF8C9A]"
            placeholder="คำอธิบายสั้นๆ"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">แสดงบนเว็บไซต์</label>
          <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors h-[38px]">
            <input
              type="checkbox"
              checked={newService.isPublic !== false}
              onChange={(e) => onServiceChange({ isPublic: e.target.checked })}
              className="accent-[#1A365D] w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs text-slate-700 select-none">
              {newService.isPublic !== false ? "แสดงบนเว็บ / จองคิว" : "ซ่อน (ใช้คิดราคาภายใน)"}
            </span>
          </label>
        </div>

        <div className="md:col-span-4 flex flex-col gap-3 mt-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ข้อดี (บรรทัดละ 1 ข้อ)</label>
            <textarea
              value={newService.benefits}
              onChange={(e) => onServiceChange({ benefits: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#FF8C9A]"
              placeholder="เช่น ช่วยให้ฟันขาวขึ้น"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ขั้นตอน (บรรทัดละ 1 ข้อ)</label>
            <textarea
              value={newService.procedures}
              onChange={(e) => onServiceChange({ procedures: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#FF8C9A]"
              placeholder="เช่น 1. ตรวจประเมิน..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">การดูแลรักษา (บรรทัดละ 1 ข้อ)</label>
            <textarea
              value={newService.care}
              onChange={(e) => onServiceChange({ care: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#FF8C9A]"
              placeholder="เช่น ก่อนทำ: งดน้ำ..."
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
        >
          ยกเลิก
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 text-xs font-semibold bg-[#1A365D] text-white rounded-xl hover:bg-[#122847]"
        >
          บันทึกบริการ
        </button>
      </div>
    </div>
  );
}

