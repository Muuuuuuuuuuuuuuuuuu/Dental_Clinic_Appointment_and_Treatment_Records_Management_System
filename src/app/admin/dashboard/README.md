# 🏠 Admin Dashboard Module — Architecture & Structure

> โมดูลหน้าภาพรวมระบบของผู้ดูแลระบบ (Admin Dashboard)
> หน้าเริ่มต้นของ Admin Portal แสดงตัวชี้วัดสำคัญ กราฟ และสถานะงานแบบ Real-time
> ใช้สถาปัตยกรรมแบบ **Positional Sections Pattern** (Header, Content, Modals) สไตล์เดียวกับ `schedule` และ `profile`

---

## 🗂️ Directory Tree

```text
src/app/admin/dashboard/
├── README.md                                         ← 🗺️ เอกสารโครงสร้างของโมดูลแดชบอร์ด
├── index.tsx                                         ← 🏢 [LAYOUT ROOT] (~70 บรรทัด) รวม Header, Content, Modals
├── AdminDashboard.tsx                                ← 🔄 Re-export compatibility file
├── hooks/
│   └── useDashboardData.ts                           ← 🧠 Hook รวมตรรกะคำนวณสถิติ, กรองนัดหมาย, คำนวณรายได้
│
└── sections/                                         ← 📦 Positional Sections
    ├── Header/                                       ← 1. แถบควบคุมส่วนบน
    │   ├── components/
    │   │   ├── TitleBar.tsx                          ← หัวข้อ "ภาพรวมระบบ" และวันที่ภาษาไทย
    │   │   └── TimeframeControls.tsx                 ← ตัวเลือกวันที่ (input date) และปุ่มสลับ วัน/สัปดาห์/เดือน
    │   └── index.tsx                                 ← รวม TitleBar และ TimeframeControls
    │
    ├── Content/                                      ← 2. เนื้อหาหลักกลางหน้าจอ
    │   ├── components/
    │   │   ├── MetricCards/                          ← 📊 การ์ดตัวเลขสรุป 4 ช่อง
    │   │   │   ├── components/
    │   │   │   │   └── MetricCardItem.tsx            ← การ์ดสรุปตัวเลข 1 ใบ
    │   │   │   └── index.tsx                         ← รวม 4 ใบ (นัดหมาย, รายได้, แพทย์, รออนุมัติ)
    │   │   ├── Charts/                               ← 📈 กราฟวิเคราะห์
    │   │   │   ├── components/
    │   │   │   │   ├── AppointmentBarChart.tsx       ← กราฟแท่งแสดงจำนวนนัดหมาย
    │   │   │   │   └── RevenueLineChart.tsx          ← กราฟเส้นแสดงรายได้
    │   │   │   └── index.tsx                         ← Grid แสดงผล 2 กราฟคู่กัน
    │   │   └── SummaryRow/                           ← 📑 แถบสรุปภาพรวมด้านล่าง
    │   │       ├── components/
    │   │       │   ├── StatusRatioCard.tsx           ← แถบสัดส่วนสถานะ (สำเร็จ, รอคิว, ยกเลิก, ไม่มา)
    │   │       │   ├── ActiveOrthoCard.tsx           ← เคสต่อเนื่อง (จัดฟัน, รากเทียม)
    │   │       │   └── AppointmentsViewButton.tsx    ← ปุ่มเปิดดูรายการนัดหมาย
    │   │       └── index.tsx                         ← แถวสรุปสถานะด้านล่าง
    │   └── index.tsx                                 ← คุมระยะห่างและลำดับของ MetricCards, Charts, SummaryRow
    │
    └── Modals/                                       ← 3. รวมหน้าต่าง Popups / Drawers
        ├── components/
        │   └── AppointmentsDrawer.tsx                ← แผงสไลด์แสดงรายการนัดหมายทั้งหมดในวันนั้น
        └── index.tsx                                 ← จัดการการแสดงผล Drawer
```

---

## 🎯 Quick Edit Guide (อยากแก้ไขจุดไหน ไปที่ไฟล์ไหน?)

| สิ่งที่ต้องการแก้ไข | ไฟล์ที่ต้องแก้ |
| :--- | :--- |
| **โครงสร้างภาพรวมทั้งหน้า** | `src/app/admin/dashboard/index.tsx` |
| **สูตรคำนวณสถิติ / การดึงข้อมูล** | `hooks/useDashboardData.ts` |
| **หัวข้อ / วันที่ภาษาไทย** | `sections/Header/components/TitleBar.tsx` |
| **ตัวเลือกวันที่ / ปุ่ม วัน/สัปดาห์/เดือน** | `sections/Header/components/TimeframeControls.tsx` |
| **สไตล์หรือข้อมูลการ์ดตัวเลข 4 ช่อง** | `sections/Content/components/MetricCards/` |
| **กราฟแท่งนัดหมาย** | `sections/Content/components/Charts/components/AppointmentBarChart.tsx` |
| **กราฟเส้นรายได้** | `sections/Content/components/Charts/components/RevenueLineChart.tsx` |
| **แถบสัดส่วนสถานะเคส** | `sections/Content/components/SummaryRow/components/StatusRatioCard.tsx` |
| **การ์ดเคสต่อเนื่อง** | `sections/Content/components/SummaryRow/components/ActiveOrthoCard.tsx` |
| **ปุ่มดูรายการนัดหมาย** | `sections/Content/components/SummaryRow/components/AppointmentsViewButton.tsx` |
| **แผงสไลด์ดูรายการนัดหมาย** | `sections/Modals/components/AppointmentsDrawer.tsx` |
