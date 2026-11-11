import React, { useState, useEffect } from "react";
import StaffHeader from "./StaffHeader";
import StaffTable from "./StaffTable";
import StaffModal from "./StaffModal";
import { StaffInfo } from "@/app/shared/data";
import { getStaff, addStaff, updateStaff } from "@/app/shared/supabaseApi";

interface StaffManagementProps {
  onBack?: () => void;
}

export default function StaffManagement({ onBack }: StaffManagementProps) {
  const [staff, setStaff] = useState<StaffInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StaffInfo | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    citizenId: "",
    role: "พนักงานต้อนรับ",
    email: "",
    phone: "",
    password: "",
    address: "",
    gender: "",
    birthDate: "",
    startDate: "",
    employmentStatus: "ปฏิบัติงานปกติ",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaff();
      setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (s?: StaffInfo) => {
    setEditing(s ?? null);
    setForm(
      s
        ? {
            firstName: s.firstName || s.name.split(" ")[0] || "",
            lastName: s.lastName || s.name.split(" ")[1] || "",
            citizenId: (s as any).citizenId || "",
            role: s.role || "พนักงานคลินิก",
            email: s.email,
            phone: s.phone || "",
            password: "",
            address: (s as any).address || "",
            gender: (s as any).gender || "",
            birthDate: (s as any).birthDate || "",
            startDate: (s as any).startDate || "",
            employmentStatus: (s as any).employmentStatus || "ปฏิบัติงานปกติ",
          }
        : {
            firstName: "",
            lastName: "",
            citizenId: "",
            role: "พนักงานต้อนรับ",
            email: "",
            phone: "",
            password: "",
            address: "",
            gender: "",
            birthDate: "",
            startDate: "",
            employmentStatus: "ปฏิบัติงานปกติ",
          }
    );
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.email) {
      alert("กรุณากรอกชื่อและอีเมล");
      return;
    }
    try {
      if (editing) {
        await updateStaff(editing.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          gender: form.gender,
          birthDate: form.birthDate || null,
          address: form.address,
          role: form.role,
          startDate: form.startDate || null,
          employmentStatus: form.employmentStatus,
        });
      } else {
        await addStaff({
          name: `${form.firstName} ${form.lastName}`,
          firstName: form.firstName,
          lastName: form.lastName,
          citizenId: form.citizenId,
          email: form.email,
          phone: form.phone,
          password: form.password || "password123",
          gender: form.gender,
          birthDate: form.birthDate || null,
          address: form.address,
          role: form.role,
          startDate: form.startDate || null,
          employmentStatus: form.employmentStatus,
          active: true,
        });
      }
      setShowModal(false);
      await fetchStaff();
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + (err.message || err));
    }
  };

  const handleToggleStatus = async (s: StaffInfo) => {
    if (!s.id) return;
    try {
      await updateStaff(s.id, { active: !s.active });
      setStaff((ss) => ss.map((x) => (x.id === s.id ? { ...x, active: !s.active } : x)));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <StaffHeader
        totalCount={staff.length}
        onOpenAdd={() => openModal()}
        onBack={onBack}
      />
      <StaffTable
        staff={staff}
        loading={loading}
        onEdit={(s) => openModal(s)}
        onToggleStatus={handleToggleStatus}
      />
      <StaffModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editing={editing}
        form={form}
        setForm={setForm}
        onSave={handleSave}
      />
    </div>
  );
}

