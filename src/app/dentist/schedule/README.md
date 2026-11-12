# 📅 Dentist Schedule Module — Architecture & Structure

> โมดูลปฏิทินและการลางานของทันตแพทย์ (Dentist Schedule & Leaves)
> จัดวางโครงสร้างตาม **โซนที่ตาเห็นบนหน้าจอ (Visual Zoning)**: `top/` และ `calendar/`
> รูปแบบมาตรฐานเดียวกับ `admin/schedule`

---

## 🗂️ Directory Tree

```text
src/app/dentist/schedule/
├── README.md                  ← 🗺️ แผนที่อธิบายโครงสร้างของโมดูลปฏิทินทันตแพทย์
├── DentistScheduleView.tsx    ← 🏢 [หน้าหลัก] วางเรียงโซน top → calendar
├── useDoctorCalendar.ts       ← 🧠 [สมองกล] คำนวณวันในปฏิทินและส่งใบลา
├── index.ts                   ← จุดส่งออกหลัก
│
├── top/                       ← 🔝 [ส่วนบนของหน้าจอ]
│   ├── index.ts
│   ├── RegularScheduleCard.tsx ← การ์ดตารางเวร 7 วันประจำสัปดาห์ (ซ้าย)
│   └── LeaveSummaryCard.tsx    ← การ์ดสรุปคำขอลาของหมอ (ขวา)
│
└── calendar/                  ← 🗓️ [ส่วนปฏิทินและป๊อปอัปส่งใบลา]
    ├── index.ts
    ├── ActualCalendarCard.tsx  ← การ์ดปฏิทินปฏิบัติงานจริงรายเดือน
    ├── CalendarHeader.tsx      ← แถบเลือกเดือน/ปี
    ├── CalendarCell.tsx        ← ช่องแสดงข้อมูลรายวันในปฏิทิน
    └── LeaveRequestModal.tsx   ← ป๊อปอัปส่งคำขอลางาน (เปิดเมื่อคลิกวันที่)
```
