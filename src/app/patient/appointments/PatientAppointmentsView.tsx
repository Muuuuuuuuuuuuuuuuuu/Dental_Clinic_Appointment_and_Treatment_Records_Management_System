import React from "react";
import { View, PatientUser } from "../types";
import { Appointment } from "@/app/shared/data";
import { usePatientAppointments } from "./hooks/usePatientAppointments";
import {
  AppointmentTitleBar,
  AppointmentCard,
  EmptyAppointmentState,
} from "./components";

interface AppointmentsProps {
  user: PatientUser;
  setView: (v: View) => void;
  appointments?: Appointment[];
  onUpdateAppt?: (id: number, updates: Partial<Appointment>) => void;
  onBookFollowUp?: (serviceId: number, doctorId: number, openTicketId?: number) => void;
}

/**
 * 📅 Patient Appointments Module - Flat & Clean Architecture
 */
export default function PatientAppointmentsView({
  user,
  setView,
  appointments: globalAppointments,
  onUpdateAppt,
  onBookFollowUp,
}: AppointmentsProps) {
  const {
    cancelId,
    setCancelId,
    expiringIds,
    activeAppts,
    doCancel,
  } = usePatientAppointments(user, globalAppointments, onUpdateAppt);

  return (
    <div>
      <AppointmentTitleBar onNewBooking={() => setView("booking")} />
      <div className="space-y-4">
        {activeAppts.length === 0 ? (
          <EmptyAppointmentState />
        ) : (
          activeAppts.map((a) => (
            <AppointmentCard
              key={a.id}
              appt={a}
              isExpiring={expiringIds.has(a.id)}
              cancelId={cancelId}
              onSetCancelId={setCancelId}
              onDoCancel={doCancel}
              onBookFollowUp={onBookFollowUp}
            />
          ))
        )}
      </div>
    </div>
  );
}
