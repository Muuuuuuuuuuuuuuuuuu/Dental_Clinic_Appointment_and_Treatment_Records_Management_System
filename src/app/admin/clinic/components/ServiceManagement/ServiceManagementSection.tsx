import React, { useState, useEffect } from "react";
import { ServiceInfo, SERVICE_CATEGORIES } from "@/app/shared/data";
import {
  getServices,
  updateService,
  addService,
  updateServiceActiveStatus,
  updateServicePublicStatus,
} from "@/app/shared/supabaseApi";

// Sub-components
import ServiceHeader from "./components/ServiceHeader";
import AddServiceCard from "./components/AddServiceCard";
import ServiceCategoryList from "./components/ServiceCategoryList";

/**
 * 🦷 [SERVICE MANAGEMENT MODULE] จัดการบริการทันตกรรม
 * โครงสร้างแบ่งเป็น 3 กล่องหลัก:
 *   1. ServiceHeader: ส่วนหัว และปุ่มเปิดฟอร์มเพิ่มบริการ
 *   2. AddServiceCard: ฟอร์มเพิ่มบริการใหม่
 *   3. ServiceCategoryList: รายการบริการแยกตามหมวดหมู่ พร้อม Inline Edit
 */
interface ServiceManagementProps {
  onBack?: () => void;
}

export default function ServiceManagement({ onBack }: ServiceManagementProps = {}) {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // แก้ไขบริการ
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

  // เพิ่มบริการใหม่
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    desc: "",
    price: "",
    maxPrice: "",
    time: "30",
    category: SERVICE_CATEGORIES[0] as string,
    applyTo: "MOUTH",
    isPublic: true,
    benefits: "",
    procedures: "",
    care: "",
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
          if (b !== undefined) payload.details.benefits = b.split("\n").map((x: string) => x.trim()).filter(Boolean);
          if (p_arr !== undefined) payload.details.procedures = p_arr.split("\n").map((x: string) => x.trim()).filter(Boolean);
          if (c_arr !== undefined) payload.details.care = c_arr.split("\n").map((x: string) => x.trim()).filter(Boolean);
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
    if (!window.confirm(`ต้องการ${actionText}ใช้งานบริการ "${s.name}" (ในระบบ) ใช่หรือไม่?`)) return;

    try {
      await updateServiceActiveStatus(s.id, !s.active);
      setServices((ss) => ss.map((x) => (x.id === s.id ? { ...x, active: !s.active } : x)));
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะบริการ");
    }
  };

  const togglePublicService = async (s: ServiceInfo) => {
    if (!s.id) return;
    const isPublic = s.isPublic ?? true;
    const actionText = isPublic ? "ซ่อนจาก" : "แสดงบน";
    if (!window.confirm(`ต้องการ${actionText}หน้าเว็บจองคิว สำหรับบริการ "${s.name}" ใช่หรือไม่?`)) return;

    try {
      await updateServicePublicStatus(s.id, !isPublic);
      setServices((ss) => ss.map((x) => (x.id === s.id ? { ...x, isPublic: !isPublic } : x)));
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะหน้าเว็บ");
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.time || !newService.category) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
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
        isPublic: newService.isPublic !== false,
        applyTo: newService.applyTo,
        details: {
          benefits: newService.benefits.split("\n").map((x) => x.trim()).filter(Boolean),
          procedures: newService.procedures.split("\n").map((x) => x.trim()).filter(Boolean),
          care: newService.care.split("\n").map((x) => x.trim()).filter(Boolean),
        },
      });
      fetchData();
      setIsAdding(false);
      setNewService({
        ...newService,
        name: "",
        desc: "",
        price: "",
        maxPrice: "",
        isPublic: true,
        benefits: "",
        procedures: "",
        care: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add service");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดข้อมูลบริการ...</div>;

  return (
    <div className="animate-fade-in space-y-4">
      {/* 1. ส่วนหัว และปุ่มเพิ่มบริการ */}
      <ServiceHeader
        onBack={onBack}
        isAdding={isAdding}
        onOpenAdd={() => setIsAdding(true)}
      />

      {/* 2. ฟอร์มเพิ่มบริการใหม่ (แสดงเมื่อคลิกเพิ่ม) */}
      {isAdding && (
        <AddServiceCard
          newService={newService}
          onServiceChange={(fields) => setNewService((prev) => ({ ...prev, ...fields }))}
          onSubmit={handleAddService}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {/* 3. รายการบริการแยกตามหมวดหมู่ */}
      <ServiceCategoryList
        services={services}
        editId={editId}
        names={names}
        cats={cats}
        descs={descs}
        applyTos={applyTos}
        benefitsMap={benefitsMap}
        proceduresMap={proceduresMap}
        careMap={careMap}
        prices={prices}
        maxPrices={maxPrices}
        times={times}
        onStartEdit={(s) => {
          setEditId(s.id);
          setPrices((p) => ({ ...p, [s.id]: String(s.basePrice) }));
          setMaxPrices((p) => ({ ...p, [s.id]: String(s.maxPrice || s.basePrice) }));
          setTimes((t) => ({ ...t, [s.id]: String(s.estimatedTime || 30) }));
          setNames((n) => ({ ...n, [s.id]: s.name }));
          setDescs((d) => ({ ...d, [s.id]: s.description }));
          setCats((c) => ({ ...c, [s.id]: s.category }));
        }}
        onNameChange={(id, val) => setNames((n) => ({ ...n, [id]: val }))}
        onCatChange={(id, val) => setCats((c) => ({ ...c, [id]: val }))}
        onDescChange={(id, val) => setDescs((d) => ({ ...d, [id]: val }))}
        onApplyToChange={(id, val) => setApplyTos((at) => ({ ...at, [id]: val }))}
        onBenefitsChange={(id, val) => setBenefitsMap((b) => ({ ...b, [id]: val }))}
        onProceduresChange={(id, val) => setProceduresMap((p) => ({ ...p, [id]: val }))}
        onCareChange={(id, val) => setCareMap((c) => ({ ...c, [id]: val }))}
        onPriceChange={(id, val) => setPrices((p) => ({ ...p, [id]: val }))}
        onMaxPriceChange={(id, val) => setMaxPrices((p) => ({ ...p, [id]: val }))}
        onTimeChange={(id, val) => setTimes((t) => ({ ...t, [id]: val }))}
        onSaveService={saveServiceChanges}
        onToggleActive={toggleActiveService}
        onTogglePublic={togglePublicService}
      />
    </div>
  );
}
