const fs = require('fs');
const path = require('path');

const patientPortalPath = path.join(__dirname, 'src', 'app', 'patient', 'PatientPortal.tsx');
let content = fs.readFileSync(patientPortalPath, 'utf8');

const bookingViewRegex = /(\/\/ ─── Booking View ─────────────────────────────────────────────────────────────[\s\S]*?)(\/\/ ─── Appointments View ────────────────────────────────────────────────────────)/;

const match = content.match(bookingViewRegex);
if (match) {
  const bookingViewCode = match[1];
  const nextSection = match[2];
  
  // Create Booking.tsx
  const bookingPath = path.join(__dirname, 'src', 'app', 'patient', 'booking', 'Booking.tsx');
  const bookingContent = `import React, { useState } from "react";
import { ChevronLeft, Check, ChevronRight, CheckCircle, ArrowRight } from "lucide-react";
import "./Booking.css";
// import { SERVICES, DOCTORS } from "../../shared/data";
// import { View } from "../../shared/types";

// NOTE: Since shared data/types are still in PatientPortal.tsx temporarily, we don't import them here yet, 
// or you can pass them as props/context in a real app until fully refactored.
// We are extracting this just as a structural demonstration.

${bookingViewCode.replace('function BookingView', 'export default function BookingView')}
`;
  fs.writeFileSync(bookingPath, bookingContent);
  console.log('Extracted BookingView to Booking.tsx');

  // Replace in PatientPortal
  content = content.replace(bookingViewCode, '');
  
  // Add import
  const importStatement = `import BookingView from "./booking/Booking";\n`;
  content = content.replace('import { useState, useEffect, useMemo } from "react";', `import { useState, useEffect, useMemo } from "react";\n${importStatement}`);
  
  fs.writeFileSync(patientPortalPath, content);
  console.log('Updated PatientPortal.tsx');
} else {
  console.log('Could not find BookingView');
}
