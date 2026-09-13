const fs = require('fs');

let file = fs.readFileSync('src/app/patient/PatientPortal.tsx', 'utf8');

if (!file.includes('const openTicketId = urlParams.get(\'openTicketId\');')) {
  file = file.replace(
    /const serviceStr = urlParams\.get\('serviceId'\);/,
    `const serviceStr = urlParams.get('serviceId');\n    const openTicketId = urlParams.get('openTicketId');`
  );
  
  file = file.replace(
    /if \(planItem\) {/,
    `if (openTicketId) {
      setFollowUpProps({
        openTicketId: parseInt(openTicketId, 10),
        service: 1, doctor: 1 // to be overwritten by BookingView fetch
      });
      setView("login");
    } else if (planItem) {`
  );
  
  file = file.replace(
    /if \(urlParams\.get\('planItem'\) \|\| urlParams\.get\('followUp'\)\) {/,
    `if (urlParams.get('planItem') || urlParams.get('followUp') || urlParams.get('openTicketId')) {`
  );
}

fs.writeFileSync('src/app/patient/PatientPortal.tsx', file);
