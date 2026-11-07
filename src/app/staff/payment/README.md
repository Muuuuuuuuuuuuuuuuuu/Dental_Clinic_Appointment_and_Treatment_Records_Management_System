# 💳 Staff Payment Module (`src/app/staff/payment`)

โมดูลรับชำระเงินและออกใบเสร็จสำหรับเจ้าหน้าที่คลินิก (Staff) โดยจัดโครงสร้างตามมาตรฐาน **Positional Sections Pattern**

---

## 📁 โครงสร้างโฟลเดอร์ (Directory Structure)

```
src/app/staff/payment/
├── index.tsx                             # Entry point หลัก (~90 บรรทัด)
├── hooks/
│   └── usePaymentData.ts                 # ตรรกะคำนวณราคา, ส่วนลด, สินค้าเสริม, คิวรับชำระเงิน, Realtime Appointments
└── sections/
    ├── Content/                          # 🔲 ส่วนเนื้อหา: แบ่งซ้าย-ขวา
    │   ├── index.tsx
    │   └── components/
    │       ├── PaymentQueueList.tsx      # แผงซ้าย: รายการคิวรอชำระเงิน และประวัติชำระเงินวันนี้
    │       └── PaymentBillingPanel.tsx   # แผงขวา: สรุปหัตถการ, แก้ไขราคา/จำนวน, สินค้าเสริม, วิธีชำระเงิน
    └── Modals/                           # 🔲 ส่วนหน้าต่างป๊อปอัป
        ├── index.tsx
        └── components/
            ├── ReceiptModal.tsx          # ป๊อปอัปใบเสร็จรับเงินสำหรับสั่งพิมพ์
            └── FollowUpModal.tsx         # ป๊อปอัปนัดหมายต่อเนื่อง / สร้างใบนัดแบบเปิด
```

