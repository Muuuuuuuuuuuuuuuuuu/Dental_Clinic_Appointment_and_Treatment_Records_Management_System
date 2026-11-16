import React from "react";
import { Edit3, Check, Clock } from "lucide-react";
import StatusBadge from "@/app/shared/components/StatusBadge";
import { ServiceInfo, SERVICE_CATEGORIES } from "@/app/shared/data";

interface ServiceCategoryListProps {
  services: ServiceInfo[];
  editId: number | null;
  onStartEdit: (s: ServiceInfo) => void;
  onNameChange: (id: number, val: string) => void;
  onCatChange: (id: number, val: string) => void;
  onDescChange: (id: number, val: string) => void;
  onApplyToChange: (id: number, val: string) => void;
  onBenefitsChange: (id: number, val: string) => void;
  onProceduresChange: (id: number, val: string) => void;
  onCareChange: (id: number, val: string) => void;
  onPriceChange: (id: number, val: string) => void;
  onMaxPriceChange: (id: number, val: string) => void;
  onTimeChange: (id: number, val: string) => void;
  onSaveService: (id: number) => void;
  onToggleActive: (s: ServiceInfo) => void;
  onTogglePublic: (s: ServiceInfo) => void;
}

export default function ServiceCategoryList({
  services,
  editId,
  onStartEdit,
  onNameChange,
  onCatChange,
  onDescChange,
  onApplyToChange,
  onBenefitsChange,
  onProceduresChange,
  onCareChange,
  onPriceChange,
  onMaxPriceChange,
  onTimeChange,
  onSaveService,
  onToggleActive,
  onTogglePublic,
}: ServiceCategoryListProps) {
  return (
    <>
      {SERVICE_CATEGORIES.map((cat) => {
        const catServices = services.filter((s) => s.category === cat);
        if (catServices.length === 0) return null;

        return (
          <div key={cat} className="mb-5">
            <div className="flex items-center gap-2 mb-3 px-1">
              <h2 className="text-sm font-semibold" style={{ color: "#1A365D" }}>
                {cat}
              </h2>
            </div>
            <div
              className="rounded-2xl bg-white overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
            >
              {catServices.map((s, i, arr) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 px-5 py-4"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(26,54,93,0.05)" : "none" }}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    {editId === s.id ? (
                      <div key={`edit-${s.id}`} className="flex flex-col gap-2 w-full">
                        <input
                          type="text"
                          defaultValue={s.name}
                          onChange={(e) => onNameChange(s.id, e.target.value)}
                          className="w-full px-2 py-1 rounded-lg text-sm outline-none border border-slate-200"
                          placeholder="ชื่อบริการ"
                        />
                        <select
                          defaultValue={s.category}
                          onChange={(e) => onCatChange(s.id, e.target.value)}
                          className="w-full px-2 py-1 rounded-lg text-sm outline-none border border-slate-200"
                        >
                          {SERVICE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          defaultValue={s.description}
                          onChange={(e) => onDescChange(s.id, e.target.value)}
                          className="w-full px-2 py-1 rounded-lg text-sm outline-none border border-slate-200"
                          placeholder="คำอธิบาย"
                        />
                        <div className="mt-1">
                          <select
                            defaultValue={s.applyTo || "MOUTH"}
                            onChange={(e) => onApplyToChange(s.id, e.target.value)}
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
                              defaultValue={s.details?.benefits?.join("\n") || ""}
                              onChange={(e) => onBenefitsChange(s.id, e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1.5 rounded-lg text-xs outline-none border border-slate-200 bg-slate-50 focus:bg-white"
                              placeholder="เช่น ช่วยให้ฟันขาวขึ้น"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-slate-500 mb-1">ขั้นตอน (บรรทัดละ 1 ข้อ)</label>
                            <textarea
                              defaultValue={s.details?.procedures?.join("\n") || ""}
                              onChange={(e) => onProceduresChange(s.id, e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1.5 rounded-lg text-xs outline-none border border-slate-200 bg-slate-50 focus:bg-white"
                              placeholder="เช่น 1. ตรวจประเมิน..."
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-slate-500 mb-1">การดูแลรักษา (บรรทัดละ 1 ข้อ)</label>
                            <textarea
                              defaultValue={s.details?.care?.join("\n") || ""}
                              onChange={(e) => onCareChange(s.id, e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1.5 rounded-lg text-xs outline-none border border-slate-200 bg-slate-50 focus:bg-white"
                              placeholder="เช่น ก่อนทำ: งดน้ำ..."
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm" style={{ color: "#1A365D" }}>
                            {s.name}
                          </p>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "#4A6080" }}>
                          {s.description}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-5 flex-shrink-0">
                    {editId === s.id ? (
                      <div className="flex items-end gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-slate-500 h-4 flex items-center">ราคาเริ่มต้น</span>
                          <input
                            type="number"
                            defaultValue={s.basePrice}
                            onChange={(e) => onPriceChange(s.id, e.target.value)}
                            className="w-20 px-2.5 py-1.5 rounded-lg text-sm outline-none border border-slate-200 focus:border-[#FF8C9A] text-center bg-white shadow-2xs h-[34px]"
                          />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-slate-500 h-4 flex items-center">ราคาสูงสุด</span>
                          <input
                            type="number"
                            defaultValue={s.maxPrice || s.basePrice}
                            onChange={(e) => onMaxPriceChange(s.id, e.target.value)}
                            className="w-20 px-2.5 py-1.5 rounded-lg text-sm outline-none border border-slate-200 focus:border-[#FF8C9A] text-center bg-white shadow-2xs h-[34px]"
                          />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1 text-xs text-slate-500 h-4">
                            <Clock size={13} className="text-slate-400" />
                            <span>เวลา (นาที)</span>
                          </div>
                          <input
                            type="number"
                            defaultValue={s.estimatedTime || 30}
                            onChange={(e) => onTimeChange(s.id, e.target.value)}
                            className="w-20 px-2.5 py-1.5 rounded-lg text-sm outline-none border border-slate-200 focus:border-[#FF8C9A] text-center bg-white shadow-2xs h-[34px]"
                          />
                        </div>
                        <button
                          onClick={() => onSaveService(s.id)}
                          className="h-[34px] px-3.5 rounded-lg bg-[#E8FFF0] hover:bg-[#D1FADD] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check size={14} style={{ color: "#1B7A3E" }} />
                          <span className="text-xs font-semibold" style={{ color: "#1B7A3E" }}>
                            บันทึก
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold" style={{ color: "#FF8C9A" }}>
                            ฿{s.basePrice.toLocaleString()}
                            {s.maxPrice && s.maxPrice > s.basePrice ? ` - ${s.maxPrice.toLocaleString()}` : ""}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <Clock size={12} />
                            {s.estimatedTime || 30} นาที
                          </div>
                        </div>
                        <button
                          onClick={() => onStartEdit(s)}
                          className="p-1.5 rounded-lg hover:bg-gray-100"
                          style={{ color: "#4A6080" }}
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 items-end">
                      <button onClick={() => onToggleActive(s)} title={s.active ? "ปิดใช้งานระบบ" : "เปิดใช้งานระบบ"}>
                        <StatusBadge label={s.active ? "ระบบ: เปิด" : "ระบบ: ปิด"} active={s.active} />
                      </button>
                      <button
                        onClick={() => onTogglePublic(s)}
                        title={(s.isPublic ?? true) ? "ซ่อนจากเว็บ" : "แสดงบนเว็บ"}
                      >
                        <StatusBadge
                          label={(s.isPublic ?? true) ? "เว็บ: แสดง" : "เว็บ: ซ่อน"}
                          active={s.isPublic ?? true}
                        />
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
  );
}

