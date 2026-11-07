import { Appointment, AppointmentBreakdown, ACTIVE_APPOINTMENT_STATUSES } from "../types/appointment";

export function getAppointmentBreakdown(appts: Appointment[]): AppointmentBreakdown {
  const completed = appts.filter(a => a.status === "เสร็จสิ้น").length;
  const scheduled = appts.filter(a => ACTIVE_APPOINTMENT_STATUSES.includes(a.status)).length;
  const cancelled = appts.filter(a => a.status === "ยกเลิก").length;
  const noShow = appts.filter(a => a.status === "ไม่มาตามนัด").length;
  return {
    completed,
    scheduled,
    cancelled,
    noShow,
    total: appts.length || 1,
  };
}

