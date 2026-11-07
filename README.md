# Supat Clinic (คลินิกทันตกรรมสุภัทร)

ระบบจัดการคลินิกทันตกรรมครบวงจร (Dental Clinic Management System) รองรับการทำงานของผู้ใช้งาน 4 กลุ่ม (Patient, Dentist, Staff, Admin) แบบ Real-time

## ฟังก์ชันการทำงานหลัก (Core Features)

- **ผู้ป่วย (Patient):** ดูบริการคลินิก, ข้อมูลแพทย์, จองคิวนัดหมายออนไลน์, ทำแบบคัดกรองสุขภาพ, ดูประวัติการรักษา
- **ทันตแพทย์ (Dentist):** ดูคิวตรวจประจำวัน, บันทึกการรักษาพร้อมผังฟัน (Odontogram), สั่งจ่ายยาและเวชภัณฑ์
- **เจ้าหน้าที่หน้าร้าน (Staff):** ระบบเช็คอินคนไข้, จัดการคิวงานรายวัน (Kanban Board), ออกใบเสร็จและชำระเงิน, ลงทะเบียนคนไข้ใหม่/Walk-in
- **ผู้ดูแลระบบ (Admin):** ภาพรวมสถิติคลินิก (Dashboard), จัดการตารางแพทย์และวันลา, ตั้งค่าเวลาเปิด-ปิดและวันหยุดพิเศษ

## เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS
- **UI Components:** Lucide Icons, Radix UI, Recharts
- **Database & Backend:** Supabase (PostgreSQL, Realtime, Auth, Storage)

## โครงสร้างไฟล์นอกสุด (Root Configuration Files)

ไฟล์ชั้นนอกสุดทั้งหมด 12 ไฟล์ มีหน้าที่และความสำคัญดังนี้:

1. **`index.html`** : หน้าเว็บโครงสร้างหลัก (Single Page Application) สำหรับให้ React เข้ามา Render หน้าจอ
2. **`package.json`** : ทะเบียนรายชื่อ Dependencies, ข้อมูลโปรเจกต์ และคำสั่งรันระบบ (`npm run dev`, `npm run build`)
3. **`package-lock.json`** : ไฟล์ล็อกเวอร์ชันที่แน่นอนของทุกแพ็กเกจ (สร้างโดยอัตโนมัติ ห้ามแก้ไขด้วยมือ)
4. **`vite.config.ts`** : ตั้งค่าการทำงานของ Vite Bundler, React Plugin และ Path Alias (`@/`)
5. **`tsconfig.json`** : ตั้งค่า Compiler ของภาษา TypeScript ให้ตรวจสอบโค้ดและแปลงประเภทข้อมูล
6. **`postcss.config.mjs`** : ตั้งค่า PostCSS สำหรับการประมวลผล Tailwind CSS
7. **`vercel.json`** : ตั้งค่า Single Page Application (SPA) Rewrite ให้กับ Vercel เมื่อนำเว็บขึ้นโฮสติ้ง
8. **`.env.local`** : เก็บตัวแปรแวดล้อมเฉพาะเครื่อง เช่น URL และ API Key ของ Supabase (ห้ามอัปโหลดขึ้น GitHub)
9. **`.gitignore`** : กำหนดรายชื่อโฟลเดอร์/ไฟล์ที่ไม่ต้องนำขึ้น GitHub (เช่น `node_modules`, `.env.local`)
10. **`.gitattributes`** : ควบคุมรูปแบบการขึ้นบรรทัดใหม่ (Line Ending: LF) ให้เป็นมาตรฐานเดียวกันข้าม OS
11. **`.npmrc`** : ตั้งค่าคำสั่งของ npm (`legacy-peer-deps=true`) เพื่อป้องกันปัญหาเวอร์ชันขัดแย้งขณะติดตั้ง
12. **`README.md`** : เอกสารคู่มือและรายละเอียดของโปรเจกต์ที่แสดงผลบนหน้าแรกของ GitHub

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
