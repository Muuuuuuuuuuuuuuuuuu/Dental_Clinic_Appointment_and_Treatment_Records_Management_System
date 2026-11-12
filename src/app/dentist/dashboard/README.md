# 🏠 Dentist Dashboard Module — Architecture & Structure

> โมดูลแดชบอร์ดภาพรวมของทันตแพทย์ (Dentist Dashboard)
> จัดวางโครงสร้างตาม **โซนที่ตาเห็นบนหน้าจอ (Visual Zoning)**: `top/` และ `bottom/`
> รูปแบบมาตรฐานเดียวกับ `admin/dashboard`

---

## 🗂️ Directory Tree

```text
src/app/dentist/dashboard/
├── README.md                  ← 🗺️ แผนที่อธิบายโครงสร้างของโมดูลแดชบอร์ดทันตแพทย์
├── DentistDashboardView.tsx   ← 🏢 [หน้าหลัก] วางเรียงโซน top → bottom
├── useDoctorDashboard.ts      ← 🧠 [สมองกล] ดึงคิวนัดหมายและคำนวณสถิติด่วน
├── index.ts                   ← จุดส่งออกหลัก
│
├── top/                       ← 🔝 [ส่วนบนของหน้าจอ]
│   ├── index.ts
│   ├── DashboardHeader.tsx    ← คำทักทายคุณหมอ
│   └── DashboardMetricCards.tsx ← การ์ดสรุปตัวเลข 4 ช่อง (คนไข้วันนี้, รอตรวจ, รอจ่ายเงิน, เสร็จสิ้น)
│
└── bottom/                    ← 📋 [ส่วนล่างของหน้าจอ]
    ├── index.ts
    ├── TodayQueueCard.tsx     ← คิวคนไข้วันนี้ 5 คนแรก พร้อมปุ่มดูทั้งหมด
    └── TodayDutyCard.tsx      ← เวลาออกตรวจของหมอประจำวัน
```
