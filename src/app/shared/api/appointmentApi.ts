import { getDailyHours, getWeeklyOffDays } from './clinicApi';
import { supabase, supabaseAdmin } from './supabaseClient';
import { Appointment, ACTIVE_APPOINTMENT_STATUSES, AppointmentStatus } from "@/app/shared/data";

/** สถานะนัดหมายที่ถือว่าครองเวลาคิวของทันตแพทย์และคนไข้ (ไม่รวม ยกเลิก และ ไม่มาตามนัด) */
const OCCUPIED_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  ...ACTIVE_APPOINTMENT_STATUSES,
  "เสร็จสิ้น"
];

function getLocalTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return new Date(dateStr).getDay();
  return new Date(y, m - 1, d).getDay();
}

/**
 * โมดูลจัดการข้อมูลนัดหมาย
 * จัดการระบบนัดหมาย, คิว, และตารางเวลา
 */
/**
 * แจ้งเตือนการเปลี่ยนแปลงข้อมูลนัดหมาย
 * รองรับทั้ง CustomEvent ภายในแท็บ, BroadcastChannel ข้ามแท็บ, และ Storage Event
 */
let apptBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    apptBroadcastChannel = new BroadcastChannel('icemu-updates');
  } catch (e) {}
}

export function notifyAppointmentsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('appointments-updated'));
    if (apptBroadcastChannel) {
      try {
        apptBroadcastChannel.postMessage({ type: 'appointments-updated', timestamp: Date.now() });
      } catch (e) {}
    }
    try {
      localStorage.setItem('icemu-sync-update', Date.now().toString());
    } catch (e) {}
  }
}


export async function getAppointments(date?: string) {
  let query = supabase.from('appointment').select(`
    *,
    patient (
      *,
      users ( profile (first_name, last_name, phone_number) ),
      patient_allergy (allergy_name),
      patient_disease (disease_name)
    ),
    appointment_detail ( service_id, price_at_booking, service (service_id, service_name, base_price, estimated_time) ),
    dentist ( staff ( users ( profile (first_name, last_name) ) ) ),
    treatment_record ( attending_dentist_id, doctor_note, odontogram_data, attending_dentist:dentist ( staff ( users ( profile (first_name, last_name) ) ) ), payment (total_amount, payment_status), treatment_detail ( service_id, location_code, quantity, actual_price, service (service_name) ), treatment_product ( product_id, quantity, actual_price, product (product_name, unit) ) )
  `);

  if (date) query = query.eq('appointment_date', date);
  const { data, error } = await query;
  if (error) {
    console.error("getAppointments error:", error);
    return [];
  }

  return data.map((d: any) => {
    const p = d.patient?.users?.profile;
    // นำบริการทั้งหมดมารวมเป็น string เดียว
    let services = d.appointment_detail?.map((ad: any) => ad.service?.service_name).join(', ') || 'ไม่ได้ระบุบริการ';
    if (d.note?.includes("นัดตัดไหม") || d.note?.includes("(นัดตัดไหม)") || d.note?.includes("[บริการ: ตัดไหม]")) {
      services = "ตัดไหม";
    }

    let doctorName = 'รอระบุแพทย์';
    let doctorId = Number(d.dentist_id) || 0;

    const dentistProfile = d.dentist?.staff?.users?.profile || d.dentist?.users?.profile;
    if (dentistProfile) {
      doctorName = `${dentistProfile.first_name} ${dentistProfile.last_name}`;
    }

    let cost = d.appointment_detail?.[0]?.price_at_booking || d.appointment_detail?.[0]?.service?.base_price || 0;
    let paid = false;
    let treatmentNotes = '';
    let recommendations = '';
    let treatmentServices: string[] = [];
    let detailedServices: any[] = [];

    if (d.treatment_record) {
      const tr = Array.isArray(d.treatment_record) ? d.treatment_record[0] : d.treatment_record;
      if (tr) {
        const docProf = tr.attending_dentist?.staff?.users?.profile || tr.attending_dentist?.users?.profile;
        if (tr.attending_dentist_id && !doctorId) {
          doctorId = Number(tr.attending_dentist_id);
        }
        if (docProf && (!dentistProfile || doctorName === 'รอระบุแพทย์')) {
          doctorName = `${docProf.first_name} ${docProf.last_name}`;
        }
        treatmentNotes = tr.doctor_note || '';
        recommendations = tr.recommendations || '';
        treatmentServices = tr.treatment_services || [];

        if (tr.doctor_note && tr.doctor_note.includes("|||")) {
          let rawNote = tr.doctor_note;
          const parts = rawNote.split("|||");
          if (treatmentServices.length === 0) {
            try { treatmentServices = JSON.parse(parts[0]); } catch (e) { }
          }
          rawNote = parts.slice(1).join("|||");
          const noteParts = rawNote.split('\\nคำแนะนำ: ');
          treatmentNotes = noteParts[0];
          if (!recommendations && noteParts.length > 1) recommendations = noteParts[1];
        }
      }

      if (tr && tr.treatment_detail) {
        const seenDetailKeys = new Set<string>();
        const servicesData = tr.treatment_detail
          .filter((td: any) => {
            const key = `${td.service_id}-${td.location_code || ''}`;
            if (seenDetailKeys.has(key)) return false;
            seenDetailKeys.add(key);
            return true;
          })
          .map((td: any) => ({
            serviceId: td.service_id,
            name: td.service?.service_name || td.diagnosis || 'ไม่ระบุ',
            locationCode: td.location_code,
            qty: td.quantity,
            price: td.actual_price
          }));
        detailedServices = [...detailedServices, ...servicesData];
      }
      
      if (tr && tr.treatment_product) {
        const productServices = tr.treatment_product.map((tp: any) => ({
          serviceId: `prod-${tp.product_id}`,
          name: tp.product?.product_name || 'ไม่ระบุ',
          qty: tp.quantity,
          price: tp.actual_price
        }));
        detailedServices = [...detailedServices, ...productServices];
      }

      // คำนวณค่าใช้จ่ายจริงจากรายการหัตถการและเวชภัณฑ์ที่บันทึกไว้
      if (detailedServices.length > 0) {
        cost = detailedServices.reduce((sum, s) => sum + (s.price * s.qty), 0);
      }

      if (tr && tr.payment) {
        const pay = Array.isArray(tr.payment) ? tr.payment[0] : tr.payment;
        if (pay) {
          cost = pay.total_amount !== undefined && pay.total_amount !== null ? pay.total_amount : cost;
          paid = pay.payment_status === 'ชำระแล้ว';
        }
      }
    }

    return {
      id: d.appointment_id,
      patientId: d.patient_id,
      hn: `HN${String(d.patient_id).padStart(3, '0')}`,
      patientName: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      patientPhone: p?.phone_number || '',
      service: services,
      serviceId: Number(d.appointment_detail?.[0]?.service_id || d.appointment_detail?.[0]?.service?.service_id) || 0,
      durationMins: Number(d.appointment_detail?.[0]?.service?.estimated_time) || 30,
      doctorName,
      doctorId,
      date: d.appointment_date,
      time: d.start_time?.slice(0, 5) || '00:00',
      endTime: d.end_time_est?.slice(0, 5) || d.start_time?.slice(0, 5) || '00:00',
      status: d.appointment_status || 'ยืนยันการจอง',
      conditions: d.patient?.patient_disease && d.patient.patient_disease.length > 0 
        ? d.patient.patient_disease.map((a: any) => a.disease_name).join(', ') 
        : 'ไม่มี',
      allergies: d.patient?.patient_allergy && d.patient.patient_allergy.length > 0 
        ? d.patient.patient_allergy.map((a: any) => a.allergy_name).join(', ') 
        : 'ไม่มีประวัติ',
      treatmentNotes,
      recommendations,
      treatmentServices,
      detailedServices,
      cost,
      paid,
      note: d.note,
      odontogramData: d.treatment_record ? (Array.isArray(d.treatment_record) ? d.treatment_record[0]?.odontogram_data : d.treatment_record.odontogram_data) : undefined
    };
  }) as Appointment[];
}

// --- Patient-specific: ดึงเฉพาะนัดหมายของคนไข้ที่ล็อกอินอยู่ ---
export async function getPatientAppointments(patientId?: number) {
  let targetPatientId = patientId;

  if (!targetPatientId) {
    // ดึง user ที่ล็อกอินอยู่
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return [];

    // หา patient_id จาก user_id
    const { data: patientData } = await supabase
      .from('patient')
      .select('patient_id')
      .eq('user_id', authUser.id)
      .single();

    if (!patientData) return [];
    targetPatientId = patientData.patient_id;
  }

  const { data, error } = await supabase.from('appointment').select(`
    *,
    patient (
      *,
      users ( profile (first_name, last_name, phone_number) ),
      patient_allergy (allergy_name),
      patient_disease (disease_name)
    ),
    appointment_detail ( service_id, price_at_booking, service (service_id, service_name, base_price, estimated_time) ),
    dentist ( staff ( users ( profile (first_name, last_name) ) ) ),
    treatment_record ( attending_dentist_id, doctor_note, payment (total_amount, payment_status), attending_dentist:dentist ( staff ( users ( profile (first_name, last_name) ) ) ), treatment_detail ( service_id, location_code, quantity, actual_price, service (service_name) ) )
  `).eq('patient_id', targetPatientId);

  if (error) {
    console.error("getPatientAppointments error:", error);
    return [];
  }

  return data.map((d: any) => {
    const p = d.patient?.users?.profile;
    const services = d.appointment_detail?.map((ad: any) => ad.service?.service_name).join(', ') || 'ไม่ได้ระบุบริการ';

    let doctorName = 'รอระบุแพทย์';
    let doctorId = Number(d.dentist_id) || 0;

    const dentistProfile = d.dentist?.staff?.users?.profile || d.dentist?.users?.profile;
    if (dentistProfile) {
      doctorName = `${dentistProfile.first_name} ${dentistProfile.last_name}`;
    }
    let cost = 0;
    let paid = false;
    let treatmentNotes = '';
    let recommendations = '';
    let detailedServices: any[] = [];

    if (d.treatment_record) {
      const tr = Array.isArray(d.treatment_record) ? d.treatment_record[0] : d.treatment_record;
      if (tr) {
        const docProf = tr.attending_dentist?.staff?.users?.profile || tr.attending_dentist?.users?.profile;
        if (docProf) {
          doctorName = `${docProf.first_name} ${docProf.last_name}`;
          doctorId = Number(tr.attending_dentist_id) || doctorId;
        }
        if (tr.doctor_note) {
          const parts = tr.doctor_note.split('\\nคำแนะนำ: ');
          treatmentNotes = parts[0];
          if (parts.length > 1) recommendations = parts[1];
        }
        if (tr.payment) {
          const pay = Array.isArray(tr.payment) ? tr.payment[0] : tr.payment;
          if (pay) {
            cost = pay.total_amount || 0;
            paid = pay.payment_status === 'ชำระแล้ว';
          }
        }
        if (tr.treatment_detail) {
          detailedServices = tr.treatment_detail.map((td: any) => ({
            serviceId: td.service_id,
            name: td.service?.service_name || 'ไม่ระบุ',
            locationCode: td.location_code,
            qty: td.quantity,
            price: td.actual_price
          }));
        }
      }
    }

    return {
      id: d.appointment_id,
      patientId: d.patient_id,
      hn: `HN${String(d.patient_id).padStart(3, '0')}`,
      patientName: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      patientPhone: p?.phone_number || '',
      service: services,
      serviceId: Number(d.appointment_detail?.[0]?.service_id || d.appointment_detail?.[0]?.service?.service_id) || 0,
      durationMins: Number(d.appointment_detail?.[0]?.service?.estimated_time) || 30,
      doctorName,
      doctorId,
      date: d.appointment_date,
      time: d.start_time?.slice(0, 5) || '00:00',
      endTime: d.end_time_est?.slice(0, 5) || d.start_time?.slice(0, 5) || '00:00',
      status: d.appointment_status || 'ยืนยันการจอง',
      conditions: d.patient?.patient_disease && d.patient.patient_disease.length > 0 
        ? d.patient.patient_disease.map((a: any) => a.disease_name).join(', ') 
        : 'ไม่มี',
      allergies: d.patient?.patient_allergy && d.patient.patient_allergy.length > 0 
        ? d.patient.patient_allergy.map((a: any) => a.allergy_name).join(', ') 
        : 'ไม่มีประวัติ',
      treatmentNotes,
      recommendations,
      detailedServices,
      cost,
      paid,
      note: d.note,
      odontogramData: d.treatment_record ? (Array.isArray(d.treatment_record) ? d.treatment_record[0]?.odontogram_data : d.treatment_record.odontogram_data) : undefined
    };
  }) as Appointment[];
}

// --- Patient-specific: ดึงเฉพาะประวัติการรักษาของคนไข้ที่ล็อกอินอยู่ ---

async function getActiveDentistsList() {
  const { data: allDentistsData } = await supabase
    .from('dentist')
    .select('dentist_id, staff_id, is_active, staff(employment_status, users(account_status))');

  return (allDentistsData || []).filter((d: any) => {
    if (d.is_active === false) return false;
    const staffObj = Array.isArray(d.staff) ? d.staff[0] : d.staff;
    if (staffObj?.employment_status === 'พักงาน' || staffObj?.employment_status === 'ลาออก') return false;
    const userObj = Array.isArray(staffObj?.users) ? staffObj?.users[0] : staffObj?.users;
    if (userObj?.account_status && userObj.account_status !== 'active') return false;
    return true;
  }).map((d: any) => ({
    dentist_id: Number(d.dentist_id),
    staff_id: d.staff_id ? Number(d.staff_id) : null
  }));
}

export async function addAppointment(appointment: Omit<Appointment, 'id'> & { id?: number }) {
  // 0. ค้นหารหัสบริการ (service_id) และระยะเวลาหัตถการจริงจากฐานข้อมูลก่อน
  let finalServiceId = appointment.serviceId ? Number(appointment.serviceId) : 0;
  let svcEstimatedTime = 30;
  let priceAtBooking = 0;

  const { data: svcData } = await supabase
    .from('service')
    .select('service_id, service_name, base_price, category, estimated_time');

  if (svcData && svcData.length > 0) {
    let matchedSvc = svcData.find((s: any) => Number(s.service_id) === finalServiceId && finalServiceId !== 9999);
    if (!matchedSvc) {
      matchedSvc = svcData.find((s: any) =>
        s.service_name === appointment.service ||
        (appointment.service && (appointment.service.includes(s.service_name) || s.service_name.includes(appointment.service)))
      );
      if (!matchedSvc && appointment.service === "ตัดไหม") {
        try {
          const { data: createdSvc } = await supabase.from('service').insert({
            service_name: 'ตัดไหม',
            description: 'บริการตัดไหมแผลผ่าตัด/ถอนฟัน',
            base_price: 0,
            max_price: 0,
            category: 'ศัลยกรรมช่องปาก (Oral Surgery)',
            estimated_time: 15,
            is_active: true,
            is_public: false,
            apply_to: 'MOUTH'
          }).select().single();
          if (createdSvc) matchedSvc = createdSvc;
        } catch (e) {
          // หากไม่มีสิทธิ์ insert ให้ใช้หมวดศัลยกรรมช่องปากเป็น fallback
        }
        if (!matchedSvc) {
          matchedSvc = svcData.find((s: any) => s.category?.includes("ศัลยกรรม") || s.service_name?.includes("ผ่า") || s.service_name?.includes("ถอน"));
        }
      }
    }
    if (matchedSvc) {
      finalServiceId = Number(matchedSvc.service_id);
      svcEstimatedTime = Number(matchedSvc.estimated_time) || 30;
      priceAtBooking = Number(matchedSvc.base_price) || 0;
    } else {
      finalServiceId = Number(svcData[0]?.service_id) || 1;
      svcEstimatedTime = Number(svcData[0]?.estimated_time) || 30;
      priceAtBooking = Number(svcData[0]?.base_price) || 0;
    }
  }

  const duration = Number(appointment.durationMins) || svcEstimatedTime || 30;

  // 1. ตรวจสอบคิวซ้ำของแพทย์ในระดับฐานข้อมูล (กรณีระบุแพทย์มาแล้ว)
  const reqDoctorId = appointment.doctorId ? Number(appointment.doctorId) : 0;
  if (reqDoctorId > 0 && appointment.date && appointment.time) {
    let overlapQuery = supabase.from('appointment')
      .select('appointment_id, appointment_date, start_time, end_time_est, appointment_status')
      .eq('dentist_id', reqDoctorId)
      .eq('appointment_date', appointment.date);
    if (appointment.id) {
      overlapQuery = overlapQuery.neq('appointment_id', Number(appointment.id));
    }
    const { data: overlapping } = await overlapQuery;

    if (overlapping && overlapping.length > 0) {
      const [newH, newM] = (appointment.time || "00:00").split(':').map(Number);
      const newStartMins = (newH * 60) + newM;
      const newEndMins = newStartMins + duration;

      for (const apptData of overlapping) {
        if (apptData.appointment_status === 'ยกเลิก' || apptData.appointment_status === 'ไม่มาตามนัด') continue;
        if (!apptData.start_time || !apptData.end_time_est) continue;

        const [existH, existM] = apptData.start_time.split(':').map(Number);
        const existStartMins = (existH * 60) + existM;
        const [existEH, existEM] = apptData.end_time_est.split(':').map(Number);
        const existEndMins = (existEH * 60) + existEM;

        if (newStartMins < existEndMins && newEndMins > existStartMins) {
          throw new Error(`คิวทับซ้อน: ทันตแพทย์ติดคิวเวลา ${apptData.start_time.substring(0, 5)} - ${apptData.end_time_est.substring(0, 5)} แล้ว`);
        }
      }
    }
  }

  // 2. ค้นหาและระบุรหัสคนไข้ (patient_id)
  let finalPatientId = appointment.patientId ? Number(appointment.patientId) : undefined;
  if (!finalPatientId) {
    const { data: patData } = await supabase.from('patient').select('patient_id, users!inner(profile!inner(first_name, last_name, phone_number, citizen_id))');
    if (patData && patData.length > 0) {
      const matched = patData.find((p: any) =>
        (appointment.walkInRegistration && p.users?.profile?.citizen_id === appointment.walkInRegistration.citizenId) ||
        (appointment.patientPhone && p.users?.profile?.phone_number === appointment.patientPhone)
      );
      if (matched) finalPatientId = Number(matched.patient_id);
    }

    if (!finalPatientId) {
      if (appointment.walkInRegistration) {
        const reg = appointment.walkInRegistration;
        let finalUserId = crypto.randomUUID();

        if (reg.email && reg.password) {
          const adminAuthClient = supabaseAdmin;
          const { data: authData, error: authErr } = await adminAuthClient.auth.admin.createUser({
            email: reg.email,
            password: reg.password,
            email_confirm: true
          });
          if (authErr) throw new Error(`ไม่สามารถสร้างบัญชีผู้ใช้ได้: ${authErr.message}`);
          if (authData.user) {
            finalUserId = authData.user.id as any;
          }
        }

        await supabase.from('profile').upsert({
          citizen_id: reg.citizenId,
          first_name: reg.firstName,
          last_name: reg.lastName,
          phone_number: appointment.patientPhone || '',
          gender: reg.gender,
          birth_date: reg.dob || null,
          current_address: reg.address || null
        }, { onConflict: 'citizen_id' });

        await supabase.from('users').upsert({
          user_id: finalUserId,
          citizen_id: reg.citizenId,
          email: reg.email || null,
          role: 'คนไข้',
          account_status: 'active'
        }, { onConflict: 'user_id' });

        const { data: newPat } = await supabase.from('patient').insert({ user_id: finalUserId }).select().single();
        finalPatientId = Number(newPat.patient_id);
      } else {
        const mockUserId = crypto.randomUUID();
        const mockCitizenId = '99' + Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
        const names = appointment.patientName.split(' ');
        await supabase.from('profile').insert({
          citizen_id: mockCitizenId,
          first_name: names[0] || 'Unknown',
          last_name: names.slice(1).join(' ') || '',
          phone_number: appointment.patientPhone || ''
        });
        await supabase.from('users').insert({
          user_id: mockUserId,
          citizen_id: mockCitizenId,
          role: 'คนไข้',
          account_status: 'active'
        });
        const { data: newPat } = await supabase.from('patient').insert({ user_id: mockUserId }).select().single();
        finalPatientId = Number(newPat.patient_id);
      }
    }
  }

  // อัปเดตข้อมูลสุขภาพและประวัติแพ้ยาของคนไข้หากมีการระบุมาพร้อมการจอง
  if (finalPatientId && (appointment.allergies || appointment.conditions)) {
    if (appointment.allergies && appointment.allergies !== 'ไม่มี' && appointment.allergies !== 'ไม่มีประวัติ') {
      await supabase.from('patient_allergy').delete().eq('patient_id', finalPatientId);
      const allergies = appointment.allergies.split(',').map(s => s.trim()).filter(s => s);
      for (const a of allergies) {
        await supabase.from('patient_allergy').insert({ patient_id: finalPatientId, allergy_name: a });
      }
    }
    if (appointment.conditions && appointment.conditions !== 'ไม่มี' && appointment.conditions !== 'ไม่มีประวัติ') {
      await supabase.from('patient_disease').delete().eq('patient_id', finalPatientId);
      const diseases = appointment.conditions.split(',').map(s => s.trim()).filter(s => s);
      for (const d of diseases) {
        await supabase.from('patient_disease').insert({ patient_id: finalPatientId, disease_name: d });
      }
    }
  }

  // อัปเดตข้อมูลผู้ติดต่อฉุกเฉินหากมีการระบุ
  if (finalPatientId && (appointment.emergencyName || appointment.emergencyPhone || appointment.emergencyRelationship)) {
    const ecUpdates: Record<string, any> = {};
    if (appointment.emergencyName) ecUpdates.contact_name = appointment.emergencyName;
    if (appointment.emergencyPhone) ecUpdates.contact_phone = appointment.emergencyPhone;
    if (appointment.emergencyRelationship) ecUpdates.relationship = appointment.emergencyRelationship;

    const { data: existing } = await supabase
      .from('emergency_contact')
      .select('emergency_id')
      .eq('patient_id', finalPatientId)
      .maybeSingle();

    if (existing) {
      await supabase.from('emergency_contact').update(ecUpdates).eq('emergency_id', existing.emergency_id);
    } else {
      await supabase.from('emergency_contact').insert({
        patient_id: finalPatientId,
        contact_name: appointment.emergencyName || '-',
        contact_phone: appointment.emergencyPhone || '-',
        relationship: appointment.emergencyRelationship || 'ไม่ได้ระบุ',
      });
    }
  }

  // 2.5 ตรวจสอบไม่ให้คนไข้คนเดิมจองเวลาซ้ำซ้อนกัน
  if (finalPatientId && appointment.date && appointment.time) {
    let overlapPatQuery = supabase.from('appointment')
      .select('appointment_id, appointment_date, start_time, end_time_est, appointment_status')
      .eq('patient_id', finalPatientId)
      .eq('appointment_date', appointment.date);
    if (appointment.id) {
      overlapPatQuery = overlapPatQuery.neq('appointment_id', Number(appointment.id));
    }
    const { data: overlappingPat } = await overlapPatQuery;

    if (overlappingPat && overlappingPat.length > 0) {
      const [newH, newM] = (appointment.time || "00:00").split(':').map(Number);
      const newStartMins = (newH * 60) + newM;
      const newEndMins = newStartMins + duration;

      for (const apptData of overlappingPat) {
        if (apptData.appointment_status === 'ยกเลิก' || apptData.appointment_status === 'ไม่มาตามนัด') continue;
        if (!apptData.start_time || !apptData.end_time_est) continue;

        const [existH, existM] = apptData.start_time.split(':').map(Number);
        const existStartMins = (existH * 60) + existM;
        const [existEH, existEM] = apptData.end_time_est.split(':').map(Number);
        const existEndMins = (existEH * 60) + existEM;

        if (newStartMins < existEndMins && newEndMins > existStartMins) {
          throw new Error(`คิวทับซ้อน: คนไข้มีนัดหมายในช่วงเวลา ${apptData.start_time.substring(0, 5)} - ${apptData.end_time_est.substring(0, 5)} อยู่แล้ว`);
        }
      }
    }
  }

  // 3. จัดสรรทันตแพทย์อัตโนมัติ (กรณีไม่ได้ระบุแพทย์ หรือเลือก "ท่านใดก็ได้")
  let finalDoctorId: number | undefined = reqDoctorId > 0 ? reqDoctorId : undefined;
  if (!finalDoctorId && appointment.date && appointment.time) {
    const activeDentists = await getActiveDentistsList();
    const { data: dsData } = await supabase.from('dentist_service').select('dentist_id').eq('service_id', finalServiceId);

    let candidateDentists = activeDentists;
    if (dsData && dsData.length > 0) {
      const dsIds = new Set(dsData.map((d: any) => Number(d.dentist_id)));
      const matched = activeDentists.filter(d => dsIds.has(d.dentist_id));
      if (matched.length > 0) candidateDentists = matched;
    }

    if (candidateDentists.length === 0) {
      throw new Error("ไม่มีทันตแพทย์ปฏิบัติงานสำหรับบริการนี้");
    }

    const dayOfWeekInt = parseDateDayOfWeek(appointment.date);
    const [dailyHours, shiftsRes, leavesRes, dayApptsRes] = await Promise.all([
      getDailyHours(),
      supabase.from('schedule').select('staff_id, start_shift, end_shift, is_off').eq('day_of_week', dayOfWeekInt),
      supabase.from('leave_record').select('staff_id, leave_period').eq('leave_date', appointment.date).eq('is_approved', true),
      supabase.from('appointment').select('appointment_id, dentist_id, start_time, end_time_est, appointment_status').eq('appointment_date', appointment.date)
    ]);

    const dayHours = dailyHours[dayOfWeekInt.toString()];
    const [openH, openM] = (dayHours?.open || "09:00").split(':').map(Number);
    const [closeH, closeM] = (dayHours?.close || "20:00").split(':').map(Number);
    const clinicOpenMin = openH * 60 + openM;
    const clinicCloseMin = closeH * 60 + closeM;

    const shifts = shiftsRes.data || [];
    const leaves = leavesRes.data || [];
    const dayAppts = (dayApptsRes.data || []).filter((a: any) =>
      a.appointment_status !== 'ยกเลิก' &&
      a.appointment_status !== 'ไม่มาตามนัด' &&
      (!appointment.id || Number(a.appointment_id) !== Number(appointment.id))
    );

    const [hh, mm] = (appointment.time || "00:00").split(':').map(Number);
    const startMins = (hh * 60) + mm;
    const endMins = startMins + duration;

    const availableDentists: number[] = [];

    for (const doc of candidateDentists) {
      const dId = doc.dentist_id;
      const sId = doc.staff_id;

      // 3.1 ตรวจสอบวันลาของแพทย์
      const docLeave = leaves.find((l: any) => l.staff_id && sId && Number(l.staff_id) === sId);
      if (docLeave) {
        if (docLeave.leave_period === 'เต็มวัน') continue;
        if (docLeave.leave_period === 'ครึ่งวันเช้า' && startMins < 13 * 60) continue;
        if (docLeave.leave_period === 'ครึ่งวันบ่าย' && endMins > 13 * 60) continue;
      }

      // 3.2 ตรวจสอบตารางเวรของแพทย์
      const shift = shifts.find((s: any) => s.staff_id && sId && Number(s.staff_id) === sId);
      if (shift && shift.is_off) continue;

      let shiftStartMin = clinicOpenMin;
      let shiftEndMin = clinicCloseMin;
      if (shift && shift.start_shift && shift.end_shift) {
        const [sH, sM] = shift.start_shift.split(':').map(Number);
        const [eH, eM] = shift.end_shift.split(':').map(Number);
        shiftStartMin = sH * 60 + sM;
        shiftEndMin = eH * 60 + eM;
      }
      if (startMins < shiftStartMin || endMins > shiftEndMin) continue;

      // 3.3 ตรวจสอบว่าติดคิวนัดหมายอื่นในช่วงเวลานี้หรือไม่
      const docAppts = dayAppts.filter((a: any) => Number(a.dentist_id) === dId);
      let isBusy = false;
      for (const appt of docAppts) {
        if (!appt.start_time || !appt.end_time_est) continue;
        const [eH, eM] = appt.start_time.split(':').map(Number);
        const eStart = (eH * 60) + eM;
        const [eeH, eeM] = appt.end_time_est.split(':').map(Number);
        const eEnd = (eeH * 60) + eeM;
        if (startMins < eEnd && endMins > eStart) {
          isBusy = true;
          break;
        }
      }

      if (!isBusy) {
        availableDentists.push(dId);
      }
    }

    if (availableDentists.length > 0) {
      finalDoctorId = availableDentists[Math.floor(Math.random() * availableDentists.length)];
    } else {
      throw new Error("ไม่มีทันตแพทย์ว่างในช่วงเวลานี้ กรุณาเลือกเวลาอื่น");
    }
  }

  // คำนวณเวลาสิ้นสุดโดยประมาณจากระยะเวลาหัตถการ
  const [hh, mm] = (appointment.time || "00:00").split(':').map(Number);
  const totalMins = (hh * 60) + mm + duration;
  const endHh = Math.floor(totalMins / 60);
  const endMm = totalMins % 60;
  const endTimeStr = `${String(endHh).padStart(2, '0')}:${String(endMm).padStart(2, '0')}:00`;
  const cleanStartTime = appointment.time ? (appointment.time.length === 5 ? appointment.time + ':00' : appointment.time) : null;

  // 4. บันทึกหรืออัปเดตข้อมูลนัดหมาย
  const apptPayload = {
    patient_id: finalPatientId,
    dentist_id: finalDoctorId || null,
    appointment_date: appointment.date || null,
    start_time: cleanStartTime,
    end_time_est: appointment.time ? endTimeStr : null,
    appointment_status: appointment.status,
    channel: appointment.source === 'doctor' ? 'Walk-in' : 'ออนไลน์',
    note: appointment.note || null
  };

  let newAppt, apptErr;
  if (appointment.id) {
    const res = await supabase.from('appointment').update(apptPayload).eq('appointment_id', Number(appointment.id)).select().single();
    newAppt = res.data;
    apptErr = res.error;
  } else {
    const res = await supabase.from('appointment').insert(apptPayload).select().single();
    newAppt = res.data;
    apptErr = res.error;
  }

  if (apptErr) throw apptErr;

  // 5. บันทึกหรืออัปเดตรายละเอียดบริการของนัดหมาย
  if (appointment.id) {
    const { error: detailErr } = await supabase.from('appointment_detail').update({ service_id: finalServiceId, price_at_booking: priceAtBooking || 0 }).eq('appointment_id', newAppt.appointment_id);
    if (detailErr) console.error("Error updating appointment detail:", detailErr);
  } else {
    const { error: detailErr } = await supabase.from('appointment_detail').insert({
      appointment_id: newAppt.appointment_id,
      service_id: finalServiceId,
      price_at_booking: priceAtBooking || 0
    });
    if (detailErr) console.error("Error inserting appointment detail:", detailErr);
  }

  // 6. อัปเดตระเบียนการรักษา (ถ้ามีระเบียนอยู่แล้วจากการรักษาจริง ให้ซิงค์แพทย์และวันที่)
  if (finalDoctorId) {
    const { data: existingTr } = await supabase.from('treatment_record').select('treatment_id').eq('appointment_id', newAppt.appointment_id).maybeSingle();
    if (existingTr) {
      const { error: trErr } = await supabase.from('treatment_record').update({
        attending_dentist_id: finalDoctorId,
        treatment_date: appointment.date
      }).eq('treatment_id', existingTr.treatment_id);
      if (trErr) console.error("Error updating treatment record:", trErr);
    }
  }

  notifyAppointmentsUpdated();
  return { ...newAppt, assignedDoctorId: finalDoctorId, serviceId: finalServiceId, durationMins: duration };
}

export async function updateAppointmentStatus(id: number, status: string, _reason?: string) {
  const { data, error } = await supabase.from('appointment').update({ appointment_status: status }).eq('appointment_id', Number(id)).select().single();
  if (error) {
    console.error("Failed to update appointment status:", error);
    throw error;
  }

  if (status === "ยกเลิก" || status === "ไม่มาตามนัด") {
    await supabase
      .from('treatment_record')
      .delete()
      .eq('appointment_id', Number(id))
      .eq('doctor_note', '')
      .is('odontogram_data', null);
  }

  notifyAppointmentsUpdated();
  return { id: data.appointment_id, status: data.appointment_status } as any;
}


export async function checkAppointmentConflicts(identifier: string | number, date: string, startTime?: string, endTime?: string) {
  let dentistId: number | null = null;
  if (typeof identifier === 'number') {
    dentistId = identifier;
  } else if (identifier.length > 20) {
    const { data: staffData } = await supabase.from('staff').select('dentist(dentist_id)').eq('user_id', identifier).maybeSingle();
    dentistId = staffData?.dentist?.[0]?.dentist_id || null;
    if (!dentistId) {
      const { data: staffData2 } = await supabase.from('staff').select('staff_id, dentist(dentist_id)').eq('staff_id', Number(identifier) || 0).maybeSingle();
      dentistId = staffData2?.dentist?.[0]?.dentist_id || null;
    }
  } else {
    dentistId = parseInt(identifier, 10);
  }

  if (!dentistId) {
    return { hasConflict: false, count: 0 };
  }

  let query = supabase.from('appointment')
    .select('appointment_id', { count: 'exact' })
    .eq('dentist_id', dentistId)
    .eq('appointment_date', date)
    .in('appointment_status', OCCUPIED_APPOINTMENT_STATUSES);

  if (startTime && endTime) {
    query = query.lt('start_time', endTime).gt('end_time_est', startTime);
  }

  const { count, error } = await query;
  if (error) {
    console.error("checkAppointmentConflicts error:", error);
    throw error;
  }

  return { hasConflict: count! > 0, count: count! };
}


export async function updateAppointmentDetails(id: number, updates: any) {
  const apptId = Number(id);
  const { data: currentAppt } = await supabase
    .from('appointment')
    .select('*, appointment_detail(service(estimated_time))')
    .eq('appointment_id', apptId)
    .maybeSingle();

  const estDuration =
    Number(updates.durationMins) ||
    Number((currentAppt as any)?.appointment_detail?.[0]?.service?.estimated_time) ||
    30;

  const targetDate = updates.date !== undefined ? updates.date : currentAppt?.appointment_date;
  const targetDoctorId = updates.doctorId !== undefined ? Number(updates.doctorId) : Number(currentAppt?.dentist_id);
  const targetPatientId = Number(currentAppt?.patient_id);
  const targetTime =
    updates.time !== undefined
      ? updates.time
      : currentAppt?.start_time
        ? currentAppt.start_time.slice(0, 5)
        : null;

  // ตรวจสอบคิวซ้อนเมื่อมีการเปลี่ยนวัน เวลา หรือโอนย้ายแพทย์
  if (targetDate && targetTime) {
    const [newH, newM] = targetTime.split(':').map(Number);
    const newStartMins = newH * 60 + newM;
    const newEndMins = newStartMins + estDuration;

    if (targetDoctorId > 0) {
      const { data: docOverlaps } = await supabase
        .from('appointment')
        .select('appointment_id, start_time, end_time_est, appointment_status')
        .eq('dentist_id', targetDoctorId)
        .eq('appointment_date', targetDate)
        .neq('appointment_id', apptId);

      if (docOverlaps) {
        for (const app of docOverlaps) {
          if (app.appointment_status === 'ยกเลิก' || app.appointment_status === 'ไม่มาตามนัด') continue;
          if (!app.start_time || !app.end_time_est) continue;
          const [aSh, aSm] = app.start_time.split(':').map(Number);
          const [aEh, aEm] = app.end_time_est.split(':').map(Number);
          const aStartMin = aSh * 60 + aSm;
          const aEndMin = aEh * 60 + aEm;
          if (newStartMins < aEndMin && newEndMins > aStartMin) {
            throw new Error(`คิวทับซ้อน: ทันตแพทย์ติดคิวเวลา ${app.start_time.slice(0, 5)} - ${app.end_time_est.slice(0, 5)} แล้ว`);
          }
        }
      }
    }

    if (targetPatientId > 0) {
      const { data: patOverlaps } = await supabase
        .from('appointment')
        .select('appointment_id, start_time, end_time_est, appointment_status')
        .eq('patient_id', targetPatientId)
        .eq('appointment_date', targetDate)
        .neq('appointment_id', apptId);

      if (patOverlaps) {
        for (const app of patOverlaps) {
          if (app.appointment_status === 'ยกเลิก' || app.appointment_status === 'ไม่มาตามนัด') continue;
          if (!app.start_time || !app.end_time_est) continue;
          const [aSh, aSm] = app.start_time.split(':').map(Number);
          const [aEh, aEm] = app.end_time_est.split(':').map(Number);
          const aStartMin = aSh * 60 + aSm;
          const aEndMin = aEh * 60 + aEm;
          if (newStartMins < aEndMin && newEndMins > aStartMin) {
            throw new Error(`คิวทับซ้อน: คนไข้มีนัดหมายเวลา ${app.start_time.slice(0, 5)} - ${app.end_time_est.slice(0, 5)} อยู่แล้ว`);
          }
        }
      }
    }
  }

  const payload: any = {};

  if (updates.date !== undefined) payload.appointment_date = updates.date || null;
  if (updates.doctorId) payload.dentist_id = Number(updates.doctorId);
  if (updates.status) payload.appointment_status = updates.status;
  if (updates.time !== undefined) {
    if (!updates.time) {
      payload.start_time = null;
      payload.end_time_est = null;
    } else {
      payload.start_time = updates.time.length === 5 ? `${updates.time}:00` : updates.time;
      const [hh, mm] = updates.time.split(':').map(Number);
      const totalMins = (hh * 60) + mm + estDuration;
      const endHh = Math.floor(totalMins / 60);
      const endMm = totalMins % 60;
      payload.end_time_est = `${String(endHh).padStart(2, '0')}:${String(endMm).padStart(2, '0')}:00`;
    }
  }

  const { error } = await supabase.from('appointment').update(payload).eq('appointment_id', apptId);
  if (error) throw error;

  notifyAppointmentsUpdated();
  return true;
}

export async function getAvailableTimeSlots(date: string, serviceId?: number, doctorId?: number, patientId?: number) {
  const slots = await getClinicTimeSlots(date, serviceId, doctorId, patientId);
  return slots.filter(s => s.status === 'available').map(s => s.time);
}


export interface TimeSlotStatus {
  time: string;
  status: 'available' | 'booked' | 'patient_booked' | 'past' | 'outside_shift';
}

export async function getClinicTimeSlots(date: string, serviceId?: number, doctorId?: number, patientId?: number): Promise<TimeSlotStatus[]> {
  if (!date) return [];
  const dayOfWeek = parseDateDayOfWeek(date);

  const [dailyHours, weeklyOffDays, holidayRes, activeDentists] = await Promise.all([
    getDailyHours(),
    getWeeklyOffDays(),
    supabase.from('clinic_holiday').select('holiday_id').eq('holiday_date', date).maybeSingle(),
    getActiveDentistsList()
  ]);

  const dayHours = dailyHours[dayOfWeek.toString()];
  if (!dayHours) return [];

  const [openH, openM] = dayHours.open.split(':').map(Number);
  const [closeH, closeM] = dayHours.close.split(':').map(Number);
  const clinicOpenMin = openH * 60 + openM;
  const clinicCloseMin = closeH * 60 + closeM;

  const isClinicOff = Boolean(holidayRes.data) || weeklyOffDays.includes(dayOfWeek);

  const numDoctorId = doctorId && Number(doctorId) > 0 ? Number(doctorId) : 0;
  const numServiceId = serviceId && Number(serviceId) > 0 && Number(serviceId) !== 9999 ? Number(serviceId) : 0;
  const numPatientId = patientId && Number(patientId) > 0 ? Number(patientId) : 0;

  let targetDoctorIds: number[] = [];
  if (numDoctorId > 0) {
    targetDoctorIds = activeDentists.some(d => d.dentist_id === numDoctorId) ? [numDoctorId] : [];
  } else if (numServiceId > 0) {
    const { data: dsData } = await supabase.from('dentist_service').select('dentist_id').eq('service_id', numServiceId);
    if (dsData && dsData.length > 0) {
      const dsSet = new Set(dsData.map((d: any) => Number(d.dentist_id)));
      const matched = activeDentists.filter(d => dsSet.has(d.dentist_id)).map(d => d.dentist_id);
      targetDoctorIds = matched.length > 0 ? matched : activeDentists.map(d => d.dentist_id);
    } else {
      targetDoctorIds = activeDentists.map(d => d.dentist_id);
    }
  } else {
    targetDoctorIds = activeDentists.map(d => d.dentist_id);
  }

  const dentistUsers = activeDentists.filter(d => targetDoctorIds.includes(d.dentist_id));
  const staffIds = dentistUsers.map(d => d.staff_id).filter((id): id is number => Boolean(id));

  let leavesQuery = supabase.from('leave_record')
    .select('staff_id, leave_period')
    .eq('leave_date', date)
    .eq('is_approved', true);

  if (staffIds.length > 0) {
    leavesQuery = leavesQuery.in('staff_id', staffIds);
  }

  const [{ data: leaves }, { data: shifts }, { data: appointments }] = await Promise.all([
    leavesQuery,
    supabase.from('schedule')
      .select('staff_id, start_shift, end_shift, is_off')
      .eq('day_of_week', dayOfWeek),
    supabase.from('appointment')
      .select('dentist_id, patient_id, start_time, end_time_est, appointment_status')
      .eq('appointment_date', date)
      .in('appointment_status', OCCUPIED_APPOINTMENT_STATUSES)
  ]);

  const isToday = getLocalTodayStr() === date;
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const patApps = numPatientId > 0
    ? (appointments?.filter(a => Number(a.patient_id) === numPatientId) || [])
    : [];

  const results: TimeSlotStatus[] = [];

  for (let min = clinicOpenMin; min <= clinicCloseMin - 30; min += 30) {
    const hh = Math.floor(min / 60);
    const mm = min % 60;
    const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

    if (isClinicOff) {
      results.push({ time: timeStr, status: 'outside_shift' });
      continue;
    }

    if (isToday && min <= currentMin) {
      results.push({ time: timeStr, status: 'past' });
      continue;
    }

    const slotStart = min;
    const slotEnd = min + 30;

    // ตรวจสอบเวลาซ้อนทับของคนไข้เอง
    let patientOverlap = false;
    for (const app of patApps) {
      if (!app.start_time || !app.end_time_est) continue;
      const [aSh, aSm] = app.start_time.split(':').map(Number);
      const [aEh, aEm] = app.end_time_est.split(':').map(Number);
      const aStartMin = aSh * 60 + aSm;
      const aEndMin = aEh * 60 + aEm;
      if (aStartMin < slotEnd && aEndMin > slotStart) {
        patientOverlap = true;
        break;
      }
    }

    if (patientOverlap) {
      results.push({ time: timeStr, status: 'patient_booked' });
      continue;
    }

    if (targetDoctorIds.length === 0) {
      results.push({ time: timeStr, status: 'outside_shift' });
      continue;
    }

    let anyAvailable = false;
    let anyBooked = false;

    for (const dId of targetDoctorIds) {
      const dUser = dentistUsers.find(du => du.dentist_id === dId);
      if (!dUser) continue;

      const docLeave = leaves?.find(l => l.staff_id && dUser.staff_id && Number(l.staff_id) === dUser.staff_id);
      if (docLeave && docLeave.leave_period === 'เต็มวัน') continue;

      const shift = shifts?.find((s: any) => s.staff_id && dUser.staff_id && Number(s.staff_id) === dUser.staff_id);
      if (shift && shift.is_off) continue;

      let shiftStartMin = clinicOpenMin;
      let shiftEndMin = clinicCloseMin;

      if (shift && shift.start_shift && shift.end_shift) {
        const [startH, startM] = shift.start_shift.split(':').map(Number);
        const [endH, endM] = shift.end_shift.split(':').map(Number);
        shiftStartMin = startH * 60 + startM;
        shiftEndMin = endH * 60 + endM;
      }

      if (slotStart < shiftStartMin || slotEnd > shiftEndMin) continue;

      let leaveStartMin = -1;
      let leaveEndMin = -1;
      if (docLeave?.leave_period === 'ครึ่งวันเช้า') {
        leaveStartMin = 0; leaveEndMin = 13 * 60;
      } else if (docLeave?.leave_period === 'ครึ่งวันบ่าย') {
        leaveStartMin = 13 * 60; leaveEndMin = 24 * 60;
      }

      if (min >= leaveStartMin && min < leaveEndMin) continue;

      // ตรวจสอบคิวนัดหมายของทันตแพทย์
      const docApps = appointments?.filter(a => Number(a.dentist_id) === dId) || [];
      let docOverlap = false;
      for (const app of docApps) {
        if (!app.start_time || !app.end_time_est) continue;
        const [aSh, aSm] = app.start_time.split(':').map(Number);
        const [aEh, aEm] = app.end_time_est.split(':').map(Number);
        const aStartMin = aSh * 60 + aSm;
        const aEndMin = aEh * 60 + aEm;
        if (aStartMin < slotEnd && aEndMin > slotStart) {
          docOverlap = true;
          break;
        }
      }

      if (docOverlap) {
        anyBooked = true;
      } else {
        anyAvailable = true;
      }
    }

    if (anyAvailable) {
      results.push({ time: timeStr, status: 'available' });
    } else if (anyBooked) {
      results.push({ time: timeStr, status: 'booked' });
    } else {
      results.push({ time: timeStr, status: 'outside_shift' });
    }
  }

  return results;
}
