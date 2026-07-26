const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'app', 'shared', 'data.ts');
let content = fs.readFileSync(dataPath, 'utf8');

const missingData = `
import React from 'react';

export const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
export const SHIFTS: Record<string, string[][]> = {
  'ทพ.ญ. อรนุช':  [['09:00','17:00'],['09:00','17:00'],['09:00','12:00'],['09:00','17:00'],['09:00','17:00'],['หยุด','หยุด']],
  'ทพ. วิชัย':    [['หยุด','หยุด'],['09:00','17:00'],['09:00','17:00'],['09:00','17:00'],['09:00','12:00'],['09:00','14:00']],
  'ทพ.ญ. พิมพ์ใจ': [['09:00','17:00'],['หยุด','หยุด'],['09:00','17:00'],['09:00','17:00'],['09:00','17:00'],['09:00','14:00']],
};

export const MOCK_APPOINTMENTS: Appointment[] = [];

export const MOCK_DOCTOR = {
  id: "D001", name: "ทพ.ญ. อรนุช", spec: "จัดฟัน", exp: 12, rating: 4.9,
  avatar: "อ",
  schedule: "จันทร์-ศุกร์ (09:00 - 17:00 น.)",
};

export const CHART_DATA = [
  { name: '1 ก.ค.', income: 45000, patients: 42 },
  { name: '2 ก.ค.', income: 52000, patients: 48 },
  { name: '3 ก.ค.', income: 38000, patients: 35 },
  { name: '4 ก.ค.', income: 65000, patients: 55 },
  { name: '5 ก.ค.', income: 48000, patients: 45 },
  { name: '6 ก.ค.', income: 55000, patients: 50 },
  { name: '7 ก.ค.', income: 61000, patients: 58 },
];

export type DocView = 'dashboard' | 'queue' | 'patients' | 'schedule' | 'leaves';

export function Badge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: active ? '#E8FFF0' : '#F0F4F8', color: active ? '#1B7A3E' : '#64748B' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? '#22C55E' : '#94A3B8' }} />
      {label || (active ? 'เปิดใช้งาน' : 'ปิดใช้งาน')}
    </span>
  );
}
`;

if (!content.includes('export const DAYS')) {
  fs.writeFileSync(dataPath, content + missingData, 'utf8');
}
