# 🩺 Dentist Module — Full System Architecture

> สถาปัตยกรรมระดับภาพรวมของฝั่ง **ทันตแพทย์ (Dentist)**
> ออกแบบโฟลเดอร์ให้ **ตรงกับเมนูใน Sidebar 1:1** มาตรฐานเดียวกับโมดูลผู้ดูแลระบบ (`src/app/admin`)
> ทุกไฟล์มีหน้าที่ชัดเจน (Single Responsibility) ไม่มีโฟลเดอร์ซ้อนลึก และไม่มีไฟล์ผีตกค้าง

---

## 🗂️ High-Level Directory Tree (1:1 กับ Sidebar)

```text
src/app/dentist/
├── DentistPortal.tsx          ← 🚪 [ROOT SHELL] สลับ 6 เมนูตาม Sidebar
├── DentistSidebar.tsx         ← 🧭 [SIDEBAR] แถบเมนูด้านข้างสีน้ำเงิน
├── DentistStatusBanner.tsx    ← 🏷️ [STATUS BANNER] แถบสถานะคลินิก
├── README.md                  ← 🗺️ แผนผังภาพรวมของระบบทันตแพทย์ (ไฟล์นี้)
│
├── 🏠 dashboard/              ← 1. เมนู "แดชบอร์ด" (DentistDashboardView + useDoctorDashboard)
│   ├── DentistDashboardView.tsx
│   ├── useDoctorDashboard.ts
│   ├── README.md
│   ├── index.ts
│   └── components/
│
├── 👥 queue/                  ← 2. เมนู "คิวการรักษา" (ห้องตรวจ, คิวคนไข้, บันทึกเคส, ผังฟัน 32 ซี่)
│   ├── DentistQueueView.tsx   ← หน้าห้องตรวจและคิวคนไข้
│   ├── Odontogram.tsx         ← ระบบผังฟัน 32 ซี่แบบ Interactive SVG
│   ├── ToothGeometry.ts       ← พิกัดและรูปทรงเรขาคณิตของฟัน
│   ├── ToothActionModal.tsx   ← ป๊อปอัปเลือกหัตถการรายซี่
│   ├── components/            ← ชิ้นส่วนฟอร์มการรักษาและผังฟัน
│   ├── hooks/                 ← useTreatmentQueue
│   ├── README.md
│   └── index.ts
│
├── 📋 records/                ← 3. เมนู "เวชระเบียน" (Flat Architecture)
│   ├── DentistRecordsView.tsx ← หน้าค้นหาและแสดงเวชระเบียนคนไข้
│   ├── PatientCard.tsx        ← การ์ดข้อมูลคนไข้ 1 คน (HN, เบอร์โทร, โรคประจำตัว)
│   ├── README.md
│   └── index.ts
│
├── 📜 history/                ← 4. เมนู "ประวัติการทำงาน"
│   ├── DentistHistoryView.tsx ← หน้าตารางประวัติหัตถการย้อนหลังทั้งหมดของคุณหมอ
│   ├── README.md
│   └── index.ts
│
├── 📅 schedule/               ← 5. เมนู "ปฏิทินและการลางาน"
│   ├── DentistScheduleView.tsx← หน้าปฏิทินเวรและส่งคำขอลางาน
│   ├── README.md
│   ├── index.ts
│   └── components/            ← ปฏิทินรายเดือน, การ์ดเวรประจำ, ป๊อปอัปขอลางาน
│
└── 👤 profile/                ← 6. เมนู "ข้อมูลส่วนตัว" (Single-File Architecture)
    ├── DentistProfileView.tsx ← รวมการ์ดซ้าย-ขวา ป๊อปอัปเปลี่ยนรหัส จบใน ~190 บรรทัด
    ├── README.md
    └── index.ts
```

---

## 🎯 Quick Navigation Guide (Sidebar Menu → โฟลเดอร์ที่รับผิดชอบ)

| เมนูบน Sidebar | โฟลเดอร์ที่รับผิดชอบ | หน้าที่การทำงาน |
| :--- | :--- | :--- |
| **🏠 แดชบอร์ด** | [`dashboard/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/dentist/dashboard/DentistDashboardView.tsx) | ภาพรวมคิวตรวจวันนี้ และเวลาออกตรวจของหมอ |
| **👥 คิวการรักษา** | [`queue/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/dentist/queue/DentistQueueView.tsx) | คิวตรวจคนไข้, บันทึกการรักษา, ผังฟัน Odontogram 32 ซี่ |
| **📋 เวชระเบียน** | [`records/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/dentist/records/DentistRecordsView.tsx) | ค้นหาประวัติคนไข้และดูโรคประจำตัว (Flat 2 ไฟล์) |
| **📜 ประวัติการทำงาน** | [`history/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/dentist/history/DentistHistoryView.tsx) | รายการหัตถการทั้งหมดที่เคยรักษา พร้อมระบบค้นหา |
| **📅 ปฏิทินและการลางาน** | [`schedule/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/dentist/schedule/DentistScheduleView.tsx) | ตารางเวร 7 วัน, ปฏิทินเดือน, และฟอร์มส่งใบลา |
| **👤 ข้อมูลส่วนตัว** | [`profile/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/dentist/profile/DentistProfileView.tsx) | ข้อมูลส่วนตัว, บริการที่รักษา, วิชาชีพ, ปุ่มเปลี่ยนรหัส |
