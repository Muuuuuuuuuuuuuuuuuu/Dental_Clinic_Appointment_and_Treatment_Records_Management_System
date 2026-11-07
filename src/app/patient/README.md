# Patient Portal Architecture (Positional Sections Pattern)

ระบบฝั่งคนไข้ (`src/app/patient`) ได้รับการปรับโครงสร้างใหม่ทั้งหมดตามมาตรฐาน **Positional Sections Pattern** เช่นเดียวกับฝั่ง Admin, Dentist และ Staff เพื่อความชัดเจน อ่านง่าย และแยกสัดส่วนการทำงานอย่างสมบูรณ์

---

## 🏗️ โครงสร้างภาพรวม (Overall Architecture)

```
src/app/patient/
├── dashboard/                 # แดชบอร์ดคนไข้ (นัดหมายถัดไป, ประวัติ, เวลาทำการคลินิก)
│   ├── hooks/usePatientDashboard.ts
│   ├── sections/Header/       # ส่วนทักทายคนไข้ และสถานะคลินิก
│   ├── sections/Content/      # การ์ดสรุปตัวเลข (MetricCards), นัดหมายถัดไป (Left), ข้อมูลคลินิก (Right)
│   ├── sections/Modals/       # หน้าต่าง Popup
│   └── index.tsx              # Layout Root
│
├── booking/                   # ระบบจองนัดหมายทันตกรรมแบบ 4 ขั้นตอน (Step 1-4)
│   ├── data/serviceDetailsData.ts
│   ├── hooks/usePatientBooking.ts
│   ├── sections/Header/       # แถบหัวข้อ และ StepIndicator (1.บริการ 2.รายละเอียด 3.สุขภาพ 4.ยืนยัน)
│   ├── sections/Content/      # ตารางบริการ, คอลัมน์ซ้าย (ข้อมูลบริการ) / ขวา (เลือกหมอ ปฏิทิน เวลา), คัดกรองสุขภาพ, สรุป
│   ├── sections/Modals/
│   └── index.tsx
│
├── appointments/              # รายการนัดหมายปัจจุบันของคนไข้
│   ├── hooks/usePatientAppointments.ts
│   ├── sections/Header/       # หัวข้อหน้านัดหมาย และปุ่มจองเพิ่ม
│   ├── sections/Content/      # การ์ดนัดหมายพร้อมกฎยกเลิก 12 ชม. ล่วงหน้า
│   ├── sections/Modals/
│   └── index.tsx
│
├── history/                   # ประวัติการรักษาและใบเสร็จ
│   ├── hooks/usePatientHistory.ts
│   ├── sections/Header/       # หัวข้อประวัติ และสรุปยอดค่าใช้จ่ายสะสม
│   ├── sections/Content/      # รายการการรักษาแต่ละครั้ง
│   ├── sections/Modals/       # Popup แท็บคำแนะนำแพทย์ + ใบเสร็จรับเงินอิเล็กทรอนิกส์
│   └── index.tsx
│
├── record/                    # เวชระเบียนทันตกรรมและแผนผังฟัน
│   ├── hooks/useDentalRecord.ts
│   ├── sections/Header/       # ปุ่มย้อนกลับ, หัวข้อ, เวลาอัปเดตล่าสุด
│   ├── sections/Content/      # แผนผังฟัน 32 ซี่ + ฟันเกิน (OdontogramView), คำแนะนำแพทย์, ไทม์ไลน์ย้อนดูประวัติฟัน
│   ├── sections/Modals/       # Popup รายละเอียดฟันรายซี่ (ToothDetailModal)
│   └── index.tsx
│
├── profile/                   # ข้อมูลส่วนตัวและความปลอดภัย
│   ├── hooks/usePatientProfile.ts
│   ├── sections/Header/       # หัวข้อหน้าโปรไฟล์ และการ์ดแจ้งเตือนบันทึกข้อมูล
│   ├── sections/Content/      # LeftProfileCard (รูป/เพศ/อายุ) + RightInfoCards (ข้อมูลระบุตัวตน/ที่อยู่/รหัสผ่าน)
│   ├── sections/Modals/
│   └── index.tsx
│
├── layout/                    # โครงสร้าง Layout รวมแถบเมนู (Sidebar/Header)
├── landing/                   # หน้าแรก Landing Page ก่อนเข้าสู่ระบบ
├── auth/                      # หน้าเข้าสู่ระบบ สมัครสมาชิก ลืมรหัสผ่าน
└── PatientPortal.tsx          # ตัวควบคุมการสลับ View ทั้งหมดของคนไข้
```

---

## 🎯 กฎและมาตรฐานการพัฒนา (Design Principles)
1. **Positional Sections**: โฟลเดอร์ในแต่ละโมดูลจะแบ่งตามตำแหน่งบนหน้าจอเสมอ ได้แก่ `Header/`, `Content/`, `Modals/` และหากเป็นคอลัมน์ซ้ายขวาจะตั้งชื่อชัดเจน เช่น `LeftProfileCard/`, `RightInfoCards/`, `ScheduleStep/`
2. **Short Layout Root**: ไฟล์ `index.tsx` ในแต่ละโมดูลจะมีขนาดสั้น (~40 - 80 บรรทัด) เพื่อทำหน้าที่เป็น Orchestrator ประกอบ Hook และ Section เข้าด้วยกัน
3. **Logic Isolation**: นำ State, API Supabase, และ Logic การคำนวณทั้งหมดแยกไปไว้ใน `hooks/use[Module].ts`
4. **Backward Compatibility**: มีไฟล์ Re-export ชื่อนามสกุลเดิม (`BookingView.tsx`, `DashboardView.tsx`, `ProfileView.tsx`, etc.) เสมอ เพื่อไม่ให้โค้ดส่วนอื่นหรือ Router พัง

