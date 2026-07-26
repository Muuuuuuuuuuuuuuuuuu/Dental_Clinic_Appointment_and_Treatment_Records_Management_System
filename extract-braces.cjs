const fs = require('fs');
const path = require('path');

function extractFunction(content, funcName) {
  const funcStart = content.indexOf(`function ${funcName}`);
  if (funcStart === -1) return null;
  
  let parenCount = 0;
  let seenParen = false;
  let braceCount = 0;
  let seenBrace = false;
  
  let inString = false;
  let stringChar = '';
  let inTemplate = false;
  let endIdx = -1;

  for (let i = funcStart; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i-1] : '';

    if (!inString && !inTemplate) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
      } else if (char === '\`') {
        inTemplate = true;
      } else if (char === '(' && !seenBrace) {
        parenCount++;
        seenParen = true;
      } else if (char === ')' && !seenBrace) {
        parenCount--;
      } else if (char === '{') {
        if (seenParen && parenCount === 0) {
          seenBrace = true;
          braceCount++;
        } else if (seenBrace) {
          braceCount++;
        }
      } else if (char === '}') {
        if (seenBrace) {
          braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
      }
    } else if (inString) {
      if (char === stringChar && prevChar !== '\\') inString = false;
    } else if (inTemplate) {
      if (char === '\`' && prevChar !== '\\') inTemplate = false;
    }
  }

  if (endIdx !== -1) {
    return content.substring(funcStart, endIdx + 1);
  }
  return null;
}

function processPortal(portalName, portalPathRel, components) {
  const portalPath = path.join(__dirname, 'src', 'app', portalPathRel);
  let content = fs.readFileSync(portalPath, 'utf8');
  
  // Fix imports FIRST before extracting so the extracted code has correct paths
  content = content.replace(/from "\.\/components\/ui/g, 'from "../shared/components/ui');
  content = content.replace(/from "\.\/components\/figma/g, 'from "../shared/components/figma');
  content = content.replace(/from "\.\/shared"/g, 'from "../shared/data"');
  content = content.replace(/from "\.\.\/shared"/g, 'from "../../shared/data"'); // In case it was already replaced
  
  if (portalName === 'patient') {
     content = content.replace(/function App\(\)/g, 'export default function PatientPortal()');
  }

  for (const comp of components) {
    const code = extractFunction(content, comp.name);
    if (!code) {
      console.log(`Could not find ${comp.name} in ${portalName}`);
      continue;
    }
    
    const destDir = path.join(__dirname, 'src', 'app', portalName, comp.folder);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    
    const filePath = path.join(destDir, `${comp.name}.tsx`);
    
    const fileContent = `import React, { useState } from "react";
${comp.imports || ''}

// NOTE: Shared types and data should ideally be imported from shared folders.
// Currently left as-is for the extraction step to avoid breaking compilation.

${code.replace(`function ${comp.name}`, `export default function ${comp.name}`)}
`;

    fs.writeFileSync(filePath, fileContent);
    console.log(`Extracted ${comp.name} to ${filePath}`);
    
    content = content.replace(code, '');
    
    let importName = comp.name;
    const importStatement = `import ${importName} from "./${comp.folder}/${comp.name}";\n`;
    
    // Add import right after react imports
    if (content.includes('import { useState, useMemo } from "react";')) {
      content = content.replace('import { useState, useMemo } from "react";', `import { useState, useMemo } from "react";\n${importStatement}`);
    } else if (content.includes('import { useState } from "react";')) {
      content = content.replace('import { useState } from "react";', `import { useState } from "react";\n${importStatement}`);
    } else if (content.includes('import { useState, useEffect, useMemo } from "react";')) {
      content = content.replace('import { useState, useEffect, useMemo } from "react";', `import { useState, useEffect, useMemo } from "react";\n${importStatement}`);
    } else {
      content = importStatement + content;
    }
  }

  fs.writeFileSync(portalPath, content);
  console.log(`Updated ${portalPathRel}`);
}

const patientComponents = [
  { name: 'DashboardView', folder: 'dashboard', imports: 'import { Calendar, CheckCircle, Clock } from "lucide-react";' },
  { name: 'BookingView', folder: 'booking', imports: 'import { ChevronLeft, Check, ChevronRight, CheckCircle, ArrowRight } from "lucide-react";' },
  { name: 'AppointmentsView', folder: 'appointments', imports: 'import { Calendar, CheckCircle, Clock } from "lucide-react";' },
  { name: 'HistoryView', folder: 'history', imports: 'import { Calendar, FileText } from "lucide-react";' },
  { name: 'ProfileView', folder: 'profile', imports: 'import { User, Lock, Edit3 } from "lucide-react";' }
];

const adminComponents = [
  { name: 'AdminDashboard', folder: 'dashboard', imports: 'import { Users, UserPlus, FileText, Settings, Calendar, Play } from "lucide-react";' },
  { name: 'DentistManagement', folder: 'users', imports: 'import { UserPlus, Edit3, Trash2 } from "lucide-react";' },
  { name: 'StaffManagement', folder: 'users', imports: 'import { UserPlus, Edit3, Trash2 } from "lucide-react";' },
  { name: 'ServiceManagement', folder: 'settings', imports: 'import { Plus, Edit3, Trash2 } from "lucide-react";' },
  { name: 'ScheduleManagement', folder: 'schedule', imports: 'import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";' },
  { name: 'LeaveApprovals', folder: 'leave', imports: 'import { CheckCircle, XCircle } from "lucide-react";' }
];

const dentistComponents = [
  { name: 'DoctorDashboard', folder: 'dashboard', imports: 'import { Users, FileText, Calendar, Clock, CheckCircle } from "lucide-react";' },
  { name: 'TreatmentQueue', folder: 'treatment', imports: 'import { Search, Filter, Play, CheckCircle, Clock, FileText, Plus, X } from "lucide-react";' },
  { name: 'PatientRecords', folder: 'patients', imports: 'import { Search, Filter, History, FileText } from "lucide-react";' },
  { name: 'DoctorSchedule', folder: 'schedule', imports: 'import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";' },
  { name: 'LeaveRequestView', folder: 'leave', imports: 'import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";' },
  { name: 'DoctorProfile', folder: 'profile', imports: 'import { User, Settings, Edit3 } from "lucide-react";' }
];

const staffComponents = [
  { name: 'QueueBoard', folder: 'queue', imports: 'import { Play, CheckCircle, Search, Filter } from "lucide-react";' },
  { name: 'PatientVerification', folder: 'patients', imports: 'import { Search, CheckCircle, FileText } from "lucide-react";' },
  { name: 'WalkInBooking', folder: 'booking', imports: 'import { Calendar, Clock, UserPlus, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";' },
  { name: 'CheckInView', folder: 'checkin', imports: 'import { Search, Play } from "lucide-react";' },
  { name: 'PaymentView', folder: 'payment', imports: 'import { Search, FileText, CheckCircle } from "lucide-react";' }
];

processPortal('patient', 'patient/PatientPortal.tsx', patientComponents);
processPortal('dentist', 'dentist/DentistPortal.tsx', dentistComponents);
processPortal('admin', 'admin/AdminPortal.tsx', adminComponents);
processPortal('staff', 'staff/StaffPortal.tsx', staffComponents);

