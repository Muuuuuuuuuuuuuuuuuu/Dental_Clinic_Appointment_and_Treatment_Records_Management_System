const fs = require('fs');

let file = fs.readFileSync('src/app/patient/booking/BookingView.tsx', 'utf8');

if (!file.includes('const [isBoundDoctor, setIsBoundDoctor] = useState(false);')) {
  // Add supabase import
  file = file.replace(
    /import {([^}]+)} from "\.\.\/\.\.\/shared\/supabaseApi";/,
    `import { supabase, $1 } from "../../shared/supabaseApi";`
  );

  // Add state for binding
  file = file.replace(
    /const \[isSubmitting, setIsSubmitting\] = useState\(false\);/,
    `const [isSubmitting, setIsSubmitting] = useState(false);\n  const [isBoundDoctor, setIsBoundDoctor] = useState(false);`
  );

  // Add fetch for open ticket, AND handle initialService mapping
  // Using a more robust regex that ignores \r
  file = file.replace(
    /useEffect\(\(\) => \{\s*if \(step === 1 && selService !== null && servicesData\[selService\]\)/m,
    `useEffect(() => {
    if (openTicketId) {
      supabase.from('appointment').select('service_id, dentist_id, appointment_detail(service_id)').eq('appointment_id', openTicketId).single()
        .then(({ data, error }) => {
          if (!error && data) {
             const actualServiceId = data.appointment_detail?.[0]?.service_id || data.service_id;
             if (actualServiceId) {
                const idx = servicesData.findIndex(s => s.serviceId === actualServiceId);
                if (idx !== -1) setSelService(idx);
             }
             if (data.dentist_id) {
                setSelDoctor(data.dentist_id);
                setWantSelectDoctor(true);
                setIsBoundDoctor(true);
             }
          }
        });
    } else if (servicesData.length > 0 && initialService !== null && selService === null) {
      // Map initialService to index for normal Follow-up
      const idx = servicesData.findIndex(s => s.serviceId === initialService);
      if (idx !== -1) setSelService(idx);
    }
  }, [openTicketId, servicesData, initialService, selService]);\n\n  useEffect(() => {\n    if (step === 1 && selService !== null && servicesData[selService])`
  );

  // Initialize selService to null instead of initialService
  file = file.replace(
    /const \[selService, setSelService\] = useState<number \| null>\(initialService\);/,
    `const [selService, setSelService] = useState<number | null>(null);`
  );

  // OpenTicketId prop
  file = file.replace(
    /planItemId\?: number;/,
    `planItemId?: number;\n  openTicketId?: number;`
  );

  file = file.replace(
    /planItemId,/,
    `planItemId,\n  openTicketId,`
  );

  // Disable doctor selection if bound
  file = file.replace(
    /<div className="p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all hover:border-gray-300" onClick=\{\(\) => setWantSelectDoctor\(!wantSelectDoctor\)\}>/,
    `<div className={\`p-4 border rounded-xl flex items-center justify-between transition-all \${isBoundDoctor ? 'bg-gray-50 border-gray-200 opacity-80' : 'cursor-pointer hover:border-gray-300'}\`} onClick={() => !isBoundDoctor && setWantSelectDoctor(!wantSelectDoctor)}>`
  );

  file = file.replace(
    /<button \n                              key=\{d\.id\}\n                              onClick=\{\(\) => setSelDoctor\(d\.id\)\}/g,
    `<button 
                              key={d.id}
                              disabled={isBoundDoctor && selDoctor !== d.id}
                              onClick={() => !isBoundDoctor && setSelDoctor(d.id)}`
  );
  
  // Also visually show disabled state on buttons
  file = file.replace(
    /className=\{\`p-4 border rounded-xl text-left transition-all relative overflow-hidden group/g,
    `className={\`p-4 border rounded-xl text-left transition-all relative overflow-hidden group \${isBoundDoctor && selDoctor !== d.id ? 'opacity-50 cursor-not-allowed grayscale' : ''}`
  );
}

fs.writeFileSync('src/app/patient/booking/BookingView.tsx', file);
