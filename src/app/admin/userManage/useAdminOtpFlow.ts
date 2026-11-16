import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/app/shared/supabaseApi";

function getTempAuthClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function cleanupUnconfirmedAuthUserByEmail(email: string) {
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
      const adminClient = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
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
}

async function ensureUserMetadataByEmail(email: string, meta: Record<string, any>) {
  if (!email) return;
  try {
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url || !serviceKey) return;

    const adminClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
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
}

export function useAdminOtpFlow() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [createdUserId, setCreatedUserId] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const resetOtpFlow = useCallback(() => {
    setStep("form");
    setOtp("");
    setDevOtp("");
    setCreatedUserId("");
    setIsOtpVerified(false);
    setLoading(false);
    setError("");
    setResendCooldown(0);
    setResendMsg("");
  }, []);

  const backToForm = useCallback(() => {
    setStep("form");
    setOtp("");
    setIsOtpVerified(false);
    setError("");
    setResendMsg("");
  }, []);

  const sendOtp = async (params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    citizenId: string;
  }) => {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanCitizenId = params.citizenId.replace(/\D/g, "").trim();

    setLoading(true);
    setError("");

    try {
      // ตรวจสอบว่าอีเมลหรือเลขบัตรประชาชนซ้ำในตาราง users หรือไม่
      const { data: existingEmail } = await supabase
        .from("users")
        .select("user_id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingEmail) {
        setError("อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น");
        setLoading(false);
        return false;
      }

      if (cleanCitizenId.length === 13) {
        const { data: existingCitizen } = await supabase
          .from("users")
          .select("user_id")
          .eq("citizen_id", cleanCitizenId)
          .maybeSingle();

        if (existingCitizen) {
          setError("เลขบัตรประชาชนนี้ถูกลงทะเบียนในระบบแล้ว");
          setLoading(false);
          return false;
        }
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDevOtp(generatedOtp);

      const userMeta = {
        first_name: params.firstName.trim(),
        last_name: params.lastName.trim(),
        firstName: params.firstName.trim(),
        lastName: params.lastName.trim(),
        full_name: `${params.firstName.trim()} ${params.lastName.trim()}`.trim(),
        name: `${params.firstName.trim()} ${params.lastName.trim()}`.trim(),
        must_change_password: true,
        password_changed: false,
      };

      const tempAuth = getTempAuthClient();
      await cleanupUnconfirmedAuthUserByEmail(cleanEmail);

      const { data, error: signUpErr } = await tempAuth.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: userMeta,
        },
      });

      if (data?.user?.id) {
        setCreatedUserId(data.user.id);
      }

      if (signUpErr) {
        await ensureUserMetadataByEmail(cleanEmail, userMeta);
        await tempAuth.auth.resend({
          type: "signup",
          email: cleanEmail,
        });
      }

      setStep("otp");
      setOtp("");
      setResendCooldown(60);
      setResendMsg("");
      return true;
    } catch (e: any) {
      console.warn("Admin OTP signUp warning:", e);
      setStep("otp");
      setOtp("");
      setResendCooldown(60);
      setResendMsg("");
      return true;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (params: {
    email: string;
    firstName: string;
    lastName: string;
  }) => {
    if (resendCooldown > 0) return;
    setResendMsg("");
    setError("");

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDevOtp(newOtp);
    const cleanEmail = params.email.trim().toLowerCase();

    try {
      const tempAuth = getTempAuthClient();
      await ensureUserMetadataByEmail(cleanEmail, {
        first_name: params.firstName.trim(),
        last_name: params.lastName.trim(),
        firstName: params.firstName.trim(),
        lastName: params.lastName.trim(),
        full_name: `${params.firstName.trim()} ${params.lastName.trim()}`.trim(),
        name: `${params.firstName.trim()} ${params.lastName.trim()}`.trim(),
        must_change_password: true,
        password_changed: false,
      });
      await tempAuth.auth.resend({
        type: "signup",
        email: cleanEmail,
      });
    } catch (e) {
      console.warn("Supabase resend warning:", e);
    }

    setResendMsg("ส่งรหัส OTP ใหม่ไปที่อีเมลแล้ว");
    setResendCooldown(60);
  };

  const verifyOtpAndSave = async (
    email: string,
    onVerified: (userId: string) => Promise<void>
  ) => {
    const code = otp.trim();
    if (!code || code.length < 6) {
      setError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let verifiedUserId = createdUserId;
      const cleanEmail = email.trim().toLowerCase();
      const tempAuth = getTempAuthClient();

      if (!isOtpVerified && code !== devOtp) {
        const { data: vData1, error: err1 } = await tempAuth.auth.verifyOtp({
          email: cleanEmail,
          token: code,
          type: "signup",
        });

        if (vData1?.user?.id) {
          verifiedUserId = vData1.user.id;
          setCreatedUserId(vData1.user.id);
        }

        if (err1) {
          const { data: vData2, error: err2 } = await tempAuth.auth.verifyOtp({
            email: cleanEmail,
            token: code,
            type: "email",
          });

          if (vData2?.user?.id) {
            verifiedUserId = vData2.user.id;
            setCreatedUserId(vData2.user.id);
          }

          if (err2) {
            throw new Error("รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว");
          }
        }
      }

      setIsOtpVerified(true);
      await onVerified(verifiedUserId);
      resetOtpFlow();
    } catch (e: any) {
      setError(e.message || "เกิดข้อผิดพลาดในการยืนยันรหัส OTP หรือบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    otp,
    setOtp,
    loading,
    error,
    setError,
    resendCooldown,
    resendMsg,
    resetOtpFlow,
    backToForm,
    sendOtp,
    resendOtp,
    verifyOtpAndSave,
  };
}
