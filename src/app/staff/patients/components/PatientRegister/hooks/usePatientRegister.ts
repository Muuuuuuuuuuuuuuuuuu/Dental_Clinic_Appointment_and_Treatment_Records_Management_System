import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { addPatient, supabase, supabaseAdmin } from "@/app/shared/supabaseApi";

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

export const PENDING_REG_STORAGE_KEY = "supat_pending_patient_reg";
export const OTP_AWAY_TIMEOUT_MS = 5 * 60 * 1000; // 5 นาที

/**
 * ดึงเวลาจริงของเครื่อง (Real Wall-Clock Time) ที่ไม่ถูกรบกวนโดยระบบจำลองเวลา (MockDate)
 */
export function getRealNow(): number {
  if (typeof performance !== "undefined" && performance.timeOrigin) {
    return Math.round(performance.timeOrigin + performance.now());
  }
  return Date.now();
}

interface PendingRegSession {
  form: RegForm;
  devOtp: string;
  createdUserId: string;
  realOtpSentAt: number;
  realLeftAt: number | null;
  realResendCooldownEnd: number;
  simOtpSentAt: number;
  simLeftAt: number | null;
}

const INITIAL_FORM: RegForm = {
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
};

const calcAge = (dob: string) => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return new Date(diff).getUTCFullYear() - 1970;
};

/** อายุขั้นต่ำและสูงสุดที่ยอมให้ลงทะเบียนได้ (ป้องกันข้อมูลผิดปกติ และป้องกันการกรอกปีเกิด พ.ศ./ค.ศ. สลับกัน) */
export const MIN_PATIENT_AGE = 2;
export const MAX_PATIENT_AGE = 100;

/** ตรวจสอบวันเกิด คืนข้อความแจ้งเตือน หรือ "" ถ้าถูกต้อง */
export const getDobError = (dob: string): string => {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "รูปแบบวันเกิดไม่ถูกต้อง";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d.getTime() > today.getTime()) return "วันกิดไม่ควรเป็นวันที่ในอนาคต กรุณากรอกวันเกิดตามความเป็นจริง (ใช้ปี ค.ศ.)";

  const age = calcAge(dob);
  if (age < MIN_PATIENT_AGE) {
    return `คนไข้ต้องมีอายุอย่างน้อย ${MIN_PATIENT_AGE} ปีขึ้นไป`;
  }
  if (age > MAX_PATIENT_AGE) {
    return `อายุต้องไม่เกิน ${MAX_PATIENT_AGE} ปี กรุณาตรวจสอบปีเกิดอีกครั้ง (ใช้ปี ค.ศ.)`;
  }
  return "";
};

const cleanupUnconfirmedAuthUser = async (userId: string) => {
  if (!userId) return;
  try {
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url || !serviceKey) return;

    const { data: existingUser } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingUser) {
      const adminClient = supabaseAdmin;
      await adminClient.auth.admin.deleteUser(userId);
    }
  } catch (e) {
    console.warn("Cleanup unconfirmed auth user warning:", e);
  }
};

const cleanupUnconfirmedAuthUserByEmail = async (email: string) => {
  if (!email) return;
  try {
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url || !serviceKey) return;

    const { data: existingUser } = await supabase
      .from("users")
      .select("user_id, email")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (!existingUser) {
      const adminClient = supabaseAdmin;
      const { data: linkData } = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email: email.trim().toLowerCase(),
      });
      if (linkData?.user?.id && !linkData.user.email_confirmed_at) {
        await adminClient.auth.admin.deleteUser(linkData.user.id);
      }
    }
  } catch (e) {
    console.warn("Cleanup unconfirmed user by email warning:", e);
  }
};

const ensureUserMetadataByEmail = async (email: string, meta: Record<string, any>) => {
  if (!email) return;
  try {
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url || !serviceKey) return;

    const adminClient = supabaseAdmin;
    const { data: linkData } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email: email.trim().toLowerCase(),
    });
    if (linkData?.user?.id) {
      await adminClient.auth.admin.updateUserById(linkData.user.id, {
        user_metadata: {
          ...linkData.user.user_metadata,
          ...meta,
        },
      });
    }
  } catch (e) {
    console.warn("Ensure user metadata warning:", e);
  }
};

export function isPendingSessionValid(parsed: any): boolean {
  if (!parsed || typeof parsed !== "object" || !parsed.realOtpSentAt) {
    return false;
  }
  const realNow = getRealNow();
  const simNow = Date.now();

  const realRef = parsed.realLeftAt || parsed.realOtpSentAt;
  const realElapsed = realNow - realRef;
  const totalRealElapsed = realNow - parsed.realOtpSentAt;

  const simRef = parsed.simLeftAt || parsed.simOtpSentAt || simNow;
  const simElapsed = simNow - simRef;

  // หากเวลาจริงผ่านไปเกิน 5 นาที หรือจำลองเวลาเดินหน้าเกิน 5 นาที ให้ถือว่าหมดเวลาทันที
  if (
    realElapsed > OTP_AWAY_TIMEOUT_MS ||
    totalRealElapsed > OTP_AWAY_TIMEOUT_MS ||
    simElapsed > OTP_AWAY_TIMEOUT_MS
  ) {
    return false;
  }
  return true;
}

function loadInitialSession(): {
  valid: boolean;
  session: PendingRegSession | null;
  expiredUserId?: string;
} {
  try {
    const raw = localStorage.getItem(PENDING_REG_STORAGE_KEY);
    if (!raw) return { valid: false, session: null };
    const parsed = JSON.parse(raw);
    if (isPendingSessionValid(parsed)) {
      return { valid: true, session: parsed as PendingRegSession };
    } else {
      localStorage.removeItem(PENDING_REG_STORAGE_KEY);
      return { valid: false, session: null, expiredUserId: parsed?.createdUserId };
    }
  } catch {
    localStorage.removeItem(PENDING_REG_STORAGE_KEY);
    return { valid: false, session: null };
  }
}

export function usePatientRegister() {
  const initial = useMemo(() => loadInitialSession(), []);

  const [step, setStep] = useState<Step>(initial.valid ? "otp" : "form");
  const [form, setForm] = useState<RegForm>(
    initial.valid && initial.session ? initial.session.form : INITIAL_FORM
  );
  const [showFormPass, setShowFormPass] = useState(false);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(
    initial.valid && initial.session ? initial.session.devOtp : ""
  );
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [createdUserId, setCreatedUserId] = useState(
    initial.valid && initial.session ? initial.session.createdUserId : ""
  );
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState<"email" | "pass" | null>(null);
  const [resendCooldown, setResendCooldown] = useState(() => {
    if (initial.valid && initial.session?.realResendCooldownEnd) {
      const remaining = Math.ceil(
        (initial.session.realResendCooldownEnd - getRealNow()) / 1000
      );
      return Math.min(60, Math.max(0, remaining));
    }
    return 0;
  });
  const [resendMsg, setResendMsg] = useState("");

  // ลบบัญชี Auth ที่ยังไม่ยืนยันหากหมดเวลา 5 นาทีตั้งแต่ตอนโหลดหน้า
  useEffect(() => {
    if (initial.expiredUserId) {
      cleanupUnconfirmedAuthUser(initial.expiredUserId);
    }
  }, [initial.expiredUserId]);

  const resetForm = useCallback(() => {
    localStorage.removeItem(PENDING_REG_STORAGE_KEY);
    setStep("form");
    setSuccessInfo(null);
    setOtp("");
    setDevOtp("");
    setCreatedUserId("");
    setForm(INITIAL_FORM);
    setErr("");
    setResendCooldown(0);
    setResendMsg("");
  }, []);

  // เมื่อกลับเข้ามาหน้า OTP ทันใน 5 นาที ให้ล้างค่า leftAt และบันทึกสถานะล่าสุด
  useEffect(() => {
    if (step === "otp") {
      try {
        const raw = localStorage.getItem(PENDING_REG_STORAGE_KEY);
        const prev: Partial<PendingRegSession> = raw ? JSON.parse(raw) : {};
        const realNow = getRealNow();
        const simNow = Date.now();
        const sessionData: PendingRegSession = {
          form,
          devOtp,
          createdUserId,
          realOtpSentAt: prev.realOtpSentAt || realNow,
          realLeftAt: null,
          realResendCooldownEnd:
            prev.realResendCooldownEnd || realNow + resendCooldown * 1000,
          simOtpSentAt: prev.simOtpSentAt || simNow,
          simLeftAt: null,
        };
        localStorage.setItem(PENDING_REG_STORAGE_KEY, JSON.stringify(sessionData));
      } catch { }
    }
  }, [step, form, devOtp, createdUserId]);

  // ตรวจสอบทุกๆ 1 วินาทีขณะอยู่หน้า OTP หากครบ 5 นาทีให้รีเซ็ตกลับไปหน้ากรอกข้อมูลทันที
  useEffect(() => {
    if (step !== "otp") return;
    const interval = setInterval(() => {
      try {
        const raw = localStorage.getItem(PENDING_REG_STORAGE_KEY);
        if (!raw) {
          resetForm();
          return;
        }
        const parsed = JSON.parse(raw);
        if (!isPendingSessionValid(parsed)) {
          cleanupUnconfirmedAuthUser(parsed?.createdUserId);
          resetForm();
        }
      } catch {
        resetForm();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resetForm]);

  // เก็บ Ref ล่าสุดสำหรับบันทึกเวลาตอนออกจากหน้านี้ (Unmount)
  const stateRef = useRef({
    step,
    form,
    devOtp,
    createdUserId,
    resendCooldown,
  });
  useEffect(() => {
    stateRef.current = { step, form, devOtp, createdUserId, resendCooldown };
  }, [step, form, devOtp, createdUserId, resendCooldown]);

  // บันทึกเวลาที่ออกจากหน้านี้เมื่อสลับไปเมนูอื่น หรือสลับแท็บเบราว์เซอร์
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (stateRef.current.step !== "otp") return;
      try {
        const raw = localStorage.getItem(PENDING_REG_STORAGE_KEY);
        if (!raw) return;
        const parsed: PendingRegSession = JSON.parse(raw);

        if (document.hidden) {
          parsed.realLeftAt = getRealNow();
          parsed.simLeftAt = Date.now();
          localStorage.setItem(PENDING_REG_STORAGE_KEY, JSON.stringify(parsed));
        } else {
          if (!isPendingSessionValid(parsed)) {
            cleanupUnconfirmedAuthUser(parsed.createdUserId);
            resetForm();
          } else {
            parsed.realLeftAt = null;
            parsed.simLeftAt = null;
            localStorage.setItem(PENDING_REG_STORAGE_KEY, JSON.stringify(parsed));
          }
        }
      } catch { }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (stateRef.current.step === "otp") {
        try {
          const raw = localStorage.getItem(PENDING_REG_STORAGE_KEY);
          const prev: Partial<PendingRegSession> = raw ? JSON.parse(raw) : {};
          const realNow = getRealNow();
          const simNow = Date.now();
          const sessionData: PendingRegSession = {
            form: stateRef.current.form,
            devOtp: stateRef.current.devOtp,
            createdUserId: stateRef.current.createdUserId,
            realOtpSentAt: prev.realOtpSentAt || realNow,
            realLeftAt: realNow,
            realResendCooldownEnd:
              realNow + stateRef.current.resendCooldown * 1000,
            simOtpSentAt: prev.simOtpSentAt || simNow,
            simLeftAt: simNow,
          };
          localStorage.setItem(
            PENDING_REG_STORAGE_KEY,
            JSON.stringify(sessionData)
          );
        } catch { }
      }
    };
  }, [resetForm]);

  const set = (k: keyof RegForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErr("");
  };
  const age = useMemo(() => calcAge(form.dob), [form.dob]);

  // ตัวนับเวลาถอยหลังก่อนกดส่งรหัส OTP ซ้ำ
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validate = () => {
    setErr("");

    // หากช่องบังคับใดช่องหนึ่งยังว่างอยู่ ไม่ว่าจะช่องไหน ให้แจ้งเตือนว่า "กรุณากรอกข้อมูลให้ครบ"
    if (
      !form.firstName?.trim() ||
      !form.lastName?.trim() ||
      !form.idCard?.trim() ||
      !form.dob ||
      !form.gender ||
      !form.phone?.trim() ||
      !form.email?.trim() ||
      !form.allergies?.trim() ||
      !form.conditions?.trim()
    ) {
      setErr("กรุณากรอกข้อมูลให้ครบ");
      return false;
    }

    if (form.idCard.replace(/\D/g, "").length !== 13) {
      setErr("เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก");
      return false;
    }
    const dobErr = getDobError(form.dob);
    if (dobErr) {
      setErr(dobErr);
      return false;
    }
    if (form.phone.replace(/\D/g, "").length !== 10) {
      setErr("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErr("รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีเมลอีกครั้ง");
      return false;
    }
    if (form.password && form.password.length < 6) {
      setErr("รหัสผ่านเริ่มต้นต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }
    if (
      form.emergencyPhone &&
      form.emergencyPhone.replace(/\D/g, "").length !== 10
    ) {
      setErr("เบอร์ติดต่อฉุกเฉินต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return false;
    }
    return true;
  };

  // ขั้นตอน 1: กรอกฟอร์มเสร็จ -> ส่งรหัส OTP ไปที่อีเมลคนไข้ (ยังไม่ลงตารางฐานข้อมูลจนกว่าจะยืนยัน OTP)
  const handleSubmitForm = async () => {
    if (!validate()) return;
    setLoading(true);
    setErr("");

    const rawId = form.idCard.replace(/\D/g, "");

    // ตรวจสอบว่ามีเลขประจำตัวประชาชน หรืออีเมลนี้อยู่ในระบบแล้วหรือไม่
    try {
      // 1. ตรวจสอบในตาราง users
      const { data: existingUser } = await supabase
        .from("users")
        .select("user_id, email, account_status, role")
        .eq("citizen_id", rawId)
        .maybeSingle();

      if (existingUser) {
        setLoading(false);
        if (existingUser.account_status === "inactive") {
          setErr(
            "มีบัญชีที่ใช้เลขประจำตัวประชาชนนี้อยู่ในระบบแล้ว แต่ถูกปิดการใช้งาน กรุณาติดต่อเจ้าหน้าที่เพื่อขอเปิดใช้งานบัญชีเดิม"
          );
        } else if (existingUser.account_status === "suspended") {
          setErr(
            "มีบัญชีที่ใช้เลขประจำตัวประชาชนนี้อยู่ในระบบแล้ว แต่ถูกระงับการใช้งาน กรุณาติดต่อเจ้าหน้าที่คลินิก"
          );
        } else {
          setErr(
            "มีบัญชีที่ใช้เลขประจำตัวประชาชนนี้อยู่ในระบบแล้ว กรุณาเข้าสู่ระบบ หรือปิดใช้งานบัญชีเดิมก่อนลงทะเบียนใหม่"
          );
        }
        return;
      }

      // 2. ตรวจสอบในตาราง profile (กรณีมีเวชระเบียนเดิมที่ยังไม่ได้ผูก user)
      const { data: existingProfile } = await supabase
        .from("profile")
        .select("citizen_id")
        .eq("citizen_id", rawId)
        .maybeSingle();

      if (existingProfile) {
        setLoading(false);
        setErr(
          "มีข้อมูลประวัติเวชระเบียนของเลขประจำตัวประชาชนนี้ในระบบแล้ว กรุณาตรวจสอบในแท็บค้นหาคนไข้ หรือติดต่อเจ้าหน้าที่"
        );
        return;
      }

      // 3. ตรวจสอบอีเมลซ้ำในตาราง users
      const { data: existingEmailUser } = await supabase
        .from("users")
        .select("user_id, citizen_id")
        .eq("email", form.email.trim().toLowerCase())
        .maybeSingle();

      if (existingEmailUser) {
        setLoading(false);
        setErr("อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบด้วยบัญชีเดิม");
        return;
      }
    } catch (checkErr: any) {
      console.warn("Check duplicate citizen/email error:", checkErr);
    }

    const loginPassword = form.password || "123456789";
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDevOtp(generatedOtp);

    let newUserId = "";

    const userMeta = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      must_change_password: true,
    };

    try {
      // หากมีอีเมลเดิมที่ค้างจากการทดสอบก่อนหน้าและยังไม่ยืนยัน ให้ลบออกก่อน เพื่อให้ signUp ได้รับชื่อใหม่
      await cleanupUnconfirmedAuthUserByEmail(form.email.trim());

      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: loginPassword,
        options: {
          data: userMeta,
        },
      });

      if (data?.user?.id) {
        newUserId = data.user.id;
        setCreatedUserId(data.user.id);
      }

      if (error) {
        await ensureUserMetadataByEmail(form.email.trim(), userMeta);
        await supabase.auth.resend({
          type: "signup",
          email: form.email.trim(),
        });
      }
    } catch (e: any) {
      console.warn("Supabase auth signUp exception:", e);
    } finally {
      const realNow = getRealNow();
      const simNow = Date.now();
      const sessionData: PendingRegSession = {
        form,
        devOtp: generatedOtp,
        createdUserId: newUserId,
        realOtpSentAt: realNow,
        realLeftAt: null,
        realResendCooldownEnd: realNow + 60 * 1000,
        simOtpSentAt: simNow,
        simLeftAt: null,
      };
      localStorage.setItem(PENDING_REG_STORAGE_KEY, JSON.stringify(sessionData));

      setStep("otp");
      setResendCooldown(60);
      setResendMsg("");
      setLoading(false);
    }
  };

  // บันทึกข้อมูลคนไข้ลงฐานข้อมูลจริง (เรียกเฉพาะเมื่อยืนยัน OTP สำเร็จเท่านั้น)
  const createAccount = async () => {
    const rawId = form.idCard.replace(/-/g, "");
    const loginPassword = form.password || "123456789";

    await addPatient({
      userId: createdUserId,
      email: form.email.trim(),
      password: loginPassword,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      citizenId: rawId,
      phone: form.phone.trim(),
      gender: form.gender,
      dob: form.dob,
      address: form.address.trim(),
      allergyHistory: form.allergies.trim(),
      underlyingDisease: form.conditions.trim(),
      emergencyContactName: form.emergencyName.trim(),
      emergencyContactPhone: form.emergencyPhone.trim(),
      emergencyContactRelationship: form.emergencyRelationship.trim(),
    });

    const cleanEmail = form.email.trim().toLowerCase();
    localStorage.setItem(`supat_must_change_pwd_${cleanEmail}`, "true");
    localStorage.removeItem(`supat_pwd_changed_${cleanEmail}`);
    localStorage.removeItem(PENDING_REG_STORAGE_KEY);

    setSuccessInfo({
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      loginEmail: form.email.trim(),
      loginPassword: loginPassword,
    });
    setStep("done");
  };

  // ขั้นตอน 2: ยืนยันรหัส OTP แล้วจึงบันทึกข้อมูลคนไข้
  const handleVerifyOTP = async (customCode?: string) => {
    const code = (customCode || otp).trim();
    if (!code || code.length < 6) {
      setErr("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
      return;
    }
    setLoading(true);
    setErr("");

    try {
      if (code !== devOtp) {
        const { error } = await supabase.auth.verifyOtp({
          email: form.email.trim(),
          token: code,
          type: "signup",
        });

        if (error) {
          const { error: err2 } = await supabase.auth.verifyOtp({
            email: form.email.trim(),
            token: code,
            type: "email",
          });

          if (err2) {
            throw new Error("รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว");
          }
        }
      }

      await createAccount();
    } catch (e: any) {
      setErr(e.message || "เกิดข้อผิดพลาดในการยืนยันรหัส OTP");
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
      await ensureUserMetadataByEmail(form.email.trim(), {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        must_change_password: true,
      });
      await supabase.auth.resend({ type: "signup", email: form.email.trim() });
    } catch (e: any) {
      console.warn("Supabase resend warning:", e);
    }

    const realNow = getRealNow();
    const simNow = Date.now();
    try {
      const raw = localStorage.getItem(PENDING_REG_STORAGE_KEY);
      if (raw) {
        const parsed: PendingRegSession = JSON.parse(raw);
        parsed.devOtp = newOtp;
        parsed.realOtpSentAt = realNow;
        parsed.simOtpSentAt = simNow;
        parsed.realResendCooldownEnd = realNow + 60 * 1000;
        localStorage.setItem(PENDING_REG_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch { }

    setResendMsg("ส่งรหัส OTP ใหม่ไปที่อีเมลแล้ว");
    setResendCooldown(60);
  }, [form.email, resendCooldown]);

  const handleBackToForm = useCallback(() => {
    localStorage.removeItem(PENDING_REG_STORAGE_KEY);
    setStep("form");
    setOtp("");
    setErr("");
    setResendMsg("");
  }, []);

  const copyText = (text: string, type: "email" | "pass") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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
    handleResendOTP,
    handleBackToForm,
    copyText,
    resetForm,
  };
}
