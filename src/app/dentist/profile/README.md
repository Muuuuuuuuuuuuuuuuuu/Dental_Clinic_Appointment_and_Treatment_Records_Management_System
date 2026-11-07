# 👤 Dentist Profile Module — Architecture & Structure

> โมดูลหน้าข้อมูลส่วนตัวของทันตแพทย์ (Doctor Profile)
> ใช้สถาปัตยกรรมแบบ **Positional Sections Pattern** สไตล์เดียวกับ `admin/profile`

---

## 🗂️ Directory Tree

```text
src/app/dentist/profile/
├── README.md                                         ← 🗺️ เอกสารโครงสร้างของโมดูลโปรไฟล์ทันตแพทย์
├── index.tsx                                         ← 🏢 [LAYOUT ROOT] (~40 บรรทัด)
│
└── sections/                                         ← 📦 Positional Sections
    ├── Header/                                       ← 1. ส่วนหัวของหน้า
    │   ├── components/
    │   │   └── TitleBar.tsx                          ← หัวข้อ "ข้อมูลส่วนตัว"
    │   └── index.tsx
    │
    ├── Content/                                      ← 2. เนื้อหาหลักแบ่ง ซ้าย - ขวา
    │   ├── components/
    │   │   ├── LeftProfileCard/                      ← 👈 ฝั่งซ้าย
    │   │   │   ├── components/
    │   │   │   │   └── AvatarBox.tsx                 ← วงกลมรูปโปรไฟล์, ชื่อ, ความเชี่ยวชาญ, เลขใบอนุญาต
    │   │   │   └── index.tsx
    │   │   └── RightInfoCards/                       ← 👉 ฝั่งขวา
    │   │       ├── components/
    │   │       │   ├── ProfessionalInfoCard.tsx      ← ข้อมูลวิชาชีพ (View Only)
    │   │       │   ├── ServicesProvidedCard.tsx      ← รายการบริการที่รับตรวจรักษา
    │   │       │   └── ContactInfoCard.tsx           ← ข้อมูลติดต่อ และปุ่มเปลี่ยนรหัสผ่าน
    │   │       └── index.tsx
    │   └── index.tsx                                 ← Grid Layout 2 คอลัมน์ (ซ้าย 1 ส่วน : ขวา 2 ส่วน)
    │
    └── Modals/                                       ← 3. รวมหน้าต่างป๊อปอัป
        ├── components/
        │   └── ChangePasswordModal.tsx               ← ฟอร์มเปลี่ยนรหัสผ่าน
        └── index.tsx
```

