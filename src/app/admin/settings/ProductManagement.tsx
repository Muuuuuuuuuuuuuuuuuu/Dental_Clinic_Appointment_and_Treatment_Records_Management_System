import React, { useState, useEffect } from "react";
import { Plus, Edit3, Check, Settings2, Package, Pill } from "lucide-react";
import StatusBadge from "../../shared/components/StatusBadge";
import { Product } from "../../shared/data";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../../shared/api/treatmentApi";

const PRODUCT_TYPES = ['ยา', 'สินค้าทั่วไป'] as const;
const COMMON_UNITS = ['เม็ด', 'แคปซูล', 'ขวด', 'หลอด', 'ชิ้น', 'อัน', 'ซอง', 'กล่อง', 'เซ็ต'];

export default function ProductManagement() {
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit States
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});

  // Add States
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    type: "ยา" as 'ยา' | 'สินค้าทั่วไป',
    price: "",
    unit: "เม็ด",
    instruction: "",
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // get all products including inactive for admin
      const { supabase } = await import('../../shared/utils/supabaseClient');
      const { data } = await supabase.from('product').select('*').order('product_type', { ascending: true });
      if (data) {
        setProducts(data.map((d: any) => ({
          id: d.product_id,
          name: d.product_name,
          type: d.product_type,
          price: Number(d.price),
          unit: d.unit,
          instruction: d.instruction,
          isActive: d.is_active
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await updateProduct(id, editData);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    }
    setEditId(null);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    try {
      await addProduct({
        name: newProduct.name,
        type: newProduct.type,
        price: parseFloat(newProduct.price),
        unit: newProduct.unit,
        instruction: newProduct.type === 'ยา' ? newProduct.instruction : '',
        isActive: true
      });
      setIsAdding(false);
      setNewProduct({ name: "", type: "ยา", price: "", unit: "เม็ด", instruction: "", isActive: true });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    }
  };

  const toggleActive = async (p: Product) => {
    const actionText = p.isActive ? "ปิด" : "เปิด";
    if (confirm(`คุณต้องการ ${actionText} การใช้งาน ${p.name} ใช่หรือไม่?`)) {
      try {
        await updateProduct(p.id, { isActive: !p.isActive });
        fetchData();
      } catch (err) {
        alert("Update failed");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100" style={{ boxShadow: "0 4px 20px rgba(26,54,93,0.03)" }}>
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการสินค้าและยา</h2>
          <p className="text-sm" style={{ color: "#4A6080" }}>เพิ่ม/แก้ไข รายชื่อยาและสินค้าทั่วไปสำหรับขายหน้าเคาน์เตอร์</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
          style={{ backgroundColor: "#1A365D", color: "white" }}
        >
          {isAdding ? "ยกเลิก" : <><Plus size={16} /> เพิ่มรายการ</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 animate-fade-in">
          <h3 className="font-bold mb-4" style={{ color: "#1A365D" }}>เพิ่มรายการใหม่</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>ชื่อยา/สินค้า *</label>
              <input 
                type="text" 
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full p-2.5 border rounded-xl bg-white" 
                placeholder="เช่น Paracetamol 500mg" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>ประเภท *</label>
              <select 
                value={newProduct.type}
                onChange={e => setNewProduct({...newProduct, type: e.target.value as any})}
                className="w-full p-2.5 border rounded-xl bg-white"
              >
                <option value="ยา">ยา</option>
                <option value="สินค้าทั่วไป">สินค้าทั่วไป</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>ราคาขาย (บาท) *</label>
              <input 
                type="number" 
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                className="w-full p-2.5 border rounded-xl bg-white" 
                placeholder="0" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>หน่วย</label>
              <input 
                type="text" 
                list="units"
                value={newProduct.unit}
                onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                className="w-full p-2.5 border rounded-xl bg-white" 
                placeholder="เช่น เม็ด" 
              />
              <datalist id="units">
                {COMMON_UNITS.map(u => <option key={u} value={u} />)}
              </datalist>
            </div>
            {newProduct.type === 'ยา' && (
              <div className="col-span-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: "#4A6080" }}>วิธีใช้/วิธีกิน (สำหรับยา)</label>
                <input 
                  type="text" 
                  value={newProduct.instruction}
                  onChange={e => setNewProduct({...newProduct, instruction: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-white" 
                  placeholder="เช่น รับประทานครั้งละ 1 เม็ด หลังอาหาร 3 เวลา" 
                />
              </div>
            )}
          </div>
          <button 
            onClick={handleAddProduct}
            className="w-full py-3 rounded-xl font-bold transition-all text-white mt-2"
            style={{ backgroundColor: newProduct.name && newProduct.price ? "#1B7A3E" : "#94A3B8" }}
            disabled={!newProduct.name || !newProduct.price}
          >
            บันทึกรายการ
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(26,54,93,0.03)" }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", color: "#4A6080", fontSize: "12px" }}>
                <th className="p-4 font-semibold uppercase tracking-wider">ชื่อรายการ</th>
                <th className="p-4 font-semibold uppercase tracking-wider">ประเภท</th>
                <th className="p-4 font-semibold uppercase tracking-wider">ราคา/หน่วย</th>
                <th className="p-4 font-semibold uppercase tracking-wider">วิธีใช้</th>
                <th className="p-4 font-semibold uppercase tracking-wider">สถานะ</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {editId === p.id ? (
                      <input 
                        type="text" 
                        value={editData.name ?? p.name}
                        onChange={e => setEditData({...editData, name: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    ) : (
                      <div className="font-semibold" style={{ color: "#1A365D" }}>{p.name}</div>
                    )}
                  </td>
                  <td className="p-4">
                    {editId === p.id ? (
                      <select 
                        value={editData.type ?? p.type}
                        onChange={e => setEditData({...editData, type: e.target.value as any})}
                        className="p-2 border rounded-lg text-sm"
                      >
                        <option value="ยา">ยา</option>
                        <option value="สินค้าทั่วไป">สินค้าทั่วไป</option>
                      </select>
                    ) : (
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${p.type === 'ยา' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>
                        {p.type === 'ยา' ? <Pill size={12}/> : <Package size={12}/>}
                        {p.type}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {editId === p.id ? (
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={editData.price ?? p.price}
                          onChange={e => setEditData({...editData, price: parseFloat(e.target.value)})}
                          className="w-20 p-2 border rounded-lg text-sm"
                        />
                        <input 
                          type="text" 
                          list="units_edit"
                          value={editData.unit ?? p.unit ?? ""}
                          onChange={e => setEditData({...editData, unit: e.target.value})}
                          className="w-16 p-2 border rounded-lg text-sm"
                          placeholder="หน่วย"
                        />
                      </div>
                    ) : (
                      <div className="text-sm font-bold" style={{ color: "#1A365D" }}>
                        ฿{p.price} <span className="font-normal text-xs" style={{ color: "#94A3B8" }}>/ {p.unit || 'ชิ้น'}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {editId === p.id ? (
                      (editData.type ?? p.type) === 'ยา' ? (
                        <input 
                          type="text" 
                          value={editData.instruction ?? p.instruction ?? ""}
                          onChange={e => setEditData({...editData, instruction: e.target.value})}
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="วิธีกิน"
                        />
                      ) : <span className="text-xs text-gray-400">-</span>
                    ) : (
                      <div className="text-xs truncate max-w-[150px]" style={{ color: "#4A6080" }}>{p.instruction || '-'}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <StatusBadge label={p.isActive ? "ใช้งานปกติ" : "ปิดใช้งาน"} active={p.isActive} />
                  </td>
                  <td className="p-4 text-right">
                    {editId === p.id ? (
                      <button onClick={() => handleSaveEdit(p.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                        <Check size={16} />
                      </button>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditId(p.id); setEditData(p); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => toggleActive(p)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                          <Settings2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">ยังไม่มีรายการสินค้าและยาในระบบ</div>
          )}
        </div>
      )}
    </div>
  );
}
