# 📁 Dentist Records Module — Architecture & Structure

> โมดูลเวชระเบียนคนไข้ของทันตแพทย์ (Dentist Patient Records)
> ตรงกับเมนู **"เวชระเบียน"** (key: `records`) บน Sidebar
> สถาปัตยกรรมแบบ **Flat & Clean** มีเพียง 2 ไฟล์หลัก ไม่มีการซอยโฟลเดอร์เกินจำเป็น

---

## 🗂️ Directory Tree

```text
src/app/dentist/records/
├── README.md               ← 🗺️ เอกสารโครงสร้างของโมดูลเวชระเบียน
├── DentistRecordsView.tsx  ← 🏢 [MAIN VIEW] หน้าค้นหาและแสดงเวชระเบียนคนไข้
├── PatientCard.tsx         ← 📇 [CARD] การ์ดแสดงข้อมูลคนไข้ 1 คน (HN, โรคประจำตัว, ประวัติการรักษา)
└── index.ts                ← ส่งออก DentistRecordsView และ PatientCard
```
