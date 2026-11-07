# 🏠 Dentist Dashboard Module — Architecture & Structure

> โมดูลหน้าภาพรวมของทันตแพทย์ (Doctor Dashboard)
> หน้าเริ่มต้นของ Dentist Portal แสดงคิวคนไข้วันนี้ สถิติด่วน และเวลาออกตรวจ
> ใช้สถาปัตยกรรมแบบ **Positional Sections Pattern** สไตล์เดียวกับ `admin/dashboard`

---

## 🗂️ Directory Tree

```text
src/app/dentist/dashboard/
├── README.md                                         ← 🗺️ แผนผังคู่มือโครงสร้างของแดชบอร์ดทันตแพทย์
├── index.tsx                                         ← 🏢 [LAYOUT ROOT] (~45 บรรทัด)
├── hooks/
│   └── useDoctorDashboard.ts                         ← 🧠 Hook รวมตรรกะกรองคิวคนไข้ของแพทย์ คำนวณสถานะ
│
└── sections/                                         ← 📦 Positional Sections
    ├── Header/                                       ← 1. แถบหัวเรื่อง
    │   ├── components/
    │   │   └── TitleBar.tsx                          ← สวัสดีคุณหมอ + วันที่ไทย + เวลาทำการ
    │   └── index.tsx
    │
    └── Content/                                      ← 2. เนื้อหาหลัก
        ├── components/
        │   ├── MetricCards/                          ← 📊 การ์ดสถิติ 4 ช่อง
        │   │   ├── components/
        │   │   │   └── MetricCardItem.tsx            ← การ์ดย่อย 1 ใบ
        │   │   └── index.tsx
        │   ├── TodayQueueCard/                       ← 📋 คิวคนไข้วันนี้ (ซ้าย 2 ส่วน)
        │   │   ├── components/
        │   │   │   └── QueueItem.tsx                 ← แถวรายการคนไข้ 1 คน
        │   │   └── index.tsx
        │   └── TodayDutyCard/                        ← ⏰ เวลาออกตรวจวันนี้ (ขวา 1 ส่วน)
        │       └── index.tsx
        └── index.tsx                                 ← คุมระยะห่าง Grid Layout
```

