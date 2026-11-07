# 👥 Users Management Module — Architecture & Project Structure

> โมดูลจัดการผู้ใช้งานระบบ (ผู้ดูแลระบบ, ทันตแพทย์, พนักงาน, คนไข้)
> ใช้สถาปัตยกรรมแบบ **Parent Hub Router + Modular Subviews Pattern** มาตรฐานเดียวกับโมดูล Clinic

---

## 🗂️ Directory Tree

```text
src/app/admin/users/
├── README.md                                  ← 🗺️ แผนผังโครงสร้างของโมดูลผู้ใช้งาน (ไฟล์นี้)
├── UsersHub.tsx                               ← 🏢 [PARENT HUB] หน้าแสดงการ์ดเลือก 4 หมวดหมู่ (แอดมิน, หมอ, พนักงาน, คนไข้)
│
└── subviews/                                  ← 📂 ระบบย่อยที่เปิดตามการ์ดที่เลือก (แยกย่อยเป็น Header / Content / Modals)
    │
    ├── AdminManagement/                       ← 🛡️ 1. จัดการผู้ดูแลระบบ
    │   ├── index.tsx                          ← Layout Controller สั้นเพียง ~100 บรรทัด
    │   └── components/
    │       ├── AdminHeader.tsx                ← ปุ่มย้อนกลับ + หัวข้อ + ปุ่มเพิ่ม
    │       ├── AdminTable.tsx                 ← ตารางรายชื่อผู้ดูแลระบบ
    │       └── AdminModal.tsx                 ← ป๊อปอัปฟอร์มเพิ่ม/แก้ไขแอดมิน
    │
    ├── DentistManagement/                     ← 👨‍⚕️ 2. จัดการทันตแพทย์
    │   ├── index.tsx                          ← Layout Controller
    │   └── components/
    │       ├── DentistHeader.tsx              ← ปุ่มย้อนกลับ + หัวข้อ + ปุ่มเพิ่ม
    │       ├── DentistGrid.tsx                ← การ์ดโปรไฟล์ทันตแพทย์
    │       └── DentistModal.tsx               ← ป๊อปอัปฟอร์มเพิ่ม/แก้ไขทันตแพทย์
    │
    ├── StaffManagement/                       ← 👥 3. จัดการพนักงาน
    │   ├── index.tsx                          ← Layout Controller
    │   └── components/
    │       ├── StaffHeader.tsx                ← ปุ่มย้อนกลับ + หัวข้อ + ปุ่มเพิ่ม
    │       ├── StaffTable.tsx                 ← ตารางรายชื่อพนักงาน
    │       └── StaffModal.tsx                 ← ป๊อปอัปฟอร์มเพิ่ม/แก้ไขพนักงาน
    │
    └── PatientManagement/                     ← 🏥 4. จัดการคนไข้
        ├── index.tsx                          ← Layout Controller
        └── components/
            ├── PatientHeader.tsx              ← ปุ่มย้อนกลับ + ค้นหา HN + ปุ่มเพิ่ม
            ├── PatientTable.tsx               ← ตารางรายชื่อคนไข้
            └── PatientModal.tsx               ← ป๊อปอัปฟอร์มเพิ่มคนไข้
```

---

## 🎯 Quick Navigation Guide

| สิ่งที่ต้องการแก้ไข | ไฟล์ที่รับผิดชอบ |
| :--- | :--- |
| **หน้าการ์ดเลือกประเภทผู้ใช้** | [`UsersHub.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/users/UsersHub.tsx) |
| **ส่วนของผู้ดูแลระบบ (Admin)** | โฟลเดอร์ [`subviews/AdminManagement/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/users/subviews/AdminManagement/) |
| **ส่วนของทันตแพทย์ (Dentist)** | โฟลเดอร์ [`subviews/DentistManagement/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/users/subviews/DentistManagement/) |
| **ส่วนของพนักงาน (Staff)** | โฟลเดอร์ [`subviews/StaffManagement/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/users/subviews/StaffManagement/) |
| **ส่วนของคนไข้ (Patient)** | โฟลเดอร์ [`subviews/PatientManagement/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/users/subviews/PatientManagement/) |
