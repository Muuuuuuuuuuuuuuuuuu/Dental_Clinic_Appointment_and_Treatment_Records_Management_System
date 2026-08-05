# 📋 รายงานเครื่องมือและเทคโนโลยีที่ใช้ในโปรเจกต์

**โปรเจกต์:** Dental Clinic Website Design (คลินิกสุภัทร / Suphat Clinic)  
**ที่มา:** Export จาก Figma Make → Code Bundle  
**Figma ต้นฉบับ:** https://www.figma.com/design/LXPHvNU9kTjoggUI1j9SM4/Dental-Clinic-Website-Design  
**วันที่ตรวจสอบ:** 5 สิงหาคม 2026  
**อัปเดตล่าสุด:** 5 สิงหาคม 2026

---

## 1. 🏗️ เทคโนโลยีหลัก (Core Stack)

| เครื่องมือ | เวอร์ชัน | หน้าที่ | สัญญาอนุญาต (License) |
|---|---|---|---|
| **React** | 18.3.1 | ไลบรารีหลักสำหรับสร้างหน้า UI | MIT |
| **React DOM** | 18.3.1 | เชื่อมต่อ React เข้ากับ Browser | MIT |
| **TypeScript** | ^7.0.2 | ภาษาเขียนโค้ดแบบมี Type Safety | Apache-2.0 |
| **Vite** | ^6.4.3 (override: 6.3.5) | Build tool & Dev server ความเร็วสูง | MIT |
| **Tailwind CSS** | 4.1.12 | Utility-first CSS framework | MIT |
| **PostCSS** | (ผ่าน Vite) | ประมวลผล CSS | MIT |

---

## 2. 🧩 UI Component Library

### 2.1 shadcn/ui (ชุด Component หลัก)
- **ที่มา:** https://ui.shadcn.com/
- **License:** MIT ✅
- **หมายเหตุ:** shadcn/ui ไม่ใช่ npm package — เป็นโค้ดที่ copy มาใส่ในโปรเจกต์โดยตรง อยู่ในโฟลเดอร์ `src/app/shared/components/ui/`
- **จำนวน Component ที่ใช้:** 48 ไฟล์ ได้แก่ accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle-group, toggle, tooltip, use-mobile, utils

### 2.2 Radix UI (Headless UI ที่ shadcn/ui สร้างทับ)

| Package | เวอร์ชัน | License |
|---|---|---|
| @radix-ui/react-accordion | 1.2.3 | MIT |
| @radix-ui/react-alert-dialog | 1.1.6 | MIT |
| @radix-ui/react-aspect-ratio | 1.1.2 | MIT |
| @radix-ui/react-avatar | 1.1.3 | MIT |
| @radix-ui/react-checkbox | 1.1.4 | MIT |
| @radix-ui/react-collapsible | 1.1.3 | MIT |
| @radix-ui/react-context-menu | 2.2.6 | MIT |
| @radix-ui/react-dialog | 1.1.6 | MIT |
| @radix-ui/react-dropdown-menu | 2.1.6 | MIT |
| @radix-ui/react-hover-card | 1.1.6 | MIT |
| @radix-ui/react-label | 2.1.2 | MIT |
| @radix-ui/react-menubar | 1.1.6 | MIT |
| @radix-ui/react-navigation-menu | 1.2.5 | MIT |
| @radix-ui/react-popover | 1.1.6 | MIT |
| @radix-ui/react-progress | 1.1.2 | MIT |
| @radix-ui/react-radio-group | 1.2.3 | MIT |
| @radix-ui/react-scroll-area | 1.2.3 | MIT |
| @radix-ui/react-select | 2.1.6 | MIT |
| @radix-ui/react-separator | 1.1.2 | MIT |
| @radix-ui/react-slider | 1.2.3 | MIT |
| @radix-ui/react-slot | 1.1.2 | MIT |
| @radix-ui/react-switch | 1.1.3 | MIT |
| @radix-ui/react-tabs | 1.1.3 | MIT |
| @radix-ui/react-toggle | 1.1.2 | MIT |
| @radix-ui/react-toggle-group | 1.1.2 | MIT |
| @radix-ui/react-tooltip | 1.1.8 | MIT |

---

## 3. 📦 ไลบรารีเสริม (Utility Libraries)

| Package | เวอร์ชัน | หน้าที่ | License |
|---|---|---|---|
| **react-router** | ^8.3.0 | ระบบเส้นทาง URL / Navigation | MIT |
| **lucide-react** | 0.487.0 | ไอคอน SVG | ISC |
| **react-odontogram** | ^0.5.6 | แผนผังฟัน (Dental chart) | MIT |
| **@emailjs/browser** | ^4.4.1 | ส่งอีเมล OTP จาก Browser | BSD-3-Clause |
| **@supabase/supabase-js** | ^2.110.2 | เชื่อมต่อฐานข้อมูล Supabase | MIT |
| **react-hook-form** | 7.55.0 | จัดการฟอร์ม (ผ่าน shadcn form) | MIT |
| **react-day-picker** | 8.10.1 | ปฏิทินเลือกวันที่ (ผ่าน shadcn calendar) | MIT |
| **date-fns** | 3.6.0 | จัดการวันที่ (peer dep ของ react-day-picker) | MIT |
| **embla-carousel-react** | 8.6.0 | Carousel / Slider (ผ่าน shadcn carousel) | MIT |
| **react-resizable-panels** | 2.1.7 | แบ่งพื้นที่แบบปรับขนาดได้ (ผ่าน shadcn resizable) | MIT |
| **recharts** | 2.15.2 | กราฟ / Chart (ผ่าน shadcn chart) | MIT |
| **sonner** | 2.0.3 | Toast notification (ผ่าน shadcn sonner) | MIT |
| **vaul** | 1.1.2 | Drawer ลิ้นชักจากล่าง (ผ่าน shadcn drawer) | MIT |
| **input-otp** | 1.4.2 | ช่องกรอก OTP (ผ่าน shadcn input-otp) | MIT |
| **cmdk** | 1.1.1 | Command palette ค้นหาคำสั่ง (ผ่าน shadcn command) | MIT |
| **class-variance-authority** | 0.7.1 | จัดการ CSS class variants | Apache-2.0 |
| **clsx** | 2.1.1 | รวม CSS class แบบมีเงื่อนไข | MIT |
| **tailwind-merge** | 3.2.0 | รวม Tailwind class ไม่ให้ซ้อน | MIT |
| **tw-animate-css** | 1.3.8 | Animation สำหรับ Tailwind | MIT |

---

## 4. 🛠️ Dev Dependencies (เครื่องมือพัฒนา — ไม่รวมอยู่ในเว็บที่ deploy)

| Package | เวอร์ชัน | หน้าที่ | License |
|---|---|---|---|
| @tailwindcss/vite | 4.1.12 | Tailwind + Vite integration | MIT |
| @types/node | ^26.1.1 | Type definitions สำหรับ Node.js | MIT |
| @types/react | ^19.2.17 | Type definitions สำหรับ React | MIT |
| @vitejs/plugin-react | 4.7.0 | Vite plugin สำหรับ React (Babel) | MIT |
| tailwindcss | 4.1.12 | Tailwind CSS core | MIT |
| typescript | ^7.0.2 | TypeScript compiler | Apache-2.0 |
| vite | ^6.4.3 | Build tool | MIT |

---

## 5. ☁️ บริการภายนอก (External Services)

| บริการ | หน้าที่ | ต้องมี API Key |
|---|---|---|
| **Supabase** | ฐานข้อมูล PostgreSQL + Auth | ✅ ใช่ (ตั้งค่าใน `.env.local`) |
| **EmailJS** | ส่งอีเมล OTP จาก Browser | ✅ ใช่ (ตั้งค่าใน `.env.local` — ยังไม่ได้ตั้ง) |
| **Google Fonts** | ดึงฟอนต์มาแสดงผลบนเว็บ | ❌ ไม่ต้อง (เป็น public CDN) |

---

## 6. 🖼️ รูปภาพ / กราฟฟิกที่อ้างอิงจากภายนอก

### 6.1 Unsplash (รูปถ่ายสต็อก)

โปรเจกต์นี้ดึงรูปภาพจาก Unsplash โดยตรงผ่าน URL ในโค้ด:

| ไฟล์ที่ใช้ | URL รูปภาพ | คำอธิบาย |
|---|---|---|
| `src/app/patient/auth/AuthShell.tsx` | `photo-1606811971618-4486d14f3f99` | รูปทันตแพทย์ (หน้าล็อกอิน) |
| `src/app/patient/landing/Hero.tsx` | `photo-1606811971618-4486d14f3f99` | รูปทันตแพทย์ (หน้าแรก) |
| `src/app/patient/landing/Contact.tsx` | `photo-1559757148-5c350d0d3c56` | รูปที่ตั้งคลินิก |
| `src/app/patient/landing/WhyUs.tsx` | `photo-1588776814546-1ffcf47267a5` | รูปภายในคลินิก |
| `src/app/shared/supabaseApi.ts` | `photo-1651008376811-b90baee60c1f` | รูป default ทันตแพทย์ (fallback) |

### 6.2 Lucide Icons (ไอคอน SVG)
- **ที่มา:** https://lucide.dev/
- **License:** ISC ✅
- **การใช้งาน:** import ผ่าน npm package `lucide-react` (ไม่ได้ copy ไฟล์มา)

### 6.3 ฟอนต์ (Google Fonts)
ดึงจาก Google Fonts CDN ในไฟล์ `src/styles/fonts.css`:
- **Playfair Display** — License: OFL (Open Font License) ✅
- **Prompt** (ฟอนต์ไทย) — License: OFL ✅
- **DM Sans** — License: OFL ✅

---

## 7. 📄 ที่มาจาก Figma Make (โค้ดที่ Generate มาจากเครื่องมือ)

โปรเจกต์นี้ถูก Export มาจาก **Figma Make** ซึ่งเป็นเครื่องมือของ Figma ที่แปลงไฟล์ดีไซน์เป็นโค้ด React อัตโนมัติ:

- **ไฟล์ที่สร้างโดย Figma Make:**
  - `vite.config.ts` — มี `figmaAssetResolver()` plugin เฉพาะ
  - `default_shadcn_theme.css` — ธีมสี shadcn ที่ Export มาจาก Figma
  - `src/app/shared/components/figma/ImageWithFallback.tsx` — Component สำหรับจัดการรูปที่โหลดไม่ได้
  - `guidelines/Guidelines.md` — Template คู่มือ (ยังไม่ได้กรอกข้อมูล)
  - `ATTRIBUTIONS.md` — ข้อมูลเครดิต (สร้างโดย Figma Make อัตโนมัติ)

---

## 8. ⚖️ สรุปสถานะลิขสิทธิ์และคำเตือน

### ✅ ปลอดภัย — ใช้ได้เสรี
- **Packages ทั้งหมดที่ใช้** ล้วนเป็น License แบบ MIT, ISC, Apache-2.0, BSD-3-Clause หรือ OFL ซึ่งอนุญาตให้ใช้ในโปรเจกต์เชิงพาณิชย์ได้อย่างเสรี **ตราบใดที่คุณเก็บข้อความ License ดั้งเดิมไว้** (ปกติอยู่ใน `node_modules/` อยู่แล้ว)
- **Google Fonts** — ใช้ได้เสรี ทั้ง OFL font license

### ⚠️ ต้องระวัง — Unsplash

> **ข้อมูลลิขสิทธิ์ Unsplash:**  
> Unsplash อนุญาตให้ใช้รูปภาพได้ฟรี ทั้งเชิงพาณิชย์และไม่เชิงพาณิชย์ **โดยไม่ต้องขออนุญาตหรือให้เครดิต** (แต่แนะนำให้ให้เครดิต)  
> 
> **สิ่งที่ห้ามทำ:**
> - ❌ ห้ามขายรูปโดยไม่ดัดแปลง (เช่น เอาไปขายเป็น wallpaper)
> - ❌ ห้ามรวบรวมรูปจำนวนมากไปทำเป็นบริการแข่งกับ Unsplash
> - ✅ ใช้ประกอบเว็บไซต์ / แอปพลิเคชัน ได้เลย

> **คำแนะนำ:** โปรเจกต์นี้ลิงก์ตรงไปที่ `images.unsplash.com` ซึ่งหมายความว่า:
> 1. ถ้า Unsplash ล่ม → รูปจะไม่แสดง
> 2. ถ้า Unsplash เปลี่ยนนโยบาย → อาจกระทบ
> 3. **แนะนำ: ดาวน์โหลดรูปมาเก็บไว้ในโปรเจกต์** เพื่อความมั่นคง

### ⚠️ ต้องระวัง — Figma Make

> โค้ดที่ Export จาก Figma Make อยู่ภายใต้เงื่อนไขการใช้งานของ Figma:
> - ✅ ใช้ในโปรเจกต์ส่วนตัวและเชิงพาณิชย์ได้
> - ⚠️ ตรวจสอบ Terms of Service ของ Figma ว่า Design ต้นฉบับเป็นของคุณเองหรือเป็นแบบ Community/Template

### ✅ แก้ไขแล้ว — ความปลอดภัย API Key

> เพิ่ม `.env.local` เข้า `.gitignore` เรียบร้อยแล้ว เพื่อป้องกัน API Keys หลุดขึ้น GitHub

---

## 9. 📁 โครงสร้างโปรเจกต์โดยย่อ

```
icemu/
├── index.html                  ← หน้า HTML หลัก
├── package.json                ← รายชื่อ Dependencies ทั้งหมด
├── vite.config.ts              ← ตั้งค่า Vite + Figma asset resolver
├── tsconfig.json               ← ตั้งค่า TypeScript
├── postcss.config.mjs          ← ตั้งค่า PostCSS (ว่างเปล่า)
├── pnpm-workspace.yaml         ← ตั้งค่า pnpm workspace
├── .env.local                  ← 🔐 API Keys (Supabase, EmailJS)
├── ATTRIBUTIONS.md             ← เครดิต shadcn/ui + Unsplash
├── default_shadcn_theme.css    ← ธีมสี shadcn จาก Figma
├── guidelines/Guidelines.md    ← แนวทางพัฒนา (template)
│
├── src/
│   ├── main.tsx                ← จุดเริ่มต้น (Entry Point)
│   ├── styles/                 ← CSS ทั้งหมด (fonts, tailwind, theme)
│   └── app/
│       ├── patient/            ← ส่วนผู้ป่วย (Landing, Auth, Booking, ฯลฯ)
│       ├── dentist/            ← ส่วนทันตแพทย์ (Dashboard, Treatment, ฯลฯ)
│       ├── staff/              ← ส่วนเจ้าหน้าที่ (Queue, Payment, Checkin, ฯลฯ)
│       ├── admin/              ← ส่วนผู้ดูแลระบบ (Users, Schedule, Settings, ฯลฯ)
│       └── shared/             ← โค้ดที่ใช้ร่วมกัน (UI components, API, utils)
│
└── dist/                       ← โฟลเดอร์ Build output
```

---

## 10. 📌 คำแนะนำสำหรับรายงาน

1. **License ที่ต้องระบุในรายงาน:** MIT (หลัก), ISC, Apache-2.0, BSD-3-Clause, OFL
2. **ให้เครดิต:** shadcn/ui, Unsplash, Lucide Icons, Google Fonts (Playfair Display, Prompt, DM Sans)
3. **เครื่องมือออกแบบ:** Figma + Figma Make
4. **Backend/Database:** Supabase (PostgreSQL)

---

## 11. 🗑️ Packages ที่ถูกลบออก (5 สิงหาคม 2026)

Packages ต่อไปนี้ถูกลบออกจาก `package.json` แล้วเนื่องจากตรวจสอบทั้งโปรเจกต์แล้วไม่พบว่ามีการ import ใช้งานจริง:

| Package ที่ลบ | เหตุผล |
|---|---|
| @mui/material 7.3.5 | ไม่มีการ import ในโค้ดใดเลย |
| @emotion/react 11.14.0 | dependency ของ @mui ที่ลบออกแล้ว |
| @emotion/styled 11.14.1 | dependency ของ @mui ที่ลบออกแล้ว |
| @popperjs/core 2.11.8 | ไม่มีการ import ในโค้ดใดเลย |
| canvas-confetti 1.9.4 | ไม่มีการ import ในโค้ดใดเลย |
| iconv-lite ^0.7.3 | ไม่มีการ import ในโค้ดใดเลย |
| motion 12.23.24 | ไม่มีการ import ในโค้ดใดเลย |
| next-themes 0.4.6 | ไม่มีการ import ในโค้ดใดเลย |
| react-dnd 16.0.1 | ไม่มีการ import ในโค้ดใดเลย |
| react-dnd-html5-backend 16.0.1 | ไม่มีการ import ในโค้ดใดเลย |
| react-popper 2.3.0 | ไม่มีการ import ในโค้ดใดเลย |
| react-responsive-masonry 2.7.1 | ไม่มีการ import ในโค้ดใดเลย |
| react-slick 0.31.0 | ไม่มีการ import ในโค้ดใดเลย |

---

## 📝 บันทึกการเปลี่ยนแปลง (Changelog)

| วันที่ | รายการเปลี่ยนแปลง |
|---|---|
| 5 ส.ค. 2026 | สร้างรายงานฉบับแรก, ลบ 13 packages ที่ไม่ได้ใช้, เพิ่ม `.env.local` เข้า `.gitignore` |
