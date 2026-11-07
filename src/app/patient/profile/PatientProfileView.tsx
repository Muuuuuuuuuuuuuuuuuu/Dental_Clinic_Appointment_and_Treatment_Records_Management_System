import React, { useState } from "react";
import { PatientUser } from "../types";
import { usePatientProfile } from "./hooks/usePatientProfile";
import { ChangePasswordModal, ChangeEmailModal } from "@/app/shared/components";
import {
  ProfileTitleBar,
  AvatarBox,
  IdentificationCard,
  EditableHealthCard,
  EditableContactCard,
} from "./components";

interface ProfileProps {
  user: PatientUser;
  setUser: (u: PatientUser) => void;
}

/**
 * 👤 Patient Profile Module - Flat & Clean Architecture
 * (ปุ่มเปลี่ยนรหัสผ่านและอีเมลย้ายมาอยู่การ์ดฝั่งซ้ายแบบเดียวกับแอดมิน)
 */
export default function PatientProfileView({ user, setUser }: ProfileProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const {
    editing,
    setEditing,
    form,
    setForm,
    saved,
    saveLoading,
    saveErr,
    saveProfile,
    cancelEditing,
    healthEditing,
    setHealthEditing,
    healthForm,
    setHealthForm,
    healthSaveLoading,
    healthSaveErr,
    saveHealthProfile,
    cancelHealthEditing,
  } = usePatientProfile(user, setUser);

  return (
    <div>
      <ProfileTitleBar saved={saved} />

      {/* 2. เนื้อหา: ซ้าย (รูป+ปุ่มความปลอดภัย) + ขวา (ข้อมูลส่วนตัว+ข้อมูลสุขภาพ+ข้อมูลการติดต่อ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-full">
          <AvatarBox
            user={user}
            onOpenEmailModal={() => setShowEmailModal(true)}
            onOpenPasswordModal={() => setShowPasswordModal(true)}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <IdentificationCard user={user} />
          <EditableHealthCard
            user={user}
            editing={healthEditing}
            setEditing={setHealthEditing}
            form={healthForm}
            setForm={setHealthForm}
            saveLoading={healthSaveLoading}
            saveErr={healthSaveErr}
            onSave={saveHealthProfile}
            onCancel={cancelHealthEditing}
          />
          <EditableContactCard
            user={user}
            editing={editing}
            setEditing={setEditing}
            form={form}
            setForm={setForm}
            saveLoading={saveLoading}
            saveErr={saveErr}
            onSave={saveProfile}
            onCancel={cancelEditing}
          />
        </div>
      </div>

      {/* ป๊อปอัปความปลอดภัยส่วนกลาง (ใช้ร่วมกันทุกบทบาท) */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <ChangeEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </div>
  );
}
