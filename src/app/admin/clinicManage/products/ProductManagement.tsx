 import React, { useState, useEffect } from "react";
import { Product } from "@/app/shared/data";
import { getProducts, addProduct, updateProduct } from "@/app/shared/api/treatmentApi";

// Sub-components
import ProductHeader from "./ProductHeader";
import AddProductForm from "./AddProductForm";
import ProductTable from "./ProductTable";

/**
 * 💊 [PRODUCT MANAGEMENT MODULE] จัดการสินค้าและยา
 * โครงสร้างแบ่งเป็น 3 กล่องหลัก:
 *   1. ProductHeader: ส่วนหัว และปุ่มเปิดฟอร์มเพิ่มรายการ
 *   2. AddProductForm: ฟอร์มเพิ่มสินค้า/ยาใหม่ (เปิดเมื่อกดเพิ่ม)
 *   3. ProductTable: ตารางแสดงรายการสินค้าและยา พร้อม Inline Edit
 */
interface ProductManagementProps {
  onBack?: () => void;
}

export default function ProductManagement({ onBack }: ProductManagementProps = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // แก้ไขข้อมูล
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});

  // เพิ่มข้อมูลใหม่
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    type: "ยา" as "ยา" | "สินค้าทั่วไป",
    price: "",
    unit: "เม็ด",
    instruction: "",
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getProducts(undefined, true);
      setProducts(data);
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
        instruction: newProduct.type === "ยา" ? newProduct.instruction : "",
        isActive: true,
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
    <div className="space-y-3.5">
      {/* 1. ส่วนหัวหน้า และปุ่มเพิ่มรายการ */}
      <ProductHeader
        onBack={onBack}
        isAdding={isAdding}
        onToggleAdd={() => setIsAdding(!isAdding)}
      />

      {/* 2. ฟอร์มเพิ่มรายการใหม่ (แสดงเมื่อ isAdding เป็นจริง) */}
      {isAdding && (
        <AddProductForm
          newProduct={newProduct}
          onProductChange={(fields) => setNewProduct((prev) => ({ ...prev, ...fields }))}
          onSubmit={handleAddProduct}
        />
      )}

      {/* 3. ตารางแสดงรายการสินค้าและยา */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
      ) : (
        <ProductTable
          products={products}
          editId={editId}
          editData={editData}
          onStartEdit={(p) => {
            setEditId(p.id);
            setEditData(p);
          }}
          onEditFieldChange={(fields) => setEditData((prev) => ({ ...prev, ...fields }))}
          onSaveEdit={handleSaveEdit}
          onToggleActive={toggleActive}
        />
      )}
    </div>
  );
}
