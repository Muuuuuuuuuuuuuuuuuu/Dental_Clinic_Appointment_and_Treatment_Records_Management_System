# 📅 Admin Schedule Module — Architecture & Structure

> โมดูลจัดการตารางเวรและการลาของผู้ดูแลระบบ (Admin Schedule & Leave Management)
> ศูนย์กลางการจัดกะเวลาทำงาน 7 วัน, ปฏิทินปฏิบัติงานจริงรายเดือน, และการอนุมัติคำขอลางาน
> ใช้สถาปัตยกรรมแบบ **Clean Flat Components Pattern** (View + 6 ชิ้นส่วน UI หลักที่ตรงกับหน้าจอ 1:1)

---

## 🗂️ Directory Tree

```text
src/app/admin/schedule/
├── README.md                      ← 🗺️ เอกสารโครงสร้างของโมดูลตารางเวร
├── ScheduleManagementView.tsx     ← 🏢 [MAIN VIEW] หน้าหลักคุม State และจัดวาง 4 โซนสายตา
├── index.ts                       ← ส่งออก ScheduleManagementView
│
└── components/                    ← 📦 ชิ้นส่วน UI ตารางเวร (6 ชิ้นส่วนหลัก)
    ├── ScheduleHeader.tsx         ← 1. แถบควบคุมบน (ค้นหา, กรองหมอ/พนักงาน, ทางลัดตั้งค่า, ปุ่มบันทึก)
    ├── WeeklyTemplateCard.tsx     ← 2. การ์ดตารางเวร 7 วัน แม่แบบประจำสัปดาห์ (คอลัมน์ซ้าย)
    ├── ActualCalendarCard.tsx     ← 3. การ์ดปฏิทินปฏิบัติงานจริงรายเดือน (คอลัมน์ขวา)
    ├── LeaveApprovalsCard.tsx     ← 4. การ์ดคำขออนุมัติการลา (ด้านล่าง มีแท็บรออนุมัติ / ประวัติ จบในตัว)
    ├── DayDetailModal.tsx         ← 5. ป๊อปอัปดูรายละเอียดคนเข้าเวรรายวัน (เปิดเมื่อคลิกช่องวันที่)
    └── EditShiftModal.tsx         ← 6. ป๊อปอัปแก้ไขเวลาเข้า-ออกเวร (เปิดเมื่อคลิกแก้ไขกะ)
```

---

## 🖥️ Layout Mapping บนหน้าจอจริง

```text
+-----------------------------------------------------------------------------------------+
| 🔝 1. ScheduleHeader (ค้นหาชื่อ, สลับบทบาท, แจ้งเตือนใบลา, ปุ่มตั้งค่า, บันทึกการเปลี่ยนแปลง) |
+-----------------------------------------------------------------------------------------+
| 👈 2. WeeklyTemplateCard (ซ้าย)              | 👉 3. ActualCalendarCard (ขวา)            |
| (ตารางเวรแม่แบบ 7 วัน จันทร์-อาทิตย์)            | (ปฏิทินจริงรายเดือน แสดงวันหยุดและคนลา)     |
+-----------------------------------------------------------------------------------------+
| 📋 4. LeaveApprovalsCard (ล่าง)                                                          |
| (แท็บคำขอลาที่รออนุมัติ พร้อมปุ่มอนุมัติ/ปฏิเสธ + แท็บประวัติการลาที่อนุมัติแล้ว)                 |
+-----------------------------------------------------------------------------------------+
| 🪟 5. DayDetailModal (ป๊อปอัปเจาะดูรายวัน)     | 🪟 6. EditShiftModal (ป๊อปอัปแก้ไขเวลากะ)   |
+-----------------------------------------------------------------------------------------+
```

---

## 🎯 Quick Edit Guide (อยากแก้ไขจุดไหน ไปที่ไฟล์ไหน?)

| สิ่งที่ต้องการแก้ไข | ไฟล์ที่ต้องแก้ |
| :--- | :--- |
| **โครงสร้างภาพรวม / จัดวางตำแหน่ง / การบันทึก Supabase** | [`ScheduleManagementView.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/ScheduleManagementView.tsx) |
| **แถบเครื่องมือบน / ปุ่มค้นหา / ตัวกรองหมอ-พนักงาน** | [`components/ScheduleHeader.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/components/ScheduleHeader.tsx) |
| **ตารางเวรประจำสัปดาห์ 7 วัน** | [`components/WeeklyTemplateCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/components/WeeklyTemplateCard.tsx) |
| **ปฏิทินปฏิบัติงานจริงรายเดือน** | [`components/ActualCalendarCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/components/ActualCalendarCard.tsx) |
| **กล่องอนุมัติการลา (ปุ่มอนุมัติ/ประวัติ)** | [`components/LeaveApprovalsCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/components/LeaveApprovalsCard.tsx) |
| **หน้าต่างดูรายละเอียดคนเข้าเวรรายวัน** | [`components/DayDetailModal.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/components/DayDetailModal.tsx) |
| **หน้าต่างแก้ไขเวลากะเข้าเวร** | [`components/EditShiftModal.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/components/EditShiftModal.tsx) |
