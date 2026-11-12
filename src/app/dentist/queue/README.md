# 👥 Dentist Queue Module — Architecture & Structure

> โมดูลคิวการรักษาและห้องตรวจทันตกรรม (Dentist Queue & Dental Treatment Room)
> ตรงกับเมนู **"คิวการรักษา"** (key: `queue`) บน Sidebar
> จัดวางโครงสร้างแบบ **2 โซนงานหลัก (Visual/Domain Zoning)** ไร้โฟลเดอร์ `components/`, `hooks/`, `constants/`, `utils/` ที่กระจัดกระจาย

---

## 🗂️ Directory Tree

```text
src/app/dentist/queue/
├── README.md                      ← 🗺️ แผนที่อธิบายโครงสร้างของโมดูลคิวการรักษา
├── DentistQueueView.tsx           ← 🏢 [หน้าหลัก] คุมหน้าคิวการรักษาและป๊อปอัป
├── useTreatmentQueue.ts           ← 🧠 [สมองกล] จัดการ State คิวคนไข้, การบันทึกหัตถการ, ยา, และฟัน
├── types.ts                       ← ประเภทข้อมูลคิวและการรักษา
├── index.ts                       ← จุดส่งออกหลัก
│
├── treatment/                     ← 🩺 [โซนคิวและการตรวจรักษา] (4 ไฟล์)
│   ├── index.ts
│   ├── QueueHeader.tsx            ← แถบหัวข้อและปุ่มกรองช่วงเวลา (วันนี้ / สัปดาห์นี้ / เดือนนี้ / ทั้งหมด)
│   ├── QueueItem.tsx              ← การ์ดแสดงคิวคนไข้แต่ละราย
│   ├── ActiveTreatmentForm.tsx    ← ฟอร์มบันทึกการรักษา, เลือกหัตถการ และสั่งยา
│   └── MedicineModal.tsx          ← ป๊อปอัปเลือกสั่งยาประจำ
│
└── odontogram/                    ← 🦷 [โซนระบบผังฟันดิจิทัล 32 ซี่] (รวมทุกอย่างไว้บ้านเดียวกัน)
    ├── index.ts
    ├── Odontogram.tsx             ← ตัวแม่ผังฟัน 32 ซี่
    ├── OdontogramChart.tsx        ← กระดานวาดผังฟันแบบ Interactive SVG
    ├── OdontogramLegend.tsx       ← หัวข้อ, สลับฟันแท้/ฟันน้ำนม และคำอธิบายสี
    ├── ToothSvg.tsx               ← ชิ้นส่วน SVG ฟันแต่ละซี่
    ├── ToothGeometry.ts           ← พิกัดและรูปทรง SVG ของฟัน
    ├── ToothExtraBadge.tsx        ← ป้ายแสดงฟันเกิน/ฟันซ้อน
    ├── ToothActionModal.tsx       ← ป๊อปอัปเลือกหัตถการรายซี่
    ├── ToothInspectionModal.tsx   ← ป๊อปอัปดูประวัติการรักษารายซี่
    ├── PatientTimelineAccordion.tsx ← ประวัติผังฟันย้อนหลังของคนไข้
    ├── toothNames.ts              ← ชื่อซี่ฟันภาษาไทยมาตรฐานสากล
    └── toothHistory.ts            ← ฟังก์ชันสรุปประวัติการรักษาต่อซี่
```
