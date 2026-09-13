const fs = require('fs');

let file = fs.readFileSync('src/app/patient/booking/BookingView.tsx', 'utf8');

// Change initialization of selService and selDoctor
file = file.replace(
  /const \[selService, setSelService\] = useState<number \| null>\(initialService\);/,
  `const [selService, setSelService] = useState<number | null>(null);`
);

// We need to map initialService to index when servicesData loads
file = file.replace(
  /useEffect\(\(\) => \{\n    Promise\.all\(\[/,
  `useEffect(() => {
    if (servicesData.length > 0 && initialService !== null && selService === null) {
      const idx = servicesData.findIndex(s => s.serviceId === initialService);
      if (idx !== -1) setSelService(idx);
    }
  }, [servicesData, initialService, selService]);\n\n  useEffect(() => {\n    Promise.all([`
);

// We also should handle doctor mapping. selDoctor is already the doctor ID, so it doesn't need index mapping!
// But wait, the openTicketId fetch was:
// setSelDoctor(data.dentist_id);
// Which is correct.

// Wait, the fetch for openTicketId might override the initialService mapping.
// Let's modify the openTicketId fetch to only do things if they aren't already set correctly, or just rely on it.
// Actually, in the openTicketId fetch, I did:
// const idx = servicesData.findIndex(s => s.serviceId === actualServiceId);
// if (idx !== -1) setSelService(idx);
// This is correct. So why did it fail?
// Let's check if the fetch actually threw an error, or `openTicketId` wasn't passed correctly.
// Let's look at PatientPortal.tsx followUpProps again.
