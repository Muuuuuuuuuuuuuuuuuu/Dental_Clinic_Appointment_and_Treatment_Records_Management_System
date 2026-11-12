# 🏠 Admin Dashboard Module — Architecture & Structure

> โมดูลหน้าภาพรวมระบบของผู้ดูแลระบบ (Admin Dashboard)
> จัดวางโครงสร้างตาม **โซนที่ตาเห็นบนหน้าจอจริง 3 ส่วน (Visual Zoning)**: `top/`, `charts/`, และ `bottom/`
> รูปแบบมาตรฐานเดียวกับโมดูล `schedule/`

---

## 🗂️ Directory Tree

```text
src/app/admin/dashboard/
├── README.md                      ← 🗺️ แผนที่อธิบายโครงสร้างของโมดูลแดชบอร์ด
├── AdminDashboardView.tsx         ← 🏢 [หน้าหลัก] วางเรียงโซน top / charts / bottom
├── useDashboardData.ts            ← 🧠 [สมองกล] คำนวณสถิติ, กรองนัดหมาย, คำนวณรายได้
├── index.ts                       ← จุดส่งออกหลัก
│
├── top/                           ← 🔝 [ส่วนบนของหน้าจอ] หัวข้อ + ตัวเลือกวัน + การ์ด 4 ช่อง
│   ├── index.ts
│   ├── DashboardHeader.tsx        ← หัวข้อ "ภาพรวมระบบ" + ปฏิทิน + ปุ่ม วัน/สัปดาห์/เดือน
│   └── MetricCards.tsx            ← การ์ดสรุปตัวเลข 4 ช่อง (นัดหมาย, รายได้, แพทย์, ลา)
│
├── charts/                        ← 📊 [ส่วนกลางของหน้าจอ] กราฟสถิติซ้าย-ขวา
│   ├── index.ts
│   ├── AppointmentBarChart.tsx    ← กราฟแท่งแสดงจำนวนนัดหมาย (ฝั่งซ้าย)
│   └── RevenueLineChart.tsx       ← กราฟเส้นแสดงรายได้ (ฝั่งขวา)
│
└── bottom/                        ← 📋 [ส่วนล่างของหน้าจอ] สัดส่วนสถานะ + รายการนัดหมาย
    ├── index.ts
    ├── StatusRatioCard.tsx        ← แถบสัดส่วนสถานะเคส (สำเร็จ, รอคิว, ยกเลิก, ไม่มา)
    ├── AppointmentsViewButton.tsx ← ปุ่มการ์ดสีชมพูกดเปิดดูรายการนัดหมาย
    └── AppointmentsDrawer.tsx     ← ลิ้นชักสไลด์แสดงรายการนัดหมายเมื่อกดปุ่มสีชมพู
```

---

## 🎯 Quick Edit Guide (อยากแก้ไขจุดไหน เปิดโฟลเดอร์ไหน?)

| จุดที่เห็นบนหน้าจอ | โฟลเดอร์ / ไฟล์ที่ต้องแก้ |
| :--- | :--- |
| **โครงสร้างภาพรวมหน้าแดชบอร์ด** | [`AdminDashboardView.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/AdminDashboardView.tsx) |
| **สูตรคำนวณสถิติ / การดึงข้อมูล** | [`useDashboardData.ts`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/useDashboardData.ts) |
| **หัวข้อ / ปฏิทินเลือกวัน / ปุ่มวัน-สัปดาห์-เดือน** | [`top/DashboardHeader.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/top/DashboardHeader.tsx) |
| **การ์ดตัวเลข 4 ช่องด้านบน** | [`top/MetricCards.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/top/MetricCards.tsx) |
| **กราฟแท่งนัดหมาย (กลางซ้าย)** | [`charts/AppointmentBarChart.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/charts/AppointmentBarChart.tsx) |
| **กราฟเส้นรายได้ (กลางขวา)** | [`charts/RevenueLineChart.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/charts/RevenueLineChart.tsx) |
| **แถบสัดส่วนสถานะเคส (ล่างซ้าย)** | [`bottom/StatusRatioCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/bottom/StatusRatioCard.tsx) |
| **ปุ่มดูรายการนัดหมายสีชมพู (ล่างขวา)** | [`bottom/AppointmentsViewButton.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/bottom/AppointmentsViewButton.tsx) |
| **ลิ้นชักสไลด์นัดหมาย** | [`bottom/AppointmentsDrawer.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/bottom/AppointmentsDrawer.tsx) |
