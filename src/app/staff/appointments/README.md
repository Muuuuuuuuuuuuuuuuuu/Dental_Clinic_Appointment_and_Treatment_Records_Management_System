# 📅 Staff Appointment Management Module (`src/app/staff/appointments`)

โมดูลจัดการนัดหมาย, คัดกรองเคสความเสี่ยงสุขภาพ, ย้ายเคส, เลื่อนคิว และยกเลิกนัด สำหรับเจ้าหน้าที่คลินิก (Staff) โดยจัดโครงสร้างตามมาตรฐาน **Positional Sections Pattern**

---

## 📁 โครงสร้างโฟลเดอร์ (Directory Structure)

```
src/app/staff/appointments/
├── index.tsx                             # Entry point หลัก (~95 บรรทัด)
├── AppointmentManagementView.tsx         # Re-export สำหรับ Backward Compatibility
├── hooks/
│   └── useStaffAppointments.ts           # ตรรกะคัดกรองเคส, ค้นหา, ย้ายแพทย์, เลื่อนนัดหมาย และ Realtime Appointments
└── sections/
    ├── Header/                           # 🔲 ส่วนหัว: TitleBar, SearchBar, Tabs Navigation
    │   ├── index.tsx
    │   └── components/
    │       ├── TitleBar.tsx
    │       └── TabsNav.tsx
    ├── Content/                          # 🔲 ส่วนเนื้อหา: การ์ดรายการนัดหมาย หรือสถานะว่าง
    │   ├── index.tsx
    │   └── components/
    │       ├── AppointmentCard.tsx
    │       └── EmptyAppointmentState.tsx
    └── Modals/                           # 🔲 ส่วนหน้าต่างป๊อปอัป
        ├── index.tsx
        └── components/
            ├── TransferModal.tsx         # ป๊อปอัปโอนย้ายเคสไปยังทันตแพทย์ท่านอื่น
            └── RescheduleModal.tsx       # ป๊อปอัปเลื่อนวันเวลา หรือยกเลิกนัดหมาย
```

