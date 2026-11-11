# 👥 Dentist Queue Module — Architecture & Structure

> โมดูลคิวการรักษาและห้องตรวจทันตกรรม (Dentist Queue & Dental Treatment Room)
> ตรงกับเมนู **"คิวการรักษา"** (key: `queue`) บน Sidebar
> ศูนย์กลางการตรวจรักษาของทันตแพทย์: จัดการคิวคนไข้, บันทึกการรักษา, สั่งยา, และแผนผังฟัน Odontogram 32 ซี่

---

## 🗂️ Directory Tree

```text
src/app/dentist/queue/
├── README.md               ← 🗺️ เอกสารโครงสร้างของโมดูลคิวการรักษา
├── DentistQueueView.tsx    ← 🏢 [MAIN VIEW] หน้าห้องตรวจและคิวคนไข้
├── Odontogram.tsx          ← 🦷 [CHART] ระบบผังฟัน 32 ซี่
├── ToothGeometry.ts        ← 📐 พิกัด SVG โครงสร้างฟัน
├── ToothActionModal.tsx    ← 🪟 ป๊อปอัปเลือกหัตถการรายซี่
├── types.ts                ← ประเภทข้อมูลทันตกรรม
├── constants/              ← ข้อมูลคงที่ (ชื่อซี่ฟันสากล)
├── hooks/                  ← useTreatmentQueue Hook คุม State การตรวจ
├── utils/                  ← toothHistory ตัวจัดการประวัติฟัน
├── components/             ← ชิ้นส่วน UI การตรวจและผังฟัน
└── index.ts                ← ส่งออก DentistQueueView และ Odontogram
```

