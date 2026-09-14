import { createClient } from '@supabase/supabase-js';
import { getDailyHours } from '../supabaseApi';
import { supabase } from '../utils/supabaseClient';
import { Appointment } from '../../shared/data';

/**
 * 📅 Appointment API Module
 * จัดการระบบนัดหมาย, คิว, และตารางเวลา
 */
let globalUpdateChannel: any = null;

export function notifyAppointmentsUpdated() {
  if (!globalUpdateChannel) {
    globalUpdateChannel = supabase.channel('icemu-updates', { config: { broadcast: { self: true } } });
    globalUpdateChannel.subscribe(); // เปิด realtime ให้ฝั่งพนักงานรับ event ได้
  }

  if (globalUpdateChannel.state === 'joined') {
    globalUpdateChannel.send({
      type: 'broadcast',
      event: 'appointments-updated',
      payload: { timestamp: Date.now() },
    }).catch(console.error);
  } else {
    // If not fully joined yet, it might drop the message, but setting up a single channel reduces the chance of drops.
    setTimeout(() => {
      globalUpdateChannel.send({
        type: 'broadcast',
        event: 'appointments-updated',
        payload: { timestamp: Date.now() },
      }).catch(console.error);
    }, 500);
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
    appointment_detail ( service (service_name) ),
    dentist ( users ( profile (first_name, last_name) ) ),
    treatment_record ( attending_dentist_id, doctor_note, odontogram_data, payment (total_amount, payment_status), treatment_detail ( service_id, location_code, quantity, actual_price, service (service_name) ), treatment_product ( product_id, quantity, actual_price, product (product_name, unit) ) )
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
    const services = d.appointment_detail?.map((ad: any) => ad.service?.service_name).join(', ') || 'ไม่ได้ระบุบริการ';

    let doctorName = 'รอระบุแพทย์';
    let doctorId = d.dentist_id || 0;

    if (d.dentist?.users?.profile) {
      doctorName = `${d.dentist.users.profile.first_name} ${d.dentist.users.profile.last_name}`;
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
        const servicesData = tr.treatment_detail.map((td: any) => ({
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
          name: `💊 ${tp.product?.product_name || 'ไม่ระบุ'}`,
          qty: tp.quantity,
          price: tp.actual_price
        }));
        detailedServices = [...detailedServices, ...productServices];
      }

      // Calculate true cost from treatment records if they exist
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
      serviceId: d.appointment_detail?.[0]?.service?.service_id || 0,
      doctorName,
      doctorId,
      date: d.appointment_date,
      time: d.start_time?.slice(0, 5) || '00:00',
      endTime: d.end_time_est?.slice(0, 5) || d.start_time?.slice(0, 5) || '00:00',
      status: d.appointment_status || 'รอการยืนยัน',
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
      treatmentPlanId: d.treatment_plan_id,
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
    appointment_detail ( service (service_name) ),
    dentist ( users ( profile (first_name, last_name) ) ),
    treatment_record ( attending_dentist_id, doctor_note, payment (total_amount, payment_status), attending_dentist:dentist ( users ( profile (first_name, last_name) ) ), treatment_detail ( service_id, location_code, quantity, actual_price, service (service_name) ) )
  `).eq('patient_id', targetPatientId);

  if (error) {
    console.error("getPatientAppointments error:", error);
    return [];
  }

  return data.map((d: any) => {
    const p = d.patient?.users?.profile;
    const services = d.appointment_detail?.map((ad: any) => ad.service?.service_name).join(', ') || 'ไม่ได้ระบุบริการ';

    let doctorName = 'รอระบุแพทย์';
    let doctorId = d.dentist_id || 0;

    if (d.dentist?.users?.profile) {
      doctorName = `${d.dentist.users.profile.first_name} ${d.dentist.users.profile.last_name}`;
    }
    let cost = 0;
    let paid = false;
    let treatmentNotes = '';
    let recommendations = '';
    let detailedServices: any[] = [];

    if (d.treatment_record) {
      const tr = Array.isArray(d.treatment_record) ? d.treatment_record[0] : d.treatment_record;
      if (tr) {
        const docProf = tr.attending_dentist?.users?.profile;
        if (docProf) {
          doctorName = `${docProf.first_name} ${docProf.last_name}`;
          doctorId = tr.attending_dentist_id;
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
      serviceId: d.appointment_detail?.[0]?.service?.service_id || 0,
      doctorName,
      doctorId,
      date: d.appointment_date,
      time: d.start_time?.slice(0, 5) || '00:00',
      endTime: d.end_time_est?.slice(0, 5) || d.start_time?.slice(0, 5) || '00:00',
      status: d.appointment_status || 'รอการยืนยัน',
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
      treatmentPlanId: d.treatment_plan_id,
      odontogramData: d.treatment_record ? (Array.isArray(d.treatment_record) ? d.treatment_record[0]?.odontogram_data : d.treatment_record.odontogram_data) : undefined
    };
  }) as Appointment[];
}

// --- Patient-specific: ดึงเฉพาะประวัติการรักษาของคนไข้ที่ล็อกอินอยู่ ---

export async function addAppointment(appointment: Omit<Appointment, 'id'> & { id?: number }) {
  // 1. Conflict Check (Backend Level)
  if (appointment.doctorId && appointment.date) {
    const { data: overlapping } = await supabase.from('appointment')
      .select('appointment_date, start_time, end_time_est, appointment_status')
      .eq('dentist_id', appointment.doctorId)
      .eq('appointment_date', appointment.date);

    if (overlapping && overlapping.length > 0) {
      const duration = appointment.durationMins || 30;
      const [newH, newM] = (appointment.time || "00:00").split(':').map(Number);
      const newStartMins = (newH * 60) + newM;
      const newEndMins = newStartMins + duration;

      for (const apptData of overlapping) {
        if (apptData.appointment_status === 'ยกเลิก' || apptData.appointment_status === 'ไม่มาตามนัด') continue;

        const [existH, existM] = (apptData.start_time || "00:00").split(':').map(Number);
        const existStartMins = (existH * 60) + existM;
        const [existEH, existEM] = (apptData.end_time_est || "00:00").split(':').map(Number);
        const existEndMins = (existEH * 60) + existEM;

        if (newStartMins < existEndMins && newEndMins > existStartMins) {
          throw new Error(`คิวทับซ้อน: ทันตแพทย์ติดคิวเวลา ${apptData.start_time.substring(0, 5)} - ${apptData.end_time_est.substring(0, 5)} แล้ว`);
        }
      }
    }
  }

  // 2. Resolve Patient ID
  let finalPatientId = appointment.patientId;
  if (!finalPatientId) {
    const { data: patData } = await supabase.from('patient').select('patient_id, users!inner(profile!inner(first_name, last_name, phone_number, citizen_id))');
    if (patData && patData.length > 0) {
      // 🐛 BUG FIX: Use strict matching. Match by Citizen ID first, fallback to phone number.
      const matched = patData.find((p: any) =>
        (appointment.walkInRegistration && p.users?.profile?.citizen_id === appointment.walkInRegistration.citizenId) ||
        (appointment.patientPhone && p.users?.profile?.phone_number === appointment.patientPhone)
      );
      if (matched) finalPatientId = matched.patient_id;
    }

    if (!finalPatientId) {
      if (appointment.walkInRegistration) {
        const reg = appointment.walkInRegistration;
        let finalUserId = crypto.randomUUID(); // Default to mock ID

        if (reg.email && reg.password) {
          // Scenario A: Create real Auth user
          const adminAuthClient = createClient(
            import.meta.env.VITE_SUPABASE_URL || '',
            import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
          );
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

        // Upsert Profile
        await supabase.from('profile').upsert({
          citizen_id: reg.citizenId,
          first_name: reg.firstName,
          last_name: reg.lastName,
          phone_number: appointment.patientPhone || '',
          gender: reg.gender,
          birth_date: reg.dob || null,
          current_address: reg.address || null
        }, { onConflict: 'citizen_id' });

        // Upsert Users
        await supabase.from('users').upsert({
          user_id: finalUserId,
          citizen_id: reg.citizenId,
          email: reg.email || null,
          role: 'คนไข้',
          account_status: 'active'
        }, { onConflict: 'user_id' });

        const { data: newPat } = await supabase.from('patient').insert({ user_id: finalUserId }).select().single();
        finalPatientId = newPat.patient_id;
      } else {
        // Fallback for old mock logic
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
        finalPatientId = newPat.patient_id;
      }
    }
  }

  // Update patient's health data if provided in the appointment booking
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

  // Update emergency contact if provided
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


  // 2.5 Conflict Check (Patient Level)
  if (finalPatientId) {
    const { data: overlappingPat } = await supabase.from('appointment')
      .select('appointment_date, start_time, end_time_est, appointment_status')
      .eq('patient_id', finalPatientId)
      .eq('appointment_date', appointment.date);

    if (overlappingPat && overlappingPat.length > 0) {
      const duration = appointment.durationMins || 30;
      const [newH, newM] = (appointment.time || "00:00").split(':').map(Number);
      const newStartMins = (newH * 60) + newM;
      const newEndMins = newStartMins + duration;

      for (const apptData of overlappingPat) {
        if (apptData.appointment_status === 'ยกเลิก' || apptData.appointment_status === 'ไม่มาตามนัด') continue;

        const [existH, existM] = (apptData.start_time || "00:00").split(':').map(Number);
        const existStartMins = (existH * 60) + existM;
        const [existEH, existEM] = (apptData.end_time_est || "00:00").split(':').map(Number);
        const existEndMins = (existEH * 60) + existEM;

        if (newStartMins < existEndMins && newEndMins > existStartMins) {
          throw new Error(`คิวทับซ้อน: คุณมีนัดหมายในช่วงเวลา ${apptData.start_time.substring(0, 5)} - ${apptData.end_time_est.substring(0, 5)} อยู่แล้ว`);
        }
      }
    }
  }

  // 3. Resolve Service ID
  let finalServiceId = appointment.serviceId;
  if (!finalServiceId) {
    const { data: svcData } = await supabase.from('service').select('service_id, service_name');
    if (svcData) {
      const matchedSvc = svcData.find((s: any) => appointment.service.includes(s.service_name) || s.service_name.includes(appointment.service));
      if (matchedSvc) {
        finalServiceId = matchedSvc.service_id;
      } else {
        // Fallback safely only if absolutely necessary, but preferably throw error
        finalServiceId = svcData[0]?.service_id || 1;
      }
    }
  }

  let finalDoctorId = appointment.doctorId;
  if (!finalDoctorId && appointment.date) {
    // 1. Get dentists who provide this service
    const { data: dsData } = await supabase.from('dentist_service').select('dentist_id').eq('service_id', finalServiceId);
    if (dsData && dsData.length > 0) {
      const capableDentists = dsData.map((d: any) => d.dentist_id);

      // 2. Check who is working on this day of week
      const dateObj = new Date(appointment.date!);
      const dayOfWeekInt = dateObj.getDay();

      // Get all dentists for these IDs
      const { data: dentists } = await supabase.from('dentist').select('dentist_id, user_id').in('dentist_id', capableDentists);
      const userIds = dentists?.map(d => d.user_id) || [];

      const { data: schedules } = await supabase.from('schedule').select('user_id, start_shift, end_shift')
        .in('user_id', userIds)
        .eq('day_of_week', dayOfWeekInt)
        .eq('is_off', false);

      if (schedules && schedules.length > 0) {
        // Map user_id to dentist_id and keep shift times
        const workingDentists = schedules.map(s => {
          const d = dentists?.find(x => x.user_id === s.user_id);
          return {
            dentist_id: d?.dentist_id,
            start_shift: s.start_shift,
            end_shift: s.end_shift
          };
        }).filter(x => x.dentist_id);

        // 3. Filter out busy dentists (check shift times, appointments, and leaves)
        let availableDentists = workingDentists.map(d => d.dentist_id as number);
        const [hh, mm] = (appointment.time || "00:00").split(':').map(Number);
        const startMins = (hh * 60) + mm;
        const endMins = startMins + (appointment.durationMins || 30);

        for (const doc of workingDentists) {
          const dId = doc.dentist_id as number;
          let isBusy = false;

          // Check if outside shift
          if (doc.start_shift && doc.end_shift) {
            const [sH, sM] = doc.start_shift.split(':').map(Number);
            const shiftStart = sH * 60 + sM;
            const [eH, eM] = doc.end_shift.split(':').map(Number);
            const shiftEnd = eH * 60 + eM;
            if (startMins < shiftStart || endMins > shiftEnd) {
              isBusy = true;
            }
          }

          if (!isBusy) {
            // Check appointments
            const { data: overlapping } = await supabase.from('appointment')
              .select('start_time, end_time_est, appointment_status')
              .eq('dentist_id', dId)
              .eq('appointment_date', appointment.date);

            if (overlapping) {
              for (const appt of overlapping) {
                if (appt.appointment_status === 'ยกเลิก' || appt.appointment_status === 'ไม่มาตามนัด') continue;
                const [eH, eM] = (appt.start_time || "00:00").split(':').map(Number);
                const eStart = (eH * 60) + eM;
                const [eeH, eeM] = (appt.end_time_est || "00:00").split(':').map(Number);
                const eEnd = (eeH * 60) + eeM;
                if (startMins < eEnd && endMins > eStart) {
                  isBusy = true;
                  break;
                }
              }
            }
          }

          if (isBusy) {
            availableDentists = availableDentists.filter(id => id !== dId);
          }
        }

        // Assign a random available dentist
        if (availableDentists.length > 0) {
          finalDoctorId = availableDentists[Math.floor(Math.random() * availableDentists.length)];
        } else {
          throw new Error("ไม่มีทันตแพทย์ว่างในช่วงเวลานี้ กรุณาเลือกเวลาอื่น");
        }
      } else {
        throw new Error("ไม่มีทันตแพทย์ปฏิบัติงานในวันนี้ กรุณาเลือกวันอื่น");
      }
    }
  }

  // Calculate end_time_est based on durationMins (default to 30 if not provided)
  const duration = appointment.durationMins || 30;
  const [hh, mm] = (appointment.time || "00:00").split(':').map(Number);
  const totalMins = (hh * 60) + mm + duration;
  const endHh = Math.floor(totalMins / 60);
  const endMm = totalMins % 60;
  const endTimeStr = `${String(endHh).padStart(2, '0')}:${String(endMm).padStart(2, '0')}:00`;

  // 4. Insert or Update Appointment
  const apptPayload = {
      patient_id: finalPatientId,
      dentist_id: finalDoctorId || null,
      appointment_date: appointment.date || null,
      start_time: appointment.time ? appointment.time + ':00' : null,
      end_time_est: appointment.time ? endTimeStr : null,
      appointment_status: appointment.status,
      channel: appointment.source === 'doctor' ? 'Walk-in' : 'ออนไลน์',
      treatment_plan_id: appointment.treatmentPlanId || null,
      note: appointment.note || null
  };

  let newAppt, apptErr;
  if (appointment.id) {
    const res = await supabase.from('appointment').update(apptPayload).eq('appointment_id', appointment.id).select().single();
    newAppt = res.data;
    apptErr = res.error;
  } else {
    const res = await supabase.from('appointment').insert(apptPayload).select().single();
    newAppt = res.data;
    apptErr = res.error;
  }

  if (apptErr) throw apptErr;

  // 5. Insert or Update Appointment Detail
  let priceAtBooking = null;
  if (finalServiceId) {
    const { data: svcData } = await supabase.from('service').select('base_price').eq('service_id', finalServiceId).maybeSingle();
    if (svcData && svcData.base_price !== undefined) {
      priceAtBooking = svcData.base_price;
    }
  }

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

  // 6. Insert or Update Treatment Record to map Doctor (if selected)
  if (finalDoctorId) {
    const { data: existingTr } = await supabase.from('treatment_record').select('treatment_id').eq('appointment_id', newAppt.appointment_id).maybeSingle();
    if (existingTr) {
      const { error: trErr } = await supabase.from('treatment_record').update({
        attending_dentist_id: finalDoctorId,
        treatment_date: appointment.date
      }).eq('treatment_id', existingTr.treatment_id);
      if (trErr) console.error("Error updating treatment record:", trErr);
    } else {
      const { error: trErr } = await supabase.from('treatment_record').insert({
        appointment_id: newAppt.appointment_id,
        attending_dentist_id: finalDoctorId,
        treatment_date: appointment.date,
        doctor_note: ''
      });
      if (trErr) console.error("Error inserting treatment record:", trErr);
    }
  }

  // 7. If this appointment is linked to a treatment plan item (long-term tracking)
  if (appointment.planItemId) {
    // Assuming status can be set to 'นัดหมายแล้ว' or similar in our tracking logic
    // But since the actual column is `status` (which only takes pending/completed natively in TreatmentPlanBuilder)
    // we'll update it to 'booked' or update a notes field, or if we rely on appointment_id, we could store it in notes for now
    // Let's just update the status to 'booked'
    await supabase.from('treatment_plan_item')
      .update({ status: 'booked' })
      .eq('item_id', appointment.planItemId);
  }

  notifyAppointmentsUpdated();
  return { ...newAppt, assignedDoctorId: finalDoctorId };
}
export async function updateAppointmentStatus(id: number, status: string, reason?: string) {
  const { data: oldAppt } = await supabase.from('appointment')
    .select('appointment_status')
    .eq('appointment_id', id)
    .single();

  const { data, error } = await supabase.from('appointment').update({ appointment_status: status }).eq('appointment_id', id).select().single();
  if (error) {
    console.error("Failed to update appointment status:", error);
    throw error;
  }



  notifyAppointmentsUpdated();
  return { id: data.appointment_id, status: data.appointment_status } as any;
}


export async function checkAppointmentConflicts(userId: string, date: string, startTime?: string, endTime?: string) {
  // First, find the dentist_id for the given userId
  const { data: dentistData } = await supabase.from('dentist').select('dentist_id').eq('user_id', userId).single();

  if (!dentistData) {
    // Not a dentist (likely staff), no direct patient appointments
    return { hasConflict: false, count: 0 };
  }

  const dentistId = dentistData.dentist_id;

  let query = supabase.from('appointment')
    .select('appointment_id', { count: 'exact' })
    .eq('dentist_id', dentistId)
    .eq('appointment_date', date)
    .in('appointment_status', ['รอการยืนยัน', 'ยืนยันการจอง', 'เช็คอินเรียบร้อย', 'กำลังรักษา', 'รอชำระเงิน']); // Active statuses

  if (startTime && endTime) {
    // Overlap condition: (existing_start < new_end) AND (existing_end > new_start)
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
  // Fetch old data
  const { data: oldAppt } = await supabase.from('appointment')
    .select('appointment_date, start_time, dentist_id')
    .eq('appointment_id', id)
    .single();

  const payload: any = {};
  let actionType = 'RESCHEDULE';

  if (updates.date) payload.appointment_date = updates.date;
  if (updates.doctorId) payload.dentist_id = updates.doctorId;
  if (updates.status) payload.status = updates.status;
  if (updates.time) {
    payload.start_time = updates.time;
    // Calculate end_time_est
    const duration = updates.durationMins || 30;
    const [hh, mm] = updates.time.split(':').map(Number);
    const totalMins = (hh * 60) + mm + duration;
    const endHh = Math.floor(totalMins / 60);
    const endMm = totalMins % 60;
    payload.end_time_est = `${String(endHh).padStart(2, '0')}:${String(endMm).padStart(2, '0')}:00`;
  }

  if (updates.doctorId && (!updates.date && !updates.time)) {
    actionType = 'TRANSFER';
  } else if (updates.doctorId && (updates.date || updates.time)) {
    actionType = 'RESCHEDULE_AND_TRANSFER';
  }

  const { error } = await supabase.from('appointment').update(payload).eq('appointment_id', id);
  if (error) throw error;



  notifyAppointmentsUpdated();
  return true;
}

export async function getAvailableTimeSlots(date: string, serviceId?: number, doctorId?: number, patientId?: number) {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();

  // 0. Check if clinic is closed
  const { data: holiday } = await supabase.from('clinic_holiday').select('holiday_id').eq('holiday_date', date).maybeSingle();
  if (holiday) return []; // Clinic is closed, no slots available

  // 1. Get target doctors
  let targetDoctorIds: number[] = [];
  if (doctorId) {
    targetDoctorIds = [doctorId];
  } else {
    let query = supabase.from('dentist').select('dentist_id');
    if (serviceId) {
      // Only doctors providing this service
      const { data: dsData } = await supabase.from('dentist_service').select('dentist_id').eq('service_id', serviceId);
      if (dsData) {
        targetDoctorIds = dsData.map(d => d.dentist_id);
      }
    } else {
      const { data: dData } = await query;
      if (dData) targetDoctorIds = dData.map(d => d.dentist_id);
    }
  }

  if (targetDoctorIds.length === 0) return [];

  // Fetch all users to map dentist_id to user_id
  const { data: dentistUsers } = await supabase.from('dentist').select('dentist_id, user_id').in('dentist_id', targetDoctorIds);
  const userIds = dentistUsers ? dentistUsers.map(d => d.user_id) : [];

  // Fetch approved leaves
  const { data: leaves } = await supabase.from('leave_record')
    .select('user_id, leave_period')
    .in('user_id', userIds)
    .eq('leave_date', date)
    .eq('is_approved', true);

  // Fetch shifts for this day of week
  const { data: shifts } = await supabase.from('schedule')
    .select('users!inner(dentist(dentist_id)), start_shift, end_shift, is_off')
    .eq('day_of_week', dayOfWeek);

  // Fetch appointments for the date
  const { data: appointments } = await supabase.from('appointment')
    .select('dentist_id, patient_id, start_time, end_time_est')
    .eq('appointment_date', date)
    .in('appointment_status', ['รอการยืนยัน', 'ยืนยันการจอง', 'เช็คอินเรียบร้อย', 'กำลังรักษา', 'รอชำระเงิน']);

  const availableSlots = new Set<string>();

  for (const dId of targetDoctorIds) {
    const dUser = dentistUsers?.find(du => du.dentist_id === dId);
    if (!dUser) continue;

    // Check leave
    const docLeave = leaves?.find(l => l.user_id === dUser.user_id);
    if (docLeave) continue; // Skip if on leave (now only full-day leaves)

    // Find shift
    const shift = shifts?.find((s: any) => s.users?.dentist?.[0]?.dentist_id === dId);
    if (!shift || shift.is_off || !shift.start_shift || !shift.end_shift) continue;

    const [startH, startM] = shift.start_shift.split(':').map(Number);
    const [endH, endM] = shift.end_shift.split(':').map(Number);
    const shiftStartMin = startH * 60 + startM;
    const shiftEndMin = endH * 60 + endM;


    const docApps = appointments?.filter(a => a.dentist_id === dId) || [];
    const patApps = patientId ? (appointments?.filter(a => a.patient_id === patientId) || []) : [];

    // Check if date is today and calculate current minutes
    const isToday = new Date().toISOString().split('T')[0] === date;
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    // Generate 30 min slots
    for (let min = shiftStartMin; min <= shiftEndMin - 30; min += 30) {

      // Prevent booking past times for today
      if (isToday && min <= currentMin) continue;

      const slotStart = min;
      const slotEnd = min + 30;

      let overlap = false;

      // Check doctor overlap
      for (const app of docApps) {
        if (!app.start_time || !app.end_time_est) continue;
        const [aSh, aSm] = app.start_time.split(':').map(Number);
        const [aEh, aEm] = app.end_time_est.split(':').map(Number);
        const aStartMin = aSh * 60 + aSm;
        const aEndMin = aEh * 60 + aEm;

        if (aStartMin < slotEnd && aEndMin > slotStart) {
          overlap = true;
          break;
        }
      }

      // Check patient overlap (if patient is selected)
      if (!overlap && patApps.length > 0) {
        for (const app of patApps) {
          if (!app.start_time || !app.end_time_est) continue;
          const [aSh, aSm] = app.start_time.split(':').map(Number);
          const [aEh, aEm] = app.end_time_est.split(':').map(Number);
          const aStartMin = aSh * 60 + aSm;
          const aEndMin = aEh * 60 + aEm;

          if (aStartMin < slotEnd && aEndMin > slotStart) {
            overlap = true;
            break;
          }
        }
      }

      if (!overlap) {
        const hh = Math.floor(min / 60);
        const mm = min % 60;
        availableSlots.add(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
      }
    }
  }

  return Array.from(availableSlots).sort();
}


export interface TimeSlotStatus {
  time: string;
  status: 'available' | 'booked' | 'past' | 'outside_shift';
}

export async function getClinicTimeSlots(date: string, serviceId?: number, doctorId?: number, patientId?: number): Promise<TimeSlotStatus[]> {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();

  // 1. Get daily hours
  const dailyHours = await getDailyHours();
  const dayHours = dailyHours[dayOfWeek.toString()];
  if (!dayHours) return [];

  const [openH, openM] = dayHours.open.split(':').map(Number);
  const [closeH, closeM] = dayHours.close.split(':').map(Number);
  const clinicOpenMin = openH * 60 + openM;
  const clinicCloseMin = closeH * 60 + closeM;

  // 0. Check if clinic is closed
  const { data: holiday } = await supabase.from('clinic_holiday').select('holiday_id').eq('holiday_date', date).maybeSingle();

  let targetDoctorIds: number[] = [];
  if (doctorId) {
    targetDoctorIds = [doctorId];
  } else {
    let query = supabase.from('dentist').select('dentist_id');
    if (serviceId) {
      const { data: dsData } = await supabase.from('dentist_service').select('dentist_id').eq('service_id', serviceId);
      if (dsData) {
        targetDoctorIds = dsData.map(d => d.dentist_id);
      }
    } else {
      const { data: dData } = await query;
      if (dData) targetDoctorIds = dData.map(d => d.dentist_id);
    }
  }

  // Fetch all users to map dentist_id to user_id
  const { data: dentistUsers } = await supabase.from('dentist').select('dentist_id, user_id').in('dentist_id', targetDoctorIds);
  const userIds = dentistUsers ? dentistUsers.map(d => d.user_id) : [];

  // Fetch approved leaves
  const { data: leaves } = await supabase.from('leave_record')
    .select('user_id, leave_period')
    .in('user_id', userIds)
    .eq('leave_date', date)
    .eq('is_approved', true);

  // Fetch shifts for this day of week
  const { data: shifts } = await supabase.from('schedule')
    .select('users!inner(dentist(dentist_id)), start_shift, end_shift, is_off')
    .eq('day_of_week', dayOfWeek);

  // Fetch appointments for the date
  const { data: appointments } = await supabase.from('appointment')
    .select('dentist_id, patient_id, start_time, end_time_est')
    .eq('appointment_date', date)
    .in('appointment_status', ['รอการยืนยัน', 'ยืนยันการจอง', 'เช็คอินเรียบร้อย', 'กำลังรักษา', 'รอชำระเงิน']);

  const isToday = new Date().toISOString().split('T')[0] === date;
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const patApps = patientId ? (appointments?.filter(a => a.patient_id === patientId) || []) : [];

  const results: TimeSlotStatus[] = [];

  for (let min = clinicOpenMin; min <= clinicCloseMin - 30; min += 30) {
    const hh = Math.floor(min / 60);
    const mm = min % 60;
    const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

    if (holiday) {
      results.push({ time: timeStr, status: 'outside_shift' });
      continue;
    }

    if (isToday && min <= currentMin) {
      results.push({ time: timeStr, status: 'past' });
      continue;
    }

    const slotStart = min;
    const slotEnd = min + 30;

    // Check patient overlap globally
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
      results.push({ time: timeStr, status: 'booked' });
      continue;
    }

    if (targetDoctorIds.length === 0) {
      results.push({ time: timeStr, status: 'outside_shift' });
      continue;
    }

    let anyAvailable = false;
    let anyBooked = false;

    for (const dId of targetDoctorIds) {
      const dUser = dentistUsers?.find(du => du.dentist_id === dId);
      if (!dUser) continue;

      const docLeave = leaves?.find(l => l.user_id === dUser.user_id);
      if (docLeave && docLeave.leave_period === 'เต็มวัน') continue;

      const shift = shifts?.find((s: any) => s.users?.dentist?.[0]?.dentist_id === dId);
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

      // Check doctor appointments
      const docApps = appointments?.filter(a => a.dentist_id === dId) || [];
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
