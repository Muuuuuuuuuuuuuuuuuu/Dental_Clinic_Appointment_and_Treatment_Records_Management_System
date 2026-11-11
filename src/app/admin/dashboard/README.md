# 🏠 Admin Dashboard Module — Architecture & Structure

> โมดูลหน้าภาพรวมระบบของผู้ดูแลระบบ (Admin Dashboard)
> หน้าเริ่มต้นของ Admin Portal แสดงตัวชี้วัดสำคัญ กราฟ และสถานะงานแบบ Real-time
> สถาปัตยกรรมแยกส่วน: **View (หน้าจอ)**, **Brain (Hook คำนวณ)**, และ **Components (หน้าปัดเกจวัด)**

---

## 🗂️ Directory Tree

```text
src/app/admin/dashboard/
├── README.md                      ← 🗺️ เอกสารโครงสร้างของโมดูลแดชบอร์ด
├── AdminDashboardView.tsx         ← 🏢 [MAIN VIEW] หน้าแดชบอร์ดรวมภาพทั้งหมด (97 บรรทัด)
├── useDashboardData.ts            ← 🧠 [BRAIN] Hook คำนวณสถิติ, กรองนัดหมาย, คำนวณรายได้ (วางคู่กับ View เลย!)
├── index.ts                       ← ส่งออก AdminDashboardView และ useDashboardData
│
└── components/                    ← 📦 ชิ้นส่วน UI แดชบอร์ด (7 ไฟล์หลัก)
    ├── DashboardHeader.tsx        ← แถว 1: หัวข้อ "ภาพรวมระบบ" + ตัวเลือกวันที่และปุ่ม วัน/สัปดาห์/เดือน
    ├── MetricCards.tsx            ← แถว 2: การ์ดสรุปตัวเลข 4 ช่อง (นัดหมาย, รายได้, แพทย์, ลา)
    ├── AppointmentBarChart.tsx    ← แถว 3 (ซ้าย): กราฟแท่งแสดงจำนวนนัดหมาย
    ├── RevenueLineChart.tsx       ← แถว 3 (ขวา): กราฟเส้นแสดงรายได้
    ├── StatusRatioCard.tsx        ← แถว 4 (ซ้าย): แถบสรุปสัดส่วนสถานะเคส (สำเร็จ, รอคิว, ยกเลิก, ไม่มา)
    ├── AppointmentsViewButton.tsx ← แถว 4 (ขวา): ปุ่มการ์ดสีชมพูกดเปิดดูรายการนัดหมาย
    └── AppointmentsDrawer.tsx     ← [DRAWER] ลิ้นชักสไลด์แสดงรายการนัดหมายวันนี้
```

---

## 🎯 Quick Edit Guide (อยากแก้ไขจุดไหน ไปที่ไฟล์ไหน?)

| สิ่งที่ต้องการแก้ไข | ไฟล์ที่ต้องแก้ |
| :--- | :--- |
| **โครงสร้างภาพรวมหน้าแดชบอร์ด** | [`AdminDashboardView.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/AdminDashboardView.tsx) |
| **สูตรคำนวณสถิติ / การดึงข้อมูล** | [`useDashboardData.ts`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/useDashboardData.ts) |
| **หัวข้อ / ปฏิทินเลือกวัน / ปุ่มวัน-สัปดาห์-เดือน** | [`components/DashboardHeader.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/components/DashboardHeader.tsx) |
| **การ์ดตัวเลข 4 ช่อง** | [`components/MetricCards.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/components/MetricCards.tsx) |
| **กราฟแท่งนัดหมาย** | [`components/AppointmentBarChart.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/components/AppointmentBarChart.tsx) |
| **กราฟเส้นรายได้** | [`components/RevenueLineChart.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/components/RevenueLineChart.tsx) |
| **แถบสัดส่วนสถานะเคส** | [`components/StatusRatioCard.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/components/StatusRatioCard.tsx) |
| **ปุ่มดูรายการนัดหมายสีชมพู** | [`components/AppointmentsViewButton.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/components/AppointmentsViewButton.tsx) |
| **ลิ้นชักสไลด์นัดหมาย** | [`components/AppointmentsDrawer.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/components/AppointmentsDrawer.tsx) |
