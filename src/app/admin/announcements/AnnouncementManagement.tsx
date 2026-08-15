import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Users, Globe, UserCheck, Megaphone, Copy, Eye, EyeOff, CalendarX } from "lucide-react";
import { Announcement } from "../../shared/data";
import { getAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } from "../../shared/supabaseApi";
import { Pencil } from "lucide-react";

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target: "all_internal" as Announcement["target"],
    link: "",
    mediaUrl: "",
    isActive: true,
    expiresAt: ""
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAnnouncement(editingId, {
          title: formData.title,
          content: formData.content,
          target: formData.target,
          link: formData.link || undefined,
          mediaUrl: formData.mediaUrl || undefined,
          isActive: formData.isActive,
          expiresAt: formData.expiresAt || null,
        });
        setAnnouncements(announcements.map(a => 
          a.id === editingId ? { ...a, ...formData, link: formData.link || undefined, mediaUrl: formData.mediaUrl || undefined, expiresAt: formData.expiresAt || null } : a
        ));
      } else {
        const newAnnouncement = await addAnnouncement({
          title: formData.title,
          content: formData.content,
          target: formData.target,
          link: formData.link || undefined,
          mediaUrl: formData.mediaUrl || undefined,
          isActive: formData.isActive,
          expiresAt: formData.expiresAt || null,
        });
        setAnnouncements([newAnnouncement, ...announcements]);
      }
      handleCloseForm();
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Failed to save announcement. Please check your connection.");
    }
  };

  const handleEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setFormData({
      title: ann.title,
      content: ann.content,
      target: ann.target,
      link: ann.link || "",
      mediaUrl: ann.mediaUrl || "",
      isActive: ann.isActive !== false,
      expiresAt: ann.expiresAt || ""
    });
    setShowForm(true);
  };

  const handleReuse = (ann: Announcement) => {
    setEditingId(null); // Creating new
    setFormData({
      title: ann.title + " (สำเนา)",
      content: ann.content,
      target: ann.target,
      link: ann.link || "",
      mediaUrl: ann.mediaUrl || "",
      isActive: true,
      expiresAt: ""
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", content: "", target: "all_internal", link: "", mediaUrl: "", isActive: true, expiresAt: "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Failed to delete announcement.");
    }
  };

  const TargetIcon = ({ target }: { target: string }) => {
    if (target === "public") return <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md"><Globe size={14} /> สาธารณะ</div>;
    if (target === "all_internal") return <div className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-md"><Users size={14} /> ภายในทั้งหมด</div>;
    if (target === "dentist") return <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><UserCheck size={14} /> ทันตแพทย์</div>;
    if (target === "staff") return <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md"><Users size={14} /> พนักงาน</div>;
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif", color: "#1A365D" }}>จัดการประกาศ</h1>
          <p className="text-sm" style={{ color: "#4A6080" }}>เพิ่มและจัดการประกาศสำคัญของคลินิก</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) {
              handleCloseForm();
            } else {
              handleCloseForm();
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium shadow-sm transition-transform hover:scale-105"
          style={{ backgroundColor: "#1A365D" }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "ยกเลิก" : "สร้างประกาศใหม่"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm mb-6 border" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#1A365D" }}>
            <Megaphone size={20} /> สร้างประกาศใหม่
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>หัวข้อประกาศ *</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:border-[#1A365D]" placeholder="เช่น วันหยุดพิเศษ, แจ้งอัปเดตระบบ..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>เนื้อหาประกาศ *</label>
              <textarea required rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:border-[#1A365D]" placeholder="รายละเอียด..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>สิทธิ์การมองเห็น *</label>
              <select value={formData.target} onChange={e => setFormData({...formData, target: e.target.value as any})}
                className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:border-[#1A365D] bg-white">
                <option value="all_internal">บุคลากรทั้งหมด (แพทย์และพนักงาน)</option>
                <option value="dentist">เฉพาะทันตแพทย์</option>
                <option value="staff">เฉพาะพนักงาน</option>
                <option value="public">สาธารณะ (แสดงหน้าแรกเว็บไซต์)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>วันสิ้นสุดการแสดงผล (ปล่อยว่างถ้าไม่มีวันหมดอายุ)</label>
              <div className="relative">
                <CalendarX size={16} className="absolute left-3 top-3 text-gray-400" />
                <input type="date" value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-[#1A365D]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>ลิงก์เพิ่มเติม (ถ้ามี)</label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-[#1A365D]" placeholder="https://..." />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "#4A6080" }}>ลิงก์รูปภาพ / วิดีโอ (ถ้ามี)</label>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                <input type="url" value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:border-[#1A365D]" placeholder="https://..." />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-[#1A365D] rounded" />
              <span className="text-sm font-medium" style={{ color: "#4A6080" }}>เปิดใช้งานประกาศนี้ทันที</span>
            </label>
            <button type="submit" className="px-6 py-2 bg-[#22C55E] text-white font-medium rounded-xl hover:bg-green-600 transition-colors">
              บันทึกและประกาศ
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-500">กำลังโหลดประกาศ...</div>
        ) : announcements.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">ไม่มีประกาศในระบบ</div>
        ) : (
          announcements.map(a => (
          <div key={a.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col" style={{ borderColor: "rgba(26,54,93,0.1)" }}>
            {a.mediaUrl && (
              <div className="h-40 w-full overflow-hidden bg-gray-100">
                <img src={a.mediaUrl} alt="announcement" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <TargetIcon target={a.target} />
                <div className="flex items-center gap-1">
                  {a.isActive === false && (
                    <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md mr-1 flex items-center gap-1">
                      <EyeOff size={12} /> ซ่อน
                    </span>
                  )}
                  <button onClick={() => handleReuse(a)} className="text-gray-400 hover:text-green-500 transition-colors p-1" title="นำมาใช้ใหม่">
                    <Copy size={16} />
                  </button>
                  <button onClick={() => handleEdit(a)} className="text-gray-400 hover:text-blue-500 transition-colors p-1" title="แก้ไข">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="ลบ">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold mb-2 text-lg leading-tight" style={{ color: "#1A365D" }}>{a.title}</h3>
              <p className="text-sm mb-4 flex-1 text-gray-600 line-clamp-3">{a.content}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400">ประกาศเมื่อ: {a.createdAt}</span>
                  {a.expiresAt && <span className="text-xs text-red-400">สิ้นสุด: {a.expiresAt}</span>}
                </div>
                {a.link && (
                  <a href={a.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                    เปิดลิงก์ <LinkIcon size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}

function X(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
