# 👥 Users Management Module — Architecture & Project Structure

> โมดูลจัดการผู้ใช้งานระบบ (ผู้ดูแลระบบ, ทันตแพทย์, พนักงาน, คนไข้)
> ใช้สถาปัตยกรรมแบบ **Parent Hub Router + Modular Subviews Pattern** มาตรฐานเดียวกับโมดูล Clinic

---

## 🗂️ Directory Tree

```text
src/app/admin/userManage/
├── README.md                      ← 🗺️ แผนผังโครงสร้างของโมดูลผู้ใช้งาน (ไฟล์นี้)
├── UserManagementView.tsx         ← 🏢 [PARENT HUB] หน้าแสดงการ์ดเลือก 4 หมวดหมู่
├── constants.ts                   ← คำจำกัดความการ์ดและสี
├── index.ts                       ← ส่งออกคอมโพเนนต์
│
├── 🛡️ admins/                     ← 1. จัดการผู้ดูแลระบบ (4 ไฟล์จบ)
│   ├── AdminManagement.tsx        ← ตัวคุมหน้าแอดมิน
│   ├── AdminHeader.tsx            ← ปุ่มย้อนกลับ + หัวข้อ + ปุ่มเพิ่ม
│   ├── AdminTable.tsx             ← ตารางรายชื่อผู้ดูแลระบบ
│   └── AdminModal.tsx             ← ป๊อปอัปฟอร์มเพิ่ม/แก้ไขแอดมิน
│
├── 👨‍⚕️ dentists/                   ← 2. จัดการทันตแพทย์ (4 ไฟล์จบ)
│   ├── DentistManagement.tsx      ← ตัวคุมหน้าทันตแพทย์
│   ├── DentistHeader.tsx          ← ปุ่มย้อนกลับ + หัวข้อ + ปุ่มเพิ่ม
│   ├── DentistGrid.tsx            ← การ์ดโปรไฟล์ทันตแพทย์
│   └── DentistModal.tsx           ← ป๊อปอัปฟอร์มเพิ่ม/แก้ไขทันตแพทย์
│
├── 👥 staff/                      ← 3. จัดการพนักงาน (4 ไฟล์จบ)
│   ├── StaffManagement.tsx        ← ตัวคุมหน้าพนักงาน
│   ├── StaffHeader.tsx            ← ปุ่มย้อนกลับ + หัวข้อ + ปุ่มเพิ่ม
│   ├── StaffTable.tsx             ← ตารางรายชื่อพนักงาน
│   └── StaffModal.tsx             ← ป๊อปอัปฟอร์มเพิ่ม/แก้ไขพนักงาน
│
└── 🏥 patients/                   ← 4. จัดการคนไข้ (4 ไฟล์จบ)
    ├── PatientManagement.tsx      ← ตัวคุมหน้าคนไข้
    ├── PatientHeader.tsx          ← ปุ่มย้อนกลับ + ค้นหา HN + ปุ่มเพิ่ม
    ├── PatientTable.tsx           ← ตารางรายชื่อคนไข้
    └── PatientModal.tsx           ← ป๊อปอัปฟอร์มเพิ่มคนไข้
```

---

## 🎯 Quick Navigation Guide

| สิ่งที่ต้องการแก้ไข | ไฟล์ที่รับผิดชอบ |
| :--- | :--- |
| **หน้าการ์ดเลือกประเภทผู้ใช้ 4 ใบ** | [`UserManagementView.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/userManage/UserManagementView.tsx) |
| **ผู้ดูแลระบบ: ตารางรายชื่อและฟอร์ม** | [`admins/AdminTable.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/userManage/admins/AdminTable.tsx) / [`admins/AdminModal.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/userManage/admins/AdminModal.tsx) |
| **ทันตแพทย์: การ์ดโปรไฟล์และฟอร์ม** | [`dentists/DentistGrid.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/userManage/dentists/DentistGrid.tsx) / [`dentists/DentistModal.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/userManage/dentists/DentistModal.tsx) |
| **พนักงาน: ตารางรายชื่อและฟอร์ม** | [`staff/StaffTable.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/userManage/staff/StaffTable.tsx) / [`staff/StaffModal.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/userManage/staff/StaffModal.tsx) |
| **คนไข้: ตารางคนไข้และฟอร์มเพิ่ม** | [`patients/PatientTable.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/userManage/patients/PatientTable.tsx) / [`patients/PatientModal.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/userManage/patients/PatientModal.tsx) |
