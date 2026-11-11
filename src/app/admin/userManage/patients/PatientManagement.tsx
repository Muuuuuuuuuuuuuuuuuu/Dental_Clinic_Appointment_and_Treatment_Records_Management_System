import React, { useState, useEffect } from "react";
import PatientHeader from "./PatientHeader";
import PatientTable from "./PatientTable";
import PatientModal from "./PatientModal";
import { PatientInfo } from "@/app/shared/data";
import { getPatients, addPatient, updatePatientStatus } from "@/app/shared/supabaseApi";

interface PatientManagementProps {
  onBack?: () => void;
}

export default function PatientManagement({ onBack }: PatientManagementProps) {
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    citizenId: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    allergyHistory: "ไม่มี",
    underlyingDisease: "ไม่มี",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    password: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.hn?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = () => {
    setForm({
      firstName: "",
      lastName: "",
      citizenId: "",
      email: "",
      phone: "",
      gender: "",
      dob: "",
      address: "",
      allergyHistory: "ไม่มี",
      underlyingDisease: "ไม่มี",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      password: "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.phone) {
      alert("กรุณากรอกชื่อ นามสกุล และเบอร์โทรศัพท์");
      return;
    }
    try {
      setSaving(true);
      await addPatient({
        firstName: form.firstName,
        lastName: form.lastName,
        citizenId: form.citizenId,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob,
        address: form.address,
        allergyHistory: form.allergyHistory || "ไม่มี",
        underlyingDisease: form.underlyingDisease || "ไม่มี",
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        emergencyContactRelationship: form.emergencyContactRelationship,
        password: form.password || "123456789",
      });
      setShowModal(false);
      await fetchPatients();
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (p: PatientInfo) => {
    if (!p.id) return;
    const newActive = !(p.active ?? true);
    const actionText = newActive ? "เปิดใช้งาน" : "ปิดใช้งาน";
    if (!confirm(`คุณต้องการ${actionText}คนไข้ "${p.name}" ใช่หรือไม่?`)) return;
    try {
      await updatePatientStatus(p.id, newActive);
      setPatients((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, active: newActive } : x))
      );
    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะคนไข้: " + (err.message || err));
    }
  };

  return (
    <div>
      <PatientHeader
        totalCount={patients.length}
        search={search}
        onSearchChange={setSearch}
        onOpenAdd={openModal}
        onBack={onBack}
      />
      <PatientTable
        patients={filteredPatients}
        loading={loading}
        onToggleStatus={handleToggleStatus}
      />
      <PatientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        saving={saving}
        onSave={handleSave}
      />
    </div>
  );
}
