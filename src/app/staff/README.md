# 💼 Staff Module — Architecture & Structure

> ศูนย์รวมฟังก์ชันการทำงานทั้งหมดของฝั่ง **พนักงานเคาน์เตอร์ / ต้อนรับ (Staff)**
> ออกแบบด้วยมาตรฐานโครงสร้างเดียวกับโมดูลผู้ดูแลระบบ (**`src/app/admin`**) และทันตแพทย์ (**`src/app/dentist`**)
> ยึดหลัก **Single Responsibility Principle (SRP)** และ **Positional Sections Pattern**

---

## 🗂️ Overall Directory Tree

```text
src/app/staff/
├── StaffPortal.tsx                                   ← 🚪 Main Shell (Sidebar, Clock-in, State router)
├── README.md                                         ← 🗺️ แผนผังภาพรวมของระบบพนักงาน (ไฟล์นี้)
│
├── leave/                                            ← 📅 1. ปฏิทินและขอลางาน
│   ├── index.tsx                                     ← [Layout Root] (~55 บรรทัด)
│   ├── hooks/useStaffLeave.ts                        ← Hook กะเวรและคำขอลางาน
│   ├── README.md
│   └── sections/
│       ├── Header/                                   ← TitleBar ("ปฏิทินและการลางาน")
│       ├── Content/                                  ← RegularScheduleCard + LeaveSummaryCard + ActualCalendar
│       └── Modals/                                   ← LeaveRequestModal (ฟอร์มส่งใบลา)
│
├── queue/                                            ← 🚦 2. บอร์ดคิวงานและเรียกคิว
│   ├── index.tsx                                     ← [Layout Root] (~45 บรรทัด)
│   ├── hooks/useQueueData.ts                         ← Hook คิวงาน, กะเวรทันตแพทย์, Realtime Sync
│   ├── README.md
│   └── sections/
│       ├── Header/                                   ← TitleBar + ViewToggle (Daily/Weekly/Monthly)
│       └── Content/                                  ← StatCards, TodayKanbanBoard, AppointmentList, Daily/Weekly/Monthly Views
│
├── appointments/                                     ← 📋 3. การจัดการนัดหมาย
│   ├── index.tsx                                     ← [Layout Root] (~90 บรรทัด)
│   ├── AppointmentManagementView.tsx                 ← Re-export compatibility file
│   ├── hooks/useStaffAppointments.ts                 ← Hook คัดกรองเคสเสี่ยง, ย้ายแพทย์, เลื่อนนัด
│   ├── README.md
│   └── sections/
│       ├── Header/                                   ← TitleBar + SearchBar + TabsNav
│       ├── Content/                                  ← AppointmentCard + EmptyAppointmentState
│       └── Modals/                                   ← TransferModal + RescheduleModal
│
├── booking/                                          ← 🚶 4. จองคิว Walk-in หน้าเคาน์เตอร์
│   ├── index.tsx                                     ← [Layout Root] (~70 บรรทัด)
│   ├── hooks/useWalkInBooking.ts                     ← Hook ค้นหาคนไข้, ปฏิทิน, สล็อตเวลา, บันทึกนัด
│   ├── README.md
│   └── sections/
│       ├── Header/                                   ← TitleBar + StepIndicator (1, 2, 3)
│       └── Content/                                  ← PatientSearchStep, ServiceScheduleStep, BookingConfirmationStep, BookingSuccessState
│
├── payment/                                          ← 💳 5. การรับชำระเงินและออกใบเสร็จ
│   ├── index.tsx                                     ← [Layout Root] (~90 บรรทัด)
│   ├── hooks/usePaymentData.ts                       ← Hook คิดเงิน, หัตถการ, ยา/สินค้าเสริม, Realtime Sync
│   ├── README.md
│   └── sections/
│       ├── Content/                                  ← PaymentQueueList (ซ้าย) + PaymentBillingPanel (ขวา)
│       └── Modals/                                   ← ReceiptModal (ใบเสร็จ) + FollowUpModal (นัดต่อเนื่อง)
│
└── patients/                                         ← 👥 6. การจัดการคนไข้
    ├── index.tsx                                     ← [Layout Root] (~20 บรรทัด)
    ├── README.md
    └── sections/
        ├── Header/                                   ← TitleBar + TabsNav (ค้นหา / ลงทะเบียนใหม่)
        └── Content/                                  ← PatientSearchTab + PatientRegisterTab
```

---

## 🏛️ แนวทางการออกแบบ (Design Principles)

1. **Short Layout Root**: ไฟล์ `index.tsx` แต่ละโฟลเดอร์ทำหน้าที่เฉพาะการวางโครง Layout เชื่อมโยง Hook และ Sections เข้าด้วยกัน
2. **Logic Isolation (Hooks)**: แยก Business Logic, คำนวณวันเวลา, การเชื่อมต่อ Supabase API และ Realtime Subscription ไว้ในโฟลเดอร์ `hooks/`
3. **Sections Organization**: แบ่งโฟลเดอร์ตามแกนหน้าจอ `Header/`, `Content/`, `Modals/` เพื่อให้อ่านง่าย ค้นหาง่าย และสเกลโค้ดได้สะดวก
