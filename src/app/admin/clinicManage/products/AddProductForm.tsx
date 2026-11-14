import React from "react";

const COMMON_UNITS = ["เม็ด", "แคปซูล", "ขวด", "หลอด", "ชิ้น", "ซอง", "กล่อง", "เซ็ต"];

interface AddProductFormProps {
  newProduct: {
    name: string;
    type: "ยา" | "สินค้าทั่วไป";
    price: string;
    unit: (typeof COMMON_UNITS)[number];
    instruction: string;
    isActive: boolean;
  };
  onProductChange: (fields: any) => void;
  onSubmit: () => void;
}

export default function AddProductForm({
  newProduct,
  onProductChange,
  onSubmit,
}: AddProductFormProps) {
  const isReady = !!newProduct.name && !!newProduct.price;
  return (
    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 animate-fade-in">
      <h3 className="font-bold mb-4" style={{ color: "#1A365D" }}>
        เพิ่มรายการใหม่
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>
            ชื่อยา/สินค้า *
          </label>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => onProductChange({ name: e.target.value })}
            className="w-full p-2.5 border rounded-xl bg-white text-xs"
            placeholder="เช่น Paracetamol 500mg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>
            ประเภท *
          </label>
          <select
            value={newProduct.type}
            onChange={(e) => onProductChange({ type: e.target.value as any })}
            className="w-full p-2.5 border rounded-xl bg-white text-xs"
          >
            <option value="ยา">ยา</option>
            <option value="สินค้าทั่วไป">สินค้าทั่วไป</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>
            ราคาขาย (บาท) *
          </label>
          <input
            type="number"
            value={newProduct.price}
            onChange={(e) => onProductChange({ price: e.target.value })}
            className="w-full p-2.5 border rounded-xl bg-white text-xs"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>
            หน่วย
          </label>
          <select

            value={newProduct.unit}
            onChange={(e) => onProductChange({ unit: e.target.value })}
            className="w-full p-2.5 border rounded-xl bg-white text-xs "
          >
            {COMMON_UNITS.map((u) => (
              <option key={u} value={u}>   {u} </option>

            ))}
          </select>


        </div>
        {newProduct.type === "ยา" && (
          <div className="col-span-3">
            <label className="block text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>
              วิธีใช้/วิธีกิน (สำหรับยา)
            </label>
            <input
              type="text"
              value={newProduct.instruction}
              onChange={(e) => onProductChange({ instruction: e.target.value })}
              className="w-full p-2.5 border rounded-xl bg-white text-xs"
              placeholder="เช่น รับประทานครั้งละ 1 เม็ด หลังอาหาร 3 เวลา"
            />
          </div>
        )}
      </div>
      <button
        onClick={onSubmit}
        className="w-full py-2.5 rounded-xl text-xs font-bold transition-all text-white mt-2 disabled:opacity-50"
        style={{ backgroundColor: isReady ? "#1B7A3E" : "#94A3B8" }}
        disabled={!isReady}
      >
        บันทึกรายการ
      </button>
    </div>
  );
}

