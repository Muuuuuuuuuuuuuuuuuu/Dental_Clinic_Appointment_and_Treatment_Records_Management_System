import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, CheckCircle, Search } from "lucide-react";
import { PatientInfo } from "../../shared/data";
import { getPatients } from "../../shared/supabaseApi";

export default function PatientManagement() {
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.hn.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto" style={{ fontFamily: "Prompt, sans-serif" }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการคนไข้</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>คนไข้ทั้งหมด {patients.length} คน</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ HN..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 w-64"
              style={{ borderColor: "rgba(26,54,93,0.1)" }}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg,#FF8C9A,#FF6B7E)", opacity: 0.5, cursor: "not-allowed" }}
            title="ฟังก์ชันนี้กำลังอยู่ในระหว่างการพัฒนา">
            <Plus size={15} /> เพิ่มคนไข้
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(26,54,93,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead style={{ backgroundColor: "#F8F9FA" }}>
              <tr>
                {["HN", "ชื่อ-นามสกุล", "อีเมล", "เบอร์โทร", "โรคประจำตัว", "ประวัติแพ้ยา", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#4A6080" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(26,54,93,0.05)" }}>
                  <td className="px-5 py-3.5 font-medium" style={{ color: "#1A365D" }}>{p.hn}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#4A90E2" }}>
                        {p.name[0] ?? "ค"}
                      </div>
                      <span className="font-medium" style={{ color: "#1A365D" }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{p.email || '-'}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#4A6080" }}>{p.phone || '-'}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: p.underlyingDisease !== 'ไม่มี' ? "#E65100" : "#4A6080" }}>
                    {p.underlyingDisease}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: p.allergyHistory !== 'ไม่มีประวัติ' ? "#D32F2F" : "#4A6080" }}>
                    {p.allergyHistory}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#4A6080" }} title="แก้ไขข้อมูล"><Edit3 size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "#E65100" }} title="ลบข้อมูล"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">ไม่พบข้อมูลคนไข้</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
