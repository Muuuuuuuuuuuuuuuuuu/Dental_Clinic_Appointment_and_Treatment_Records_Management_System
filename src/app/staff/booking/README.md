# 🚶 Staff Walk-in Booking Module (`src/app/staff/booking`)

โมดูลจองคิวหน้าร้าน (Walk-in) สำหรับเจ้าหน้าที่คลินิก (Staff) โดยจัดโครงสร้างตามมาตรฐาน **Positional Sections Pattern**

---

## 📁 โครงสร้างโฟลเดอร์ (Directory Structure)

```
src/app/staff/booking/
├── index.tsx                             # Entry point หลัก (~75 บรรทัด)
├── hooks/
│   └── useWalkInBooking.ts               # ค้นหาคนไข้, ตารางเวรทันตแพทย์, ปฏิทินวันหยุด, ดึงสล็อตเวลา และการบันทึกนัดหมาย
└── sections/
    ├── Header/                           # 🔲 ส่วนหัว: TitleBar และตัวบ่งชี้ขั้นตอน (StepIndicator 1, 2, 3)
    │   ├── index.tsx
    │   └── components/
    │       ├── TitleBar.tsx
    │       └── StepIndicator.tsx
    └── Content/                          # 🔲 ส่วนเนื้อหา: ขั้นตอนต่างๆ ของการจองคิว
        ├── index.tsx
        └── components/
            ├── PatientSearchStep.tsx     # ขั้นตอนที่ 1: ค้นหาและระบุคนไข้
            ├── ServiceScheduleStep/      # ขั้นตอนที่ 2: บริการ ทันตแพทย์ ปฏิทิน และเวลา
            │   ├── index.tsx
            │   ├── ServiceSelector.tsx
            │   ├── DoctorSelector.tsx
            │   ├── CalendarPicker.tsx
            │   └── TimeSlotPicker.tsx
            ├── BookingConfirmationStep.tsx # ขั้นตอนที่ 3: ตรวจสอบและยืนยันข้อมูล
            └── BookingSuccessState.tsx   # สถานะสำเร็จเมื่อบันทึกข้อมูลเรียบร้อย
```

