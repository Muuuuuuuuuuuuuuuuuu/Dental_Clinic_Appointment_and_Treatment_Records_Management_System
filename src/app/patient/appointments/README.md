# 📅 Patient Appointments Module (`src/app/patient/appointments`)

โมดูลรายการนัดหมายสำหรับคนไข้ จัดโครงสร้างตามมาตรฐาน **Positional Sections Pattern**

---

## 📁 โครงสร้างโฟลเดอร์ (Directory Structure)

```
src/app/patient/appointments/
├── index.tsx                             # Entry point หลัก (~50 บรรทัด)
├── hooks/
│   └── usePatientAppointments.ts         # ดึงนัดหมาย, Auto-cancel นัดหมายที่เลยเวลา, คำนวณ Optimistic Update
└── sections/
    ├── Header/                           # 🔲 ส่วนหัว: TitleBar และปุ่มจองนัดใหม่
    │   ├── index.tsx
    │   └── components/
    │       └── TitleBar.tsx
    └── Content/                          # 🔲 ส่วนเนื้อหา: การ์ดรายการนัดหมาย หรือสถานะว่าง
        ├── index.tsx
        └── components/
            ├── AppointmentCard.tsx       # การ์ดแสดงวัน-เวลา บริการ ทันตแพทย์ และปุ่มยกเลิก
            └── EmptyAppointmentState.tsx # กล่องว่างเมื่อยังไม่มีการนัดหมาย
```

