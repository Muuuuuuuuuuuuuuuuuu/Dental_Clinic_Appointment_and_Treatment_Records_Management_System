# 🏠 Dentist Dashboard Module — Architecture & Structure

> โมดูลแดชบอร์ดภาพรวมของทันตแพทย์ (Dentist Dashboard)
> ตรงกับเมนู **"แดชบอร์ด"** (key: `dashboard`) บน Sidebar
> สถาปัตยกรรมแบบ **View + Brain (Hook)** สไตล์เดียวกับ Admin Dashboard

---

## 🗂️ Directory Tree

```text
src/app/dentist/dashboard/
├── README.md               ← 🗺️ เอกสารโครงสร้างของโมดูลแดชบอร์ดทันตแพทย์
├── DentistDashboardView.tsx← 🏢 [MAIN VIEW] หน้าจอหลักแดชบอร์ดคุณหมอ
├── useDoctorDashboard.ts   ← 🧠 [BRAIN] Hook ดึงคิวนัดหมายและคำนวณสถิติด่วน (วางคู่กับ View)
├── index.ts                ← ส่งออก DentistDashboardView และ useDoctorDashboard
│
└── components/             ← 📦 4 ชิ้นส่วน UI หลัก
    ├── DashboardHeader.tsx       ← คำทักทายคุณหมอ + วันที่ปัจจุบัน
    ├── DashboardMetricCards.tsx  ← การ์ดสรุปตัวเลข 4 ช่อง (คนไข้วันนี้, รอตรวจ, รอจ่ายเงิน, เสร็จสิ้น)
    ├── TodayQueueCard.tsx        ← คิวคนไข้วันนี้ 5 คนแรก พร้อมปุ่มดูทั้งหมด
    └── TodayDutyCard.tsx         ← เวลาออกตรวจของหมอประจำวัน
```
