import React, { useState } from "react";
import { X, ClipboardList, RotateCcw } from "lucide-react";
import { ToothStatus } from "../utils/toothHistory";
import {
  PRESET_SUPERNUMERARY,
  SupernumeraryTooth,
  getExtraToothLocation,
  getUpperToothRowItems,
  getLowerToothRowItems,
  createCustomSupernumerary,
} from "../ToothGeometry";
import { getExtraToothInsertOptionLabel } from "../constants/toothNames";

interface ToothManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  toothData: Record<number | string, ToothStatus>;
  extraTeeth: SupernumeraryTooth[];
  onSave: (
    updatedToothData: Record<number | string, ToothStatus>,
    updatedExtraTeeth: SupernumeraryTooth[]
  ) => void;
}

export default function ToothManagerModal({
  isOpen,
  onClose,
  toothData,
  extraTeeth,
  onSave,
}: ToothManagerModalProps) {
  const [draftToothData, setDraftToothData] = useState<Record<number | string, ToothStatus>>(toothData || {});
  const [draftExtraTeeth, setDraftExtraTeeth] = useState<SupernumeraryTooth[]>(extraTeeth || []);
  const [customToothToAdd, setCustomToothToAdd] = useState<string>('');

  if (!isOpen) return null;

  const handleToggleDraftTooth = (id: number | string) => {
    setDraftToothData(prev => {
      const next = { ...prev };
      if (next[id] === "cross") {
        delete next[id];
      } else {
        next[id] = "cross";
      }
      return next;
    });
  };

  const handleAddDraftExtra = (newTooth: SupernumeraryTooth) => {
    setDraftExtraTeeth(prev => {
      if (prev.find(x => x.id === newTooth.id)) return prev;
      return [...prev, newTooth];
    });
  };

  const handleRemoveDraftExtra = (id: string) => {
    setDraftExtraTeeth(prev => prev.filter(x => x.id !== id));
    setDraftToothData(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleFinish = () => {
    onSave(draftToothData, draftExtraTeeth);
    onClose();
  };

  const draftMissingTeeth = Object.entries(draftToothData)
    .filter(([_, s]) => s === 'cross')
    .map(([n]) => String(n).replace('teeth-', ''));

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[110] p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[88vh]">
        {/* ส่วนหัว */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-sm leading-tight">บันทึกตำแหน่งฟันตามสภาพช่องปากจริง</div>
              <div className="text-[11px] text-slate-300 font-normal">คลิกเลขซี่เพื่อลบฟันที่ไม่มี หรือเลือกแทรกฟันเกิน (+S)</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
            title="ปิดโดยไม่บันทึก"
          >
            <X size={18} />
          </button>
        </div>

        {/* ส่วนจัดการซี่ฟัน */}
        <div className="p-3.5 space-y-3 overflow-y-auto flex-1">
          {/* แถวซี่ฟันบน */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2 px-1">
              <span className="text-blue-700 font-bold">ขวาคนไข้ (18 - 11)</span>
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>ฟันบน (UPPER)</span>
                {draftExtraTeeth.some(t => t.quadrant === 1 || t.quadrant === 2 || t.id === "mesiodens") && (
                  <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded-full font-medium">
                    มีฟันเกิน
                  </span>
                )}
              </span>
              <span className="text-blue-700 font-bold">ซ้ายคนไข้ (21 - 28)</span>
            </div>
            <div className="flex items-center justify-center gap-1 flex-wrap sm:flex-nowrap">
              {getUpperToothRowItems(draftExtraTeeth, false, false).map(item => {
                const isRemoved = draftToothData[item.id] === "cross";
                const showUpperMidline = item.id === 21;

                if (item.isExtra) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRemoveDraftExtra(String(item.id))}
                      className="h-8 min-w-[34px] px-1 shrink-0 rounded-lg text-[10px] font-bold border-2 bg-amber-100 text-amber-950 border-amber-400 hover:bg-rose-100 hover:border-rose-400 hover:text-rose-900 transition-all flex flex-col items-center justify-center shadow-xs"
                      title={`${item.locationTip || item.label} (คลิกเพื่อนำออกจากผัง)`}
                    >
                      <span className="leading-tight font-extrabold">{item.label}</span>
                      <span className="text-[7px] text-amber-800 font-medium leading-none">เอาออก</span>
                    </button>
                  );
                }

                return (
                  <div key={item.id} className="flex items-center gap-1">
                    {showUpperMidline && (
                      <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" title="แนวกึ่งกลางฟัน (Midline)" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleDraftTooth(item.id)}
                      className={`w-7 sm:w-8 h-8 shrink-0 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center leading-none ${
                        isRemoved
                          ? "bg-rose-600 text-white border-rose-700 shadow-xs scale-105"
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50 shadow-2xs"
                      }`}
                      title={`ซี่ ${item.id} ${isRemoved ? '(ลบแล้ว - คลิกคืนค่า)' : '(คลิกเพื่อลบฟัน)'}`}
                    >
                      <span>{item.label}</span>
                      {isRemoved && <span className="text-[7px] text-rose-200 font-extrabold leading-none mt-0.5">ลบ</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* แถวซี่ฟันล่าง */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2 px-1">
              <span className="text-blue-700 font-bold">ขวาคนไข้ (48 - 41)</span>
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>ฟันล่าง (LOWER)</span>
                {draftExtraTeeth.some(t => t.quadrant === 3 || t.quadrant === 4) && (
                  <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded-full font-medium">
                    มีฟันเกิน
                  </span>
                )}
              </span>
              <span className="text-blue-700 font-bold">ซ้ายคนไข้ (31 - 38)</span>
            </div>
            <div className="flex items-center justify-center gap-1 flex-wrap sm:flex-nowrap">
              {getLowerToothRowItems(draftExtraTeeth, false, false).map(item => {
                const isRemoved = draftToothData[item.id] === "cross";
                const showLowerMidline = item.id === 31;

                if (item.isExtra) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRemoveDraftExtra(String(item.id))}
                      className="h-8 min-w-[34px] px-1 shrink-0 rounded-lg text-[10px] font-bold border-2 bg-amber-100 text-amber-950 border-amber-400 hover:bg-rose-100 hover:border-rose-400 hover:text-rose-900 transition-all flex flex-col items-center justify-center shadow-xs"
                      title={`${item.locationTip || item.label} (คลิกเพื่อนำออกจากผัง)`}
                    >
                      <span className="leading-tight font-extrabold">{item.label}</span>
                      <span className="text-[7px] text-amber-800 font-medium leading-none">เอาออก</span>
                    </button>
                  );
                }

                return (
                  <div key={item.id} className="flex items-center gap-1">
                    {showLowerMidline && (
                      <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" title="แนวกึ่งกลางฟัน (Midline)" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleDraftTooth(item.id)}
                      className={`w-7 sm:w-8 h-8 shrink-0 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center leading-none ${
                        isRemoved
                          ? "bg-rose-600 text-white border-rose-700 shadow-xs scale-105"
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50 shadow-2xs"
                      }`}
                      title={`ซี่ ${item.id} ${isRemoved ? '(ลบแล้ว - คลิกคืนค่า)' : '(คลิกเพื่อลบฟัน)'}`}
                    >
                      <span>{item.label}</span>
                      {isRemoved && <span className="text-[7px] text-rose-200 font-extrabold leading-none mt-0.5">ลบ</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* แถบเลือกเพิ่มซี่ฟันเกิน */}
          <div className="py-2.5 px-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                <span className="text-[11px] font-bold text-amber-950 shrink-0">
                  แทรกฟันเกิน / ฟันซ้อน (+S):
                </span>
                <select
                  value={customToothToAdd}
                  onChange={e => {
                    const val = e.target.value;
                    if (val) {
                      if (val === "11S") {
                        const p = PRESET_SUPERNUMERARY.find(x => x.id === "11S");
                        if (p) handleAddDraftExtra(p);
                      } else if (val.endsWith("S") && ["13S", "23S", "43S", "33S", "18S", "28S", "48S", "38S"].includes(val)) {
                        const p = PRESET_SUPERNUMERARY.find(x => x.id === val);
                        if (p) handleAddDraftExtra(p);
                        else {
                          const num = parseInt(val.replace("S", ""), 10);
                          handleAddDraftExtra(createCustomSupernumerary(num));
                        }
                      } else {
                        const tNum = parseInt(val, 10);
                        const existingCount = draftExtraTeeth.filter(t => t.id === `${tNum}S` || t.id.startsWith(`${tNum}S-`)).length;
                        handleAddDraftExtra(createCustomSupernumerary(tNum, existingCount + 1));
                      }
                      setCustomToothToAdd('');
                    }
                  }}
                  className="bg-white border border-amber-800 text-slate-800 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-800 shadow-2xs flex-1 min-w-[260px] max-w-full truncate"
                >
                  <option value="">-- เลือกตำแหน่งซี่ฟัน --</option>
                  <optgroup label="ตำแหน่งที่พบบ่อย (Mesiodens / เขี้ยวซ้อน / ฟันเกินคุด)">
                    <option value="11S">{getExtraToothInsertOptionLabel(11)}</option>
                    <option value="13S">{getExtraToothInsertOptionLabel(13)}</option>
                    <option value="23S">{getExtraToothInsertOptionLabel(23)}</option>
                    <option value="43S">{getExtraToothInsertOptionLabel(43)}</option>
                    <option value="33S">{getExtraToothInsertOptionLabel(33)}</option>
                    <option value="18S">{getExtraToothInsertOptionLabel(18)}</option>
                    <option value="28S">{getExtraToothInsertOptionLabel(28)}</option>
                    <option value="48S">{getExtraToothInsertOptionLabel(48)}</option>
                    <option value="38S">{getExtraToothInsertOptionLabel(38)}</option>
                  </optgroup>
                  <optgroup label="ฟันบนขวา (18 - 11)">
                    {[18, 17, 16, 15, 14, 13, 12, 11].map(n => (
                      <option key={n} value={n}>{getExtraToothInsertOptionLabel(n)}</option>
                    ))}
                  </optgroup>
                  <optgroup label="ฟันบนซ้าย (21 - 28)">
                    {[21, 22, 23, 24, 25, 26, 27, 28].map(n => (
                      <option key={n} value={n}>{getExtraToothInsertOptionLabel(n)}</option>
                    ))}
                  </optgroup>
                  <optgroup label="ฟันล่างขวา (48 - 41)">
                    {[48, 47, 46, 45, 44, 43, 42, 41].map(n => (
                      <option key={n} value={n}>{getExtraToothInsertOptionLabel(n)}</option>
                    ))}
                  </optgroup>
                  <optgroup label="ฟันล่างซ้าย (31 - 38)">
                    {[31, 32, 33, 34, 35, 36, 37, 38].map(n => (
                      <option key={n} value={n}>{getExtraToothInsertOptionLabel(n)}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="text-[11px] text-amber-900 font-semibold shrink-0">
                {draftExtraTeeth.length === 0 ? "ยังไม่มีฟันเกิน" : `มีฟันเกินในผัง ${draftExtraTeeth.length} ซี่`}
              </div>
            </div>
          </div>

          {/* สรุปรายการฟันที่ลบและฟันเกิน */}
          <div className="py-2 px-3 bg-slate-100/90 rounded-xl text-[11px] flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-semibold text-slate-700">รายการฟันที่ลบ: </span>
              <span className="text-rose-700 font-bold">
                {draftMissingTeeth.length > 0
                  ? draftMissingTeeth.map(t => {
                      const isEx = t.endsWith('S') || t === 'mesiodens';
                      return isEx ? `${t} (+S)` : t;
                    }).join(', ') + ' (' + draftMissingTeeth.length + ' ซี่)'
                  : 'ไม่มี (ฟันครบ 32 ซี่)'}
              </span>
            </div>
            {draftExtraTeeth.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700">ฟันเกินในผัง: </span>
                {draftExtraTeeth.map(t => {
                  const toothId = t.id === "mesiodens" ? "11S" : t.id;
                  const locTip = getExtraToothLocation(t.id);
                  return (
                    <span
                      key={t.id}
                      title={locTip}
                      className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 border border-amber-300 px-1.5 py-0.5 rounded-md font-bold text-[10px] shadow-2xs cursor-help"
                    >
                      <span>+{toothId}</span>
                      <span className="text-[9px] font-normal text-amber-800">
                        ({locTip.includes("Mesiodens") ? "กึ่งกลางหน้าบน" : locTip.includes("เขี้ยว") ? "เขี้ยวซ้อน" : "ฟันเกินคุด"})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftExtra(t.id)}
                        className="text-amber-800 hover:text-rose-600 hover:bg-rose-100/70 rounded px-0.5 transition-colors leading-none"
                        title={`นำ ${t.id} ออกจากผังฟัน`}
                      >
                        ลบ
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Fixed Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              const cleaned: Record<number | string, ToothStatus> = {};
              Object.entries(draftToothData).forEach(([k, v]) => {
                if (v !== 'cross') cleaned[k] = v;
              });
              setDraftToothData(cleaned);
              setDraftExtraTeeth([]);
            }}
            className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
            title="ล้างค่าทั้งหมดและคืนฟันครบ 32 ซี่ปกติ"
          >
            <RotateCcw size={12} />
            <span>คืนฟันครบ 32 ซี่</span>
          </button>
          <div className="text-[11px] text-slate-600 truncate">
            {draftMissingTeeth.length > 0 ? (
              <span>
                ลบออกแล้ว <strong className="text-rose-600 font-bold">{draftMissingTeeth.length} ซี่</strong>
                {draftExtraTeeth.length > 0 && (
                  <span> | ฟันเกิน <strong className="text-amber-700 font-bold">{draftExtraTeeth.length} ซี่</strong></span>
                )}
              </span>
            ) : (
              <span>
                {draftExtraTeeth.length > 0 ? (
                  <span>ฟันเกิน <strong className="text-amber-700 font-bold">{draftExtraTeeth.length} ซี่</strong> (ไม่มีฟันถูกลบ)</span>
                ) : (
                  "ฟันครบ 32 ซี่ปกติ"
                )}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm active:scale-98 shrink-0 flex items-center gap-1.5"
          >
            <span>เสร็จสิ้น / บันทึก</span>
          </button>
        </div>
      </div>
    </div>
  );
}

