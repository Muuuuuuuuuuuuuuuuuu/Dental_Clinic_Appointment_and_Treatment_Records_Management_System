tecture & Structure

> โมดูลจัดการตารางเวรและการลาของผู้ดูแลระบบ (Admin Schedule & Leave Management)
> จัดวางโครงสร้างตาม **โซนที่ตาเห็นบนหน้าจอจริง 3 ส่วน (Visual Zoning)**: `header/`, `calendar/`, และ `leave/`
> โดยตั้งชื่อไฟล์ใน `calendar/` แบบจับคู่ (`Actual...` คู่กับ `Actual...` / `Weekly...` คู่กับ `Weekly...`) เพื่อให้เรียงติดกันและหาง่ายทันที

---

## 🗂️ Directory Tree

```text
src/app/admin/schedule/
├── README.md                      ← 🗺️ แผนที่อธิบายโครงสร้างของหน้าตารางเวร
├── ScheduleManagementView.tsx     ← 🏢 [หน้าหลัก ~96 บรรทัด] กล่องใหญ่คุมเลย์เอาต์ บน-กลาง-ล่าง
├── useScheduleData.ts             ← 🧠 [เบื้องหลัง] ดึงข้อมูล 6 ตารางจาก Supabase + คำนวณกะ/วันลา + บันทึก
├── index.ts                       ← จุดส่งออกหลักของโมดูล
│
├── header/                        ← 🔝 [ส่วนบนของหน้าจอ]
│   └── ScheduleHeader.tsx         ← ชื่อหน้า "ตารางเวรและการลา", ช่องค้นหา, ปุ่มกรอง (ทั้งหมด/หมอ/พนักงาน), ปุ่มบันทึก
│
├── calendar/                      ← 🗓️ [ส่วนกลางของหน้าจอ] (เรียงคู่กันตามตัวอักษร)
│   ├── index.ts
│   ├── ActualCalendarCard.tsx     ← กล่องขวา: ปฏิทินปฏิบัติงานจริงรายเดือน
│   ├── ActualDayDetailModal.tsx   ← ป๊อปอัปดูคนเข้าเวรรายวัน (คู่กับ ActualCalendarCard)
│   ├── WeeklyEditShiftModal.tsx   ← ป๊อปอัปแก้เวลากะ (คู่กับ WeeklyTemplateCard)
│   └── WeeklyTemplateCard.tsx     ← กล่องซ้าย: ตารางเวรประจำสัปดาห์ 7 วัน
│
└── leave/                         ← 📋 [ส่วนล่างของหน้าจอ]
    └── LeaveApprovalsCard.tsx     ← การ์ดคำขออนุมัติการลา (แท็บรออนุมัติ + แท็บประวัติ ครบจบในไฟล์เดียว)
```

---

## 🎯 Quick Edit Guide (อยากแก้ไขตรงไหนบนหน้าจอ เปิดโฟลเดอร์ไหน?)

| จุดที่เห็นบนหน้าจอ | โฟลเดอร์ / ไฟล์ที่ต้องเปิด |
| :--- | :--- |
| **ตัวกรอบรวมทั้งหมด / การเรียง บน-กลาง-ล่าง** | [`ScheduleManagementView.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/ScheduleManagementView.tsx) |
| **สูตรคำนวณวันลา / ดึงข้อมูล / กดบันทึกไม่เข้า** | [`useScheduleData.ts`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/useScheduleData.ts) |
| **ส่วนหัว, ช่องค้นหาชื่อ, ปุ่มทั้งหมด/ทันตแพทย์/พนักงาน** | [`header/ScheduleHeader.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/header/ScheduleHeader.tsx) |
| **ตารางเวร 7 วัน (ฝั่งซ้าย)** | [`calendar/WeeklyTemplateCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/calendar/WeeklyTemplateCard.tsx) |
| **ป๊อปอัปตั้งค่าเวลาเข้าเวร (เด้งจากฝั่งซ้าย)** | [`calendar/WeeklyEditShiftModal.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/calendar/WeeklyEditShiftModal.tsx) |
| **ปฏิทินปฏิบัติงานจริง (ฝั่งขวา)** | [`calendar/ActualCalendarCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/calendar/ActualCalendarCard.tsx) |
| **ป๊อปอัปดูรายชื่อคนเข้าเวรประจำวัน (เด้งจากฝั่งขวา)** | [`calendar/ActualDayDetailModal.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/calendar/ActualDayDetailModal.tsx) |
| **กล่องคำขออนุมัติการลาด้านล่าง (รออนุมัติ / ประวัติ)** | [`leave/LeaveApprovalsCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/leave/LeaveApprovalsCard.tsx) |
