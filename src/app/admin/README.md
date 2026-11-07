# 🏛️ Admin Portal — Full System Architecture

> สถาปัตยกรรมระดับภาพรวมของฝั่งผู้ดูแลระบบ (Admin)
> จัดวางโฟลเดอร์ตาม **เมนูใน Sidebar ทั้งหมดแบบ 1:1** สะอาด บริสุทธิ์ ไม่มีโฟลเดอร์กลางกำกวม (Zero Loose Components)

---

## 🗂️ High-Level Directory Tree (1:1 กับ Sidebar)

```text
src/app/admin/
├── AdminPortal.tsx                    ← 🏛️ [ROOT SHELL] แถบ Sidebar ด้านซ้าย + Router สลับหน้า
├── README.md                          ← 🗺️ แผนผังภาพรวมทั้งระบบของ Admin (ไฟล์นี้)
│
├── 👤 profile/                        ← 0. เมนู "ข้อมูลส่วนตัว" (คลิกที่การ์ดชื่อแอดมินด้านบน Sidebar)
│   ├── index.tsx                      ← Layout Root 2 ฝั่ง (ซ้าย: โปรไฟล์ / ขวา: ข้อมูล)
│   ├── README.md
│   └── components/                    ← ProfileCard, PersonalInfoCard, EmploymentInfoCard, ChangePasswordModal, ChangeEmailModal
│
├── 🏠 dashboard/                      ← 1. เมนู "แดชบอร์ด" (AdminDashboard + 5 Sub-components)
│   ├── AdminDashboard.tsx
│   ├── README.md
│   └── components/                    ← DashboardHeader, MetricCards, ChartsSection, SummaryRow, AppointmentsDrawer
│
├── 📅 schedule/                       ← 2. เมนู "ตารางเวรและการลา" (ScheduleManagement + 4 Positional Sections)
│   ├── ScheduleHub.tsx
│   ├── ScheduleManagement.tsx
│   ├── README.md
│   └── sections/
│       ├── Header/                    ← TitleBar, SearchBar, RoleFilterTabs, HeaderActions
│       ├── Content/                   ← LeftWeeklyTemplate/ + RightActualCalendar/
│       ├── Footer/                    ← คำขออนุมัติการลา (Leave Approvals)
│       └── Modals/                    ← DayDetailModal, EditShiftModal
│
├── 📋 clinic/                         ← 3. เมนู "จัดการคลินิก" (ClinicHub Router + 3 Self-Contained Subviews)
│   ├── ClinicHub.tsx                  ← หน้าแสดงการ์ดเลือก 3 หมวดหมู่ (บริการ, เวลา, ยา)
│   ├── README.md
│   └── subviews/
│       ├── ServiceManagement/         ← มี ServiceHeader (ปุ่มย้อนกลับในตัว) + AddServiceCard + ServiceCategoryList
│       ├── ClinicSettingsManagement/  ← มี SettingsHeader (ปุ่มย้อนกลับในตัว) + 3 Settings Cards + ConfirmModal
│       └── ProductManagement/         ← มี ProductHeader (ปุ่มย้อนกลับในตัว) + AddProductForm + ProductTable
│
└── 👥 users/                          ← 4. เมนู "จัดการผู้ใช้งาน" (UsersHub Router + 4 Modular Subviews)
    ├── UsersHub.tsx                   ← หน้าแสดงการ์ดเลือกหมวดหมู่ผู้ใช้ (แอดมิน, หมอ, พนักงาน, คนไข้)
    ├── README.md
    └── subviews/
        ├── AdminManagement/           ← Layout สั้น + AdminHeader + AdminTable + AdminModal
        ├── DentistManagement/         ← Layout สั้น + DentistHeader + DentistGrid + DentistModal
        ├── StaffManagement/           ← Layout สั้น + StaffHeader + StaffTable + StaffModal
        └── PatientManagement/         ← Layout สั้น + PatientHeader + PatientTable + PatientModal
```

---

## 🎯 Quick Navigation Guide (Sidebar Menu → โฟลเดอร์ที่รับผิดชอบ)

| ปุ่ม/จุดที่คลิกบน Sidebar | โฟลเดอร์ที่รับผิดชอบ | รายละเอียดภายใน |
| :--- | :--- | :--- |
| **การ์ดโปรไฟล์ "ผู้ดูแลระบบ" ด้านบน** | [`src/app/admin/profile/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/profile/index.tsx) | หน้าโปรไฟล์แยกซ้าย-ขวา พร้อมป๊อปอัปเปลี่ยนรหัสผ่านและอีเมล |
| **🏠 แดชบอร์ด** | [`src/app/admin/dashboard/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/AdminDashboard.tsx) | ภาพรวมสถิติ กราฟนัดหมาย และ Drawer รายการนัดหมายวันนี้ |
| **📅 ตารางเวรและการลา** | [`src/app/admin/schedule/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/ScheduleManagement.tsx) | Header, ตารางเวรสัปดาห์ (ซ้าย), ปฏิทินจริง (ขวา), และกล่องอนุมัติลา (ล่าง) |
| **📋 จัดการคลินิก** | [`src/app/admin/clinic/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinic/ClinicHub.tsx) | หมวดบริการ, เวลาเปิด-ปิด/วันหยุด, และรายการสินค้า/ยา (มีปุ่มย้อนกลับในตัว) |
| **👥 จัดการผู้ใช้งาน** | [`src/app/admin/users/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/users/UsersHub.tsx) | จัดการแอดมิน, หมอ, พนักงาน, คนไข้ (มีปุ่มย้อนกลับและ UserModal ในตัว) |
| **🚪 ออกจากระบบ (ล่างสุด)** | เรียก callback `onLogout` ใน `AdminPortal.tsx` | ออกจากระบบอย่างปลอดภัย พร้อมระบบ Idle Timeout 30 นาที |

---

## 💡 กฎความโปร่งใส (Colocation Principle)
1. **ปุ่มย้อนกลับ (Back Navigation)**: อยู่ใน Header ของแต่ละหน้าโดยตรง (รับผ่าน prop `onBack?: () => void`) ทำให้เปิดไฟล์ Header ปุ๊บรู้ทันทีว่าปุ่มอยู่ตรงไหน อยากเปลี่ยนสไตล์หรือข้อความทำได้อิสระ ไม่กระทบหน้าอื่น
2. **หน้าต่างป๊อปอัป (Modals)**: อยู่ในโมดูลของตัวเอง เช่น `profile/components/ChangePasswordModal.tsx`, `users/components/UserModal.tsx`, `schedule/sections/Modals/`
3. **จบในตัว (Self-Contained)**: หากต้องการลบหน้าไหน หรือย้ายไปทำเป็น Micro-frontend แค่จัดการโฟลเดอร์ของหน้านั้น ไม่มีเศษซากโค้ดค้างในโฟลเดอร์กลาง
