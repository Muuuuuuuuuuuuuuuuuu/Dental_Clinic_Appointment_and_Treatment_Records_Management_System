import { AlertTriangle, Lock, X } from "lucide-react";

interface ConfirmPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  password: string;
  onPasswordChange: (val: string) => void;
  error: string;
  onConfirm: () => void;
}

export default function ConfirmPasswordModal({
  isOpen,
  onClose,
  password,
  onPasswordChange,
  error,
  onConfirm,
}: ConfirmPasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 bg-amber-50 rounded-xl">
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-800">ยืนยันการเปลี่ยนแปลง</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-slate-600 mb-5 leading-relaxed">
            การแก้ไขเวลาทำการและวันหยุดคลินิก จะส่งผลกระทบต่อตารางงานของแพทย์ พนักงาน และหน้าบ้านของคนไข้ กรุณายืนยันด้วยรหัสผ่านผู้ดูแลระบบ
          </p>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">รหัสผ่าน Admin</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="ใส่รหัสผ่านเพื่อยืนยัน"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-400"
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors"
            >
              ยืนยันการบันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

