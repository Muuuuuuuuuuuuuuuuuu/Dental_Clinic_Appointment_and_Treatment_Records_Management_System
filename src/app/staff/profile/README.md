# 👨‍💼 Staff Profile Architecture (Positional Sections Pattern)

โครงสร้างโฟลเดอร์สำหรับหน้าโปรไฟล์พนักงาน (`src/app/staff/profile`) จัดระเบียบตาม **Positional Sections Pattern**:

```
src/app/staff/profile/
├── hooks/
│   └── useStaffProfile.ts              # จัดการ State & Form logic (Password, Email modal)
├── sections/
│   ├── Header/                         # [SECTION: HEADER] หัวข้อหน้า
│   │   ├── components/
│   │   │   └── TitleBar.tsx            # ข้อความ "ข้อมูลส่วนตัว"
│   │   └── index.tsx
│   ├── Content/                        # [SECTION: CONTENT] เนื้อหาหลัก 3 คอลัมน์
│   │   ├── components/
│   │   │   ├── LeftProfileCard/        # ฝั่งซ้าย (1 col): อวตาร, ชื่อ, ปุ่มเปิด Modal
│   │   │   │   └── index.tsx
│   │   │   └── RightInfoCards/         # ฝั่งขวา (2 col): ข้อมูลส่วนตัว และการจ้างงาน
│   │   │       ├── PersonalInfoCard.tsx
│   │   │       ├── EmploymentInfoCard.tsx
│   │   │       └── index.tsx
│   │   └── index.tsx
│   └── Modals/                         # [SECTION: MODALS] ป๊อปอัปทั้งหมด
│       ├── components/
│       │   ├── ChangePasswordModal.tsx # ป๊อปอัปเปลี่ยนรหัสผ่าน
│       │   └── ChangeEmailModal.tsx    # ป๊อปอัปเปลี่ยนอีเมล
│       └── index.tsx
├── index.tsx                           # Root orchestrator (~50 บรรทัด)
└── README.md
```

