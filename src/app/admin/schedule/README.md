# 📁 Schedule & Leave Module — Architecture & Project Structure

> โมดูลจัดการตารางเวรและการลา
> ใช้สถาปัตยกรรมระดับมาตรฐาน **Header / Content / Footer / Modals** เพื่อให้เห็นการจัดวางตามตำแหน่งบนหน้าจอจริงแบบ 1:1

---

## 🗂️ Directory Tree

```text
src/app/admin/schedule/
├── README.md                                  ← 🗺️ แผนผังโครงสร้างของโมดูลตารางเวร (ไฟล์นี้)
├── index.tsx                                  ← 🏢 [LAYOUT ROOT] ตัวคุม State และ Layout 4 ส่วนหลัก จบในตัว
│
└── sections/                                  ← 📦 กล่องระดับบนสุดจัดตามตำแหน่งบนหน้าจอ
    │
    ├── Header/                                ← 🔝 1. [HEADER SECTION] ส่วนหัวด้านบน
    │   ├── index.tsx                          ← Layout แถบบน (ชื่อหน้าซ้าย + เครื่องมือขวา)
    │   └── components/
    │       ├── TitleBar.tsx                   ← ชื่อหน้า "ตารางเวรและการลา" + คำอธิบาย
    │       ├── SearchBar.tsx                  ← ช่องค้นหาชื่อบุคลากร
    │       ├── RoleFilterTabs.tsx             ← ปุ่มสลับ [ทั้งหมด | ทันตแพทย์ | พนักงาน]
    │       └── HeaderActions.tsx              ← ปุ่มทางลัด [รออนุมัติลา | ตั้งค่าคลินิก | บันทึก]
    │
    ├── Content/                               ← 🔲 2. [CONTENT SECTION] ส่วนเนื้อหาตรงกลาง (Grid 2 คอลัมน์)
    │   ├── index.tsx                          ← Layout คุมการแบ่ง 2 คอลัมน์ (ซ้าย - ขวา)
    │   └── components/
    │       ├── LeftWeeklyTemplate/            ← 👈 ฝั่งซ้าย: ตารางเวรประจำสัปดาห์
    │       │   ├── index.tsx                  ← Layout กล่องฝั่งซ้าย
    │       │   └── components/
    │       │       ├── TemplateHeader.tsx     ← หัวข้อตารางเวร + คำแนะนำ + ปุ่มย่อขยาย
    │       │       └── TemplateTable.tsx      ← ตารางเวร 7 วัน (จ.-ส. + กะเวลา)
    │       │
    │       └── RightActualCalendar/           ← 👉 ฝั่งขวา: ปฏิทินปฏิบัติงานจริง
    │           ├── index.tsx                  ← Layout กล่องฝั่งขวา
    │           └── components/
    │               ├── CalendarHeader.tsx     ← หัวข้อปฏิทิน + ปุ่มเลื่อนเดือน [< พ.ย. 2569 >]
    │               └── CalendarGrid.tsx       ← ตารางปฏิทินรายเดือน (วันที่ 1-30 + คนเข้าเวร)
    │
    ├── Footer/                                ← 📋 3. [FOOTER SECTION] ส่วนล่างของหน้าจอ
    │   ├── index.tsx                          ← Layout กล่องคำขออนุมัติการลา (Leave Approvals)
    │   └── components/
    │       ├── ApprovalHeader.tsx             ← หัวข้อ + Badge รออนุมัติ + ปุ่มย่อขยาย
    │       ├── PendingLeavesList.tsx          ← รายการรออนุมัติ พร้อมปุ่ม [อนุมัติ] / [ไม่อนุมัติ]
    │       └── HistoryLeavesList.tsx          ← ประวัติการอนุมัติการลา
    │
    └── Modals/                                ← 🪟 4. [MODALS SECTION] หน้าต่างลอย
        ├── index.tsx                          ← Controller คุมเปิด/ปิด Popups
        └── components/
            ├── DayDetailModal.tsx             ← ป๊อปอัปดูคนเข้าเวรประจำวันที่คลิก
            └── EditShiftModal.tsx             ← ป๊อปอัปแก้ไขเวลากะ / สลับเป็นวันหยุด
```

---

## 🖥️ Layout Mapping บนหน้าจอจริง

```text
+-----------------------------------------------------------------------------------------+
| 🔝 1. HeaderSection (sections/Header/)                                                  |
| [ตารางเวรและการลา]                       [ค้นหา...] [ทั้งหมด|หมอ|พนักงาน] [รออนุมัติ] [บันทึก] |
+-----------------------------------------------------------------------------------------+
| 🔲 2. ContentSection (sections/Content/)                                                |
|                                            |                                            |
| 👈 LeftWeeklyTemplate                      | 👉 RightActualCalendar                     |
| (sections/Content/components/Left...)      | (sections/Content/components/Right...)     |
| ตารางเวร 7 วัน (วันจันทร์ - เสาร์)               | ปฏิทินปฏิบัติงานจริงประจำเดือน (วันที่ 1 - 30)  |
+-----------------------------------------------------------------------------------------+
| 📋 3. FooterSection (sections/Footer/)                                                  |
| คำขออนุมัติการลา (Leave Approvals): [รออนุมัติ | ประวัติ] พร้อมปุ่มอนุมัติ/ไม่อนุมัติ              |
+-----------------------------------------------------------------------------------------+
| 🪟 4. ModalsSection (sections/Modals/)                                                  |
| DayDetailModal (ดูคนเข้าเวรรายวัน) / EditShiftModal (แก้เวลากะ)                           |
+-----------------------------------------------------------------------------------------+
```

---

## 🎯 Quick Edit Guide (อยากแก้ไขจุดไหน ไปที่ไฟล์ไหน?)

| สิ่งที่ต้องการแก้ไข | ไฟล์ที่ต้องแก้ |
| :--- | :--- |
| **โครงสร้างภาพรวมทั้งหน้า (จัดระยะห่าง 4 ท่อน บน/กลาง/ล่าง/ป๊อปอัป)** | `ScheduleManagement.tsx` |
| **แถบควบคุมด้านบน (ค้นหา, สลับบทบาท, ปุ่มบันทึก)** | `sections/Header/index.tsx` |
| **โครงสร้างเนื้อหาตรงกลาง (ปรับสัดส่วน ซ้าย-ขวา)** | `sections/Content/index.tsx` |
| └─ ตารางเวรประจำสัปดาห์ 7 วัน (ฝั่งซ้าย) | `sections/Content/components/LeftWeeklyTemplate/index.tsx` |
| └─ ปฏิทินปฏิบัติงานจริง (ฝั่งขวา) | `sections/Content/components/RightActualCalendar/index.tsx` |
| **ส่วนล่าง: คำขออนุมัติการลา (การ์ดขอลา, ปุ่มอนุมัติ)** | `sections/Footer/index.tsx` |
| **หน้าต่างป๊อปอัป (ดูคนเข้าเวรรายวัน, แก้ไขเวลากะ)** | `sections/Modals/index.tsx` |
