# Supat Clinic (คลินิกทันตกรรมสุภัทร)

ระบบจัดการคลินิกทันตกรรมครบวงจร (Dental Clinic Management System) รองรับการทำงานของผู้ใช้งาน 4 กลุ่ม (Patient, Dentist, Staff, Admin) แบบ Real-time



แผนผังโครงสร้างโค้ดและตำแหน่งไฟล์ (Project Directory Map)
> **สำหรับทีมพัฒนาและคู่มือการแก้ไขโค้ด:** หากต้องการแก้ไขหน้าจอ ฟังก์ชัน หรือตรรกะใด ให้เปิดไฟล์ตามพิกัดด้านล่างนี้ได้ทันที

### 1. ฝั่งพนักงานต้อนรับ (Staff Portal) -> `src/app/staff/`
* **แถบเมนูด้านข้าง (Sidebar):** `src/app/staff/layout/StaffSidebar.tsx`
* **คิวงาน (Queue Kanban Board):** `src/app/staff/queue/StaffQueueView.tsx` *(เช็คอินคนไข้)*
* **จัดการนัดหมาย (Appointments):** `src/app/staff/appointments/StaffAppointmentsView.tsx` *(ย้ายเคส / เลื่อนนัด / ยกเลิก)*
* **จัดการคนไข้ (Patients):** `src/app/staff/patients/StaffPatientsView.tsx`
  *ค้นหาประวัติคนไข้:* `src/app/staff/patients/components/PatientSearchTab.tsx`
  *ลงทะเบียนคนไข้ใหม่ + ส่ง OTP:* `src/app/staff/patients/components/PatientRegister/`
* **จองคิว Walk-in:** `src/app/staff/booking/StaffWalkInBookingView.tsx`
* **รับชำระเงิน (Billing & Payment):** `src/app/staff/payment/StaffPaymentView.tsx` *(คิดเงิน / พิมพ์ใบเสร็จ / ปุ่มนัดครั้งถัดไป)*
* **ปฏิทินและการลางาน (Leave):** `src/app/staff/leave/StaffLeaveView.tsx`
* **ข้อมูลส่วนตัวพนักงาน (Profile):** `src/app/staff/profile/StaffProfileView.tsx`

---

###  2. ฝั่งทันตแพทย์ (Dentist Portal) -> `src/app/dentist/`
* **แถบเมนูด้านข้าง (Sidebar):** `src/app/dentist/layout/DentistSidebar.tsx`
* **แดชบอร์ดหมอ (Dashboard):** `src/app/dentist/dashboard/DentistDashboardView.tsx`
* **คิวการรักษา (Active Treatment & ห้องตรวจ):** `src/app/dentist/treatment/TreatmentQueue.tsx`
  *ผังฟัน SVG (Odontogram):* `src/app/dentist/treatment/Odontogram.tsx`
  *สั่งจ่ายยาและเวชภัณฑ์:* `src/app/dentist/treatment/components/MedicineModal.tsx`
* **เวชระเบียนคนไข้ (Patient Records Directory):** `src/app/dentist/patients/DentistPatientsView.tsx` *(ค้นหาดูประวัติคนไข้ทั้งคลินิก)*
* **ประวัติการทำงานหมอ (History):** `src/app/dentist/treatment/TreatmentHistory.tsx`
* **ปฏิทินตารางเวรและการลางาน:** `src/app/dentist/schedule/DentistScheduleView.tsx`
* **ข้อมูลส่วนตัวหมอ (Profile):** `src/app/dentist/profile/DentistProfileView.tsx`

---

### 3. ฝั่งคนไข้ (Patient Portal) -> `src/app/patient/`
* **แถบเมนูด้านข้าง (Sidebar):** `src/app/patient/layout/PortalLayout.tsx`
* **แดชบอร์ดคนไข้ (Dashboard):** `src/app/patient/dashboard/PatientDashboardView.tsx`
* **จองคิวนัดหมาย (Booking Wizard 4 ขั้นตอน):** `src/app/patient/booking/PatientBookingView.tsx`
* **รายการนัดหมายของฉัน (Appointments):** `src/app/patient/appointments/PatientAppointmentsView.tsx` *(กดยกเลิกนัด >= 12 ชม.)*
* **ประวัติการรักษา (Treatment History):** `src/app/patient/history/PatientHistoryView.tsx`
* **สุขภาพฟันของฉัน (Odontogram View):** `src/app/patient/record/PatientDentalRecordView.tsx`
* **ข้อมูลส่วนตัวคนไข้ (Profile):** `src/app/patient/profile/PatientProfileView.tsx`

---

### 4. ฝั่งผู้ดูแลระบบ (Admin Portal) -> `src/app/admin/`
* **แถบเมนูด้านข้าง (Sidebar):** `src/app/admin/AdminSidebar.tsx`
* **แถบแจ้งสถานะคลินิก (Status Banner):** `src/app/admin/AdminStatusBanner.tsx`
* **แดชบอร์ดสถิติผู้บริหาร (Analytics):** `src/app/admin/dashboard/AdminDashboardView.tsx`
* **ตารางเวรและการลา (Schedule & Leave):** `src/app/admin/schedule/ScheduleManagementView.tsx` *(จัดเวร / อนุมัติการลา)*
* **จัดการคลินิก (Clinic Settings):** `src/app/admin/clinicManage/ClinicManagementView.tsx`
  *จัดการบริการทันตกรรม:* `src/app/admin/clinicManage/services/`
  *เวลาเปิด-ปิดและวันหยุดคลินิก:* `src/app/admin/clinicManage/settings/`
 *จัดการยาและสินค้า:* `src/app/admin/clinicManage/products/`
* **จัดการผู้ใช้งาน (User Management):** `src/app/admin/userManage/UserManagementView.tsx` *(โฟลเดอร์แยก 4 บทบาท: `admins/`, `dentists/`, `staff/`, `patients/`)*
* **ข้อมูลส่วนตัวแอดมิน (Profile):** `src/app/admin/profile/AdminProfileView.tsx`

---

### 5. ส่วนกลางที่ใช้ร่วมกัน (Shared Services) -> `src/app/shared/`
* **จุดรวมการเชื่อมต่อฐานข้อมูล Supabase API:** `src/app/shared/api/`
  * `appointmentApi.ts` -> จัดการนัดหมายและสล็อตเวลาว่าง
  * `treatmentApi.ts` -> จัดการประวัติการรักษาและผังฟัน
  * `dentistApi.ts` -> ข้อมูลทันตแพทย์และความเชี่ยวชาญ
  * `usersApi.ts` -> ข้อมูลผู้ใช้งานและโปรไฟล์
  * `clinicApi.ts` -> บริการ วันหยุด และเวลาทำการ
  * `authApi.ts` -> ระบบยืนยันตัวตนและการเข้าสู่ระบบ
* **โมดอลและวิดเจ็ตส่วนกลาง (Shared Components):**
  * `ChangePasswordModal.tsx` -> เปลี่ยนรหัสผ่าน
  * `ChangeEmailModal.tsx` -> เปลี่ยนอีเมล
  * `TimeSimulationWidget.tsx` -> ตัวจำลองเวลาสำหรับทดสอบระบบ (Demo Widget)
* **โครงสร้างชนิดข้อมูลกลาง (Data Types):** `src/app/shared/data.ts`

---

## ฟังก์ชันการทำงานหลัก (Core Features)

- **ผู้ป่วย (Patient):** ดูบริการคลินิก, ข้อมูลแพทย์, จองคิวนัดหมายออนไลน์, ทำแบบคัดกรองสุขภาพ, ดูประวัติการรักษาและผังฟัน
- **ทันตแพทย์ (Dentist):** ดูคิวตรวจประจำวัน, บันทึกการรักษาพร้อมผังฟัน (Odontogram), สั่งจ่ายยาและเวชภัณฑ์, ดูสารบัญเวชระเบียน
- **เจ้าหน้าที่หน้าร้าน (Staff):** ระบบเช็คอินคนไข้, จัดการคิวงานรายวัน (Kanban Board), ออกใบเสร็จและชำระเงิน, ลงทะเบียนคนไข้ใหม่พร้อม OTP, จองคิว Walk-in
- **ผู้ดูแลระบบ (Admin):** ภาพรวมสถิติคลินิก (Dashboard), จัดการตารางแพทย์และวันลา, ตั้งค่าเวลาเปิด-ปิดและวันหยุดพิเศษ, จัดการบัญชีผู้ใช้

---

## เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS
- **UI Components:** Lucide Icons, Radix UI, Recharts
- **Database & Backend:** Supabase (PostgreSQL, Realtime, Auth, Storage)

---

## โครงสร้างไฟล์นอกสุด (Root Configuration Files)

1. **`index.html`** : หน้าเว็บโครงสร้างหลัก (Single Page Application) สำหรับให้ React เข้ามา Render หน้าจอ
2. **`package.json`** : ทะเบียนรายชื่อ Dependencies, ข้อมูลโปรเจกต์ และคำสั่งรันระบบ (`npm run dev`, `npm run build`)
3. **`package-lock.json`** : ไฟล์ล็อกเวอร์ชันที่แน่นอนของทุกแพ็กเกจ
4. **`vite.config.ts`** : ตั้งค่าการทำงานของ Vite Bundler, React Plugin และ Path Alias (`@/`)
5. **`tsconfig.json`** : ตั้งค่า Compiler ของภาษา TypeScript ให้ตรวจสอบโค้ดและแปลงประเภทข้อมูล
6. **`postcss.config.mjs`** : ตั้งค่า PostCSS สำหรับการประมวลผล Tailwind CSS
7. **`vercel.json`** : ตั้งค่า Single Page Application (SPA) Rewrite ให้กับ Vercel เมื่อนำเว็บขึ้นโฮสติ้ง
8. **`.env.local`** : เก็บตัวแปรแวดล้อมเฉพาะเครื่อง เช่น URL และ API Key ของ Supabase (ห้ามอัปโหลดขึ้น GitHub)
9. **`.gitignore`** : กำหนดรายชื่อโฟลเดอร์/ไฟล์ที่ไม่ต้องนำขึ้น GitHub (เช่น `node_modules`, `.env.local`)
10. **`.gitattributes`** : ควบคุมรูปแบบการขึ้นบรรทัดใหม่ (Line Ending: LF) ให้เป็นมาตรฐานเดียวกันข้าม OS
11. **`.npmrc`** : ตั้งค่าคำสั่งของ npm (`legacy-peer-deps=true`) เพื่อป้องกันปัญหาเวอร์ชันขัดแย้งขณะติดตั้ง
12. **`README.md`** : เอกสารคู่มือและรายละเอียดของโปรเจกต์ที่แสดงผลบนหน้าแรกของ GitHub

---

## การติดตั้งและเริ่มใช้งาน (Getting Started)

1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

2. รันระบบสำหรับ Development:
   ```bash
   npm run dev
   ```

3. สร้าง Production Bundle:
   ```bash
   npm run build
   ```
