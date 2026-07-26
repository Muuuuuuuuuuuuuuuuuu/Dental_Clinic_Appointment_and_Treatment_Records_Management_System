const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'app', 'shared', 'data.ts');
let dataContent = fs.readFileSync(dataPath, 'utf8');

if (!dataContent.includes('export type AdminView')) {
  dataContent += `
export type AdminView = "dashboard" | "dentists" | "staff" | "services" | "schedule" | "leaves";
export type DoctorView = "dashboard" | "queue" | "patients" | "schedule" | "leaves";
export type StaffView = "dashboard" | "booking" | "queue" | "patients" | "checkin" | "payment";
`;
  fs.writeFileSync(dataPath, dataContent, 'utf8');
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const portals = ['admin', 'dentist', 'staff'];
for (const portal of portals) {
  const dir = path.join(__dirname, 'src', 'app', portal);
  const files = walk(dir);
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const target = `// NOTE: Shared types and data should ideally be imported from shared folders.\n// Currently left as-is for the extraction step to avoid breaking compilation.`;
    
    if (content.includes(target)) {
      const replacement = `import { Appointment, AppointmentStatus, DentistInfo, StaffInfo, ServiceInfo, LeaveRequest, MOCK_DENTISTS, MOCK_STAFF, MOCK_SERVICES, MOCK_LEAVES, STATUS_COLORS, getClinicStatus, SPECIAL_CLOSURES, SHIFTS, DAYS, MOCK_APPOINTMENTS, AdminView, DoctorView, StaffView } from "../../shared/data";\nimport { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";`;
      content = content.replace(target, replacement);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed ' + file);
    }
  }
}
