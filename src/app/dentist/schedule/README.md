# 📅 Dentist Schedule Module — Architecture & Structure

> โมดูลปฏิทินและการลางานของทันตแพทย์ (Dentist Schedule & Leaves)
> ตรงกับเมนู **"ปฏิทินและการลางาน"** (key: `calendar`) บน Sidebar
> สถาปัตยกรรมแบบ **View + Brain (Hook)** สไตล์เดียวกับ Dashboard

---

## 🗂️ Directory Tree

```text
src/app/dentist/schedule/
├── README.md               ← 🗺️ เอกสารโครงสร้างของโมดูลปฏิทินทันตแพทย์
├── DentistScheduleView.tsx ← 🏢 [MAIN VIEW] หน้าปฏิทินเวรและส่งคำขอลางาน
├── useDoctorCalendar.ts    ← 🧠 [BRAIN] Hook คำนวณวันในปฏิทินและส่งใบลา (วางคู่กับ View)
├── index.ts                ← ส่งออก DentistScheduleView และ useDoctorCalendar
│
└── components/             ← 📦 ชิ้นส่วน UI ปฏิทิน
    ├── RegularScheduleCard.tsx  ← การ์ดตารางเวร 7 วันประจำสัปดาห์
    ├── LeaveSummaryCard.tsx     ← การ์ดสรุปคำขอลาของหมอ
    ├── ActualCalendarCard.tsx   ← การ์ดปฏิทินปฏิบัติงานจริงรายเดือน
    ├── CalendarHeader.tsx       ← แถบเลือกเดือน/ปี
    ├── CalendarCell.tsx         ← ช่องแสดงข้อมูลรายวันในปฏิทิน
    └── LeaveRequestModal.tsx    ← ป๊อปอัปส่งคำขอลางาน
```
