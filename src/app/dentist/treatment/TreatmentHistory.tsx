import React, { useState, useEffect } from "react";
import { DentistInfo } from "../../shared/data";
import { getDentistTreatmentHistory } from "../../shared/supabaseApi";
import { Calendar, Search, FileText, CheckCircle, Smile } from "lucide-react";

export default function TreatmentHistory({ doctor }: { doctor: DentistInfo | null }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (doctor) {
      setLoading(true);
      getDentistTreatmentHistory(doctor.id).then(data => {
        setHistory(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [doctor]);

  const filteredHistory = history.filter(item => 
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "Playfair Display, serif" }}>ประวัติการทำหัตถการ</h2>
          <p className="text-sm text-slate-500 mt-1">ประวัติเคสและการรักษาทั้งหมดที่คุณได้รับผิดชอบ</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อคนไข้, หัตถการ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C9A]/20 focus:border-[#FF8C9A] transition-all"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            พบทั้งหมด {filteredHistory.length} รายการ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4 whitespace-nowrap">วันที่</th>
                <th className="p-4 whitespace-nowrap">ชื่อคนไข้</th>
                <th className="p-4 whitespace-nowrap">หัตถการ</th>
                <th className="p-4 whitespace-nowrap">ซี่ฟัน</th>
                <th className="p-4 whitespace-nowrap">การวินิจฉัย / โน้ต</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#FF8C9A] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <FileText size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">ไม่พบประวัติการทำหัตถการ</p>
                    <p className="text-xs text-slate-400 mt-1">ยังไม่มีข้อมูลการรักษา หรือไม่พบจากคำค้นหา</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 whitespace-nowrap text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {item.date}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {item.patientName.charAt(0)}
                        </div>
                        {item.patientName}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-700">
                      {item.serviceName}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {item.toothNumber !== '-' ? (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold border border-slate-200">
                          {item.toothNumber}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-4 min-w-[200px] max-w-[300px]">
                      <div className="text-xs text-slate-700 line-clamp-2">
                        {item.diagnosis && item.diagnosis !== '-' ? (
                          <span className="font-semibold text-slate-800 mr-1">Dx: {item.diagnosis}</span>
                        ) : null}
                        {item.note || <span className="text-slate-300 italic">ไม่มีโน้ต</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
