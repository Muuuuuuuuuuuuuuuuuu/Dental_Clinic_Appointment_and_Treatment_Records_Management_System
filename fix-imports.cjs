const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

function updateImports(filePath, role) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (role !== 'patient') {
    // For admin, dentist, staff
    content = content.replace(/from ".\/components\//g, 'from "../shared/components/');
    content = content.replace(/from ".\/shared"/g, 'from "../shared/data"');
  } else {
    // For patient (PatientPortal.tsx)
    content = content.replace(/from ".\/components\//g, 'from "../shared/components/');
    content = content.replace(/from ".\/shared"/g, 'from "../shared/data"');
    content = content.replace(/import DoctorPortal from ".\/DoctorPortal";/g, 'import DentistPortal from "../dentist/DentistPortal";');
    content = content.replace(/import AdminPortal from ".\/AdminPortal";/g, 'import AdminPortal from "../admin/AdminPortal";');
    content = content.replace(/import StaffPortal from ".\/StaffPortal";/g, 'import StaffPortal from "../staff/StaffPortal";');
    content = content.replace(/<DoctorPortal \/>/g, '<DentistPortal />');
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

updateImports(path.join(srcDir, 'admin', 'AdminPortal.tsx'), 'admin');
updateImports(path.join(srcDir, 'dentist', 'DentistPortal.tsx'), 'dentist');
updateImports(path.join(srcDir, 'staff', 'StaffPortal.tsx'), 'staff');
updateImports(path.join(srcDir, 'patient', 'PatientPortal.tsx'), 'patient');
