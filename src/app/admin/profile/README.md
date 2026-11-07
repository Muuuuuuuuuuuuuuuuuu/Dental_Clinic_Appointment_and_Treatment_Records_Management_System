# 👤 Admin Profile Module — Architecture & Structure

> โมดูลหน้าข้อมูลส่วนตัวของผู้ดูแลระบบ (Admin Profile)
> เข้าถึงได้จากการคลิกการ์ดชื่อโปรไฟล์ด้านบนของ Sidebar แอดมิน
> ใช้สถาปัตยกรรมแบบ **Positional Sections Pattern** แบ่งตามตำแหน่งสายตา (Header, Content, Modals) เหมือนกับ `schedule`

---

## 🗂️ Directory Tree

```text
src/app/admin/profile/
├── README.md                                         ← 🗺️ เอกสารโครงสร้างของโมดูลโปรไฟล์
├── index.tsx                                         ← 🏢 [LAYOUT ROOT] (~45 บรรทัด) รวม Header, Content, Modals
│
└── sections/                                         ← 📦 Positional Sections
    ├── Header/                                       ← 1. ส่วนหัวหน้า
    │   ├── components/
    │   │   └── TitleBar.tsx                          ← หัวข้อ "ข้อมูลส่วนตัว" และคำอธิบาย
    │   └── index.tsx                                 ← คุมพื้นที่ Header
    │
    ├── Content/                                      ← 2. ส่วนเนื้อหากลางหน้าจอ (แบ่ง ซ้าย - ขวา)
    │   ├── components/
    │   │   ├── LeftProfileCard/                      ← 👈 ฝั่งซ้าย: ข้อมูลบัญชีและปุ่มจัดการ
    │   │   │   ├── components/
    │   │   │   │   ├── AvatarBox.tsx                 ← วงกลมรูปโปรไฟล์ ตัวอักษร "ผ", ชื่อ, ป้ายผู้ดูแลระบบ
    │   │   │   │   └── ProfileActions.tsx            ← ปุ่มเปลี่ยนอีเมล และ ปุ่มเปลี่ยนรหัสผ่าน
    │   │   │   └── index.tsx                         ← ประกอบกล่องฝั่งซ้าย
    │   │   └── RightInfoCards/                       ← 👉 ฝั่งขวา: การ์ดรายละเอียด
    │   │       ├── components/
    │   │       │   ├── PersonalInfoCard.tsx          ← ข้อมูลส่วนตัว (View Only)
    │   │       │   └── EmploymentInfoCard.tsx        ← ข้อมูลการจ้างงาน
    │   │       └── index.tsx                         ← ประกอบกล่องฝั่งขวา
    │   └── index.tsx                                 ← Grid Layout 2 คอลัมน์ (ซ้าย 1 ส่วน, ขวา 2 ส่วน)
    │
    └── Modals/                                       ← 3. ส่วนหน้าต่าง Popups / Modals
        ├── components/
        │   ├── ChangePasswordModal.tsx               ← ป๊อปอัปเปลี่ยนรหัสผ่าน พร้อมตรวจสอบความถูกต้อง
        │   └── ChangeEmailModal.tsx                  ← ป๊อปอัปเปลี่ยนอีเมล พร้อมส่งลิงก์ยืนยัน
        └── index.tsx                                 ← รวมศูนย์การแสดงผล Modals ทั้งหมด
```

---

## 🎯 Quick Edit Guide (อยากแก้ไขจุดไหน ไปที่ไฟล์ไหน?)

| สิ่งที่ต้องการแก้ไข | ไฟล์ที่ต้องแก้ |
| :--- | :--- |
| **โครงสร้างภาพรวมทั้งหน้า** (ความกว้าง, ระยะห่าง) | `src/app/admin/profile/index.tsx` |
| **หัวข้อหน้า / คำอธิบาย** | `sections/Header/components/TitleBar.tsx` |
| **รูปวงกลม, ชื่อ, ป้ายบทบาท** | `sections/Content/components/LeftProfileCard/components/AvatarBox.tsx` |
| **ปุ่มเปลี่ยนอีเมล / ปุ่มเปลี่ยนรหัสผ่าน** | `sections/Content/components/LeftProfileCard/components/ProfileActions.tsx` |
| **ฟิลด์ข้อมูลส่วนตัว** (เลขบัตร, วันเกิด, ที่อยู่ ฯลฯ) | `sections/Content/components/RightInfoCards/components/PersonalInfoCard.tsx` |
| **ฟิลด์ข้อมูลการจ้างงาน** (ตำแหน่ง, วันเริ่มงาน, สถานะ) | `sections/Content/components/RightInfoCards/components/EmploymentInfoCard.tsx` |
| **แบบฟอร์มเปลี่ยนรหัสผ่าน** | `sections/Modals/components/ChangePasswordModal.tsx` |
| **แบบฟอร์มเปลี่ยนอีเมล** | `sections/Modals/components/ChangeEmailModal.tsx` |
