import { useState } from "react";
import { StaffInfo } from "@/app/shared/data";
import { changePassword, supabase } from "@/app/shared/supabaseApi";

export function useStaffProfile(user: StaffInfo | null) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [changeError, setChangeError] = useState("");

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChangePassword = async () => {
    if (!oldPassword) {
      setChangeError("กรุณากรอกรหัสผ่านเดิม");
      return;
    }
    if (newPassword.length < 6) {
      setChangeError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setIsChanging(true);
    setChangeError("");
    try {
      await changePassword(oldPassword, newPassword);
      alert("เปลี่ยนรหัสผ่านสำเร็จ!");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setChangeError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setIsChanging(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!currentPassword) {
      setEmailMessage({
        type: "error",
        text: "กรุณากรอกรหัสผ่านปัจจุบันเพื่อความปลอดภัย",
      });
      return;
    }
    if (!newEmail || !newEmail.includes("@")) {
      setEmailMessage({
        type: "error",
        text: "กรุณากรอกอีเมลให้ถูกต้อง",
      });
      return;
    }

    try {
      setEmailLoading(true);
      setEmailMessage(null);

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser?.email) throw new Error("ไม่พบข้อมูลผู้ใช้");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      });

      if (signInError) throw new Error("รหัสผ่านปัจจุบันไม่ถูกต้อง");

      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      setEmailMessage({
        type: "success",
        text: "ส่งลิงก์ยืนยันไปที่อีเมลใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยัน",
      });
      setNewEmail("");
      setCurrentPassword("");
    } catch (err: any) {
      console.error(err);
      setEmailMessage({
        type: "error",
        text: err.message || "เกิดข้อผิดพลาดในการเปลี่ยนอีเมล",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  return {
    user,
    showPasswordModal,
    setShowPasswordModal,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isChanging,
    changeError,
    setChangeError,
    handleChangePassword,
    showEmailModal,
    setShowEmailModal,
    newEmail,
    setNewEmail,
    currentPassword,
    setCurrentPassword,
    emailLoading,
    emailMessage,
    setEmailMessage,
    handleEmailSubmit,
  };
}

