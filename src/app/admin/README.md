# 🏛️ Admin Portal — Full System Architecture

> สถาปัตยกรรมระดับภาพรวมของฝั่งผู้ดูแลระบบ (Admin)
> จัดวางโฟลเดอร์ตาม **เมนูใน Sidebar ทั้งหมดแบบ 1:1** สะอาด บริสุทธิ์ ไม่มีโฟลเดอร์กลางกำกวม (Zero Loose Components)

---

## 🗂️ High-Level Directory Tree (1:1 กับ Sidebar)

```text
src/app/admin/
├── AdminPortal.tsx                    ← 🏛️ [ROOT SHELL] ตัวคุมระบบและ Router สลับหน้า
├── AdminSidebar.tsx                   ← 🧭 [SIDEBAR] แถบเมนูด้านข้างสีน้ำเงิน (โลโก้ + เมนู + โปรไฟล์ + ออกจากระบบ)
├── AdminStatusBanner.tsx              ← 🏷️ [STATUS BANNER] แถบแจ้งเตือนสถานะการเปิด-ปิดคลินิกด้านบน
├── README.md                          ← 🗺️ แผนผังภาพรวมทั้งระบบของ Admin (ไฟล์นี้)
│
├── 👤 profile/                        ← 0. เมนู "ข้อมูลส่วนตัว" (คลิกการ์ดโปรไฟล์บน Sidebar)
│   ├── AdminProfileView.tsx           ← Single-File Architecture รวมการ์ดซ้าย-ขวาและป๊อปอัป จบใน ~160 บรรทัด
│   ├── README.md
│   └── index.ts
│
├── 🏠 dashboard/                      ← 1. เมนู "แดชบอร์ด" (ภาพรวมระบบ)
│   ├── AdminDashboardView.tsx         ← [หน้าร้าน] จัดวางหน้าปัด 4 แถว
│   ├── useDashboardData.ts            ← [ห้องครัว] Hook คิดเลข สถิติ กราฟ (วางคู่กับ View หาง่าย)
│   ├── README.md
│   ├── index.ts
│   └── components/                    ← เกจวัด 7 ชิ้นส่วน (Header, Cards, Charts, Ratios, Drawer)
│
├── 📅 schedule/                       ← 2. เมนู "ตารางเวรและการลา"
│   ├── ScheduleManagementView.tsx     ← [คุมตารางเวร] จัดวาง 4 โซนสายตา
│   ├── README.md
│   ├── index.ts
│   └── components/                    ← 6 ชิ้นส่วน UI หลัก (Header, Weekly, Actual, Leaves, 2 Modals)
│
├── 📋 clinicManage/                   ← 3. เมนู "จัดการคลินิก" (ClinicManagementView Router + 3 หมวดหมู่แบนราบ)
│   ├── ClinicManagementView.tsx       ← หน้าแสดงการ์ดเลือก 3 หมวดหมู่ (บริการ, เวลา/วันหยุด, ยาและสินค้า)
│   ├── constants.ts
│   ├── README.md
│   ├── index.ts
│   ├── services/                      ← 🦷 จัดการบริการทันตกรรม (ServiceManagement + Header + AddCard + List)
│   ├── settings/                      ← ⏰ ตั้งค่าเวลาเปิด-ปิดและวันหยุดคลินิก (ClinicSettings + Cards + Modal)
│   └── products/                      ← 💊 จัดการสินค้าและยา (ProductManagement + Header + AddForm + Table)
│
└── 👥 userManage/                     ← 4. เมนู "จัดการผู้ใช้งาน" (UserManagementView Router + 4 บทบาท)
    ├── UserManagementView.tsx         ← หน้าแสดงการ์ดเลือก 4 หมวดหมู่ผู้ใช้
    ├── README.md
    ├── index.ts
    ├── admins/                        ← 🛡️ จัดการผู้ดูแลระบบ (AdminManagement + Header + Table + Modal)
    ├── dentists/                      ← 👨‍⚕️ จัดการทันตแพทย์ (DentistManagement + Header + Grid + Modal)
    ├── staff/                         ← 👥 จัดการพนักงาน (StaffManagement + Header + Table + Modal)
    └── patients/                      ← 🏥 จัดการคนไข้ (PatientManagement + Header + Table + Modal)
```

---

## 🎯 Quick Navigation Guide (Sidebar Menu → โฟลเดอร์ที่รับผิดชอบ)

| เมนูบน Sidebar | โฟลเดอร์ที่รับผิดชอบ | รายละเอียดภายใน |
| :--- | :--- | :--- |
| **🧭 แถบด้านข้างสีน้ำเงินทั้งหมด** | [`AdminSidebar.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/AdminSidebar.tsx) | โลโก้, ปุ่มเมนูหลัก 4 เมนู, การ์ดโปรไฟล์, และปุ่มออกจากระบบ |
| **🏷️ แถบสถานะคลินิกด้านบน** | [`AdminStatusBanner.tsx`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/AdminStatusBanner.tsx) | แสดงสถานะเปิด/ปิดคลินิก และวันที่ปัจจุบันภาษาไทย |
| **👤 ข้อมูลส่วนตัว (บนสุด Sidebar)** | [`profile/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/profile/AdminProfileView.tsx) | หน้าโปรไฟล์เดี่ยว รวมรูป ข้อมูลส่วนตัว ข้อมูลการจ้างงาน และปุ่มเปลี่ยนรหัส |
| **🏠 แดชบอร์ด** | [`dashboard/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/dashboard/AdminDashboardView.tsx) | ภาพรวมสถิติ กราฟนัดหมาย และ Drawer รายการนัดหมายวันนี้ |
| **📅 ตารางเวรและการลา** | [`schedule/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/schedule/ScheduleManagementView.tsx) | Header, ตารางเวรสัปดาห์ (ซ้าย), ปฏิทินจริง (ขวา), และกล่องอนุมัติลา (ล่าง) |
| **📋 จัดการคลินิก** | [`clinicManage/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/clinicManage/ClinicManagementView.tsx) | หมวดบริการ, เวลาเปิด-ปิด/วันหยุด, และรายการสินค้า/ยา (มีปุ่มย้อนกลับในตัว) |
| **👥 จัดการผู้ใช้งาน** | [`userManage/`](file:///c:/Users/Lenovo/Documents/GitHub/icemu/src/app/admin/userManage/UserManagementView.tsx) | จัดการแอดมิน, หมอ, พนักงาน, คนไข้ (มีปุ่มย้อนกลับและ Modal ในตัว) |
