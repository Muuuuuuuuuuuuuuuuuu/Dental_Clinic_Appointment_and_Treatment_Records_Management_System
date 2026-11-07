# 📊 Patient Dashboard Module (`src/app/patient/dashboard`)

โมดูลแดชบอร์ดภาพรวมสำหรับคนไข้ จัดโครงสร้างตามมาตรฐาน **Positional Sections Pattern**

---

## 📁 โครงสร้างโฟลเดอร์ (Directory Structure)

```
src/app/patient/dashboard/
├── index.tsx                             # Entry point หลัก (~45 บรรทัด)
├── hooks/
│   └── usePatientDashboard.ts            # ดึงข้อมูลนัดหมาย, ประวัติการรักษา, เวลาทำการคลินิก
└── sections/
    ├── Header/                           # 🔲 ส่วนหัว: TitleBar และป้ายสถานะคลินิก
    │   ├── index.tsx
    │   └── components/
    │       └── TitleBar.tsx
    └── Content/                          # 🔲 ส่วนเนื้อหา: บัตรสถิติ, คิวถัดไป และข้อมูลติดต่อ
        ├── index.tsx
        └── components/
            ├── MetricCards.tsx           # สถิตินัดหมาย, รอรับบริการ, ประวัติ, ค่าใช้จ่ายรวม
            ├── UpcomingAppointmentCard.tsx # การ์ดแสดงนัดหมายที่กำลังจะมาถึง พร้อมปุ่มจอง
            └── ClinicInfoCard.tsx        # เวลาทำการ 7 วัน และข้อมูลการติดต่อคลินิก
```

