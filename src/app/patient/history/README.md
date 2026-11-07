# 📜 Patient Treatment History Module (`src/app/patient/history`)

โมดูลประวัติการรักษาและสลิปใบเสร็จรับเงินสำหรับคนไข้ จัดโครงสร้างตามมาตรฐาน **Positional Sections Pattern**

---

## 📁 โครงสร้างโฟลเดอร์ (Directory Structure)

```
src/app/patient/history/
├── index.tsx                             # Entry point หลัก (~45 บรรทัด)
├── hooks/
│   └── usePatientHistory.ts              # ดึงประวัติการรักษา, คำนวณยอดเงินรวม, ควบคุม Modal
└── sections/
    ├── Header/                           # 🔲 ส่วนหัว: TitleBar และยอดค่าใช้จ่ายรวม
    │   ├── index.tsx
    │   └── components/
    │       └── TitleBar.tsx
    ├── Content/                          # 🔲 ส่วนเนื้อหา: การ์ดประวัติการรักษา หรือสถานะว่าง
    │   ├── index.tsx
    │   └── components/
    │       ├── HistoryCard.tsx           # การ์ดแสดงผลการรักษา วันที่ ทันตแพทย์ และราคา
    │       └── EmptyHistoryState.tsx     # กล่องว่างเมื่อยังไม่มีประวัติการรักษา
    └── Modals/                           # 🔲 ส่วนหน้าต่างป๊อปอัป
        ├── index.tsx
        └── components/
            ├── TreatmentDetailModal.tsx  # ป๊อปอัปผลการรักษาและสลิปใบเสร็จ
            ├── TreatmentAdviceTab.tsx    # แท็บบันทึกแพทย์และคำแนะนำการดูแล
            └── ReceiptSlipTab.tsx        # แท็บสลิปใบเสร็จพร้อมฟังก์ชันสั่งพิมพ์
```

