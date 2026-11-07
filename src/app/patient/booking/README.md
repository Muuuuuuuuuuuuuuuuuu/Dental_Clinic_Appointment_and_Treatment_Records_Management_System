# Patient Booking Module Architecture

โครงสร้างสถาปัตยกรรมโมดูลการจองนัดหมายทันตกรรมของคนไข้ (`patient/booking`) ออกแบบตามมาตรฐาน **Positional Sections Pattern**

```
src/app/patient/booking/
├── data/
│   └── serviceDetailsData.ts      # ข้อมูลประโยชน์ ขั้นตอนการรักษา คำแนะนำ และไอคอนของแต่ละบริการ
├── hooks/
│   └── usePatientBooking.ts       # State และ Business Logic: วันที่ เวลา โควต้าคิว แพทย์ แบบฟอร์มสุขภาพ การบันทึก
├── sections/
│   ├── Header/                    # แถบด้านบน: ปุ่มย้อนกลับ, หัวข้อ, ตัวบอกขั้นตอน (StepIndicator 1-4)
│   │   ├── components/
│   │   │   ├── TitleBar.tsx
│   │   │   └── StepIndicator.tsx
│   │   └── index.tsx
│   ├── Content/                   # เนื้อหาหลักตามแต่ละขั้นตอนการจอง
│   │   ├── components/
│   │   │   ├── ServiceStep/       # ขั้นตอนที่ 0: ตารางเลือกบริการทันตกรรม
│   │   │   │   └── ServiceCardGrid.tsx
│   │   │   ├── ScheduleStep/      # ขั้นตอนที่ 1: แบ่งซ้าย (ข้อมูลบริการ) และขวา (เลือกหมอ ปฏิทิน เวลาว่าง)
│   │   │   │   ├── ServiceDetailLeftCard.tsx
│   │   │   │   ├── DoctorSelector.tsx
│   │   │   │   ├── FollowUpAlert.tsx
│   │   │   │   ├── BookingCalendar.tsx
│   │   │   │   ├── TimeSlotPicker.tsx
│   │   │   │   └── index.tsx
│   │   │   ├── HealthChecklistStep/ # ขั้นตอนที่ 2: ฟอร์มประวัติสุขภาพและความยินยอม
│   │   │   │   └── index.tsx
│   │   │   ├── ConfirmationStep/  # ขั้นตอนที่ 4: สรุปข้อมูลนัดหมาย และปุ่มกดยืนยัน
│   │   │   │   └── SummaryCard.tsx
│   │   │   └── BookingSuccessState/ # หน้าจอแสดงผลเมื่อจองสำเร็จ
│   │   │       └── index.tsx
│   │   └── index.tsx
│   └── Modals/                    # หน้าต่าง Popup หรือ Dialog
│       └── index.tsx
├── HealthChecklistForm.tsx        # แบบฟอร์มคัดกรองสุขภาพ
├── index.tsx                      # Layout Root Component (~80 lines)
└── README.md                      # เอกสารอธิบายโครงสร้าง
```

