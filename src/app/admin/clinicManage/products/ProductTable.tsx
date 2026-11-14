import React from "react";
import { Edit3, Check, Settings2, Package, Pill } from "lucide-react";
import StatusBadge from "@/app/shared/components/StatusBadge";
import { Product } from "@/app/shared/data";

interface ProductTableProps {
  products: Product[];
  editId: number | null;
  editData: Partial<Product>;
  onStartEdit: (p: Product) => void;
  onEditFieldChange: (fields: Partial<Product>) => void;
  onSaveEdit: (id: number) => void;
  onToggleActive: (p: Product) => void;
}

export default function ProductTable({
  products,
  editId,
  editData,
  onStartEdit,
  onEditFieldChange,
  onSaveEdit,
  onToggleActive,
}: ProductTableProps) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs"
      style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}
    >
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 shadow-2xs" style={{ backgroundColor: "#F8FAFC", color: "#4A6080" }}>
            <tr>
              
              <th className="py-2.5 px-3.5 font-semibold uppercase tracking-wider">ชื่อรายการ</th>
              <th className="py-2.5 px-3.5 font-semibold uppercase tracking-wider">ประเภท</th>
              <th className="py-2.5 px-3.5 font-semibold uppercase tracking-wider">ราคา/หน่วย</th>
              <th className="py-2.5 px-3.5 font-semibold uppercase tracking-wider">วิธีใช้</th>
              <th className="py-2.5 px-3.5 font-semibold uppercase tracking-wider">สถานะ</th>
              <th className="py-2.5 px-3.5 font-semibold uppercase tracking-wider text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
               
                <td className="py-2 px-3.5">
                  {editId === p.id ? (
                    <input
                      type="text"
                      value={editData.name ?? p.name}
                      onChange={(e) => onEditFieldChange({ name: e.target.value })}
                      className="w-full p-1.5 border rounded-lg text-xs"
                    />
                  ) : (
                    <div className="font-semibold text-xs" style={{ color: "#1A365D" }}>
                      {p.name}
                    </div>
                  )}
                </td>
                <td className="py-2 px-3.5">
                  {editId === p.id ? (
                    <select
                      value={editData.type ?? p.type}
                      onChange={(e) => onEditFieldChange({ type: e.target.value as any })}
                      className="p-1.5 border rounded-lg text-xs"
                    >
                      <option value="ยา">ยา</option>
                      <option value="สินค้าทั่วไป">สินค้าทั่วไป</option>
                    </select>
                  ) : (
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold w-fit ${
                        p.type === "ยา" ? "bg-indigo-50 text-indigo-700" : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {p.type === "ยา" ? <Pill size={11} /> : <Package size={11} />}
                      {p.type}
                    </span>
                  )}
                </td>
                <td className="py-2 px-3.5">
                  {editId === p.id ? (
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={editData.price ?? p.price}
                        onChange={(e) => onEditFieldChange({ price: parseFloat(e.target.value) })}
                        className="w-16 p-1.5 border rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={editData.unit ?? p.unit ?? ""}
                        onChange={(e) => onEditFieldChange({ unit: e.target.value })}
                        className="w-14 p-1.5 border rounded-lg text-xs"
                        placeholder="หน่วย"
                      />
                    </div>
                  ) : (
                    <div className="text-xs font-bold" style={{ color: "#1A365D" }}>
                      ฿{p.price}{" "}
                      <span className="font-normal text-[10px]" style={{ color: "#94A3B8" }}>
                        / {p.unit || "ชิ้น"}
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-2 px-3.5">
                  {editId === p.id ? (
                    (editData.type ?? p.type) === "ยา" ? (
                      <input
                        type="text"
                        value={editData.instruction ?? p.instruction ?? ""}
                        onChange={(e) => onEditFieldChange({ instruction: e.target.value })}
                        className="w-full p-1.5 border rounded-lg text-xs"
                        placeholder="วิธีกิน"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )
                  ) : (
                    <div className="text-xs truncate max-w-[200px]" style={{ color: "#4A6080" }}>
                      {p.instruction || "-"}
                    </div>
                  )}
                </td>
                <td className="py-2 px-3.5">
                  <StatusBadge label={p.isActive ? "ใช้งานปกติ" : "ปิดใช้งาน"} active={p.isActive} />
                </td>
                <td className="py-2 px-3.5 text-right">
                  {editId === p.id ? (
                    <button
                      onClick={() => onSaveEdit(p.id)}
                      className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                  ) : (
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onStartEdit(p)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="แก้ไข"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onToggleActive(p)}
                        className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="เปิด/ปิดใช้งาน"
                      >
                        <Settings2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs">ยังไม่มีรายการสินค้าและยาในระบบ</div>
        )}
      </div>
    </div>
  );
}
