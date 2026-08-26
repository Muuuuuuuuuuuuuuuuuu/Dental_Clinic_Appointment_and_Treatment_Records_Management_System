const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'src/app/staff/queue/QueueBoard.tsx',
  'src/app/staff/payment/PaymentView.tsx',
  'src/app/staff/patients/PatientVerification.tsx',
  'src/app/staff/confirmations/ConfirmationsView.tsx',
  'src/app/staff/checkin/CheckInView.tsx',
  'src/app/staff/appointments/AppointmentManagementView.tsx',
  'src/app/staff/StaffPortal.tsx'
];

for (const relPath of filesToPatch) {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');

  // StaffPortal.tsx
  if (relPath.includes('StaffPortal.tsx')) {
    // Make sure useRealtimeAppointments is used
    if (!content.includes('useRealtimeAppointments')) {
      content = content.replace(
        'import { getAppointments, getClinicClosures, getClinicSettings, getDailyHours, getWeeklyOffDays } from "../shared/supabaseApi";',
        'import { getClinicClosures, getClinicSettings, getDailyHours, getWeeklyOffDays } from "../shared/supabaseApi";\nimport { useRealtimeAppointments } from "../shared/useRealtimeAppointments";'
      );
      content = content.replace(
        '  appointments,\n  onUpdateAppt,\n  onAddAppt,\n  onLogout,',
        '  onUpdateAppt,\n  onAddAppt,\n  onLogout,'
      );
      content = content.replace(
        '  appointments: Appointment[];',
        '  appointments?: Appointment[];'
      );
      content = content.replace(
        '  const [view, setView] = useState<StaffView>("dashboard");',
        '  const { appointments } = useRealtimeAppointments();\n  const [view, setView] = useState<StaffView>("dashboard");'
      );
    }
  } 
  // Other Staff Views
  else {
    if (!content.includes('useRealtimeAppointments')) {
      // Import
      content = content.replace(
        'import { getAppointments,',
        'import { '
      );
      if (content.includes('import { getAppointments }')) {
         content = content.replace('import { getAppointments } from', 'import { } from');
      }
      content = content.replace(
        /import \{.*?\} from "\.\.\/\.\.\/shared\/supabaseApi";/,
        '$&\nimport { useRealtimeAppointments } from "../../shared/useRealtimeAppointments";'
      );

      // State replacement
      content = content.replace(
        'const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments || []);',
        'const { appointments, refetch: fetchAppointments } = useRealtimeAppointments();'
      );
      content = content.replace(
        'const [appointments, setAppointments] = useState<Appointment[]>([]);',
        'const { appointments, refetch: fetchAppointments } = useRealtimeAppointments();'
      );

      // getAppointments() -> fetchAppointments()
      content = content.replace(/getAppointments\(\)\.then\(setAppointments\)/g, 'fetchAppointments()');
      
      // Initial fetch removal (since useRealtimeAppointments does it)
      if (relPath.includes('PaymentView.tsx') || relPath.includes('ConfirmationsView.tsx') || relPath.includes('CheckInView.tsx')) {
         content = content.replace(/getAppointments\(\)\.then\([^)]+\)\.catch\([^)]+\)\.finally\([^)]+\);/g, '');
      }
      
      // PatientVerification
      if (relPath.includes('PatientVerification.tsx')) {
        content = content.replace('getAppointments(),\n', '');
        content = content.replace('      getTreatmentPlans()', 'getTreatmentPlans()');
        content = content.replace('.then(([aData, tData]) => {', '.then(([tData]) => {');
        content = content.replace('        setAppointments(aData);', '');
      }
    }
  }

  fs.writeFileSync(fullPath, content);
  console.log('Patched:', relPath);
}
