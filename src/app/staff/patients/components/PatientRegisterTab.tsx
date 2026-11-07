import React from "react";
import { usePatientRegister } from "./PatientRegister/hooks/usePatientRegister";
import RegisterFormStep from "./PatientRegister/components/RegisterFormStep";
import RegisterOtpStep from "./PatientRegister/components/RegisterOtpStep";
import RegisterDoneStep from "./PatientRegister/components/RegisterDoneStep";

/**
 * 🧑‍⚕️ [STAFF PATIENT REGISTER TAB]
 * หน้าลงทะเบียนคนไข้ใหม่สำหรับเจ้าหน้าที่เคาน์เตอร์
 * สถาปัตยกรรมแยก 3 ขั้นตอน:
 * - 1. FormStep (กรอกข้อมูลพร้อม Reusable FormField)
 * - 2. OtpStep (ยืนยัน OTP ทางอีเมล)
 * - 3. DoneStep (แสดงบัญชีและรหัสผ่านเริ่มต้น)
 */
export default function StaffRegisterPatient() {
  const r = usePatientRegister();

  if (r.step === "done" && r.successInfo) {
    return (
      <RegisterDoneStep
        successInfo={r.successInfo}
        showPass={r.showPass}
        setShowPass={r.setShowPass}
        copied={r.copied}
        copyText={r.copyText}
        resetForm={r.resetForm}
      />
    );
  }

  if (r.step === "otp") {
    return (
      <RegisterOtpStep
        email={r.form.email}
        otp={r.otp}
        setOtp={r.setOtp}
        err={r.err}
        loading={r.loading}
        resendCooldown={r.resendCooldown}
        resendMsg={r.resendMsg}
        onBack={() => {
          r.setStep("form");
          r.setOtp("");
        }}
        onResendOTP={r.handleResendOTP}
        onVerifyOTP={r.handleVerifyOTP}
        onSkipOTP={r.createAccount}
      />
    );
  }

  return (
    <RegisterFormStep
      form={r.form}
      set={r.set}
      age={r.age}
      err={r.err}
      loading={r.loading}
      showFormPass={r.showFormPass}
      setShowFormPass={r.setShowFormPass}
      onSubmit={r.handleSubmitForm}
    />
  );
}
