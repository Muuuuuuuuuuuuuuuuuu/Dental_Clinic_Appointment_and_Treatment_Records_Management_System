# 📋 Clinic Management Module — Architecture & Structure

> โมดูลจัดการคลินิก (จัดการบริการ, เวลาเปิด-ปิด/วันหยุด, สินค้าและยา)
> ใช้สถาปัตยกรรมแบบ **Parent Hub Router + Subviews Pattern** โดยทุกหน้าย่อยแยก Components ชัดเจนตามมาตรฐานเดียวกัน

---

## 🗂️ Directory Tree

```text
src/app/admin/clinic/
├── README.md                                  ← 🗺️ แผนผังโครงสร้างของโมดูลคลินิก (ไฟล์นี้)
├── ClinicHub.tsx                              ← 🏢 [PARENT HUB] หน้าแสดงการ์ดเลือก 3 หมวดหมู่หลัก
│
└── subviews/                                  ← 📂 ระบบย่อยที่เปิดตามการ์ดที่เลือก
    │
    ├── ServiceManagement/                     ← 🦷 1. ระบบจัดการบริการทันตกรรม
    │   ├── index.tsx                          ← 🏢 [LAYOUT ROOT] ตัวคุม State และ Layout
    │   └── components/
    │       ├── ServiceHeader.tsx              ← ส่วนหัว + ปุ่มเพิ่มบริการ
    │       ├── AddServiceCard.tsx             ← ฟอร์มเพิ่มบริการใหม่
    │       └── ServiceCategoryList.tsx        ← รายการบริการแยกตามหมวดหมู่ (พร้อม Inline Edit)
    │
    ├── ClinicSettingsManagement/              ← ⏰ 2. ระบบตั้งค่าเวลาและวันหยุด
    │   ├── index.tsx                          ← 🏢 [LAYOUT ROOT] ตัวคุม State และ Layout
    │   └── components/
    │       ├── SettingsHeader.tsx             ← ส่วนหัว + ปุ่มบันทึกการตั้งค่า
    │       ├── OperatingHoursCard.tsx         ← เวลาเปิด-ปิดทำการ 7 วัน
    │       ├── WeeklyOffDaysCard.tsx          ← วันหยุดประจำสัปดาห์
    │       ├── SpecialClosuresCard.tsx        ← จัดการวันหยุดพิเศษ (input date สะอาดตา)
    │       └── ConfirmPasswordModal.tsx       ← ป๊อปอัปยืนยันรหัสผ่านแอดมิน
    │
    └── ProductManagement/                     ← 💊 3. ระบบจัดการสินค้าและยา
        ├── index.tsx                          ← 🏢 [LAYOUT ROOT] ตัวคุม State และ Layout
        └── components/
            ├── ProductHeader.tsx              ← ส่วนหัว + ปุ่มเพิ่มรายการ
            ├── AddProductForm.tsx             ← ฟอร์มเพิ่มสินค้า/ยาใหม่
            └── ProductTable.tsx               ← ตารางรายการสินค้าและยา (พร้อม Inline Edit)
```

---

## 🎯 Quick Edit Guide (อยากแก้ไขจุดไหน ไปที่ไฟล์ไหน?)

| สิ่งที่ต้องการแก้ไข | ไฟล์ที่ต้องแก้ |
| :--- | :--- |
| **หน้าเมนูการ์ด 3 กล่อง** (เปลี่ยนชื่อการ์ด, ไอคอน, สี Gradient) | `ClinicHub.tsx` |
| **บริการทันตกรรม: หัวข้อและปุ่มเพิ่ม** | `subviews/ServiceManagement/components/ServiceHeader.tsx` |
| **บริการทันตกรรม: ฟอร์มเพิ่มบริการใหม่** | `subviews/ServiceManagement/components/AddServiceCard.tsx` |
| **บริการทันตกรรม: รายการบริการ, แก้ไขราคา, ปิด/เปิด** | `subviews/ServiceManagement/components/ServiceCategoryList.tsx` |
| **เวลาทำการ: เวลาเปิด-ปิด 7 วัน** | `subviews/ClinicSettingsManagement/components/OperatingHoursCard.tsx` |
| **เวลาทำการ: วันหยุดประจำสัปดาห์** | `subviews/ClinicSettingsManagement/components/WeeklyOffDaysCard.tsx` |
| **เวลาทำการ: วันหยุดพิเศษ (เพิ่ม/ลบ)** | `subviews/ClinicSettingsManagement/components/SpecialClosuresCard.tsx` |
| **สินค้าและยา: หัวข้อและปุ่มเพิ่ม** | `subviews/ProductManagement/components/ProductHeader.tsx` |
| **สินค้าและยา: ฟอร์มเพิ่มสินค้า/ยา** | `subviews/ProductManagement/components/AddProductForm.tsx` |
| **สินค้าและยา: ตารางรายการ, แก้ราคา, เปิด/ปิด** | `subviews/ProductManagement/components/ProductTable.tsx` |
