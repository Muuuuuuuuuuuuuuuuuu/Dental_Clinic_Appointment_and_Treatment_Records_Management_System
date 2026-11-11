import React, { useState, useEffect } from "react";
import AdminHeader from "./AdminHeader";
import AdminTable from "./AdminTable";
import AdminModal from "./AdminModal";
import { AdminInfo } from "@/app/shared/data";
import { getAdmins, addAdmin, updateAdmin } from "@/app/shared/supabaseApi";

interface AdminManagementProps {
  onBack?: () => void;
}

export default function AdminManagement({ onBack }: AdminManagementProps) {
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminInfo | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    citizenId: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    birthDate: "",
    address: "",
    role: "ผู้ดูแลระบบ",
    startDate: "",
    employmentStatus: "ปฏิบัติงานปกติ",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (a?: AdminInfo) => {
    setEditing(a ?? null);
    setForm(
      a
        ? {
            firstName: a.firstName || a.name.split(" ")[0] || "",
            lastName: a.lastName || a.name.split(" ")[1] || "",
            citizenId: a.citizenId || "",
            email: a.email,
            phone: a.phone || "",
            password: "",
            gender: a.gender || "",
            birthDate: a.birthDate || "",
            address: a.address || "",
            role: a.role || "ผู้ดูแลระบบ",
            startDate: a.startDate || "",
            employmentStatus: a.employmentStatus || "ปฏิบัติงานปกติ",
          }
        : {
            firstName: "",
            lastName: "",
            citizenId: "",
            email: "",
            phone: "",
            password: "",
            gender: "",
            birthDate: "",
            address: "",
            role: "ผู้ดูแลระบบ",
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
        await updateAdmin(editing.id, {
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
        await addAdmin({
          id: "",
          name: `${form.firstName} ${form.lastName}`,
          firstName: form.firstName,
          lastName: form.lastName,
          citizenId: form.citizenId,
          email: form.email,
          phone: form.phone,
          password: form.password || "admin123",
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
      await fetchAdmins();
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + (err.message || err));
    }
  };

  const handleToggleStatus = async (a: AdminInfo) => {
    if (!a.id) return;
    try {
      await updateAdmin(a.id, { active: !a.active });
      setAdmins((aa) => aa.map((x) => (x.id === a.id ? { ...x, active: !a.active } : x)));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <AdminHeader
        totalCount={admins.length}
        onOpenAdd={() => openModal()}
        onBack={onBack}
      />
      <AdminTable
        admins={admins}
        loading={loading}
        onEdit={(a) => openModal(a)}
        onToggleStatus={handleToggleStatus}
      />
      <AdminModal
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

