# 📁 Dentist Patients Module — Architecture & Structure

> โมดูลค้นหาเวชระเบียนคนไข้ของทันตแพทย์ (Patient Records)
> ค้นหาตามชื่อคนไข้หรือรหัส HN เพื่อดูโรคประจำตัว ประวัติการแพ้ยา และประวัติการรักษา
> ใช้สถาปัตยกรรมแบบ **Positional Sections Pattern**

---

## 🗂️ Directory Tree

```text
src/app/dentist/patients/
├── README.md                                         ← 🗺️ แผนผังคู่มือโครงสร้างของเวชระเบียน
├── index.tsx                                         ← 🏢 [LAYOUT ROOT] (~40 บรรทัด)
│
└── sections/                                         ← 📦 Positional Sections
    ├── Header/                                       ← 1. แถบหัวเรื่องและช่องค้นหา
    │   ├── components/
    │   │   ├── TitleBar.tsx                          ← หัวข้อ "เวชระเบียนคนไข้"
    │   │   └── PatientSearchBar.tsx                  ← ช่องค้นหาชื่อหรือ HN
    │   └── index.tsx
    │
    └── Content/                                      ← 2. เนื้อหาแสดงการ์ดคนไข้
        ├── components/
        │   ├── PatientCard.tsx                       ← การ์ดข้อมูลคนไข้ 1 คน (HN, โรคประจำตัว, ประวัติ)
        │   └── EmptyPatientState.tsx                 ← สถานะเมื่อไม่พบข้อมูล
        └── index.tsx                                 ← Grid 2 คอลัมน์
```

