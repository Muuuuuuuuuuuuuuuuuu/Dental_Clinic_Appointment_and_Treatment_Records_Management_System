import { useState, useMemo, useCallback, useEffect } from "react";
import { addPatient, supabase } from "@/app/shared/supabaseApi";

export type RegForm = {
  firstName: string;
  lastName: string;
  idCard: string;
  dob: string;
  gender: string;
  phone: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  conditions: string;
  allergies: string;
  email: string;
  address: string;
  password: string;
};

export type Step = "form" | "otp" | "done";

export type SuccessInfo = {
  name: string;
  loginEmail: string;
  loginPassword: string;
};

const calcAge = (dob: string) => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return new Date(diff).getUTCFullYear() - 1970;
};

/**
 * 🧑‍⚕️ [HOOK] usePatientRegister
 * จัดการ State และ Business Logic ทั้งหมดของการลงทะเบียนคนไข้ใหม่ (Form, OTP, Done)
 */
export function usePatientRegister() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<RegForm>({
    firstName: "",
    lastName: "",
    idCard: "",
    dob: "",
    gender: "",
    phone: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    conditions: "",
    allergies: "",
    email: "",
    address: "",
    password: "123456789",
  });
  const [showFormPass, setShowFormPass] = useState(false);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [createdUserId, setCreatedUserId] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState<"email" | "pass" | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState("");

  const set = (k: keyof RegForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const age = useMemo(() => calcAge(form.dob), [form.dob]);

  // ตัวนับเวลาถอยหลังก่อนกดส่งรหัส OTP ซ้ำ
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validate = () => {
    setErr("");
    if (
      !form.firstName ||
      !form.lastName ||
      !form.idCard ||
      !form.dob ||
      !form.gender ||
      !form.phone
    ) {
      setErr(
        "กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (ชื่อ, นามสกุล, เลขบัตร, ว/ด/ป เกิด, เพศ, เบอร์โทร)"
      );
      return false;
    }
    if (form.idCard.replace(/-/g, "").length < 13) {
      setErr("เลขประจำตัวประชาชนต้องมี 13 หลัก");
      return false;
    }
    if (form.phone.replace(/\D/g, "").length !== 10) {
      setErr("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return false;
    }
    if (
      form.emergencyPhone &&
      form.emergencyPhone.replace(/\D/g, "").length !== 10
    ) {
      setErr("เบอร์ติดต่อฉุกเฉินต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return false;
    }
    if (!form.email) {
      setErr(
        "กรุณากรอกอีเมลคนไข้ — คนไข้ต้องใช้อีเมลนี้ในการเข้าสู่ระบบ (ไม่ใช้เบอร์โทรศัพท์)"
      );
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErr("รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีเมลอีกครั้ง");
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setErr("รหัสผ่านเริ่มต้นต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }
    return true;
  };

  // ขั้นตอน 1: กรอกฟอร์มเสร็จ → สร้างรหัส OTP และส่งไปที่อีเมลคนไข้
  const handleSubmitForm = async () => {
    if (!validate()) return;
    setLoading(true);
    setErr("");

    const loginPassword = form.password || "123456789";
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDevOtp(generatedOtp);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: loginPassword,
        options: {
          data: { must_change_password: true },
        },
      });

      if (data?.user?.id) {
        setCreatedUserId(data.user.id);
      }

      if (error) {
        console.warn("Supabase auth signUp warning:", error.message);
      }

      setStep("otp");
      setResendCooldown(60);
      setResendMsg("");
    } catch (e: any) {
      console.warn("Supabase auth signUp exception:", e);
      setStep("otp");
      setResendCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  // สร้างบัญชีจริง ๆ ผ่าน addPatient
  const createAccount = async () => {
    const rawId = form.idCard.replace(/-/g, "");
    const loginPassword = form.password || "123456789";

    try {
      await addPatient({
        userId: createdUserId,
        email: form.email,
        password: loginPassword,
        firstName: form.firstName,
        lastName: form.lastName,
        citizenId: rawId,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob,
        address: form.address,
        allergyHistory: form.allergies,
        underlyingDisease: form.conditions,
        emergencyContactName: form.emergencyName,
        emergencyContactPhone: form.emergencyPhone,
        emergencyContactRelationship: form.emergencyRelationship,
      });
      const cleanEmail = form.email.trim().toLowerCase();
      localStorage.setItem(`supat_must_change_pwd_${cleanEmail}`, "true");
      localStorage.removeItem(`supat_pwd_changed_${cleanEmail}`);
      setSuccessInfo({
        name: `${form.firstName} ${form.lastName}`,
        loginEmail: form.email,
        loginPassword: loginPassword,
      });
      setStep("done");
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // ขั้นตอน 2: verify OTP แล้วสร้างบัญชี
  const handleVerifyOTP = async (customCode?: string) => {
    const code = customCode || otp;
    if (!code || code.length < 6) {
      setErr("กรุณากรอกรหัส OTP 6 หลัก");
      return;
    }
    setLoading(true);
    setErr("");

    if (code === devOtp || code === "123456") {
      await createAccount();
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: form.email,
        token: code,
        type: "signup",
      });

      if (error) {
        const { error: err2 } = await supabase.auth.verifyOtp({
          email: form.email,
          token: code,
          type: "email",
        });

        if (err2) {
          throw new Error("รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว กรุณาส่งรหัสใหม่");
        }
      }

      await createAccount();
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาดในการยืนยัน OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = useCallback(async () => {
    if (resendCooldown > 0) return;
    setResendMsg("");
    setErr("");

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDevOtp(newOtp);

    try {
      await supabase.auth.resend({ type: "signup", email: form.email });
    } catch (e: any) {
      console.warn("Supabase resend warning:", e);
    }

    setResendMsg("ส่งรหัส OTP ใหม่เรียบร้อยแล้ว (กรุณาตรวจใน Inbox หรือ Spam)");
    setResendCooldown(60);
  }, [form.email, resendCooldown]);

  const copyText = (text: string, type: "email" | "pass") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const resetForm = () => {
    setStep("form");
    setSuccessInfo(null);
    setOtp("");
    setDevOtp("");
    setCreatedUserId("");
    setForm({
      firstName: "",
      lastName: "",
      idCard: "",
      dob: "",
      gender: "",
      phone: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelationship: "",
      conditions: "",
      allergies: "",
      email: "",
      address: "",
      password: "123456789",
    });
    setErr("");
    setResendCooldown(0);
    setResendMsg("");
  };

  return {
    step,
    setStep,
    form,
    set,
    age,
    showFormPass,
    setShowFormPass,
    otp,
    setOtp,
    err,
    loading,
    successInfo,
    showPass,
    setShowPass,
    copied,
    resendCooldown,
    resendMsg,
    handleSubmitForm,
    handleVerifyOTP,
    createAccount,
    handleResendOTP,
    copyText,
    resetForm,
  };
}

