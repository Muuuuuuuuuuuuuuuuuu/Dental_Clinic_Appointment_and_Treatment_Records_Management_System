import { createClient } from '@supabase/supabase-js';
import { supabase } from './utils/supabaseClient';
import { sendOTPEmail } from './utils/emailService';
export { supabase };
import { RegForm } from '../patient/types';
import { Appointment, DentistInfo, PatientInfo, StaffInfo, AdminInfo, ServiceInfo, LeaveRequest, Announcement, SpecialClosure, Shift, Promotion, TreatmentPlan, ServiceCategoryType } from './data';
export * from './api/dentistApi';
export * from './api/authApi';
export * from './api/appointmentApi';
export * from './api/treatmentApi';
import { notifyAppointmentsUpdated, checkAppointmentConflicts } from './api/appointmentApi';
import { TreatmentPackage } from './data';

// ============================================================================
// REALTIME HELPERS
// ============================================================================
// ============================================================================
// ADAPTER: V4 Normalized Schema
// This file has been updated to fetch data from the 15 normalized tables.
// ============================================================================

// --- Dentists ---







// --- Admins ---
export async function getAdmins() {
  const { data, error } = await supabase.from('users').select(`
    user_id,
    email,
    account_status,
    profile (first_name, last_name, phone_number, citizen_id, gender, birth_date, current_address),
    staff (position, salary, employment_status, hire_date)
  `).eq('role', 'admin');

  if (error) {
    console.error("getAdmins error:", error);
    return [];
  }

  return data.map((d: any) => {
    const p = d.profile;
    const s = Array.isArray(d.staff) ? d.staff[0] : d.staff;
    return {
      id: d.user_id,
      name: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      firstName: p?.first_name || '',
      lastName: p?.last_name || '',
      gender: p?.gender || '',
      birthDate: p?.birth_date || '',
      address: p?.current_address || '',
      email: d.email || '',
      phone: p?.phone_number || '',
      citizenId: p?.citizen_id || '',
      active: d.account_status === 'active',
      role: s?.position || 'ผู้ดูแลระบบ',
      salary: s?.salary?.toString() || '',
      startDate: s?.hire_date || '',
      employmentStatus: s?.employment_status || 'ปฏิบัติงานปกติ'
    } as AdminInfo;
  });
}

export async function addAdmin(admin: AdminInfo) {
  const adminAuthClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  const { data: authData, error: authErr } = await adminAuthClient.auth.admin.createUser({
    email: admin.email,
    password: admin.password || 'admin123',
    email_confirm: true
  });

  if (authErr) {
    console.error("Auth creation failed:", authErr);
    throw new Error("ไม่สามารถสร้างบัญชีผู้ใช้ได้ (อีเมลอาจซ้ำ หรือไม่มีสิทธิ์ Admin)");
  }

  const realUserId = authData.user.id;
  const citizenIdToUse = admin.citizenId?.trim();
  if (!citizenIdToUse || citizenIdToUse.length !== 13) {
      throw new Error("ต้องระบุเลขบัตรประชาชน 13 หลักให้ถูกต้อง");
  }

  await supabase.from('profile').insert({
    citizen_id: citizenIdToUse,
    first_name: admin.firstName || '',
    last_name: admin.lastName || '',
    phone_number: admin.phone || null,
    gender: (admin.gender === 'ชาย' || admin.gender === 'หญิง') ? admin.gender : null,
    birth_date: admin.birthDate || null,
    current_address: admin.address || null
  });
  
  await supabase.from('users').insert({
    user_id: realUserId,
    citizen_id: citizenIdToUse,
    email: admin.email,
    role: 'admin',
    account_status: admin.active ? 'active' : 'inactive'
  });

  await supabase.from('staff').insert({
    user_id: realUserId,
    position: admin.role || 'ผู้ดูแลระบบ',
    employment_status: admin.employmentStatus || (admin.active ? 'ปฏิบัติงานปกติ' : 'พักงาน'),
    hire_date: admin.startDate || new Date().toISOString().split('T')[0],
    salary: admin.salary ? parseFloat(admin.salary) : null
  });

  return {
    ...admin,
    id: realUserId,
    name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim()
  };
}

export async function updateAdmin(id: string, updates: Partial<AdminInfo>) {
  if (updates.active !== undefined) {
    await supabase.from('users').update({ account_status: updates.active ? 'active' : 'inactive' }).eq('user_id', id);
  }
  
  const staffUpdates: any = {};
  if (updates.salary !== undefined) staffUpdates.salary = updates.salary ? parseFloat(updates.salary) : null;
  if (updates.role !== undefined) staffUpdates.position = updates.role;
  if (updates.employmentStatus !== undefined) staffUpdates.employment_status = updates.employmentStatus;
  if (updates.startDate !== undefined) staffUpdates.hire_date = updates.startDate;
  if (Object.keys(staffUpdates).length > 0) {
    await supabase.from('staff').update(staffUpdates).eq('user_id', id);
  }

  const profileUpdates: any = {};
  if (updates.firstName !== undefined) profileUpdates.first_name = updates.firstName;
  if (updates.lastName !== undefined) profileUpdates.last_name = updates.lastName;
  if (updates.phone !== undefined) profileUpdates.phone_number = updates.phone;
  if (updates.gender !== undefined) profileUpdates.gender = (updates.gender === 'ชาย' || updates.gender === 'หญิง') ? updates.gender : null;
  if (updates.birthDate !== undefined) profileUpdates.birth_date = updates.birthDate;
  if (updates.address !== undefined) profileUpdates.current_address = updates.address;
  
  if (Object.keys(profileUpdates).length > 0) {
    const { data: userData } = await supabase.from('users').select('citizen_id').eq('user_id', id).single();
    if (userData?.citizen_id) {
      await supabase.from('profile').update(profileUpdates).eq('citizen_id', userData.citizen_id);
    }
  }

  return { id, ...updates };
}

// --- Staff ---
export async function getStaff() {
  const { data, error } = await supabase.from('staff').select(`
    *,
    users!inner (
      email,
      account_status,
      role,
      profile (first_name, last_name, phone_number, citizen_id, gender, birth_date, current_address)
    )
  `).neq('users.role', 'admin');
  if (error) {
    console.error("getStaff error:", error);
    return [];
  }

  return data.map((d: any) => {
    const p = d.users?.profile;
    return {
      id: d.staff_id,
      userId: d.user_id,
      name: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      firstName: p?.first_name || '',
      lastName: p?.last_name || '',
      gender: p?.gender || '',
      birthDate: p?.birth_date || '',
      address: p?.current_address || '',
      role: d.position || 'พนักงาน',
      email: d.users?.email || '',
      phone: p?.phone_number || '',
      citizenId: p?.citizen_id || '',
      startDate: d.hire_date,
      employmentStatus: d.employment_status || 'ปฏิบัติงานปกติ',
      active: d.users?.account_status === 'active',
      salary: d.salary?.toString() || ''
    };
  }) as StaffInfo[];
}

export async function addStaff(staff: Omit<StaffInfo, 'id'>): Promise<StaffInfo> {
  const adminAuthClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  const { data: authData, error: authErr } = await adminAuthClient.auth.admin.createUser({
    email: staff.email,
    password: staff.password || 'password123',
    email_confirm: true
  });

  if (authErr) {
    console.error("Auth creation failed:", authErr);
    throw new Error("ไม่สามารถสร้างบัญชีผู้ใช้พนักงานได้ (อีเมลอาจซ้ำ หรือไม่มีสิทธิ์ Admin)");
  }

  const realUserId = authData.user.id;
  const citizenIdToUse = staff.citizenId?.trim();
  if (!citizenIdToUse || citizenIdToUse.length !== 13) {
      throw new Error("ต้องระบุเลขบัตรประชาชน 13 หลักให้ถูกต้อง");
  }
  
  await supabase.from('profile').insert({
    citizen_id: citizenIdToUse,
    first_name: staff.firstName || '',
    last_name: staff.lastName || '',
    phone_number: staff.phone || null,
    gender: (staff.gender === 'ชาย' || staff.gender === 'หญิง') ? staff.gender : null,
    birth_date: staff.birthDate || null,
    current_address: staff.address || null
  });

  await supabase.from('users').insert({
    user_id: realUserId,
    citizen_id: citizenIdToUse,
    email: staff.email,
    role: 'พนักงาน',
    account_status: staff.active ? 'active' : 'inactive'
  });

  const { data, error } = await supabase.from('staff').insert({
    user_id: realUserId,
    position: staff.role,
    employment_status: staff.employmentStatus || (staff.active ? 'ปฏิบัติงานปกติ' : 'พักงาน'),
    hire_date: staff.startDate,
    salary: staff.salary ? parseFloat(staff.salary) : null
  }).select().single();

  if (error) throw error;
  return { 
    ...staff, 
    id: data.staff_id, 
    userId: realUserId,
    name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim()
  };
}
export async function updateStaff(id: number, updates: Partial<StaffInfo>): Promise<StaffInfo> {
  const staffUpdates: any = {};
  if (updates.role !== undefined) staffUpdates.position = updates.role;
  if (updates.employmentStatus !== undefined) staffUpdates.employment_status = updates.employmentStatus;
  if (updates.startDate !== undefined) staffUpdates.hire_date = updates.startDate;
  if (updates.salary !== undefined) staffUpdates.salary = updates.salary ? parseFloat(updates.salary) : null;

  if (Object.keys(staffUpdates).length > 0) {
    const { error } = await supabase.from('staff').update(staffUpdates).eq('staff_id', id);
    if (error) throw error;
  }
  
  const { data: staffData } = await supabase.from('staff').select('user_id').eq('staff_id', id).single();
  if (staffData?.user_id) {
    if (updates.active !== undefined) {
      await supabase.from('users').update({ account_status: updates.active ? 'active' : 'inactive' }).eq('user_id', staffData.user_id);
    }
    
    const profileUpdates: any = {};
    if (updates.firstName !== undefined) profileUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) profileUpdates.last_name = updates.lastName;
    if (updates.phone !== undefined) profileUpdates.phone_number = updates.phone;
    if (updates.gender !== undefined) profileUpdates.gender = (updates.gender === 'ชาย' || updates.gender === 'หญิง') ? updates.gender : null;
    if (updates.birthDate !== undefined) profileUpdates.birth_date = updates.birthDate;
    if (updates.address !== undefined) profileUpdates.current_address = updates.address;

    if (Object.keys(profileUpdates).length > 0) {
      const { data: userData } = await supabase.from('users').select('citizen_id').eq('user_id', staffData.user_id).single();
      if (userData?.citizen_id) {
        await supabase.from('profile').update(profileUpdates).eq('citizen_id', userData.citizen_id);
      }
    }
  }

  return { id, ...updates } as StaffInfo;
}
export async function deleteStaff(id: number): Promise<void> {
  await supabase.from('staff').delete().eq('staff_id', id);
}

export async function getServices() {
  const { data: serviceData, error } = await supabase.from('service').select('*');
  if (error) return [];

  const { data: settingsData } = await supabase.from('clinic_settings').select('setting_value').eq('setting_key', 'disabled_services').maybeSingle();
  let disabledIds: number[] = [];
  if (settingsData && settingsData.setting_value) {
    try { disabledIds = typeof settingsData.setting_value === 'string' ? JSON.parse(settingsData.setting_value) : settingsData.setting_value; } catch (e) { }
  }

  return serviceData.map((d: any) => ({
    id: d.service_id,
    name: d.service_name,
    description: d.description || `ใช้เวลาประมาณ ${d.estimated_time} นาที`,
    basePrice: d.base_price,
    maxPrice: d.max_price,
    base_price: d.base_price,
    max_price: d.max_price,
    category: d.category || 'ทันตกรรมทั่วไป (General Dentistry)',
    newCategoryIcon: 'Smile',
    newCategoryColor: '#F0F4F8',
    estimatedTime: d.estimated_time,
    requiresConfirmation: d.requires_confirmation,
    isFixedPrice: d.is_fixed_price,
    active: d.is_active,
    isPublic: !disabledIds.includes(d.service_id),
    applyTo: d.apply_to,
    serviceType: d.service_type,
    details: { benefits: d.benefits || [], procedures: d.procedures || [], care: d.care || [] }
  })) as ServiceInfo[];
}

export async function addService(service: Omit<ServiceInfo, 'id'>) {
  const estimatedTime = service.estimatedTime || 30;
  const { data, error } = await supabase.from('service').insert({
    service_name: service.name,
    description: service.description,
    base_price: service.basePrice,
    category: service.category,
    estimated_time: estimatedTime,
    is_active: service.active !== false,
    requires_confirmation: service.requiresConfirmation || false,
    service_type: service.serviceType,
    apply_to: service.applyTo || 'MOUTH',
    is_fixed_price: service.isFixedPrice || false,
    benefits: service.details?.benefits || [],
    procedures: service.details?.procedures || [],
    care: service.details?.care || []
  }).select().single();
  if (error) throw error;
  return { ...service, id: data.service_id, estimatedTime, description: data.description || `ใช้เวลาประมาณ ${estimatedTime} นาที` } as ServiceInfo;
}
export async function updateService(id: number, updates: Partial<ServiceInfo>): Promise<ServiceInfo> {
  const serviceUpdates: any = {};
  if (updates.name !== undefined) serviceUpdates.service_name = updates.name;
  if (updates.description !== undefined) serviceUpdates.description = updates.description;
  if (updates.basePrice !== undefined) serviceUpdates.base_price = updates.basePrice;
  if (updates.category !== undefined) serviceUpdates.category = updates.category;
  if (updates.estimatedTime !== undefined) serviceUpdates.estimated_time = updates.estimatedTime;
  if (updates.requiresConfirmation !== undefined) serviceUpdates.requires_confirmation = updates.requiresConfirmation;
  if (updates.active !== undefined) serviceUpdates.is_active = updates.active;
  if (updates.serviceType !== undefined) serviceUpdates.service_type = updates.serviceType;
  if (updates.applyTo !== undefined) serviceUpdates.apply_to = updates.applyTo;
  if (updates.isFixedPrice !== undefined) serviceUpdates.is_fixed_price = updates.isFixedPrice;
  if (updates.details !== undefined) {
    if (updates.details.benefits) serviceUpdates.benefits = updates.details.benefits;
    if (updates.details.procedures) serviceUpdates.procedures = updates.details.procedures;
    if (updates.details.care) serviceUpdates.care = updates.details.care;
  }

  const { error } = await supabase.from('service').update(serviceUpdates).eq('service_id', id);
  if (error) throw error;
  return { id, ...updates } as ServiceInfo;
}
export async function deleteService(id: number): Promise<void> {
  await supabase.from('service').delete().eq('service_id', id);
}

export async function updateServiceActiveStatus(id: number, active: boolean) {
  const { error } = await supabase.from('service').update({ is_active: active }).eq('service_id', id);
  if (error) throw error;
}

export async function updateServicePublicStatus(id: number, isPublic: boolean) {
  const { data } = await supabase.from('clinic_settings').select('setting_value').eq('setting_key', 'disabled_services').maybeSingle();
  let disabledIds: number[] = [];
  if (data && data.setting_value) {
    try { disabledIds = typeof data.setting_value === 'string' ? JSON.parse(data.setting_value) : data.setting_value; } catch (e) { }
  }

  if (isPublic) {
    disabledIds = disabledIds.filter(x => x !== id);
  } else {
    if (!disabledIds.includes(id)) disabledIds.push(id);
  }

  const { error } = await supabase.from('clinic_settings').upsert({
    setting_key: 'disabled_services',
    setting_value: JSON.stringify(disabledIds)
  }, { onConflict: 'setting_key' });

  if (error) throw error;
}

// --- Landing Page Data ---
export async function getLandingServices() {
  const { data, error } = await supabase.from('service').select('*');
  if (error) return [];

  const { data: settingsData } = await supabase.from('clinic_settings').select('setting_value').eq('setting_key', 'disabled_services').maybeSingle();
  let disabledIds: number[] = [];
  if (settingsData && settingsData.setting_value) {
    try { disabledIds = typeof settingsData.setting_value === 'string' ? JSON.parse(settingsData.setting_value) : settingsData.setting_value; } catch (e) { }
  }

  return data
    .filter((d: any) => !disabledIds.includes(d.service_id))
    .map((d: any) => ({
      serviceId: d.service_id,
      iconName: 'Smile',
      title: d.service_name,
      desc: d.description || `บริการระดับมืออาชีพ ใช้เวลาประมาณ ${d.estimated_time} นาที`,
      price: d.base_price ? `เริ่มต้น ${d.base_price.toLocaleString()} บาท` : 'แจ้งราคาหลังตรวจ',
      color: '#FFE8EC',
      type: d.service_type || 'general',
      baseTimeMins: d.estimated_time || 30,
      requiresConfirmation: d.requires_confirmation || false,
      details: { benefits: d.benefits || [], procedures: d.procedures || [], care: d.care || [] }
    }));
}


// ดึงหมอที่ทำบริการ (service_id) นั้นได้ ผ่านตาราง dentist_service

export async function getUpcomingLeaves() {
  const today = new Date();
  today.setDate(1);
  const dateStr = today.toISOString().split('T')[0];
  const { data, error } = await supabase.from('leave_record')
    .select('user_id, leave_date, leave_period')
    .eq('is_approved', true)
    .gte('leave_date', dateStr);
  if (error) return [];
  return data;
}

export async function getReviews() {
  const { data, error } = await supabase.from('review').select(`
    *,
    patient ( users ( profile (first_name, last_name) ) ),
    appointment ( appointment_detail ( service (service_name) ) )
  `);
  if (error) return [];

  return data.map((d: any) => {
    const prof = d.patient?.users?.profile;
    const name = prof ? `${prof.first_name} ${prof.last_name}` : 'ไม่ระบุชื่อ';
    const srv = d.appointment?.appointment_detail?.[0]?.service?.service_name || 'ไม่ระบุบริการ';
    return {
      name: name,
      text: d.comment,
      stars: d.rating,
      service: srv
    };
  });
}

// --- Clinic Settings ---
export async function getClinicSettings() {
  const { data, error } = await supabase.from('clinic_settings').select('*');
  if (error) return {};

  const settings: Record<string, string> = {};
  data.forEach((s: any) => {
    settings[s.setting_key] = s.setting_value;
  });
  return settings;
}

export async function updateClinicSetting(key: string, value: string) {
  const { error } = await supabase
    .from('clinic_settings')
    .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' });
  if (error) throw error;
}

// --- Weekly Off Days (clinic-level policy) ---
export async function getWeeklyOffDays(): Promise<number[]> {
  const settings = await getClinicSettings();
  try {
    return JSON.parse(settings.weekly_off_days || '[0]');
  } catch {
    return [0]; // default: Sunday
  }
}

export async function updateWeeklyOffDays(days: number[]): Promise<void> {
  await updateClinicSetting('weekly_off_days', JSON.stringify(days));
}

// --- Per-Day Operating Hours ---
export interface DayHours {
  open: string;
  close: string;
}

const DEFAULT_DAILY_HOURS: Record<string, DayHours> = {
  "0": { open: "09:00", close: "20:00" },
  "1": { open: "09:00", close: "20:00" },
  "2": { open: "09:00", close: "20:00" },
  "3": { open: "09:00", close: "20:00" },
  "4": { open: "09:00", close: "20:00" },
  "5": { open: "09:00", close: "20:00" },
  "6": { open: "09:00", close: "18:00" },
};

export async function getDailyHours(): Promise<Record<string, DayHours>> {
  const settings = await getClinicSettings();
  try {
    if (settings.daily_hours) {
      return { ...DEFAULT_DAILY_HOURS, ...JSON.parse(settings.daily_hours) };
    }
    // Fallback: build from legacy keys
    const fallback = { ...DEFAULT_DAILY_HOURS };
    const openTime = settings.open_time || "09:00";
    const closeTime = settings.close_time || "20:00";
    const satClose = settings.saturday_close_time || "18:00";
    for (let i = 0; i <= 6; i++) {
      fallback[String(i)] = { open: openTime, close: i === 6 ? satClose : closeTime };
    }
    return fallback;
  } catch {
    return DEFAULT_DAILY_HOURS;
  }
}

export async function updateDailyHours(hours: Record<string, DayHours>): Promise<void> {
  await updateClinicSetting('daily_hours', JSON.stringify(hours));
}

// --- Patients ---
export async function getPatients() {
  const { data, error } = await supabase.from('patient').select(`
    *,
    users (
      email,
      profile (first_name, last_name, phone_number)
    ),
    emergency_contact (contact_name, contact_phone, relationship),
    patient_allergy (allergy_name),
    patient_disease (disease_name)
  `);
  if (error) {
    console.error("getPatients error:", error);
    return [];
  }

  return data.map((d: any) => {
    const p = d.users?.profile;
    const ec = d.emergency_contact?.[0] || d.emergency_contact;
    const allergies = d.patient_allergy && d.patient_allergy.length > 0 
      ? d.patient_allergy.map((a: any) => a.allergy_name).join(', ') 
      : 'ไม่มี';
    const diseases = d.patient_disease && d.patient_disease.length > 0
      ? d.patient_disease.map((a: any) => a.disease_name).join(', ')
      : 'ไม่มี';
    
    return {
      id: d.patient_id,
      hn: `HN${String(d.patient_id).padStart(3, '0')}`,
      name: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      email: d.users?.email || '',
      phone: p?.phone_number || '',
      allergyHistory: allergies,
      underlyingDisease: diseases,
      emergencyContactName: ec?.contact_name || '',
      emergencyContactPhone: ec?.contact_phone || '',
      emergencyContactRelationship: ec?.relationship || ''
    };
  }) as PatientInfo[];
}

export async function searchPatientByKeyword(keyword: string): Promise<PatientInfo[]> {
  const cleanKeyword = keyword.trim();
  let userIds: number[] = [];

  if (cleanKeyword.includes('@')) {
    const { data } = await supabase.from('users').select('user_id').eq('email', cleanKeyword);
    if (data) userIds = data.map(d => d.user_id);
  } else if (cleanKeyword.replace(/-/g, '').length === 13 && /^\d+$/.test(cleanKeyword.replace(/-/g, ''))) {
    const unformattedId = cleanKeyword.replace(/-/g, '');
    const { data } = await supabase.from('users').select('user_id').eq('citizen_id', unformattedId);
    if (data) userIds = data.map(d => d.user_id);
  } else {
    // try phone, first_name, last_name
    const searchPattern = `%${cleanKeyword}%`;
    const { data } = await supabase.from('profile')
      .select('user_id')
      .or(`phone_number.eq.${cleanKeyword},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`);
    if (data) userIds = data.map(d => d.user_id);
  }

  if (userIds.length === 0) return [];

  const { data, error: patErr } = await supabase.from('patient').select(`
    *,
    users (
      email,
      profile (first_name, last_name, phone_number)
    ),
    emergency_contact (contact_name, contact_phone, relationship),
    patient_allergy (allergy_name),
    patient_disease (disease_name)
  `).in('user_id', userIds);

  if (patErr || !data) return [];

  return data.map(d => {
    const p = d.users?.profile;
    const ec = Array.isArray(d.emergency_contact) ? d.emergency_contact[0] : d.emergency_contact;
    const allergies = d.patient_allergy && d.patient_allergy.length > 0 
      ? d.patient_allergy.map((a: any) => a.allergy_name).join(', ') 
      : 'ไม่มี';
    const diseases = d.patient_disease && d.patient_disease.length > 0
      ? d.patient_disease.map((a: any) => a.disease_name).join(', ')
      : 'ไม่มี';
    
    return {
      id: d.patient_id,
      hn: `HN${String(d.patient_id).padStart(3, '0')}`,
      name: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      email: d.users?.email || '',
      phone: p?.phone_number || '',
      allergyHistory: allergies,
      underlyingDisease: diseases,
      emergencyContactName: ec?.contact_name || '',
      emergencyContactPhone: ec?.contact_phone || '',
      emergencyContactRelationship: ec?.relationship || ''
    } as PatientInfo;
  });
}

export async function addPatient(patient: {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  citizenId: string;
  phone: string;
  gender?: string;
  dob?: string;
  address?: string;
  allergyHistory?: string;
  underlyingDisease?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}): Promise<any> {
  // สร้าง Admin Client สำหรับจัดการ Auth โดยเฉพาะ
  const adminAuthClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  const defaultPassword = patient.password || 'patient123';

  // 1. สร้างบัญชีผู้ใช้ใน Supabase Auth จริงๆ
  const { data: authData, error: authErr } = await adminAuthClient.auth.admin.createUser({
    email: patient.email,
    password: defaultPassword,
    email_confirm: true
  });

  if (authErr) {
    console.error("Auth creation failed:", authErr);
    throw new Error("ไม่สามารถสร้างบัญชีคนไข้ได้ (อีเมลอาจซ้ำ หรือไม่มีสิทธิ์ Admin)");
  }

  const realUserId = authData.user.id;

  // 2. สร้าง Profile
  // gender ต้องเป็น 'ชาย' หรือ 'หญิง' เท่านั้น (DB CHECK constraint)
  const validGender = (patient.gender === 'ชาย' || patient.gender === 'หญิง') ? patient.gender : null;
  const { error: pErr } = await supabase.from('profile').insert({
    citizen_id: patient.citizenId,
    first_name: patient.firstName,
    last_name: patient.lastName,
    phone_number: patient.phone || null,
    gender: validGender,
    birth_date: patient.dob || null,
    current_address: patient.address || null  // ชื่อคอลัมน์จริงใน DB คือ current_address
  });
  if (pErr) { console.error("Profile insert error:", pErr); throw pErr; }

  // 3. สร้าง Users
  const { error: uErr } = await supabase.from('users').insert({
    user_id: realUserId,
    citizen_id: patient.citizenId,
    email: patient.email,
    role: 'คนไข้',
    account_status: 'active'
  });
  if (uErr) { console.error("Users insert error:", uErr); throw uErr; }

  // 4. สร้าง Patient
  const { data: patData, error: patErr } = await supabase.from('patient').insert({
    user_id: realUserId
  }).select().single();
  if (patErr) { console.error("Patient insert error:", patErr); throw patErr; }

  // 5. สร้าง Emergency Contact
  if (patient.emergencyContactName || patient.emergencyContactPhone) {
    const { error: ecErr } = await supabase.from('emergency_contact').insert({
      patient_id: patData.patient_id,
      contact_name: patient.emergencyContactName || '-',
      contact_phone: patient.emergencyContactPhone || '-',
      relationship: patient.emergencyContactRelationship || 'ไม่ได้ระบุ'
    });
    if (ecErr) { console.error("Emergency Contact insert error:", ecErr); }
  }

  // 6. สร้าง Allergy & Disease
  if (patient.allergyHistory && patient.allergyHistory !== 'ไม่มี' && patient.allergyHistory !== 'ไม่มีประวัติ' && patient.allergyHistory !== '-') {
    const allergies = patient.allergyHistory.split(',').map(s => s.trim()).filter(s => s);
    for (const a of allergies) {
      await supabase.from('patient_allergy').insert({ patient_id: patData.patient_id, allergy_name: a });
    }
  }
  
  if (patient.underlyingDisease && patient.underlyingDisease !== 'ไม่มี' && patient.underlyingDisease !== 'ไม่มีประวัติ' && patient.underlyingDisease !== '-') {
    const diseases = patient.underlyingDisease.split(',').map(s => s.trim()).filter(s => s);
    for (const d of diseases) {
      await supabase.from('patient_disease').insert({ patient_id: patData.patient_id, disease_name: d });
    }
  }

  return { id: patData.patient_id, userId: realUserId };
}

// --- เปลี่ยนรหัสผ่าน (จากภายในระบบ ต้องกรอกรหัสเดิมก่อน) ---
export async function getPatientProfileByUserId(userId: string) {
  const { data, error } = await supabase.from('users').select(`
    *,
    profile (*)
  `).eq('user_id', userId).single();

  if (error || !data || !data.profile) return null;

  const p = data.profile;
  const { data: patientData } = await supabase.from('patient').select('*').eq('user_id', userId).maybeSingle();
  let ecData = null;
  let allergies = '';
  let conditions = '';
  if (patientData?.patient_id) {
    const { data: ec } = await supabase.from('emergency_contact').select('*').eq('patient_id', patientData.patient_id).maybeSingle();
    ecData = ec;
    
    const { data: alData } = await supabase.from('patient_allergy').select('allergy_name').eq('patient_id', patientData.patient_id);
    if (alData && alData.length > 0) {
      allergies = alData.map((a: any) => a.allergy_name).join(', ');
    }
    
    const { data: disData } = await supabase.from('patient_disease').select('disease_name').eq('patient_id', patientData.patient_id);
    if (disData && disData.length > 0) {
      conditions = disData.map((d: any) => d.disease_name).join(', ');
    }
  }

  return {
    patientId: patientData?.patient_id,
    firstName: p.first_name,
    lastName: p.last_name,
    idCard: p.citizen_id,
    dob: p.birth_date,
    gender: p.gender,
    phone: p.phone_number,
    email: data.email,
    address: p.current_address || '',
    emergencyName: ecData?.contact_name || '',
    emergencyPhone: ecData?.contact_phone || '',
    emergencyRelationship: ecData?.relationship || '',
    conditions: conditions || 'ไม่มี',
    allergies: allergies || 'ไม่มี'
  };
}

// --- Update Patient Profile ---
export async function updatePatientProfile(userId: string, updates: {
  phone?: string;
  email?: string;
  address?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
  allergyHistory?: string;
  underlyingDisease?: string;
}) {
  // 1. ดึง citizen_id และ patient_id
  const { data: userData, error: userErr } = await supabase
    .from('users')
    .select('citizen_id')
    .eq('user_id', userId)
    .single();
  if (userErr || !userData) throw new Error('ไม่พบข้อมูลผู้ใช้');

  const { data: patientData } = await supabase
    .from('patient')
    .select('patient_id')
    .eq('user_id', userId)
    .maybeSingle();

  // 2. อัปเดต profile (phone, address)
  const profileUpdates: Record<string, any> = {};
  if (updates.phone !== undefined) profileUpdates.phone_number = updates.phone;
  if (updates.address !== undefined) profileUpdates.current_address = updates.address;

  if (Object.keys(profileUpdates).length > 0) {
    const { error: pErr } = await supabase
      .from('profile')
      .update(profileUpdates)
      .eq('citizen_id', userData.citizen_id);
    if (pErr) throw pErr;
  }

  // 3. อัปเดต users (email)
  if (updates.email !== undefined) {
    const { error: uErr } = await supabase
      .from('users')
      .update({ email: updates.email, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (uErr) throw uErr;
  }

  // 4. อัปเดต emergency_contact
  if (patientData?.patient_id && (updates.emergencyName !== undefined || updates.emergencyPhone !== undefined || updates.emergencyRelationship !== undefined)) {
    const ecUpdates: Record<string, any> = {};
    if (updates.emergencyName !== undefined) ecUpdates.contact_name = updates.emergencyName;
    if (updates.emergencyPhone !== undefined) ecUpdates.contact_phone = updates.emergencyPhone;
    if (updates.emergencyRelationship !== undefined) ecUpdates.relationship = updates.emergencyRelationship;

    const { data: existing } = await supabase
      .from('emergency_contact')
      .select('emergency_id')
      .eq('patient_id', patientData.patient_id)
      .maybeSingle();

    if (existing) {
      await supabase.from('emergency_contact').update(ecUpdates).eq('emergency_id', existing.emergency_id);
    } else {
      await supabase.from('emergency_contact').insert({
        patient_id: patientData.patient_id,
        contact_name: updates.emergencyName || '-',
        contact_phone: updates.emergencyPhone || '-',
        relationship: updates.emergencyRelationship || 'ไม่ได้ระบุ',
      });
    }
  }

  // 5. อัปเดต Allergy และ Disease
  if (patientData?.patient_id) {
    if (updates.allergyHistory !== undefined) {
      await supabase.from('patient_allergy').delete().eq('patient_id', patientData.patient_id);
      if (updates.allergyHistory && updates.allergyHistory !== 'ไม่มี' && updates.allergyHistory !== 'ไม่มีประวัติ' && updates.allergyHistory !== '-') {
        const allergies = updates.allergyHistory.split(',').map(s => s.trim()).filter(s => s);
        for (const a of allergies) {
          await supabase.from('patient_allergy').insert({ patient_id: patientData.patient_id, allergy_name: a });
        }
      }
    }
    
    if (updates.underlyingDisease !== undefined) {
      await supabase.from('patient_disease').delete().eq('patient_id', patientData.patient_id);
      if (updates.underlyingDisease && updates.underlyingDisease !== 'ไม่มี' && updates.underlyingDisease !== 'ไม่มีประวัติ' && updates.underlyingDisease !== '-') {
        const diseases = updates.underlyingDisease.split(',').map(s => s.trim()).filter(s => s);
        for (const d of diseases) {
          await supabase.from('patient_disease').insert({ patient_id: patientData.patient_id, disease_name: d });
        }
      }
    }
  }
}

export async function updatePatientInfoByPatientId(patientId: number, updates: {
  phone?: string;
  email?: string;
  allergyHistory?: string;
  underlyingDisease?: string;
}) {
  const { data: patientData, error: pErr } = await supabase
    .from('patient')
    .select('user_id')
    .eq('patient_id', patientId)
    .single();
  
  if (pErr || !patientData) throw new Error('ไม่พบข้อมูลคนไข้');

  const userId = patientData.user_id;
  const { data: userData } = await supabase.from('users').select('citizen_id').eq('user_id', userId).single();

  if (updates.email !== undefined) {
    await supabase.from('users').update({ email: updates.email, updated_at: new Date().toISOString() }).eq('user_id', userId);
  }

  if (updates.phone !== undefined && userData?.citizen_id) {
    await supabase.from('profile').update({ phone_number: updates.phone }).eq('citizen_id', userData.citizen_id);
  }

  if (updates.allergyHistory !== undefined) {
    await supabase.from('patient_allergy').delete().eq('patient_id', patientId);
    if (updates.allergyHistory && updates.allergyHistory !== 'ไม่มี' && updates.allergyHistory !== 'ไม่มีประวัติ' && updates.allergyHistory !== '-') {
      const allergies = updates.allergyHistory.split(',').map(s => s.trim()).filter(s => s);
      for (const a of allergies) {
        await supabase.from('patient_allergy').insert({ patient_id: patientId, allergy_name: a });
      }
    }
  }

  if (updates.underlyingDisease !== undefined) {
    await supabase.from('patient_disease').delete().eq('patient_id', patientId);
    if (updates.underlyingDisease && updates.underlyingDisease !== 'ไม่มี' && updates.underlyingDisease !== 'ไม่มีประวัติ' && updates.underlyingDisease !== '-') {
      const diseases = updates.underlyingDisease.split(',').map(s => s.trim()).filter(s => s);
      for (const d of diseases) {
        await supabase.from('patient_disease').insert({ patient_id: patientId, disease_name: d });
      }
    }
  }
}

// --- Appointments ---
export async function getLeaveRequests() {
  const { data, error } = await supabase.from('leave_record').select(`
    *,
    users ( profile (first_name, last_name) )
  `);
  if (error) return [];

  return data.map((d: any) => {
    const p = d.users?.profile;
    return {
      id: d.leave_id,
      doctorId: d.user_id, // doctorId will now contain the user_id (UUID)
      doctorName: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      startDate: d.leave_date,
      endDate: d.leave_date, // โครงสร้างใหม่มีแค่วันที่เดียว
      leaveType: d.leave_type as 'ลาป่วย' | 'ลากิจ' | 'ลาพักร้อน' | undefined,
      reason: d.reason,
      status: d.is_approved === true ? 'อนุมัติแล้ว' : d.is_approved === false ? 'ไม่อนุมัติ' : 'รออนุมัติ',
      createdAt: d.leave_date
    };
  }) as LeaveRequest[];
}
export async function addLeaveRequest(req: Omit<LeaveRequest, 'id' | 'createdAt' | 'doctorName'>) {
  const { data, error } = await supabase.from('leave_record').insert({
    user_id: req.doctorId, // Expecting UUID here
    leave_date: req.startDate,
    leave_period: 'เต็มวัน',
    leave_type: req.leaveType,
    reason: req.reason,
    is_approved: null // null means pending
  }).select().single();

  if (error) throw error;
  return data;
}
export async function updateLeaveStatus(id: number, status: string) {
  let is_approved = null;
  if (status === 'อนุมัติแล้ว') is_approved = true;
  else if (status === 'ไม่อนุมัติ' || status === 'ปฏิเสธ') is_approved = false;

  // Check conflicts if approving
  if (is_approved === true) {
    const { data: leaveRecord } = await supabase.from('leave_record').select('*').eq('leave_id', id).single();
    if (leaveRecord) {
      const conflict = await checkAppointmentConflicts(leaveRecord.user_id, leaveRecord.leave_date, '00:00', '23:59');
      if (conflict.hasConflict) {
        throw new Error(`ไม่สามารถอนุมัติได้ เนื่องจากมีคิวคนไข้จองไว้แล้ว ${conflict.count} คิว กรุณาเลื่อนหรือยกเลิกคิวก่อน`);
      }
    }
  }
  else if (status === 'ไม่อนุมัติ' || status === 'ปฏิเสธ') is_approved = false;

  const { data, error } = await supabase
    .from('leave_record')
    .update({ is_approved })
    .eq('leave_id', id)
    .select()
    .single();

  if (error) throw error;
  return { ...data, status };
}

// ============================================================================
// OLD SCHEMA FALLBACKS 
// (สำหรับตารางที่ไม่มีใน 15 ตารางของ PDF เช่น ประกาศ, โปรโมชั่น, กะทำงาน)
// ============================================================================

export async function getAnnouncements() {
  const { data, error } = await supabase.from('announcement').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    content: d.content,
    link: d.link,
    mediaUrl: d.media_url,
    target: d.target,
    isActive: d.is_active,
    expiresAt: d.expires_at,
    createdAt: d.created_at.split('T')[0]
  })) as Announcement[];
}

export async function getPublicAnnouncements() {
  // Fetch only active announcements that have not expired
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('announcement')
    .select('*')
    .eq('is_active', true)
    .eq('target', 'public')
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    content: d.content,
    link: d.link,
    mediaUrl: d.media_url,
    target: d.target,
    isActive: d.is_active,
    expiresAt: d.expires_at,
    createdAt: d.created_at.split('T')[0]
  })) as Announcement[];
}

export async function addAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
  const payload = {
    title: announcement.title,
    content: announcement.content,
    link: announcement.link || null,
    media_url: announcement.mediaUrl || null,
    target: announcement.target,
    is_active: announcement.isActive,
    expires_at: announcement.expiresAt || null
  };

  const { data, error } = await supabase.from('announcement').insert(payload).select().single();
  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    link: data.link,
    mediaUrl: data.media_url,
    target: data.target,
    isActive: data.is_active,
    expiresAt: data.expires_at,
    createdAt: data.created_at.split('T')[0]
  };
}

export async function updateAnnouncement(id: number, ann: Omit<Announcement, 'id' | 'createdAt'>): Promise<void> {
  const { error } = await supabase.from('announcement').update({
    title: ann.title,
    content: ann.content,
    link: ann.link || null,
    media_url: ann.mediaUrl || null,
    target: ann.target,
    is_active: ann.isActive,
    expires_at: ann.expiresAt || null
  }).eq('id', id);

  if (error) throw error;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const { error } = await supabase.from('announcement').delete().eq('id', id);
  if (error) throw error;
}

export async function getClinicClosures() {
  const { data, error } = await supabase.from('clinic_holiday').select('*');

  if (error) {
    console.error('Error fetching clinic holidays:', error);
    return [];
  }

  return data.map(d => ({
    id: d.holiday_id,
    date: d.holiday_date,
    reason: d.holiday_name,
    isRecurring: d.is_recurring,
    linkedAnnouncementId: d.linked_announcement_id
  })) as SpecialClosure[];
}
export async function addClinicClosure(closure: Omit<SpecialClosure, 'id'>): Promise<SpecialClosure> {
  const { data, error } = await supabase.from('clinic_holiday').insert({
    holiday_date: closure.date,
    holiday_name: closure.reason,
    is_recurring: false
  }).select().single();

  if (error) throw error;

  return {
    id: data.holiday_id,
    date: data.holiday_date,
    reason: data.holiday_name,
    isRecurring: data.is_recurring,
    linkedAnnouncementId: data.linked_announcement_id
  } as SpecialClosure;
}

export async function linkAnnouncementToHoliday(holidayId: number, announcementId: number): Promise<void> {
  const { error } = await supabase
    .from('clinic_holiday')
    .update({ linked_announcement_id: announcementId })
    .eq('holiday_id', holidayId);
  if (error) throw error;
}

export async function deleteClinicClosure(id: number): Promise<void> {
  const { error } = await supabase.from('clinic_holiday').delete().eq('holiday_id', id);
  if (error) throw error;
}


export async function getShifts() {
  const { data, error } = await supabase.from('schedule').select(`
    *,
    users (
      dentist (dentist_id),
      staff (staff_id)
    )
  `);
  if (error) {
    console.error("getShifts error:", error);
    return [];
  }

  return data.map((d: any) => {
    const isDentist = d.users?.dentist && d.users.dentist.length > 0;
    const isStaff = d.users?.staff && d.users.staff.length > 0;

    return {
      id: d.schedule_id,
      person_id: isDentist ? d.users.dentist[0].dentist_id : (isStaff ? d.users.staff[0].staff_id : 0),
      person_type: isDentist ? 'dentist' : 'staff',
      day_of_week: d.day_of_week,
      start_time: d.start_shift,
      end_time: d.end_shift,
      is_off: d.is_off
    };
  }) as Shift[];
}

export async function updateShift(id: number, updates: Partial<Shift>) {
  const payload: any = {};
  if (updates.start_time !== undefined) payload.start_shift = updates.start_time;
  if (updates.end_time !== undefined) payload.end_shift = updates.end_time;
  if (updates.is_off !== undefined) payload.is_off = updates.is_off;

  const { data, error } = await supabase.from('schedule').update(payload).eq('schedule_id', id).select(`
    *,
    users ( dentist (dentist_id), staff (staff_id) )
  `).single();

  if (error) throw error;

  const isDentist = data.users?.dentist && data.users.dentist.length > 0;
  const isStaff = data.users?.staff && data.users.staff.length > 0;

  return {
    id: data.schedule_id,
    person_id: isDentist ? data.users.dentist[0].dentist_id : (isStaff ? data.users.staff[0].staff_id : 0),
    person_type: isDentist ? 'dentist' : 'staff',
    day_of_week: data.day_of_week,
    start_time: data.start_shift,
    end_time: data.end_shift,
    is_off: data.is_off
  } as Shift;
}

export async function upsertShift(userId: string, dayOfWeek: number, updates: Partial<Shift>) {
  const payload: any = {
    user_id: userId,
    day_of_week: dayOfWeek,
  };
  
  if (updates.start_time !== undefined) payload.start_shift = updates.start_time;
  if (updates.end_time !== undefined) payload.end_shift = updates.end_time;
  if (updates.is_off !== undefined) payload.is_off = updates.is_off;

  // First check if it exists
  const { data: existing, error: findError } = await supabase
    .from('schedule')
    .select('schedule_id')
    .eq('user_id', userId)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (findError) {
    console.error("upsertShift find error:", findError);
    throw findError;
  }

  if (existing) {
    // Update
    const { error: updateError } = await supabase
      .from('schedule')
      .update(payload)
      .eq('schedule_id', existing.schedule_id);
      
    if (updateError) {
      console.error("upsertShift update error:", updateError);
      throw updateError;
    }
  } else {
    // Insert
    const { error: insertError } = await supabase
      .from('schedule')
      .insert(payload);
      
    if (insertError) {
      console.error("upsertShift insert error:", insertError);
      throw insertError;
    }
  }
}

export async function getPromotions() {
  const { data, error } = await supabase.from('promotion').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id,
    tag: d.tag,
    tagColor: d.tag_color,
    title: d.title,
    desc: d.desc_text,
    originalPrice: d.original_price,
    salePrice: d.sale_price,
    validUntil: d.valid_until,
    icon: d.icon,
    highlight: d.highlight,
    isActive: d.is_active,
    expiresAt: d.expires_at
  })) as Promotion[];
}

export async function getPublicPromotions() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('promotion')
    .select('*')
    .eq('is_active', true)
    .gte('valid_until', today)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id,
    tag: d.tag,
    tagColor: d.tag_color,
    title: d.title,
    desc: d.desc_text,
    originalPrice: d.original_price,
    salePrice: d.sale_price,
    validUntil: d.valid_until,
    icon: d.icon,
    highlight: d.highlight,
    isActive: d.is_active,
    expiresAt: d.expires_at
  })) as Promotion[];
}

export async function addPromotion(promo: Omit<Promotion, 'id'>) {
  const payload = {
    tag: promo.tag,
    tag_color: promo.tagColor,
    title: promo.title,
    desc_text: promo.desc,
    original_price: promo.originalPrice,
    sale_price: promo.salePrice,
    valid_until: promo.validUntil,
    icon: promo.icon,
    highlight: promo.highlight,
    is_active: promo.isActive !== false,
    expires_at: promo.expiresAt || null
  };

  const { data, error } = await supabase.from('promotion').insert(payload).select().single();
  if (error) throw error;

  return {
    ...promo,
    id: data.id,
    isActive: data.is_active,
    expiresAt: data.expires_at
  } as Promotion;
}

export async function updatePromotion(id: number, promo: Partial<Promotion>) {
  const payload: any = {};
  if (promo.tag !== undefined) payload.tag = promo.tag;
  if (promo.tagColor !== undefined) payload.tag_color = promo.tagColor;
  if (promo.title !== undefined) payload.title = promo.title;
  if (promo.desc !== undefined) payload.desc_text = promo.desc;
  if (promo.originalPrice !== undefined) payload.original_price = promo.originalPrice;
  if (promo.salePrice !== undefined) payload.sale_price = promo.salePrice;
  if (promo.validUntil !== undefined) payload.valid_until = promo.validUntil;
  if (promo.icon !== undefined) payload.icon = promo.icon;
  if (promo.highlight !== undefined) payload.highlight = promo.highlight;
  if (promo.isActive !== undefined) payload.is_active = promo.isActive;
  if (promo.expiresAt !== undefined) payload.expires_at = promo.expiresAt;

  const { data, error } = await supabase.from('promotion').update(payload).eq('id', id).select().single();
  if (error) throw error;

  return {
    id: data.id,
    tag: data.tag,
    tagColor: data.tag_color,
    title: data.title,
    desc: data.desc_text,
    originalPrice: data.original_price,
    salePrice: data.sale_price,
    validUntil: data.valid_until,
    icon: data.icon,
    highlight: data.highlight,
    isActive: data.is_active,
    expiresAt: data.expires_at
  } as Promotion;
}

export async function deletePromotion(id: number) {
  const { error } = await supabase.from('promotion').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteServiceCategory(id: number) {
  const { error } = await supabase.from('service_category').delete().eq('category_id', id);
  if (error) throw error;
}

export async function getDoctorSchedules() {
  const { data, error } = await supabase.from('schedule').select('user_id, day_of_week, start_shift, end_shift, is_off');
  if (error || !data) return [];

  const { data: dentists } = await supabase.from('dentist').select('dentist_id, user_id');
  if (!dentists) return [];

  return data.map((s: any) => {
    const d = dentists.find((d: any) => d.user_id === s.user_id);
    return {
      dentistId: d?.dentist_id,
      dayOfWeek: s.day_of_week,
      isOff: s.is_off,
      start: s.start_shift,
      end: s.end_shift
    };
  }).filter((s: any) => s.dentistId !== undefined);
}

// --- Bulk calendar: ตรวจสอบวันที่คิวเต็มทั้งเดือนในครั้งเดียว ---
export async function getMonthlyFullyBookedDates(
  year: number,
  month: number,
  serviceId?: number,
  doctorId?: number,
  estTimeMins: number = 30
): Promise<string[]> {
  const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDateObj = new Date(year, month + 1, 0);
  const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

  // ดึงข้อมูลทั้งหมดที่ต้องใช้ใน batch เดียว
  const [dailyHours, holidaysRes, dentistUsersRes, leavesRes, shiftsRes, appointmentsRes] = await Promise.all([
    getDailyHours(),
    supabase.from('clinic_holiday').select('holiday_date').gte('holiday_date', startDateStr).lte('holiday_date', endDateStr),
    supabase.from('dentist').select('dentist_id, user_id'),
    supabase.from('leave_record').select('user_id, leave_period, leave_date').gte('leave_date', startDateStr).lte('leave_date', endDateStr).eq('is_approved', true),
    supabase.from('schedule').select('users!inner(dentist(dentist_id)), start_shift, end_shift, is_off, day_of_week'),
    supabase.from('appointment').select('appointment_date, dentist_id, start_time, end_time_est').gte('appointment_date', startDateStr).lte('appointment_date', endDateStr).in('appointment_status', ['รอการยืนยัน', 'ยืนยันการจอง', 'เช็คอินเรียบร้อย', 'กำลังรักษา', 'รอชำระเงิน']),
  ]);

  const holidaySet = new Set((holidaysRes.data || []).map((h: any) => h.holiday_date));
  const allDentistUsers = dentistUsersRes.data || [];
  const allLeaves = leavesRes.data || [];
  const allShifts = shiftsRes.data || [];
  const allAppointments = appointmentsRes.data || [];

  // หา targetDoctorIds
  let targetDoctorIds: number[] = [];
  if (doctorId) {
    targetDoctorIds = [doctorId];
  } else if (serviceId) {
    const { data: dsData } = await supabase.from('dentist_service').select('dentist_id').eq('service_id', serviceId);
    if (dsData && dsData.length > 0) {
      targetDoctorIds = dsData.map((d: any) => d.dentist_id);
    } else {
      // ถ้าบริการนี้ไม่มีหมอเฉพาะ ให้ใช้หมอทั้งหมด
      targetDoctorIds = allDentistUsers.map((d: any) => d.dentist_id);
    }
  } else {
    targetDoctorIds = allDentistUsers.map((d: any) => d.dentist_id);
  }

  // ถ้าไม่มีหมอเลยในระบบ ไม่ต้อง mark วันไหนว่าเต็ม
  if (targetDoctorIds.length === 0) return [];

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const reqSlots = Math.ceil(estTimeMins / 30);
  const fullyBooked: string[] = [];

  for (let d = 1; d <= endDateObj.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (dateStr < todayStr) continue;
    if (holidaySet.has(dateStr)) continue;

    const dateObj = new Date(year, month, d);
    const dayOfWeek = dateObj.getDay();
    const dayHours = dailyHours[dayOfWeek.toString()];
    if (!dayHours) continue;

    const [openH, openM] = dayHours.open.split(':').map(Number);
    const [closeH, closeM] = dayHours.close.split(':').map(Number);
    const clinicOpenMin = openH * 60 + openM;
    const clinicCloseMin = closeH * 60 + closeM;
    if (clinicOpenMin >= clinicCloseMin) continue;

    const isToday = dateStr === todayStr;
    const dayAppointments = allAppointments.filter((a: any) => a.appointment_date === dateStr);
    const dayLeaves = allLeaves.filter((l: any) => l.leave_date === dateStr);

    const slots: { time: string; status: string }[] = [];

    for (let min = clinicOpenMin; min <= clinicCloseMin - 30; min += 30) {
      const hh = Math.floor(min / 60);
      const mm = min % 60;
      const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

      if (isToday && min <= currentMin) {
        slots.push({ time: timeStr, status: 'past' });
        continue;
      }

      let anyAvailable = false;
      for (const dId of targetDoctorIds) {
        const dUser = allDentistUsers.find((du: any) => du.dentist_id === dId);
        if (!dUser) continue;

        // เช็คลาเต็มวัน
        const docFullDayLeave = dayLeaves.find((l: any) => l.user_id === dUser.user_id && l.leave_period === 'เต็มวัน');
        if (docFullDayLeave) continue;

        // เช็คเวรประจำวัน
        const shift = allShifts.find((s: any) => {
          const dentistId = s.users?.dentist?.dentist_id ?? s.users?.dentist?.[0]?.dentist_id;
          return dentistId === dId && s.day_of_week === dayOfWeek;
        });

        let isWorking = true;
        if (shift) {
          if (shift.is_off) { isWorking = false; }
          else {
            const [sH, sM] = (shift.start_shift || '00:00').split(':').map(Number);
            const [eH, eM] = (shift.end_shift || '23:59').split(':').map(Number);
            const shiftStart = sH * 60 + sM;
            const shiftEnd = eH * 60 + eM;
            if (min < shiftStart || min >= shiftEnd) isWorking = false;
          }
        }
        if (!isWorking) continue;

        // เช็คลาครึ่งวัน
        const docPartLeave = dayLeaves.find((l: any) => l.user_id === dUser.user_id && l.leave_period !== 'เต็มวัน');
        if (docPartLeave) {
          if (docPartLeave.leave_period === 'ครึ่งวันเช้า' && min < 13 * 60) continue;
          if (docPartLeave.leave_period === 'ครึ่งวันบ่าย' && min >= 13 * 60) continue;
        }

        // เช็คว่า slot ถูกจองหรือยัง
        let hasConflict = false;
        for (const app of dayAppointments) {
          if (app.dentist_id !== dId || !app.start_time || !app.end_time_est) continue;
          const [aSh, aSm] = app.start_time.split(':').map(Number);
          const [aEh, aEm] = app.end_time_est.split(':').map(Number);
          if ((aSh * 60 + aSm) < min + 30 && (aEh * 60 + aEm) > min) {
            hasConflict = true;
            break;
          }
        }
        if (!hasConflict) { anyAvailable = true; break; }
      }
      slots.push({ time: timeStr, status: anyAvailable ? 'available' : 'booked' });
    }

    // ตรวจว่ามี consecutive slots เพียงพอสำหรับบริการนี้หรือไม่
    let hasAnyCanBook = false;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].status !== 'available') continue;
      let ok = true;
      for (let j = 1; j < reqSlots; j++) {
        if (i + j >= slots.length || slots[i + j].status !== 'available') { ok = false; break; }
        const [pH, pM] = slots[i + j - 1].time.split(':').map(Number);
        const [cH, cM] = slots[i + j].time.split(':').map(Number);
        if ((cH * 60 + cM) - (pH * 60 + pM) !== 30) { ok = false; break; }
      }
      if (ok) { hasAnyCanBook = true; break; }
    }

    // mark ว่าเต็มเมื่อ: มี slot ที่ควรจองได้ (ไม่ใช่แค่ past ทั้งหมด) แต่ไม่มีช่วงว่างเลย
    const hasBookableSlots = slots.some(s => s.status !== 'past');
    if (hasBookableSlots && !hasAnyCanBook) {
      fullyBooked.push(dateStr);
    }
  }

  return fullyBooked;
}