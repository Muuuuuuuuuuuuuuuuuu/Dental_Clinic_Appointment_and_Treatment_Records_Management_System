const fs = require('fs');

let file = fs.readFileSync('src/app/staff/payment/PaymentView.tsx', 'utf8');

if (!file.includes('const [openTicketId, setOpenTicketId]')) {
  file = file.replace(
    /const \[showLink, setShowLink\] = useState\(false\);/,
    `const [showLink, setShowLink] = useState(false);\n  const [openTicketId, setOpenTicketId] = useState<number | null>(null);`
  );
}

if (!file.includes('?openTicketId=${openTicketId}')) {
  file = file.replace(
    /https:\/\/suphat\.clinic\/booking\?followUp=123/g,
    `https://suphat.clinic/booking?openTicketId=\${openTicketId}`
  );
  file = file.replace(
    /span className="text-xs text-gray-500 truncate mr-3">https:\/\/suphat\.clinic\/booking\?openTicketId=\$\{openTicketId\}<\/span>/,
    `span className="text-xs text-gray-500 truncate mr-3">{\`https://suphat.clinic/booking?openTicketId=\${openTicketId}\`}</span >`
  );
  // Need to fix the closing span tag properly
  file = file.replace(/<\/span >/, '</span>');
}

if (!file.includes('setOpenTicketId(newAppt.appointment_id || newAppt.id);')) {
  file = file.replace(
    /await addAppointment\(\{([\s\S]*?)\}\s*as any\);/,
    `const newAppt: any = await addAppointment({$1} as any);\n                          if (newAppt && (newAppt.appointment_id || newAppt.id)) {\n                            setOpenTicketId(newAppt.appointment_id || newAppt.id);\n                          }`
  );
}

fs.writeFileSync('src/app/staff/payment/PaymentView.tsx', file);
