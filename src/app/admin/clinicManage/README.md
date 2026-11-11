# 📋 Clinic Management Module — Architecture & Structure

> โมดูลจัดการคลินิก (จัดการบริการ, เวลาเปิด-ปิด/วันหยุด, สินค้าและยา)
> ใช้สถาปัตยกรรมแบบ **Parent Hub Router + Subviews Pattern** โดยทุกหน้าย่อยแยก Components ชัดเจนตามมาตรฐานเดียวกัน


## 🗂️ Directory Tree

```text
src/app/admin/clinicManage/
├── README.md                      ← 🗺️ แผนผังโครงสร้างของโมดูลคลินิก (ไฟล์นี้)
├── ClinicManagementView.tsx       ← 🏢 [PARENT HUB] หน้าแสดงการ์ดเลือก 3 หมวดหมู่หลัก
├── constants.ts                   ← คำจำกัดความการ์ดและสี
├── index.ts                       ← ส่งออกคอมโพเนนต์
│
├── 🦷 services/                   ← 1. ระบบจัดการบริการทันตกรรม (แบนราบ 4 ไฟล์จบ)
│   ├── ServiceManagement.tsx      ← ตัวคุมหน้าบริการ
│   ├── ServiceHeader.tsx          ← ส่วนหัว + ปุ่มเพิ่มบริการ
│   ├── AddServiceCard.tsx         ← ฟอร์มเพิ่มบริการใหม่
│   └── ServiceCategoryList.tsx    ← รายการบริการแยกตามหมวดหมู่ พร้อมแก้ไขราคา
│
├── ⏰ settings/                   ← 2. ระบบตั้งค่าเวลาและวันหยุดคลินิก (6 ไฟล์จบ)
│   ├── ClinicSettings.tsx         ← ตัวคุมหน้าตั้งค่าคลินิก
│   ├── SettingsHeader.tsx         ← ส่วนหัว + ปุ่มบันทึกการตั้งค่า
│   ├── OperatingHoursCard.tsx     ← เวลาเปิด-ปิดทำการ 7 วัน
│   ├── WeeklyOffDaysCard.tsx      ← วันหยุดประจำสัปดาห์
│   ├── SpecialClosuresCard.tsx    ← จัดการวันหยุดพิเศษ
│   └── ConfirmPasswordModal.tsx   ← ป๊อปอัปยืนยันรหัสผ่านแอดมิน
│
└── 💊 products/                   ← 3. ระบบจัดการสินค้าและยา (4 ไฟล์จบ)
    ├── ProductManagement.tsx      ← ตัวคุมหน้าสินค้า
    ├── ProductHeader.tsx          ← ส่วนหัว + ปุ่มเพิ่มรายการ
    ├── AddProductForm.tsx         ← ฟอร์มเพิ่มสินค้า/ยาใหม่
    └── ProductTable.tsx           ← ตารางรายการสินค้าและยา พร้อมแก้ไขราคา
```

---

## 🎯 Quick Edit Guide (อยากแก้ไขจุดไหน ไปที่ไฟล์ไหน?)

| สิ่งที่ต้องการแก้ไข | ไฟล์ที่ต้องแก้ |
| :--- | :--- |
| **หน้าเมนูการ์ด 3 กล่อง** (เปลี่ยนชื่อการ์ด, ไอคอน, สี Gradient) | [`ClinicManagementView.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinicManage/ClinicManagementView.tsx) |
| **บริการทันตกรรม: หัวข้อและปุ่มเพิ่ม** | [`services/ServiceHeader.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinicManage/services/ServiceHeader.tsx) |
| **บริการทันตกรรม: ฟอร์มเพิ่มบริการใหม่** | [`services/AddServiceCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinicManage/services/AddServiceCard.tsx) |
| **บริการทันตกรรม: รายการบริการ, แก้ไขราคา, ปิด/เปิด** | [`services/ServiceCategoryList.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinicManage/services/ServiceCategoryList.tsx) |
| **เวลาทำการ: เวลาเปิด-ปิด 7 วัน** | [`settings/OperatingHoursCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinicManage/settings/OperatingHoursCard.tsx) |
| **เวลาทำการ: วันหยุดประจำสัปดาห์** | [`settings/WeeklyOffDaysCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinicManage/settings/WeeklyOffDaysCard.tsx) |
| **เวลาทำการ: จัดการวันหยุดพิเศษ** | [`settings/SpecialClosuresCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinicManage/settings/SpecialClosuresCard.tsx) |
| **คลังสินค้า/ยา: ฟอร์มเพิ่มรายการใหม่** | [`products/AddProductForm.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinicManage/products/AddProductForm.tsx) |
| **คลังสินค้า/ยา: ตารางรายการสินค้าและยา** | [`products/ProductTable.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinicManage/products/ProductTable.tsx) |
| **เวลาทำการ: วันหยุดประจำสัปดาห์** | `subviews/ClinicSettingsManagement/components/WeeklyOffDaysCard.tsx` |
| **เวลาทำการ: วันหยุดพิเศษ (เพิ่ม/ลบ)** | `subviews/ClinicSettingsManagement/components/SpecialClosuresCard.tsx` |
| **สินค้าและยา: หัวข้อและปุ่มเพิ่ม** | `subviews/ProductManagement/components/ProductHeader.tsx` |
| **สินค้าและยา: ฟอร์มเพิ่มสินค้า/ยา** | `subviews/ProductManagement/components/AddProductForm.tsx` |
| **สินค้าและยา: ตารางรายการ, แก้ราคา, เปิด/ปิด** | `subviews/ProductManagement/components/ProductTable.tsx` |
