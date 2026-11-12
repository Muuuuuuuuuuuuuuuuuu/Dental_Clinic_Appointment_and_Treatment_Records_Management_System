# 🩺 Dentist Module — Full System Architecture

> สถาปัตยกรรมระดับภาพรวมของฝั่ง **ทันตแพทย์ (Dentist)**
> ออกแบบโฟลเดอร์ให้ **ตรงกับเมนูใน Sidebar 1:1** และใช้หลัก **Visual Zoning (ไร้โฟลเดอร์ `components/` กว้างๆ)** มาตรฐานเดียวกับโมดูลผู้ดูแลระบบ (`src/app/admin`)

---

## 🗂️ High-Level Directory Tree (1:1 กับ Sidebar)

```text
src/app/dentist/
├── DentistPortal.tsx          ← 🚪 [ROOT SHELL] สลับ 6 เมนูตาม Sidebar
├── DentistSidebar.tsx         ← 🧭 [SIDEBAR] แถบเมนูด้านข้างสีน้ำเงิน
├── README.md                  ← 🗺️ แผนผังภาพรวมของระบบทันตแพทย์ (ไฟล์นี้)
│
├── 🏠 dashboard/              ← 1. เมนู "แดชบอร์ด" (แบ่ง top / bottom เหมือน admin/dashboard)
│   ├── DentistDashboardView.tsx
│   ├── useDoctorDashboard.ts
│   ├── top/                   ← คำทักทาย + การ์ดสรุป 4 ช่อง
│   └── bottom/                ← คิววันนี้ + เวลาออกตรวจ
│
├── 👥 queue/                  ← 2. เมนู "คิวการรักษา" (แบ่ง treatment / odontogram ไร้โฟลเดอร์รกตา)
│   ├── DentistQueueView.tsx   ← หน้าห้องตรวจและคิวคนไข้
│   ├── useTreatmentQueue.ts   ← สมองคำนวณคิวและบันทึกการรักษา
│   ├── treatment/             ← แถบกรอง, การ์ดคิว, ฟอร์มรักษา, ป๊อปอัปยา
│   └── odontogram/            ← ระบบผังฟัน 32 ซี่ครบวงจร (รวม SVG, ชื่อฟัน, ป๊อปอัป, ประวัติ)
│
├── 📋 records/                ← 3. เมนู "เวชระเบียน" (Flat 2 ไฟล์)
│   ├── DentistRecordsView.tsx ← หน้าค้นหาและแสดงเวชระเบียนคนไข้
│   └── PatientCard.tsx        ← การ์ดข้อมูลคนไข้ 1 คน
│
├── 📜 history/                ← 4. เมนู "ประวัติการทำงาน" (Single-File)
│   └── DentistHistoryView.tsx ← หน้าตารางประวัติหัตถการย้อนหลังทั้งหมดของคุณหมอ
│
├── 📅 schedule/               ← 5. เมนู "ปฏิทินและการลางาน" (แบ่ง top / calendar เหมือน admin/schedule)
│   ├── DentistScheduleView.tsx
│   ├── useDoctorCalendar.ts
│   ├── top/                   ← การ์ดตารางเวรประจำสัปดาห์ + การ์ดสรุปการลา
│   └── calendar/              ← ปฏิทินจริงรายเดือน + ช่องวัน + ป๊อปอัปส่งใบลา
│
└── 👤 profile/                ← 6. เมนู "ข้อมูลส่วนตัว" (Single-File เหมือน admin/profile)
    └── DentistProfileView.tsx ← รวมการ์ดซ้าย-ขวา ป๊อปอัปเปลี่ยนรหัส จบในไฟล์เดียว
```
