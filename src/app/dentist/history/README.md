# 📜 Dentist History Module — Architecture & Structure

> โมดูลประวัติการทำงานของทันตแพทย์ (Dentist Treatment History)
> ตรงกับเมนู **"ประวัติการทำงาน"** บน Sidebar
> แสดงรายการเคสและหัตถการทั้งหมดที่คุณหมอได้รับผิดชอบ พร้อมระบบค้นหาคนไข้และหัตถการ

---

## 🗂️ Directory Tree

```text
src/app/dentist/history/
├── README.md               ← 🗺️ เอกสารโครงสร้างของโมดูลประวัติการทำงาน
├── DentistHistoryView.tsx  ← 🏢 [MAIN VIEW] หน้าตารางแสดงประวัติหัตถการย้อนหลัง พร้อมช่องค้นหา
└── index.ts                ← ส่งออก DentistHistoryView
```

