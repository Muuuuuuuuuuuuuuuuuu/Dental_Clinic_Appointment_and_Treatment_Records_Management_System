const fs = require('fs');
const path = require('path');

function extractRemnant(content, searchRegex) {
  const match = content.match(searchRegex);
  if (!match) return { code: null, endIdx: -1, startIdx: -1 };
  
  const funcStart = match.index;
  const searchString = match[0];
  
  let braceCount = 1;
  let inString = false;
  let stringChar = '';
  let inTemplate = false;
  let endBraceIdx = -1;

  let startParseIdx = funcStart + searchString.indexOf('{');

  for (let i = startParseIdx + 1; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i-1] : '';

    if (!inString && !inTemplate) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
      } else if (char === '\`') {
        inTemplate = true;
      } else if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          endBraceIdx = i;
          break;
        }
      }
    } else if (inString) {
      if (char === stringChar && prevChar !== '\\') inString = false;
    } else if (inTemplate) {
      if (char === '\`' && prevChar !== '\\') inTemplate = false;
    }
  }

  if (endBraceIdx !== -1) {
    return { code: content.substring(funcStart, endBraceIdx + 1), endIdx: endBraceIdx, startIdx: funcStart };
  }
  return { code: null, endIdx: -1, startIdx: -1 };
}

function repairComponent(portalPathRel, compName, compFolder, searchRegex) {
  const portalPath = path.join(__dirname, 'src', 'app', portalPathRel);
  let content = fs.readFileSync(portalPath, 'utf8');

  const { code, startIdx, endIdx } = extractRemnant(content, searchRegex);
  if (!code) {
    console.log(`Could not find remnant for ${compName}`);
    return;
  }

  // Remove remnant from portal
  const before = content.substring(0, startIdx);
  const after = content.substring(endIdx + 1);
  fs.writeFileSync(portalPath, before + after);

  // Append remnant to component file
  const compPath = path.join(__dirname, 'src', 'app', path.dirname(portalPathRel), compFolder, `${compName}.tsx`);
  let compContent = fs.readFileSync(compPath, 'utf8');
  compContent = compContent.trimRight() + code + '\n';
  fs.writeFileSync(compPath, compContent);
  
  console.log(`Repaired ${compName}`);
}

const repairs = [
  { portal: 'patient/PatientPortal.tsx', name: 'DashboardView', folder: 'dashboard', search: /:\s*\{\s*user:\s*PatientUser;\s*setView:\s*\(v:\s*View\)\s*=>\s*void\s*\}\)\s*\{/ },
  { portal: 'patient/PatientPortal.tsx', name: 'AppointmentsView', folder: 'appointments', search: /:\s*\{\s*setView:\s*\(v:\s*View\)\s*=>\s*void\s*\}\)\s*\{/ },
  { portal: 'patient/PatientPortal.tsx', name: 'ProfileView', folder: 'profile', search: /:\s*\{\s*user:\s*PatientUser;\s*setUser:\s*\(u:\s*PatientUser\)\s*=>\s*void\s*\}\)\s*\{/ },
  { portal: 'patient/PatientPortal.tsx', name: 'HistoryView', folder: 'history', search: /\(\)\s*\{/ },

  { portal: 'dentist/DentistPortal.tsx', name: 'DoctorDashboard', folder: 'dashboard', search: /:\s*\{\s*appointments:\s*Appointment\[\];\s*setView:\s*\(v:\s*DocView\)\s*=>\s*void\s*\}\)\s*\{/ },
  { portal: 'dentist/DentistPortal.tsx', name: 'TreatmentQueue', folder: 'treatment', search: /:\s*\{\s*appointments:\s*Appointment\[\];\s*onUpdateAppt:\s*\(id:\s*number,\s*st:\s*string,\s*txt\?:\s*string\)\s*=>\s*void;\s*\}\)\s*\{/ },
  { portal: 'dentist/DentistPortal.tsx', name: 'PatientRecords', folder: 'patients', search: /:\s*\{\s*appointments:\s*Appointment\[\]\s*\}\)\s*\{/ },
  { portal: 'dentist/DentistPortal.tsx', name: 'DoctorSchedule', folder: 'schedule', search: /\(\)\s*\{/ },
  { portal: 'dentist/DentistPortal.tsx', name: 'LeaveRequestView', folder: 'leave', search: /\(\)\s*\{/ },
  { portal: 'dentist/DentistPortal.tsx', name: 'DoctorProfile', folder: 'profile', search: /\(\)\s*\{/ },

  { portal: 'admin/AdminPortal.tsx', name: 'AdminDashboard', folder: 'dashboard', search: /:\s*\{\s*appointments:\s*Appointment\[\];\s*setView:\s*\(v:\s*AdminView\)\s*=>\s*void\s*\}\)\s*\{/ },
  { portal: 'admin/AdminPortal.tsx', name: 'DentistManagement', folder: 'users', search: /\(\)\s*\{/ },
  { portal: 'admin/AdminPortal.tsx', name: 'StaffManagement', folder: 'users', search: /\(\)\s*\{/ },
  { portal: 'admin/AdminPortal.tsx', name: 'ServiceManagement', folder: 'settings', search: /\(\)\s*\{/ },
  { portal: 'admin/AdminPortal.tsx', name: 'ScheduleManagement', folder: 'schedule', search: /\(\)\s*\{/ },
  { portal: 'admin/AdminPortal.tsx', name: 'LeaveApprovals', folder: 'leave', search: /\(\)\s*\{/ },

  { portal: 'staff/StaffPortal.tsx', name: 'QueueBoard', folder: 'queue', search: /:\s*\{\s*appointments:\s*Appointment\[\];\s*setView:\s*\(v:\s*StaffView\)\s*=>\s*void\s*\}\)\s*\{/ },
  { portal: 'staff/StaffPortal.tsx', name: 'PatientVerification', folder: 'patients', search: /:\s*\{\s*appointments:\s*Appointment\[\]\s*\}\)\s*\{/ },
  { portal: 'staff/StaffPortal.tsx', name: 'WalkInBooking', folder: 'booking', search: /:\s*\{\s*onAddAppt:\s*\(a:\s*Appointment\)\s*=>\s*void\s*\}\)\s*\{/ },
  { portal: 'staff/StaffPortal.tsx', name: 'CheckInView', folder: 'checkin', search: /:\s*\{\s*appointments:\s*Appointment\[\];\s*onUpdate:\s*\(id:\s*number,\s*s:\s*string\)\s*=>\s*void\s*\}\)\s*\{/ },
  { portal: 'staff/StaffPortal.tsx', name: 'PaymentView', folder: 'payment', search: /:\s*\{\s*appointments:\s*Appointment\[\];\s*onUpdate:\s*\(id:\s*number,\s*s:\s*string\)\s*=>\s*void\s*\}\)\s*\{/ }
];

repairs.forEach(r => repairComponent(r.portal, r.name, r.folder, r.search));
