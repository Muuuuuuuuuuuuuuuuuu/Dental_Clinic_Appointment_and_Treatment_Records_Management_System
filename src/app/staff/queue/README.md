# 🏥 Staff Queue Management Module (`src/app/staff/queue`)

โมดูลจัดการคิวงานและตารางนัดหมายสำหรับเจ้าหน้าที่คลินิก (Staff) โดยจัดโครงสร้างตามมาตรฐาน **Positional Sections Pattern**

---

## 📁 โครงสร้างโฟลเดอร์ (Directory Structure)

```
src/app/staff/queue/
├── index.tsx                             # Entry point หลัก สั้นกระชับ (~45 บรรทัด)
├── hooks/
│   └── useQueueData.ts                   # ดึงข้อมูลคิวงาน, กะทันตแพทย์, วันหยุดคลินิก และ Realtime Sync
└── sections/
    ├── Header/                           # 🔲 ส่วนหัว: TitleBar และปุ่มสลับมุมมอง (Daily/Weekly/Monthly)
    │   ├── index.tsx
    │   └── components/
    │       ├── TitleBar.tsx
    │       └── ViewToggle.tsx
    └── Content/                          # 🔲 ส่วนเนื้อหา: ปฏิทิน คิวงาน Kanban และบัตรสถิติ
        ├── index.tsx
        └── components/
            ├── StatCards.tsx             # สถิติคิววันนี้ (รอตรวจ, กำลังตรวจ, รอชำระเงิน, เสร็จสิ้น)
            ├── TodayKanbanBoard.tsx      # บอร์ดคิวงานตามสถานะ
            ├── AppointmentList.tsx       # รายการคิวงานรายชั่วโมง
            ├── OnDutyDentistsBar.tsx     # ทันตแพทย์ที่เข้าเวรในวันนั้น
            ├── DaySelector.tsx           # ตัวเลื่อนวัน (ย้อนหลัง/ถัดไป/วันนี้)
            ├── DailyView/                # มุมมองรายวัน
            ├── WeeklyView/               # มุมมองรายสัปดาห์
            └── MonthlyView/              # มุมมองรายเดือน
```

