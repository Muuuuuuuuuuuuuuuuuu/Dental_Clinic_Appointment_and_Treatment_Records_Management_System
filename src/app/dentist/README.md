# 🩺 Dentist Module — Architecture & Structure

> ศูนย์รวมฟังก์ชันการทำงานทั้งหมดของฝั่ง **ทันตแพทย์ (Dentist)**
> ออกแบบด้วยมาตรฐานโครงสร้างเดียวกับโมดูลผู้ดูแลระบบ (**`src/app/admin`**)
> ยึดหลัก **Single Responsibility Principle (SRP)** ทุกไฟล์สั้นกระชับ ค้นหาง่าย และแก้ไขได้อย่างปลอดภัย

---

## 🗂️ Overall Directory Tree

```text
src/app/dentist/
├── DentistPortal.tsx                                 ← 🚪 Main Shell (Sidebar, Idle timeout, State router)
├── README.md                                         ← 🗺️ แผนผังภาพรวมของระบบทันตแพทย์ (ไฟล์นี้)
│
├── dashboard/                                        ← 🏠 1. แดชบอร์ดภาพรวมทันตแพทย์
│   ├── index.tsx                                     ← [Layout Root]
│   ├── hooks/useDoctorDashboard.ts                   ← Hook ดึงคิวนัดหมาย คำนวณสถานะด่วน
│   ├── README.md
│   └── sections/
│       ├── Header/                                   ← ทักทายคุณหมอ + วันที่ + เวลาเปิดทำการ
│       └── Content/                                  ← การ์ด 4 ช่อง + คิววันนี้ + เวลาออกตรวจ
│
├── profile/                                          ← 👤 2. ข้อมูลส่วนตัวทันตแพทย์
│   ├── index.tsx                                     ← [Layout Root]
│   ├── README.md
│   └── sections/
│       ├── Header/                                   ← หัวข้อ "ข้อมูลส่วนตัว"
│       ├── Content/                                  ← ซ้าย (รูป+ใบอนุญาต) : ขวา (วิชาชีพ+บริการ+ติดต่อ)
│       └── Modals/                                   ← ChangePasswordModal (เปลี่ยนรหัสผ่าน)
│
├── schedule/                                         ← 📅 3. ปฏิทินและการลางาน
│   ├── index.tsx                                     ← [Layout Root]
│   ├── hooks/useDoctorCalendar.ts                    ← Hook ปฏิทินรายเดือนและคำขอลางาน
│   ├── README.md
│   └── sections/
│       ├── Header/                                   ← หัวข้อ "ปฏิทินและการลางาน"
│       ├── Content/                                  ← ตารางเวรสัปดาห์ + สรุปคำขอลา + ปฏิทินเดือนจริง
│       └── Modals/                                   ← LeaveRequestModal (ฟอร์มส่งใบลา)
│
├── patients/                                         ← 📁 4. เวชระเบียนคนไข้
│   ├── index.tsx                                     ← [Layout Root]
│   ├── README.md
│   └── sections/
│       ├── Header/                                   ← หัวข้อ + ช่องค้นหาคนไข้ตามชื่อหรือ HN
│       └── Content/                                  ← PatientCard Grid + Empty state
│
└── treatment/                                        ← 🦷 5. การรักษาและบันทึกฟัน (Odontogram)
    ├── TreatmentQueue.tsx                            ← คิวตรวจรักษาและบันทึกเคส
    ├── TreatmentHistory.tsx                          ← ประวัติการรักษาที่ทำเสร็จแล้ว
    ├── Odontogram.tsx                                ← ผังฟัน 32 ซี่แบบ Interactive SVG
    ├── ToothActionModal.tsx                          ← ป๊อปอัปเลือกหัตถการรายซี่
    └── ToothGeometry.ts                              ← พิกัดและรูปทรงเรขาคณิตของฟัน
```

---

## 🎯 มาตรฐานการแบ่งโฟลเดอร์ (Standard Architecture Pattern)

| โมดูล | Pattern ที่ใช้ | คำอธิบาย |
| :--- | :--- | :--- |
| **`dashboard`** | **`sections/`** | แบ่ง Header / Content แยก Hook คิวคนไข้ |
| **`profile`** | **`sections/`** | แบ่ง Header / Content (ซ้าย: รูป / ขวา: ข้อมูล) / Modals |
| **`schedule`** | **`sections/`** | แบ่ง Header / Content (ตารางเวร + ปฏิทิน) / Modals |
| **`patients`** | **`sections/`** | แบ่ง Header (ช่องค้นหา) / Content (การ์ดคนไข้) |
| **`treatment`** | **Interactive Odontogram** | ระบบผังฟันดิจิทัล 3D/SVG สำหรับบันทึกตำแหน่งหัตถการ |

