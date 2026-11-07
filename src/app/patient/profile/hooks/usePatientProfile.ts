import { useState } from "react";
import { PatientUser } from "../../types";
import { supabase, updatePatientProfile, changeEmail, changePassword } from "@/app/shared/supabaseApi";

export const calcAge = (dob: string) => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return new Date(diff).getUTCFullYear() - 1970;
};

export const thDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function usePatientProfile(user: PatientUser, setUser: (u: PatientUser) => void) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: user.phone || "",
    email: user.email || "",
    address: user.address ?? "",
    emergencyName: user.emergencyName || "",
    emergencyPhone: user.emergencyPhone || "",
  });
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // สถานะและแบบฟอร์มข้อมูลสุขภาพ (โรคประจำตัว และ ประวัติการแพ้ยา)
  const [healthEditing, setHealthEditing] = useState(false);
  const [healthForm, setHealthForm] = useState({
    conditions: user.conditions || "",
    allergies: user.allergies || "",
  });
  const [healthSaveLoading, setHealthSaveLoading] = useState(false);
  const [healthSaveErr, setHealthSaveErr] = useState("");

  const [pwMode, setPwMode] = useState(false);
  const [emailMode, setEmailMode] = useState(false);

  const [emailForm, setEmailForm] = useState({ oldPw: "", newEmail: "" });
  const [emailErr, setEmailErr] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [pw, setPw] = useState({ old: "", newPw: "", confirm: "" });
  const [pwErr, setPwErr] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const saveProfile = async () => {
    setSaveErr("");
    if (form.phone.replace(/\D/g, "").length !== 10) {
      setSaveErr("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return;
    }
    if (form.emergencyPhone && form.emergencyPhone.replace(/\D/g, "").length !== 10) {
      setSaveErr("เบอร์ผู้ติดต่อฉุกเฉินต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return;
    }
    setSaveLoading(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) throw new Error("ไม่พบข้อมูลผู้ใช้");
      await updatePatientProfile(authUser.id, form);
      setUser({ ...user, ...form });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveErr(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaveLoading(false);
    }
  };

  const saveHealthProfile = async () => {
    setHealthSaveErr("");
    setHealthSaveLoading(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) throw new Error("ไม่พบข้อมูลผู้ใช้");

      const trimmedConditions = healthForm.conditions.trim();
      const trimmedAllergies = healthForm.allergies.trim();

      await updatePatientProfile(authUser.id, {
        underlyingDisease: trimmedConditions || "ไม่มี",
        allergyHistory: trimmedAllergies || "ไม่มี",
      });

      setUser({
        ...user,
        conditions: trimmedConditions || "ไม่มี",
        allergies: trimmedAllergies || "ไม่มี",
      });
      setHealthEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setHealthSaveErr(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลสุขภาพ");
    } finally {
      setHealthSaveLoading(false);
    }
  };

  const cancelHealthEditing = () => {
    setHealthEditing(false);
    setHealthSaveErr("");
    setHealthForm({
      conditions: user.conditions || "",
      allergies: user.allergies || "",
    });
  };

  const saveEmail = async () => {
    setEmailErr("");
    if (!emailForm.oldPw) {
      setEmailErr("กรุณากรอกรหัสผ่านเพื่อยืนยัน");
      return;
    }
    if (!emailForm.newEmail || !emailForm.newEmail.includes("@")) {
      setEmailErr("อีเมลไม่ถูกต้อง");
      return;
    }

    setEmailLoading(true);
    try {
      await changeEmail(emailForm.oldPw, emailForm.newEmail);
      setUser({ ...user, email: emailForm.newEmail });
      setEmailMode(false);
      setEmailForm({ oldPw: "", newEmail: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      alert("เปลี่ยนอีเมลสำเร็จ กรุณาตรวจสอบอีเมลใหม่เพื่อยืนยัน (ถ้ามี)");
    } catch (err: any) {
      setEmailErr(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนอีเมล");
    } finally {
      setEmailLoading(false);
    }
  };

  const savePw = async () => {
    setPwErr("");
    if (!pw.old) {
      setPwErr("กรุณากรอกรหัสผ่านเดิม");
      return;
    }
    if (pw.newPw.length < 6) {
      setPwErr("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (pw.newPw !== pw.confirm) {
      setPwErr("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setPwLoading(true);
    try {
      await changePassword(pw.old, pw.newPw);
      setPwMode(false);
      setPw({ old: "", newPw: "", confirm: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setPwErr(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setPwLoading(false);
    }
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveErr("");
    setForm({
      phone: user.phone || "",
      email: user.email || "",
      address: user.address ?? "",
      emergencyName: user.emergencyName || "",
      emergencyPhone: user.emergencyPhone || "",
    });
  };

  return {
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
    pwMode,
    setPwMode,
    emailMode,
    setEmailMode,
    emailForm,
    setEmailForm,
    emailErr,
    emailLoading,
    saveEmail,
    pw,
    setPw,
    pwErr,
    pwLoading,
    savePw,
  };
}

