import React from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
  sublabel?: string;
  className?: string;
}

export const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border transition-all outline-none text-xs sm:text-sm";

export const inputStyle = (val: string) => ({
  borderColor: val ? "rgba(26,54,93,0.3)" : "rgba(26,54,93,0.12)",
  backgroundColor: val ? "#fff" : "#FAFAFA",
  color: "#1A365D",
});

/**
 * 📝 [FORM COMPONENT] ช่องกรอกข้อมูลมาตรฐานสำหรับแบบฟอร์มลงทะเบียน
 */
export function FormField({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  sublabel,
  className = "",
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        className="block text-xs font-semibold mb-1"
        style={{ color: "#4A6080" }}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        className={inputCls}
        style={inputStyle(value)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {sublabel && (
        <p className="text-[10px] mt-0.5 text-slate-500">{sublabel}</p>
      )}
    </div>
  );
}

export default FormField;

