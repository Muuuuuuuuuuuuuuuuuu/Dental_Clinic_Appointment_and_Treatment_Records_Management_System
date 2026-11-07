# 👥 Staff Patient Management Module (`src/app/staff/patients`)

โมดูลจัดการคนไข้, ค้นหาประวัติ และลงทะเบียนคนไข้ใหม่สำหรับเจ้าหน้าที่คลินิก (Staff) โดยจัดโครงสร้างตามมาตรฐาน **Positional Sections Pattern**

---

## 📁 โครงสร้างโฟลเดอร์ (Directory Structure)

```
src/app/staff/patients/
├── index.tsx                             # Entry point หลัก (~20 บรรทัด)
└── sections/
    ├── Header/                           # 🔲 ส่วนหัว: TitleBar และแถบสลับเมนู (TabsNav)
    │   ├── index.tsx
    │   └── components/
    │       ├── TitleBar.tsx
    │       └── TabsNav.tsx
    └── Content/                          # 🔲 ส่วนเนื้อหา: ค้นหาประวัติคนไข้ หรือลงทะเบียนใหม่
        ├── index.tsx
        └── components/
            ├── PatientSearchTab.tsx      # แท็บค้นหา ตรวจสอบ HN และแก้ไขข้อมูลพื้นฐาน
            └── PatientRegisterTab.tsx    # แท็บฟอร์มลงทะเบียนคนไข้ใหม่ พร้อมระบบ OTP
```

