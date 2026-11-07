# 📅 Staff Leave Module — Architecture & Structure

> โมดูลปฏิทินและการลางานของพนักงาน (Staff Leave)
> ตรวจสอบตารางเวรปกติรายสัปดาห์ ปฏิทินปฏิบัติงานรายเดือน และส่งคำขอลางาน
> ใช้สถาปัตยกรรมแบบ **Positional Sections Pattern** สไตล์เดียวกับ `dentist/schedule` และ `admin/schedule`

---

## 🗂️ Directory Tree

```text
src/app/staff/leave/
├── README.md                                         ← 🗺️ แผนผังคู่มือโครงสร้างของโมดูลการลาพนักงาน
├── index.tsx                                         ← 🏢 [LAYOUT ROOT] (~55 บรรทัด)
├── hooks/
│   └── useStaffLeave.ts                              ← 🧠 Hook รวมตรรกะการดึงข้อมูลกะ, วันปิดคลินิก, ส่งคำขอลา
│
└── sections/                                         ← 📦 Positional Sections
    ├── Header/                                       ← 1. แถบหัวเรื่อง
    │   ├── components/
    │   │   └── TitleBar.tsx                          ← หัวข้อ "ปฏิทินและการลางาน" และคำอธิบาย
    │   └── index.tsx
    │
    ├── Content/                                      ← 2. เนื้อหาหลัก
    │   ├── components/
    │   │   ├── RegularScheduleCard/                  ← ⏰ ตารางเวรประจำสัปดาห์ (ย่อ/ขยายได้)
    │   │   │   └── index.tsx
    │   │   ├── LeaveSummaryCard/                     ← 📊 สรุปการลางานในปีนี้ (รออนุมัติ, อนุมัติ, ไม่อนุมัติ)
    │   │   │   └── index.tsx
    │   │   └── ActualCalendar/                       ← 📅 ปฏิทินปฏิบัติงานรายเดือนจริง
    │   │       ├── components/
    │   │       │   ├── CalendarHeader.tsx            ← ตัวเลือกเดือน/ปี, ปุ่มเลื่อน, คำอธิบายสี
    │   │       │   └── CalendarCell.tsx              ← ช่องวัน 1 ช่องพร้อมเงื่อนไขคลิกส่งใบลา
    │   │       └── index.tsx
    │   └── index.tsx                                 ← ประกอบตารางเวร + สรุปใบลา + ปฏิทินเดือน
    │
    └── Modals/                                       ← 3. รวมหน้าต่าง Popups
        ├── components/
        │   └── LeaveRequestModal.tsx                 ← ฟอร์มป๊อปอัปส่งคำขอลางาน
        └── index.tsx
```

