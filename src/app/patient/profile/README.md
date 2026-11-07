# 👤 Patient Profile Module (`src/app/patient/profile`)

โมดูลข้อมูลส่วนตัวคนไข้ จัดโครงสร้างตามมาตรฐาน **Positional Sections Pattern**

---

## 📁 โครงสร้างโฟลเดอร์ (Directory Structure)

```
src/app/patient/profile/
├── index.tsx                             # Entry point หลัก (~65 บรรทัด)
├── hooks/
│   └── usePatientProfile.ts              # จัดการ State แก้ไขข้อมูล, เปลี่ยนอีเมล, เปลี่ยนรหัสผ่าน
└── sections/
    ├── Header/                           # 🔲 ส่วนหัว: TitleBar และแจ้งเตือนบันทึกสำเร็จ
    │   ├── index.tsx
    │   └── components/
    │       └── TitleBar.tsx
    └── Content/                          # 🔲 ส่วนเนื้อหา: แบ่งซ้าย-ขวา
        ├── index.tsx
        └── components/
            ├── LeftProfileCard/          # ฝั่งซ้าย: รูปประจำตัว, ชื่อคนไข้, อีเมล, เพศ, อายุ
            │   ├── index.tsx
            │   └── components/
            │       └── AvatarBox.tsx
            └── RightInfoCards/           # ฝั่งขวา: ข้อมูลระบุตัวตน, ข้อมูลติดต่อ, ความปลอดภัย
                ├── index.tsx
                └── components/
                    ├── IdentificationCard.tsx    # ข้อมูลระบุตัวตน (View Only)
                    ├── EditableContactCard.tsx   # ข้อมูลติดต่อที่คนไข้แก้ไขได้
                    └── SecurityCard.tsx          # การเปลี่ยนอีเมลและรหัสผ่าน
```

