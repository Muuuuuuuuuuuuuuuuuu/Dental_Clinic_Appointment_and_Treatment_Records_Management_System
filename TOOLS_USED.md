# 📋 รายงานเครื่องมือและเทคโนโลยีที่ใช้ในโปรเจกต์

**ชื่อโปรเจกต์:** ระบบเว็บไซต์คลินิกทันตกรรม (Dental Clinic Website)  
**ชื่อคลินิก:** คลินิกสุภัทร (Suphat Clinic)  
**วันที่จัดทำ:** 5 สิงหาคม 2026

---

## 1. ภาษาโปรแกรมและ Framework หลัก

| เครื่องมือ | เวอร์ชัน | หน้าที่ |
|---|---|---|
| **TypeScript** | 7.0 | ภาษาหลักที่ใช้เขียนโค้ด เป็น JavaScript ที่มีระบบตรวจสอบชนิดข้อมูล (Type Safety) |
| **React** | 18.3.1 | ไลบรารีสำหรับสร้างหน้าจอ UI (User Interface) พัฒนาโดย Meta (Facebook) |
| **React DOM** | 18.3.1 | ส่วนเชื่อมต่อ React เข้ากับเว็บเบราว์เซอร์ |
| **Vite** | 6.4.3 | เครื่องมือ Build และ Dev Server ความเร็วสูง สำหรับรันโปรเจกต์ขณะพัฒนา |

---

## 2. การจัดการหน้าตาเว็บไซต์ (Styling & CSS)

| เครื่องมือ | เวอร์ชัน | หน้าที่ |
|---|---|---|
| **Tailwind CSS** | 4.1.12 | CSS Framework แบบ Utility-first ช่วยตกแต่งหน้าเว็บด้วย class สำเร็จรูป |
| **tw-animate-css** | 1.3.8 | เพิ่ม Animation (เอฟเฟกต์เคลื่อนไหว) ให้กับ Tailwind CSS |
| **PostCSS** | (ผ่าน Vite) | ตัวประมวลผล CSS อัตโนมัติ |

### ฟอนต์ที่ใช้ (จาก Google Fonts)

| ฟอนต์ | ลักษณะการใช้งาน |
|---|---|
| **Playfair Display** | ฟอนต์หัวข้อภาษาอังกฤษ (แบบ Serif สวยหรู) |
| **Prompt** | ฟอนต์ภาษาไทย (อ่านง่าย รองรับอักษรไทยครบ) |
| **DM Sans** | ฟอนต์เนื้อหาภาษาอังกฤษ (แบบ Sans-serif ทันสมัย) |

---

## 3. ชุด UI Component (ส่วนประกอบหน้าจอ)

### 3.1 shadcn/ui

| รายการ | รายละเอียด |
|---|---|
| **คำอธิบาย** | ชุดส่วนประกอบหน้าจอสำเร็จรูป เช่น ปุ่ม, ตาราง, ฟอร์ม, Dialog ฯลฯ |
| **ผู้พัฒนา** | shadcn (Shadid Haque) |
| **GitHub** | https://github.com/shadcn-ui/ui |
| **License** | MIT |
| **จำนวนที่ใช้** | 48 component ได้แก่ accordion, alert, avatar, badge, button, calendar, card, carousel, chart, checkbox, dialog, drawer, dropdown-menu, form, input, label, navigation-menu, pagination, popover, progress, radio-group, select, separator, sheet, sidebar, skeleton, slider, switch, table, tabs, textarea, toggle, tooltip เป็นต้น |

### 3.2 Radix UI

| รายการ | รายละเอียด |
|---|---|
| **คำอธิบาย** | ชุด Headless UI ที่ shadcn/ui สร้างทับอีกที ทำหน้าที่จัดการ logic เช่น การเปิด-ปิด popup, การเลือกรายการ |
| **ผู้พัฒนา** | WorkOS (Radix team) |
| **GitHub** | https://github.com/radix-ui/primitives |
| **License** | MIT |
| **จำนวนที่ใช้** | 26 packages |

---

## 4. ไลบรารีเสริม (Utility Libraries)

| เครื่องมือ | หน้าที่ |
|---|---|
| **react-router** (v8.3) | ระบบเส้นทาง URL / เปลี่ยนหน้าจอ (Navigation) |
| **react-hook-form** (v7.55) | จัดการฟอร์มกรอกข้อมูล |
| **react-day-picker** (v8.10) | ปฏิทินสำหรับเลือกวันที่ |
| **date-fns** (v3.6) | ไลบรารีจัดการและแปลงรูปแบบวันที่ |
| **recharts** (v2.15) | สร้างกราฟและแผนภูมิ (Chart) |
| **embla-carousel-react** (v8.6) | Carousel / Slider เลื่อนดูรูปภาพหรือเนื้อหา |
| **react-resizable-panels** (v2.1) | แบ่งพื้นที่หน้าจอแบบปรับขนาดได้ |
| **sonner** (v2.0) | แจ้งเตือนแบบ Toast (ข้อความป๊อปอัปมุมจอ) |
| **vaul** (v1.1) | Drawer (ลิ้นชักเลื่อนขึ้นจากด้านล่างจอ) |
| **input-otp** (v1.4) | ช่องกรอกรหัส OTP 6 หลัก |
| **cmdk** (v1.1) | Command Palette (ช่องค้นหาคำสั่งแบบ Spotlight) |
| **class-variance-authority** (v0.7) | จัดการ CSS class ให้มีหลาย variant (เช่น ปุ่มขนาดเล็ก/ใหญ่) |
| **clsx** (v2.1) | รวม CSS class แบบมีเงื่อนไข |
| **tailwind-merge** (v3.2) | ป้องกัน Tailwind class ซ้อนทับกัน |

---

## 5. ไลบรารีเฉพาะทาง (Domain-Specific)

### 5.1 🦷 react-odontogram (แผนผังฟัน)

| รายการ | รายละเอียด |
|---|---|
| **คำอธิบาย** | React component สำหรับแสดงแผนผังฟัน (Dental Chart / Odontogram) แบบ interactive วาดด้วย SVG รองรับทั้งฟันแท้และฟันน้ำนม |
| **เวอร์ชัน** | 0.5.6 |
| **ผู้พัฒนา** | Pratik Sharma (biomathcode) |
| **GitHub** | https://github.com/biomathcode/react-odontogram |
| **License** | MIT |
| **ใช้ในส่วน** | หน้าบันทึกการรักษาของทันตแพทย์ และหน้าดูประวัติทันตกรรมของผู้ป่วย |

### 5.2 ✏️ Lucide Icons (ชุดไอคอน)

| รายการ | รายละเอียด |
|---|---|
| **คำอธิบาย** | ชุดไอคอน SVG มากกว่า 1,000 ตัว ใช้แสดงสัญลักษณ์ต่างๆ บนหน้าจอ |
| **เวอร์ชัน** | 0.487.0 |
| **ผู้พัฒนา** | Lucide Contributors |
| **GitHub** | https://github.com/lucide-icons/lucide |
| **License** | ISC |

---

## 6. บริการภายนอก (External Services)

| บริการ | หน้าที่ | รายละเอียด |
|---|---|---|
| **Supabase** | ฐานข้อมูลและระบบยืนยันตัวตน | ใช้ PostgreSQL เป็นฐานข้อมูลหลัก พร้อมระบบ Authentication จัดการผู้ใช้งาน |
| **EmailJS** | ส่งอีเมล OTP | ส่งรหัส OTP ไปยังอีเมลผู้ป่วยสำหรับการรีเซ็ตรหัสผ่าน |
| **Google Fonts** | ฟอนต์ | ดึงฟอนต์ Playfair Display, Prompt, DM Sans มาแสดงผลบนเว็บ |

---

## 7. รูปภาพและกราฟฟิกจากภายนอก

### 7.1 Unsplash (รูปถ่ายสต็อก)

| ตำแหน่งที่ใช้ | คำอธิบายรูป |
|---|---|
| หน้าล็อกอิน + หน้าแรก | รูปทันตแพทย์กำลังทำงาน |
| หน้าติดต่อเรา (Contact) | รูปที่ตั้งคลินิก |
| หน้าทำไมต้องเลือกเรา (Why Us) | รูปบรรยากาศภายในคลินิก |
| รูป default ทันตแพทย์ | รูป fallback เมื่อไม่มีรูปจริงของทันตแพทย์ |

> **ที่มา:** https://unsplash.com — ใช้ได้ฟรีทั้งส่วนตัวและเชิงพาณิชย์

---

## 8. เครื่องมือออกแบบ

| เครื่องมือ | หน้าที่ |
|---|---|
| **Figma** | ออกแบบหน้าจอ UI/UX ของเว็บไซต์ |
| **Figma Make** | แปลงไฟล์ออกแบบจาก Figma เป็นโค้ด React อัตโนมัติ |

---

## 9. เครื่องมือพัฒนา (Dev Tools)

| เครื่องมือ | หน้าที่ |
|---|---|
| **@vitejs/plugin-react** | Vite plugin สำหรับ React |
| **@tailwindcss/vite** | เชื่อมต่อ Tailwind CSS กับ Vite |
| **@types/node** | Type definitions สำหรับ Node.js |
| **@types/react** | Type definitions สำหรับ React |
| **Git + GitHub** | ระบบควบคุมเวอร์ชันโค้ดและแชร์โค้ดร่วมกันในทีม |
| **npm** | ตัวจัดการ packages (ติดตั้งไลบรารี) |

---

## 10. สรุป License ทั้งหมดที่ใช้

| ประเภท License | ความหมาย | ใช้กับ |
|---|---|---|
| **MIT** | ใช้ได้เสรี ทั้งส่วนตัวและเชิงพาณิชย์ แค่เก็บข้อความ License ไว้ | React, shadcn/ui, Radix UI, react-odontogram, Supabase, Tailwind CSS และอื่นๆ ส่วนใหญ่ |
| **ISC** | คล้าย MIT ใช้ได้เสรี | Lucide Icons |
| **Apache-2.0** | ใช้ได้เสรี ต้องระบุการเปลี่ยนแปลงถ้ามี | TypeScript, class-variance-authority |
| **BSD-3-Clause** | ใช้ได้เสรี ห้ามใช้ชื่อผู้พัฒนาโปรโมทสินค้า | EmailJS |
| **OFL** | ใช้ฟอนต์ได้เสรี | Playfair Display, Prompt, DM Sans |

> ✅ **ทุก License ที่ใช้ในโปรเจกต์นี้อนุญาตให้ใช้งานเชิงพาณิชย์ได้อย่างเสรี**

---

## 11. การอ้างอิง (References)

> **react-odontogram**  
> Sharma, P. (2024). react-odontogram: Dental chart for selecting teeth [Computer software]. GitHub. https://github.com/biomathcode/react-odontogram

> **shadcn/ui**  
> Haque, S. (2024). shadcn/ui: Beautifully designed components built with Radix UI and Tailwind CSS [Computer software]. GitHub. https://github.com/shadcn-ui/ui

> **Radix UI**  
> WorkOS. (2024). Radix Primitives: Unstyled, accessible UI components [Computer software]. GitHub. https://github.com/radix-ui/primitives

> **Lucide Icons**  
> Lucide Contributors. (2024). Lucide: Beautiful & consistent icon set [Computer software]. GitHub. https://github.com/lucide-icons/lucide

> **React**  
> Meta Platforms, Inc. (2024). React: A JavaScript library for building user interfaces [Computer software]. GitHub. https://github.com/facebook/react

> **Vite**  
> Evan You. (2024). Vite: Next generation frontend tooling [Computer software]. GitHub. https://github.com/vitejs/vite

> **Tailwind CSS**  
> Tailwind Labs. (2024). Tailwind CSS: A utility-first CSS framework [Computer software]. GitHub. https://github.com/tailwindlabs/tailwindcss

> **Supabase**  
> Supabase, Inc. (2024). Supabase: The open source Firebase alternative [Computer software]. https://supabase.com

> **Unsplash**  
> Unsplash, Inc. (2024). Unsplash: Beautiful free images & pictures [Photographs]. https://unsplash.com
