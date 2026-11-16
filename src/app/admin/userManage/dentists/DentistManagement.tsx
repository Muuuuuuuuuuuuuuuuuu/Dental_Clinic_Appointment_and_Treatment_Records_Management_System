import { useState, useEffect } from "react";
import DentistHeader from "./DentistHeader";
import DentistGrid from "./DentistGrid";
import DentistModal from "./DentistModal";
import { DentistInfo, ServiceInfo } from "@/app/shared/data";
import { getDentists, addDentist, updateDentist, getServices } from "@/app/shared/supabaseApi";

interface DentistManagementProps {
  onBack?: () => void;
}

export default function DentistManagement({ onBack }: DentistManagementProps) {
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [allServices, setAllServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DentistInfo | null>(null);

  const [form, setForm] = useState({
    titleName: "ทพ.",
    firstName: "",
    lastName: "",
    citizenId: "",
    specialty: "",
    license: "",
    university: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    gender: "",
    birthDate: "",
    experienceYears: 0,
    graduationYear: new Date().getFullYear(),
    imageUrl: "",
    startDate: "",
    serviceIds: [] as number[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [den, svc] = await Promise.all([getDentists(), getServices()]);
      setDentists(den);
      setAllServices(svc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (d?: DentistInfo) => {
    setEditing(d ?? null);
    setForm(
      d
        ? {
            titleName: d.titleName || "ทพ.",
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            citizenId: d.citizenId || "",
            specialty: d.specialty,
            license: d.license,
            university: d.university || "",
            email: d.email,
            password: "",
            phone: d.phone,
            address: d.address || "",
            gender: d.gender || "",
            birthDate: d.birthDate || "",
            experienceYears: d.experienceYears || 0,
            graduationYear: d.graduationYear || new Date().getFullYear(),
            imageUrl: d.imageUrl || "",
            startDate: d.startDate || "",
            serviceIds: d.serviceIds || [],
          }
        : {
            titleName: "ทพ.",
            firstName: "",
            lastName: "",
            citizenId: "",
            specialty: "",
            license: "",
            university: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            gender: "",
            birthDate: "",
            experienceYears: 0,
            graduationYear: new Date().getFullYear(),
            imageUrl: "",
            startDate: "",
            serviceIds: [],
          }
    );
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.specialty || !form.license || !form.email) {
      alert("กรุณากรอกข้อมูลสำคัญให้ครบถ้วน");
      return;
    }
    try {
      if (editing) {
        await updateDentist(editing.id, {
          titleName: form.titleName,
          firstName: form.firstName,
          lastName: form.lastName,
          specialty: form.specialty,
          license: form.license,
          university: form.university,
          phone: form.phone,
          address: form.address,
          gender: form.gender,
          birthDate: form.birthDate || null,
          experienceYears: form.experienceYears,
          graduationYear: form.graduationYear,
          imageUrl: form.imageUrl,
          startDate: form.startDate || null,
          serviceIds: form.serviceIds,
        });
      } else {
        await addDentist({
          name: `${form.titleName} ${form.firstName} ${form.lastName}`,
          titleName: form.titleName,
          firstName: form.firstName,
          lastName: form.lastName,
          citizenId: form.citizenId,
          specialty: form.specialty,
          license: form.license,
          university: form.university,
          email: form.email,
          password: form.password || "password123",
          phone: form.phone,
          address: form.address,
          gender: form.gender,
          birthDate: form.birthDate || null,
          experienceYears: form.experienceYears,
          graduationYear: form.graduationYear,
          imageUrl: form.imageUrl,
          startDate: form.startDate || null,
          active: true,
          serviceIds: form.serviceIds,
        });
      }
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + (err.message || err));
    }
  };

  const handleToggleStatus = async (d: DentistInfo) => {
    if (!d.id) return;
    try {
      await updateDentist(d.id, { active: !d.active });
      setDentists((dd) => dd.map((x) => (x.id === d.id ? { ...x, active: !d.active } : x)));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <DentistHeader
        totalCount={dentists.length}
        onOpenAdd={() => openModal()}
        onBack={onBack}
      />
      <DentistGrid
        dentists={dentists}
        loading={loading}
        onEdit={(d) => openModal(d)}
        onToggleStatus={handleToggleStatus}
      />
      <DentistModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editing={editing}
        form={form}
        setForm={setForm}
        allServices={allServices}
        onSave={handleSave}
      />
    </div>
  );
}

