# Patient Dental Record Module Architecture

โครงสร้างสถาปัตยกรรมโมดูลเวชระเบียนและแผนผังฟันคนไข้ (`patient/record`) ออกแบบตามมาตรฐาน **Flat & Clean Architecture**

```
src/app/patient/record/
├── components/
│   ├── DentalRecordTitleBar.tsx  # แถบด้านบน: ปุ่มย้อนกลับ, หัวข้อ, วันที่อัปเดตล่าสุด
│   ├── OdontogramView.tsx        # แผนผังฟัน 32 ซี่ + ฟันเกิน + สวิตช์เด็ก/ผู้ใหญ่ + กล่องประวัติรักษาในตัว
│   ├── ToothDetailModal.tsx      # หน้าต่าง Popup รายละเอียดฟันรายซี่ + หัตถการที่เคยทำ
│   └── index.ts                  # Export รวม components
├── hooks/
│   └── useDentalRecord.ts        # คำนวณ Odontogram, ฟันเกิน, ประวัติย้อนหลัง, สถิติฟัน, สถานะสลับดูแผนผังย้อนหลัง
├── index.ts                      # Module Entry Point
├── PatientDentalRecordView.tsx   # View หลัก
└── README.md                     # เอกสารอธิบายโครงสร้าง
```
