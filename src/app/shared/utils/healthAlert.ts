// Helper: ตรวจสอบว่าคนไข้มีประวัติสุขภาพที่ควรแจ้งเตือนหรือไม่
// ใช้ฟังก์ชันนี้ในทุกหน้าแทนการเขียน !== "ไม่มี" เองทุกครั้ง
const NO_HEALTH_KEYWORDS = ['ไม่มี', 'ไม่มีประวัติ', 'ไม่มีประวัติแพ้ยา', 'ไม่มี ภาวะสุขภาพหรือโรคประจำตัวใดๆ', '-', ''];

export function hasHealthAlert(allergies?: string, conditions?: string): boolean {
  const allergyAlert = !!allergies && !NO_HEALTH_KEYWORDS.some(k => allergies.trim() === k);
  const conditionAlert = !!conditions && !NO_HEALTH_KEYWORDS.some(k => conditions.trim() === k);
  return allergyAlert || conditionAlert;
}

