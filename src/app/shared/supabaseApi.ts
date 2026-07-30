import { createClient } from '@supabase/supabase-js';
import { supabase } from './utils/supabaseClient';
import { sendOTPEmail } from './utils/emailService';
export { supabase };
import { RegForm } from '../patient/types';
import { Appointment, DentistInfo, PatientInfo, StaffInfo, ServiceInfo, LeaveRequest, Announcement, SpecialClosure, Shift, Promotion, TreatmentPlan } from './data';

// ============================================================================
// ADAPTER: V4 Normalized Schema
// This file has been updated to fetch data from the 15 normalized tables.
// ============================================================================

// --- Dentists ---
export async function getDentists() {
  // ดึงข้อมูลจากตาราง dentist และ JOIN กับ users และ profile
  const { data, error } = await supabase.from('dentist').select(`
    *,
    users (
      email,
      account_status,
      profile (first_name, last_name, phone_number)
    ),
    dentist_service (
      service_id
    )
  `);
  if (error) {
    console.error("getDentists error:", error);
    return [];
  }
  
  return data.map((d: any) => {
    const p = d.users?.profile;
    return {
      id: d.dentist_id,
      name: p ? `${d.title_name || ''} ${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      specialty: d.specialization || 'ทันตกรรมทั่วไป',
      license: d.license_number,
      university: 'N/A', 
      email: d.users?.email || '',
      phone: p?.phone_number || '',
      active: d.users?.account_status === 'active',
      userId: d.user_id,
      serviceIds: d.dentist_service?.map((ds: any) => ds.service_id) || [],
      defaultRoom: d.default_room
    };
  }) as DentistInfo[];
}

export async function updateDentistRoom(id: number, roomName: string): Promise<void> {
  const { error } = await supabase.from('dentist').update({ default_room: roomName }).eq('dentist_id', id);
  if (error) throw error;
}

export async function getClinicRooms(): Promise<string[]> {
  const { data, error } = await supabase.from('clinic_settings').select('*').eq('setting_key', 'clinic_rooms').single();
  if (error || !data) return ['ห้อง A-101', 'ห้อง B-202', 'ห้อง C-303'];
  try {
    return typeof data.setting_value === 'string' ? JSON.parse(data.setting_value) : data.setting_value;
  } catch (e) {
    return ['ห้อง A-101', 'ห้อง B-202', 'ห้อง C-303'];
  }
}

export async function updateClinicRooms(rooms: string[]): Promise<void> {
  const { error } = await supabase.from('clinic_settings').upsert({
    setting_key: 'clinic_rooms',
    setting_value: JSON.stringify(rooms)
  }, { onConflict: 'setting_key' });
  if (error) throw error;
}

export async function addDentist(dentist: Omit<DentistInfo, 'id'>): Promise<DentistInfo> {
  // สร้าง Admin Client สำหรับจัดการ Auth โดยเฉพาะ (ข้อควรระวัง: ในโปรดักชัน ควรทำผ่าน Edge Function / Backend เพื่อความปลอดภัย)
  const adminAuthClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  // 1. สร้างบัญชีผู้ใช้ใน Supabase Auth จริงๆ
  const { data: authData, error: authErr } = await adminAuthClient.auth.admin.createUser({
    email: dentist.email,
    password: 'password123', // รหัสผ่านตั้งต้น
    email_confirm: true
  });

  if (authErr) {
    console.error("Auth creation failed:", authErr);
    throw new Error("ไม่สามารถสร้างบัญชีผู้ใช้ได้ (อีเมลอาจซ้ำ หรือไม่มีสิทธิ์ Admin)");
  }

  const realUserId = authData.user.id;
  const mockCitizenId = '9' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  const names = dentist.name.split(' ');
  
  await supabase.from('profile').insert({
    citizen_id: mockCitizenId,
    first_name: names[0] || '',
    last_name: names.slice(1).join(' ') || '',
    phone_number: dentist.phone
  });

  await supabase.from('users').insert({
    user_id: realUserId,
    citizen_id: mockCitizenId,
    email: dentist.email,
    role: 'ทันตแพทย์',
    mock_password: 'password123',
    account_status: dentist.active ? 'active' : 'inactive'
  });

  const { data, error } = await supabase.from('dentist').insert({
    user_id: realUserId,
    title_name: 'ทพ.',
    specialization: dentist.specialty,
    license_number: dentist.license
  }).select().single();
  
  if (error) throw error;
  
  if (dentist.serviceIds && dentist.serviceIds.length > 0) {
    const dsInserts = dentist.serviceIds.map(sid => ({ dentist_id: data.dentist_id, service_id: sid }));
    await supabase.from('dentist_service').insert(dsInserts);
  }
  
  return { ...dentist, id: data.dentist_id, userId: realUserId };
}
export async function updateDentist(id: number, updates: Partial<DentistInfo>): Promise<DentistInfo> {
  const dentistUpdates: any = {};
  if (updates.specialty !== undefined) dentistUpdates.specialization = updates.specialty;
  if (updates.license !== undefined) dentistUpdates.license_number = updates.license;
  if (Object.keys(dentistUpdates).length > 0) {
    const { error } = await supabase.from('dentist').update(dentistUpdates).eq('dentist_id', id);
    if (error) throw error;
  }
  if (updates.active !== undefined) {
    const { data } = await supabase.from('dentist').select('user_id').eq('dentist_id', id).single();
    if (data?.user_id) {
      await supabase.from('users').update({ account_status: updates.active ? 'active' : 'inactive' }).eq('user_id', data.user_id);
    }
  }
  
  if (updates.serviceIds !== undefined) {
    await supabase.from('dentist_service').delete().eq('dentist_id', id);
    if (updates.serviceIds.length > 0) {
      const dsInserts = updates.serviceIds.map(sid => ({ dentist_id: id, service_id: sid }));
      await supabase.from('dentist_service').insert(dsInserts);
    }
  }
  
  return { id, ...updates } as DentistInfo;
}
export async function deleteDentist(id: number): Promise<void> {
  await supabase.from('dentist').delete().eq('dentist_id', id);
}

// --- Admins ---
export async function getAdmins() {
  const { data, error } = await supabase.from('users').select(`
    user_id,
    email,
    account_status,
    profile (first_name, last_name, phone_number)
  `).eq('role', 'admin');
  
  if (error) {
    console.error("getAdmins error:", error);
    return [];
  }
  
  return data.map((d: any) => {
    const p = d.profile;
    return {
      id: d.user_id,
      name: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      email: d.email || '',
      phone: p?.phone_number || '',
      active: d.account_status === 'active'
    };
  });
}

export async function addAdmin(admin: any) {
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
  const citizenIdToUse = admin.citizenId && admin.citizenId.trim() !== '' 
    ? admin.citizenId 
    : '9' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    
  const names = admin.name.split(' ');
  await supabase.from('profile').insert({
    citizen_id: citizenIdToUse,
    first_name: names[0] || '',
    last_name: names.slice(1).join(' ') || '',
    phone_number: admin.phone
  });
  await supabase.from('users').insert({
    user_id: realUserId,
    citizen_id: citizenIdToUse,
    email: admin.email,
    role: 'admin',
    account_status: admin.active ? 'active' : 'inactive'
  });

  return {
    id: realUserId,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    active: admin.active
  };
}

export async function updateAdmin(id: string, updates: any) {
  if (updates.active !== undefined) {
    await supabase.from('users').update({ account_status: updates.active ? 'active' : 'inactive' }).eq('user_id', id);
  }
  // Other updates if necessary
  return { id, ...updates };
}

// --- Staff ---
export async function getStaff() {
  const { data, error } = await supabase.from('staff').select(`
    *,
    users (
      email,
      profile (first_name, last_name, phone_number)
    )
  `);
  if (error) {
    console.error("getStaff error:", error);
    return [];
  }
  
  return data.map((d: any) => {
    const p = d.users?.profile;
    return {
      id: d.staff_id,
      name: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      role: d.position || 'พนักงาน',
      email: d.users?.email || '',
      phone: p?.phone_number || '',
      startDate: d.hire_date,
      active: d.employment_status === 'ปฏิบัติงานปกติ'
    };
  }) as StaffInfo[];
}

export async function addStaff(staff: Omit<StaffInfo, 'id'>): Promise<StaffInfo> {
  // สร้าง Admin Client สำหรับจัดการ Auth โดยเฉพาะ
  const adminAuthClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  // 1. สร้างบัญชีผู้ใช้ใน Supabase Auth จริงๆ
  const { data: authData, error: authErr } = await adminAuthClient.auth.admin.createUser({
    email: staff.email,
    password: 'password123', // รหัสผ่านตั้งต้น
    email_confirm: true
  });

  if (authErr) {
    console.error("Auth creation failed:", authErr);
    throw new Error("ไม่สามารถสร้างบัญชีผู้ใช้พนักงานได้ (อีเมลอาจซ้ำ หรือไม่มีสิทธิ์ Admin)");
  }

  const realUserId = authData.user.id;
  const mockCitizenId = '8' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  const names = staff.name.split(' ');
  await supabase.from('profile').insert({
    citizen_id: mockCitizenId,
    first_name: names[0] || '',
    last_name: names.slice(1).join(' ') || '',
    phone_number: staff.phone
  });
  await supabase.from('users').insert({
    user_id: realUserId,
    citizen_id: mockCitizenId,
    email: staff.email,
    role: 'พนักงาน',
    mock_password: 'password123',
    account_status: staff.active ? 'active' : 'inactive'
  });
  const { data, error } = await supabase.from('staff').insert({
    user_id: realUserId,
    position: staff.role,
    employment_status: staff.active ? 'ปฏิบัติงานปกติ' : 'พักงาน',
    hire_date: staff.startDate
  }).select().single();
  
  if (error) throw error;
  return { ...staff, id: data.staff_id };
}
export async function updateStaff(id: number, updates: Partial<StaffInfo>): Promise<StaffInfo> {
  const staffUpdates: any = {};
  if (updates.role !== undefined) staffUpdates.position = updates.role;
  if (updates.active !== undefined) staffUpdates.employment_status = updates.active ? 'ปฏิบัติงานปกติ' : 'พักงาน';
  
  if (Object.keys(staffUpdates).length > 0) {
    const { error } = await supabase.from('staff').update(staffUpdates).eq('staff_id', id);
    if (error) throw error;
  }
  return { id, ...updates } as StaffInfo;
}
export async function deleteStaff(id: number): Promise<void> {
  await supabase.from('staff').delete().eq('staff_id', id);
}

// --- Services ---
export async function getServices() {
  const { data, error } = await supabase.from('service').select('*');
  if (error) return [];
  
  return data.map((d: any) => ({
    id: d.service_id,
    name: d.service_name,
    description: `ใช้เวลาประมาณ ${d.estimated_time} นาที`,
    basePrice: d.base_price,
    category: d.service_category,
    estimatedTime: d.estimated_time,
    active: true
  })) as ServiceInfo[];
}

export async function addService(service: Omit<ServiceInfo, 'id'>) {
  const estimatedTime = service.estimatedTime || 30;
  const { data, error } = await supabase.from('service').insert({
    service_name: service.name,
    base_price: service.basePrice,
    service_category: service.category,
    estimated_time: estimatedTime
  }).select().single();
  if (error) throw error;
  return { ...service, id: data.service_id, estimatedTime, description: `ใช้เวลาประมาณ ${estimatedTime} นาที` } as ServiceInfo;
}
export async function updateService(id: number, updates: Partial<ServiceInfo>): Promise<ServiceInfo> {
  const serviceUpdates: any = {};
  if (updates.name !== undefined) serviceUpdates.service_name = updates.name;
  if (updates.basePrice !== undefined) serviceUpdates.base_price = updates.basePrice;
  if (updates.category !== undefined) serviceUpdates.service_category = updates.category;
  if (updates.estimatedTime !== undefined) serviceUpdates.estimated_time = updates.estimatedTime;
  
  const { error } = await supabase.from('service').update(serviceUpdates).eq('service_id', id);
  if (error) throw error;
  return { id, ...updates } as ServiceInfo;
}
export async function deleteService(id: number): Promise<void> {
  await supabase.from('service').delete().eq('service_id', id);
}

// --- Landing Page Data ---
export async function getLandingServices() {
  const { data, error } = await supabase.from('service').select('*');
  if (error) return [];
  
  return data.map((d: any) => ({
    serviceId: d.service_id,
    iconName: d.icon_name || 'Smile',
    title: d.service_name,
    desc: d.description || `บริการระดับมืออาชีพ ใช้เวลาประมาณ ${d.estimated_time} นาที`,
    price: `เริ่มต้น ${d.base_price.toLocaleString()} บาท`,
    color: d.color_code || '#FFE8EC',
    type: d.service_type || 'general',
    baseTimeMins: d.estimated_time || 30
  }));
}

export async function getPaymentPlans(serviceId: number) {
  const { data, error } = await supabase
    .from('payment_plan')
    .select('*')
    .eq('service_id', serviceId)
    .order('plan_id', { ascending: true });
    
  if (error) {
    console.error("getPaymentPlans error:", error);
    return [];
  }
  return data;
}

export async function getLandingDoctors() {
  const { data, error } = await supabase.from('dentist').select('*, users(profile(first_name, last_name))');
  if (error) return [];
  
  return data.map((d: any) => ({
    id: d.dentist_id,
    name: `${d.title_name || ''} ${d.users?.profile?.first_name} ${d.users?.profile?.last_name}`,
    specialty: d.specialization || 'ทันตแพทย์',
    img: d.image_url || 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&auto=format',
    years: d.years_of_experience || 'ประสบการณ์ 5 ปี+'
  }));
}

// ดึงหมอที่ทำบริการ (service_id) นั้นได้ ผ่านตาราง dentist_service
export async function getDentistsByService(serviceId: number) {
  const { data, error } = await supabase
    .from('dentist_service')
    .select('dentist_id, dentist(dentist_id, title_name, specialization, image_url, years_of_experience, users(profile(first_name, last_name)))')
    .eq('service_id', serviceId);
  if (error || !data) return [];

  return data.map((row: any) => {
    const d = row.dentist;
    if (!d) return null;
    return {
      id: d.dentist_id,
      name: `${d.title_name || ''} ${d.users?.profile?.first_name} ${d.users?.profile?.last_name}`,
      specialty: d.specialization || 'ทันตแพทย์',
      img: d.image_url || 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&auto=format',
      years: d.years_of_experience || 'ประสบการณ์ 5 ปี+'
    };
  }).filter(Boolean);
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
    )
  `);
  if (error) {
    console.error("getPatients error:", error);
    return [];
  }
  
  return data.map((d: any) => {
    const p = d.users?.profile;
    return {
      id: d.patient_id,
      hn: `HN${String(d.patient_id).padStart(3, '0')}`,
      name: p ? `${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      email: d.users?.email || '',
      phone: p?.phone_number || '',
      allergyHistory: d.allergy_history || 'ไม่มีประวัติ',
      underlyingDisease: d.underlying_disease || 'ไม่มี'
    };
  }) as PatientInfo[];
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
}): Promise<any> {
  // สร้าง Admin Client สำหรับจัดการ Auth โดยเฉพาะ
  const adminAuthClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  const defaultPassword = patient.password || 'demo1234';

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
  const { error: pErr } = await supabase.from('profile').insert({
    citizen_id: patient.citizenId,
    first_name: patient.firstName,
    last_name: patient.lastName,
    phone_number: patient.phone,
    gender: patient.gender || '',
    birth_date: patient.dob || null,
    address: patient.address || ''
  });
  if (pErr) { console.error("Profile insert error:", pErr); throw pErr; }

  // 3. สร้าง Users
  const { error: uErr } = await supabase.from('users').insert({
    user_id: realUserId,
    citizen_id: patient.citizenId,
    email: patient.email,
    role: 'คนไข้',
    mock_password: defaultPassword,
    account_status: 'active'
  });
  if (uErr) { console.error("Users insert error:", uErr); throw uErr; }

  // 4. สร้าง Patient
  const { data: patData, error: patErr } = await supabase.from('patient').insert({
    user_id: realUserId,
    allergy_history: patient.allergyHistory || 'ไม่มี',
    underlying_disease: patient.underlyingDisease || 'ไม่มี',
    emergency_contact_name: patient.emergencyContactName || '-',
    emergency_contact_phone: patient.emergencyContactPhone || '-'
  }).select().single();
  if (patErr) { console.error("Patient insert error:", patErr); throw patErr; }

  return { id: patData.patient_id, userId: realUserId };
}

// --- เปลี่ยนรหัสผ่าน (จากภายในระบบ ต้องกรอกรหัสเดิมก่อน) ---
export async function changePassword(currentPassword: string, newPassword: string) {
  // 1. ดึง email ของผู้ใช้ที่ล็อกอินอยู่
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error("ไม่พบข้อมูลผู้ใช้ที่ล็อกอินอยู่");

  // 2. ทดสอบล็อกอินด้วยรหัสผ่านเดิมเพื่อยืนยันตัวตน
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });
  if (verifyErr) throw new Error("รหัสผ่านเดิมไม่ถูกต้อง");

  // 3. เปลี่ยนรหัสผ่านเป็นรหัสใหม่
  const { error: updateErr } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (updateErr) throw new Error("ไม่สามารถเปลี่ยนรหัสผ่านได้: " + updateErr.message);

  return true;
}

export async function loginPatient(email: string, pass: string) {
  // Use real Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: pass
  });
  
  if (authError || !authData.user) {
    throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  // Get user profile using the authenticated user id
  const profile = await getPatientProfileByUserId(authData.user.id);
  if (!profile) {
    // If not a patient, they might be a staff/admin. We still return something so AuthShell knows login succeeded.
    // In a full implementation, we'd fetch staff profile here.
    return { email: authData.user.email };
  }
  return profile;
}



export async function getPatientProfileByUserId(userId: string) {
  const { data, error } = await supabase.from('users').select(`
    *,
    profile (*)
  `).eq('user_id', userId).single();
  
  if (error || !data || !data.profile) return null;
  
  const p = data.profile;
  const { data: patientData } = await supabase.from('patient').select('*').eq('user_id', userId).single();
  
  return {
    patientId: patientData?.patient_id,
    firstName: p.first_name,
    lastName: p.last_name,
    idCard: p.citizen_id,
    dob: p.birth_date,
    gender: p.gender,
    phone: p.phone_number,
    email: data.email,
    emergencyName: patientData?.emergency_contact_name || '',
    emergencyPhone: patientData?.emergency_contact_phone || '',
    conditions: patientData?.underlying_disease || '',
    allergies: patientData?.allergy_history || ''
  };
}

// --- Appointments ---
export async function getAppointments(date?: string) {
  let query = supabase.from('appointment').select(`
    *,
    patient (
      *,
      users ( profile (first_name, last_name, phone_number) )
    ),
    appointment_detail ( service (service_name) ),
    treatment_record ( dentist_id, doctor_note, odontogram_data, payment (total_amount, payment_status), dentist ( users ( profile (first_name, last_name) ) ) )
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
    let doctorId = 0;
    let cost = 0;
    let paid = false;
    let treatmentNotes = '';
    let recommendations = '';
    
    if (d.treatment_record && d.treatment_record.length > 0) {
      const tr = d.treatment_record[0];
      const docProf = tr.dentist?.users?.profile;
      if (docProf) {
        doctorName = `${docProf.first_name} ${docProf.last_name}`;
        doctorId = tr.dentist_id;
      }
      if (tr.doctor_note) {
        const parts = tr.doctor_note.split('\\nคำแนะนำ: ');
        treatmentNotes = parts[0];
        if (parts.length > 1) recommendations = parts[1];
      }
      if (tr.payment && tr.payment.length > 0) {
        cost = tr.payment[0].total_amount || 0;
        paid = tr.payment[0].payment_status === 'ชำระแล้ว';
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
      time: d.start_time?.slice(0,5) || '00:00',
      endTime: d.end_time_est?.slice(0,5) || d.start_time?.slice(0,5) || '00:00',
      status: d.appointment_status || 'รอการยืนยัน',
      conditions: d.patient?.underlying_disease || '',
      allergies: d.patient?.allergy_history || '',
      treatmentNotes,
      recommendations,
      cost,
      paid,
      note: d.note,
      odontogramData: d.treatment_record?.[0]?.odontogram_data
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
      users ( profile (first_name, last_name, phone_number) )
    ),
    appointment_detail ( service (service_name) ),
    treatment_record ( dentist_id, doctor_note, payment (total_amount, payment_status), dentist ( users ( profile (first_name, last_name) ) ) )
  `).eq('patient_id', targetPatientId);

  if (error) {
    console.error("getPatientAppointments error:", error);
    return [];
  }

  return data.map((d: any) => {
    const p = d.patient?.users?.profile;
    const services = d.appointment_detail?.map((ad: any) => ad.service?.service_name).join(', ') || 'ไม่ได้ระบุบริการ';
    
    let doctorName = 'รอระบุแพทย์';
    let doctorId = 0;
    let cost = 0;
    let paid = false;
    let treatmentNotes = '';
    let recommendations = '';
    
    if (d.treatment_record && d.treatment_record.length > 0) {
      const tr = d.treatment_record[0];
      const docProf = tr.dentist?.users?.profile;
      if (docProf) {
        doctorName = `${docProf.first_name} ${docProf.last_name}`;
        doctorId = tr.dentist_id;
      }
      if (tr.doctor_note) {
        const parts = tr.doctor_note.split('\\nคำแนะนำ: ');
        treatmentNotes = parts[0];
        if (parts.length > 1) recommendations = parts[1];
      }
      if (tr.payment && tr.payment.length > 0) {
        cost = tr.payment[0].total_amount || 0;
        paid = tr.payment[0].payment_status === 'ชำระแล้ว';
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
      time: d.start_time?.slice(0,5) || '00:00',
      endTime: d.end_time_est?.slice(0,5) || d.start_time?.slice(0,5) || '00:00',
      status: d.appointment_status || 'รอการยืนยัน',
      conditions: d.patient?.underlying_disease || '',
      allergies: d.patient?.allergy_history || '',
      treatmentNotes,
      recommendations,
      cost,
      paid,
      note: d.note,
      odontogramData: d.treatment_record?.[0]?.odontogram_data
    };
  }) as Appointment[];
}

// --- Patient-specific: ดึงเฉพาะประวัติการรักษาของคนไข้ที่ล็อกอินอยู่ ---
export async function getPatientTreatmentRecords(patientId?: number) {
  let targetPatientId = patientId;

  if (!targetPatientId) {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return [];

    const { data: patientData } = await supabase
      .from('patient')
      .select('patient_id')
      .eq('user_id', authUser.id)
      .single();

    if (!patientData) return [];
    targetPatientId = patientData.patient_id;
  }

  const { data, error } = await supabase.from('treatment_record').select(`
    *,
    odontogram_data,
    appointment!inner(start_time, appointment_status, appointment_detail ( service (service_name) )),
    dentist ( users ( profile (first_name, last_name) ) ),
    treatment_detail ( actual_price, diagnosis, tooth_number, service (service_name) ),
    payment (total_amount)
  `).eq('patient_id', targetPatientId);

  if (error) return [];

  return data.map((d: any) => {
    const dr = d.dentist?.users?.profile;
    const detail = d.treatment_detail?.[0];
    const apptDetail = d.appointment?.appointment_detail?.[0];
    const srvName = detail?.service?.service_name || apptDetail?.service?.service_name || 'ไม่ระบุบริการ';
    const costAmt = d.payment?.[0]?.total_amount || detail?.actual_price || 0;
    
    let treatmentNotes = d.doctor_note || '';
    let recommendations = detail?.diagnosis || '';
    if (d.doctor_note) {
      const parts = d.doctor_note.split('\\nคำแนะนำ: ');
      treatmentNotes = parts[0];
      if (parts.length > 1) recommendations = parts[1];
    }

    return {
      id: d.treatment_id,
      service: srvName,
      doctor: dr ? `${dr.first_name} ${dr.last_name}` : 'ไม่ระบุแพทย์',
      date: d.treatment_date,
      time: d.appointment?.start_time?.slice(0,5) || '00:00',
      cost: costAmt.toLocaleString(),
      notes: treatmentNotes,
      teeth: detail?.tooth_number || '',
      recommendations: recommendations,
      odontogramData: d.odontogram_data
    };
  });
}

export async function getPatientLatestOdontogram(patientId: number) {
  const { data } = await supabase.from('treatment_record')
    .select('odontogram_data')
    .eq('patient_id', patientId)
    .not('odontogram_data', 'is', null)
    .order('treatment_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.odontogram_data || {};
}

export async function addAppointment(appointment: Omit<Appointment, 'id'>) {
  // 1. Conflict Check (Backend Level)
  if (appointment.doctorId) {
    const { data: overlapping } = await supabase.from('treatment_record')
      .select('appointment_id, appointment!inner(appointment_date, start_time, end_time_est, appointment_status)')
      .eq('dentist_id', appointment.doctorId)
      .eq('appointment.appointment_date', appointment.date);
    
    if (overlapping && overlapping.length > 0) {
      const duration = appointment.durationMins || 30;
      const [newH, newM] = (appointment.time || "00:00").split(':').map(Number);
      const newStartMins = (newH * 60) + newM;
      const newEndMins = newStartMins + duration;

      for (const rec of overlapping) {
        if (!rec.appointment) continue;
        const apptData = Array.isArray(rec.appointment) ? rec.appointment[0] : rec.appointment;
        if (apptData.appointment_status === 'ยกเลิก' || apptData.appointment_status === 'ไม่มาตามนัด') continue;
        
        const [existH, existM] = (apptData.start_time || "00:00").split(':').map(Number);
        const existStartMins = (existH * 60) + existM;
        const [existEH, existEM] = (apptData.end_time_est || "00:00").split(':').map(Number);
        const existEndMins = (existEH * 60) + existEM;

        if (newStartMins < existEndMins && newEndMins > existStartMins) {
          throw new Error(`คิวทับซ้อน: ทันตแพทย์ติดคิวเวลา ${apptData.start_time.substring(0,5)} - ${apptData.end_time_est.substring(0,5)} แล้ว`);
        }
      }
    }
  }

  // 2. Resolve Patient ID
  let finalPatientId = appointment.patientId;
  if (!finalPatientId) {
    const { data: patData } = await supabase.from('patient').select('patient_id, users!inner(profile!inner(first_name, last_name, phone_number))');
    if (patData && patData.length > 0) {
      const matched = patData.find((p: any) => 
        (appointment.patientPhone && p.users?.profile?.phone_number === appointment.patientPhone) ||
        (appointment.patientName && (p.users?.profile?.first_name + ' ' + p.users?.profile?.last_name).includes(appointment.patientName))
      );
      if (matched) finalPatientId = matched.patient_id;
    }
    
    if (!finalPatientId) {
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
  
  if (appointment.doctorId) {
    // We already have doctorId, but we need to ensure the appointment schema maps it if needed. 
    // In normalized schema, appointment doesn't have doctor_id, it is in treatment_record.
    // We can just proceed.
  }

  // Calculate end_time_est based on durationMins (default to 30 if not provided)
  const duration = appointment.durationMins || 30;
  const [hh, mm] = (appointment.time || "00:00").split(':').map(Number);
  const totalMins = (hh * 60) + mm + duration;
  const endHh = Math.floor(totalMins / 60);
  const endMm = totalMins % 60;
  const endTimeStr = `${String(endHh).padStart(2, '0')}:${String(endMm).padStart(2, '0')}:00`;

  // 4. Insert Appointment
  const { data: newAppt, error: apptErr } = await supabase
    .from('appointment')
    .insert({
      patient_id: finalPatientId,
      appointment_date: appointment.date || null,
      start_time: appointment.time ? appointment.time + ':00' : null,
      end_time_est: appointment.time ? endTimeStr : null,
      appointment_status: appointment.status,
      channel: appointment.source === 'doctor' ? 'Walk-in' : 'ออนไลน์',
      plan_id: appointment.paymentPlanId || null,
      note: appointment.note || null
    })
    .select()
    .single();

  if (apptErr) throw apptErr;

  // 5. Insert Appointment Detail
  const { error: detailErr } = await supabase.from('appointment_detail').insert({
    appointment_id: newAppt.appointment_id,
    service_id: finalServiceId
  });
  if (detailErr) {
    console.error("Error inserting appointment detail:", detailErr);
  }

  // 6. Insert Treatment Record to map Doctor (if selected)
  if (appointment.doctorId) {
    const { error: trErr } = await supabase.from('treatment_record').insert({
      appointment_id: newAppt.appointment_id,
      dentist_id: appointment.doctorId,
      patient_id: finalPatientId,
      treatment_date: appointment.date,
      doctor_note: ''
    });
    if (trErr) {
      console.error("Error inserting treatment record:", trErr);
      // We log but might not want to crash the whole appointment if dentist is invalid
    }
  }

  return newAppt;
}
export async function updateAppointmentStatus(id: number, status: string) {
  const { data, error } = await supabase.from('appointment').update({ appointment_status: status }).eq('appointment_id', id).select().single();
  if (error) throw error;
  return { id: data.appointment_id, status: data.appointment_status } as any;
}

export async function saveTreatment(apptId: number, notes: string, recommendations: string, services: string[], cost: number, toothData?: Record<number, string>) {
  // 1. Update appointment status
  await supabase.from('appointment').update({ appointment_status: 'รอชำระเงิน' }).eq('appointment_id', apptId);
  
  // 2. Fetch treatment_record
  const { data: trData } = await supabase.from('treatment_record').select('treatment_id').eq('appointment_id', apptId).single();
  let treatmentId = trData?.treatment_id;
  
  // Update or insert treatment record
  const fullNote = notes + (recommendations ? "\\nคำแนะนำ: " + recommendations : "");
  if (treatmentId) {
    await supabase.from('treatment_record').update({ 
      doctor_note: fullNote,
      odontogram_data: toothData || null
    }).eq('treatment_id', treatmentId);
  } else {
    const { data: apptData } = await supabase.from('appointment').select('patient_id, treatment_record(dentist_id)').eq('appointment_id', apptId).single();
    if (apptData) {
       const { data: newTr } = await supabase.from('treatment_record').insert({
         appointment_id: apptId,
         patient_id: apptData.patient_id,
         dentist_id: apptData.treatment_record?.[0]?.dentist_id || null,
         treatment_date: new Date().toISOString().split('T')[0],
         doctor_note: fullNote,
         odontogram_data: toothData || null
       }).select().single();
       if (newTr) treatmentId = newTr.treatment_id;
    }
  }
  
  // 3. Update or Insert payment record
  if (treatmentId) {
    const { data: payData } = await supabase.from('payment').select('payment_id').eq('treatment_id', treatmentId).maybeSingle();
    if (payData) {
      await supabase.from('payment').update({ total_amount: cost }).eq('payment_id', payData.payment_id);
    } else {
      await supabase.from('payment').insert({
        treatment_id: treatmentId,
        total_amount: cost,
        payment_status: 'ค้างชำระ'
      });
    }
  }
}

export async function processPaymentApi(apptId: number, finalCost: number, method: string) {
  // 1. Update appointment status to เสร็จสิ้น
  const { error: apptError } = await supabase.from('appointment').update({ appointment_status: 'เสร็จสิ้น' }).eq('appointment_id', apptId);
  if (apptError) throw apptError;
  
  // 2. Fetch treatment_record
  const { data: trData } = await supabase.from('treatment_record').select('treatment_id').eq('appointment_id', apptId).single();
  let treatmentId = trData?.treatment_id;

  if (treatmentId) {
    const { data: payData } = await supabase.from('payment').select('payment_id').eq('treatment_id', treatmentId).maybeSingle();
    if (payData) {
      await supabase.from('payment').update({ 
        total_amount: finalCost,
        payment_method: method,
        payment_status: 'ชำระแล้ว',
        paid_at: new Date().toISOString()
      }).eq('payment_id', payData.payment_id);
    } else {
      await supabase.from('payment').insert({
        treatment_id: treatmentId,
        total_amount: finalCost,
        payment_method: method,
        payment_status: 'ชำระแล้ว',
        paid_at: new Date().toISOString()
      });
    }
  }
  
  return { status: 'เสร็จสิ้น' };
}




export async function getPatientHistory(patientId: number) {
  const { data, error } = await supabase.from('treatment_record').select(`
    *,
    dentist ( title_name, users ( profile (first_name, last_name) ) ),
    treatment_detail ( tooth_number, diagnosis, actual_price, service (service_name) )
  `).eq('patient_id', patientId);
  
  if (error) return [];
  
  return data.map((d: any) => {
    const td = d.treatment_detail?.[0] || {};
    const dp = d.dentist?.users?.profile;
    const doctorName = dp ? `${d.dentist?.title_name || ''} ${dp.first_name} ${dp.last_name}` : 'ไม่ระบุ';
    
    return {
      id: d.treatment_id,
      service: td.service?.service_name || 'ไม่ระบุ',
      doctor: doctorName,
      date: d.treatment_date,
      time: '00:00', // Time might not be in treatment_record
      cost: td.actual_price ? String(td.actual_price) : '0',
      teeth: td.tooth_number || '',
      notes: d.doctor_note || '',
      medications: [],
      recommendations: td.diagnosis || ''
    };
  });
}

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
      leavePeriod: d.leave_period || 'เต็มวัน',
      reason: d.leave_type,
      status: d.is_approved === true ? 'อนุมัติแล้ว' : d.is_approved === false ? 'ปฏิเสธ' : 'รอการอนุมัติ',
      createdAt: d.leave_date
    };
  }) as LeaveRequest[];
}
export async function addLeaveRequest(req: Omit<LeaveRequest, 'id' | 'createdAt' | 'doctorName'>) {
  const { data, error } = await supabase.from('leave_record').insert({
    user_id: req.doctorId, // Expecting UUID here
    leave_date: req.startDate,
    leave_period: req.leavePeriod || 'เต็มวัน',
    leave_type: req.reason,
    is_approved: null // null means pending
  }).select().single();
  
  if (error) throw error;
  return data;
}
export async function updateLeaveStatus(id: number, status: string) {
  let is_approved = null;
  if (status === 'อนุมัติแล้ว') is_approved = true;
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
  const { data, error } = await supabase.from('clinic_settings').select('*').eq('setting_key', 'announcements').single();
  if (error || !data) return [];
  try {
    const announcements = typeof data.setting_value === 'string' ? JSON.parse(data.setting_value) : data.setting_value;
    return announcements.map((d: any, index: number) => ({
      id: d.id || index + 1,
      title: d.title,
      content: d.content,
      link: d.link,
      mediaUrl: d.mediaUrl || d.media_url,
      target: d.target || "public",
      createdAt: d.createdAt || d.created_at || new Date().toISOString().split('T')[0]
    })) as Announcement[];
  } catch (e) {
    console.error("Error parsing announcements", e);
    return [];
  }
}
export async function addAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> { throw new Error("Not implemented"); }
export async function deleteAnnouncement(id: number): Promise<void> { throw new Error("Not implemented"); }

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
    isRecurring: d.is_recurring
  })) as SpecialClosure[];
}
export async function addClinicClosure(closure: Omit<SpecialClosure, 'id'>): Promise<SpecialClosure> { throw new Error("Not implemented"); }
export async function deleteClinicClosure(id: number): Promise<void> { throw new Error("Not implemented"); }

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

export async function getPromotions() {
  const { data, error } = await supabase.from('clinic_settings').select('*').eq('setting_key', 'promotions').single();
  if (error || !data) return [];
  try {
    const promos = typeof data.setting_value === 'string' ? JSON.parse(data.setting_value) : data.setting_value;
    return promos.map((d: any, i: number) => ({
      id: d.id || i + 1, tag: d.tag, tagColor: d.tagColor, title: d.title, desc: d.desc, originalPrice: d.originalPrice, salePrice: d.salePrice, validUntil: d.validUntil, icon: d.icon, highlight: d.highlight,
    })) as Promotion[];
  } catch (e) {
    return [];
  }
}

export async function addPromotion(promo: Omit<Promotion, 'id'>) {
  const promos = await getPromotions();
  const newId = promos.length > 0 ? Math.max(...promos.map(p => p.id)) + 1 : 1;
  const newPromo = { ...promo, id: newId };
  promos.push(newPromo);
  
  const { error } = await supabase.from('clinic_settings').upsert({
    setting_key: 'promotions',
    setting_value: JSON.stringify(promos)
  }, { onConflict: 'setting_key' });
  if (error) throw error;
  return newPromo as Promotion;
}

export async function updatePromotion(id: number, promo: Partial<Promotion>) {
  const promos = await getPromotions();
  const index = promos.findIndex(p => p.id === id);
  if (index === -1) throw new Error("Promotion not found");
  
  promos[index] = { ...promos[index], ...promo };
  
  const { error } = await supabase.from('clinic_settings').upsert({
    setting_key: 'promotions',
    setting_value: JSON.stringify(promos)
  }, { onConflict: 'setting_key' });
  if (error) throw error;
  return promos[index] as Promotion;
}

export async function deletePromotion(id: number) {
  const promos = await getPromotions();
  const newPromos = promos.filter(p => p.id !== id);
  
  const { error } = await supabase.from('clinic_settings').upsert({
    setting_key: 'promotions',
    setting_value: JSON.stringify(newPromos)
  }, { onConflict: 'setting_key' });
  if (error) throw error;
}

export async function getTreatmentPlans(hn?: string) {
  let query = supabase.from('treatment_plan').select(`
    *,
    installment (*),
    patient (users (profile (first_name, last_name)))
  `);
  
  if (hn) {
    const patientId = parseInt(hn.replace('HN', ''), 10);
    if (!isNaN(patientId)) {
        query = query.eq('patient_id', patientId);
    }
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("getTreatmentPlans error:", error);
    return [];
  }
  
  return data.map((d: any) => {
    const prof = d.patient?.users?.profile;
    return {
      id: d.plan_id,
      hn: `HN${String(d.patient_id).padStart(3, '0')}`,
      name: prof ? `${prof.first_name} ${prof.last_name}` : 'ไม่ระบุชื่อ',
      totalCost: d.total_cost,
      paidAmount: d.paid_amount,
      installments: d.installment.map((inst: any) => ({
        dueDate: inst.due_date,
        amount: inst.amount,
        paid: inst.paid
      })).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    };
  });
}
export async function updateInstallmentPaid(installmentId: number, paid: boolean) {
  const { error } = await supabase.from('installment').update({
    paid,
    paid_at: paid ? new Date().toISOString() : null
  }).eq('installment_id', installmentId);
  if (error) throw error;
}
export async function updateTreatmentPlanPaidAmount(planId: number, paidAmount: number) {
  const { error } = await supabase.from('treatment_plan').update({
    paid_amount: paidAmount
  }).eq('plan_id', planId);
  if (error) throw error;
}

export async function getTreatmentRecords(patientName?: string) {
  let query = supabase.from('treatment_record').select(`
    *,
    appointment!inner(start_time, appointment_status),
    dentist ( users ( profile (first_name, last_name) ) ),
    patient!inner ( users ( profile (first_name, last_name) ) ),
    treatment_detail ( actual_price, diagnosis, tooth_number, service (service_name) ),
    payment (total_amount)
  `);

  if (patientName) {
    const parts = patientName.split(' ');
    if (parts.length > 0) query = query.ilike('patient.users.profile.first_name', `%${parts[0]}%`);
  }

  const { data, error } = await query;
  if (error) return [];

  return data.map((d: any) => {
    const dr = d.dentist?.users?.profile;
    const detail = d.treatment_detail?.[0]; // Assume 1 detail per treatment for simplicity
    const srvName = detail?.service?.service_name || 'ไม่ระบุบริการ';
    const costAmt = d.payment?.[0]?.total_amount || detail?.actual_price || 0;
    
    return {
      id: d.treatment_id,
      service: srvName,
      doctor: dr ? `${dr.first_name} ${dr.last_name}` : 'ไม่ระบุแพทย์',
      date: d.treatment_date,
      time: d.appointment?.start_time?.slice(0,5) || '00:00',
      cost: costAmt.toLocaleString(),
      notes: d.doctor_note || '',
      teeth: detail?.tooth_number || '',
      recommendations: detail?.diagnosis || ''
    };
  });
}


// --- Patient Registration ---
export async function checkEmailExists(email: string): Promise<boolean> {
  const { data } = await supabase.from('users').select('user_id').eq('email', email);
  return data !== null && data.length > 0;
}
export async function requestRegistrationOTP(form: RegForm) {
  // Use real Supabase Auth signup (sends confirmation email with OTP if configured)
  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
  });
  if (error) throw error;
  
  // Supabase returns an empty identities array if the user already exists
  // to prevent email enumeration, but in this case we want to tell the user
  if (data?.user?.identities && data.user.identities.length === 0) {
    throw new Error("อีเมลนี้ได้ลงทะเบียนไว้แล้ว โปรดเข้าสู่ระบบ หรือใช้อีเมลอื่น (หากกำลังทดสอบ โปรดลบยูสเซอร์เก่าใน Supabase ก่อน)");
  }
  
  return true;
}
export async function resendOTP(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email
  });
  if (error) throw error;
  return true;
}
export async function verifyOTP(email: string, otp: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'signup'
  });
  if (error) throw error;
  return true;
}
export async function savePatientData(form: RegForm) {
  // Get the authenticated user (since they just verified OTP)
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("ไม่พบข้อมูลผู้ใช้ที่ยืนยันตัวตนแล้ว กรุณาเข้าสู่ระบบใหม่");

  const userId = user.id;
  const cleanIdCard = form.idCard.replace(/-/g, "");

  // Upsert into Profile (handles case where trigger may have already created a record)
  const { error: pErr } = await supabase.from('profile').upsert({
    citizen_id: cleanIdCard,
    first_name: form.firstName,
    last_name: form.lastName,
    phone_number: form.phone,
    gender: form.gender,
    birth_date: form.dob
  }, { onConflict: 'citizen_id' });
  if (pErr) throw new Error(`ข้อผิดพลาดบันทึกข้อมูลส่วนตัว: ${pErr.message}`);

  // Upsert into Users (handles case where auth trigger may have created the row)
  const { error: uErr } = await supabase.from('users').upsert({
    user_id: userId,
    citizen_id: cleanIdCard,
    email: form.email,
    role: 'คนไข้',
    account_status: 'active'
  }, { onConflict: 'user_id' });
  if (uErr) throw new Error(`ข้อผิดพลาดบันทึกข้อมูลบัญชี: ${uErr.message}`);

  // Check if patient record already exists before inserting
  const { data: existingPatient } = await supabase
    .from('patient')
    .select('patient_id')
    .eq('user_id', userId)
    .maybeSingle();

  let returnedPatientId: number;

  if (!existingPatient) {
    // Insert into Patient only if it doesn't exist yet
    const { data: patData, error: patErr } = await supabase.from('patient').insert({
      user_id: userId,
      allergy_history: form.allergies || 'ไม่มี',
      underlying_disease: form.conditions || 'ไม่มี',
      emergency_contact_name: form.emergencyName || '-',
      emergency_contact_phone: form.emergencyPhone || '-'
    }).select('patient_id').single();
    
    if (patErr) throw new Error(`ข้อผิดพลาดบันทึกข้อมูลคนไข้: ${patErr.message}`);
    returnedPatientId = patData.patient_id;
  } else {
    // Update existing patient record with the new health info
    const { error: patUpdErr } = await supabase.from('patient').update({
      allergy_history: form.allergies || 'ไม่มี',
      underlying_disease: form.conditions || 'ไม่มี',
      emergency_contact_name: form.emergencyName || '-',
      emergency_contact_phone: form.emergencyPhone || '-'
    }).eq('user_id', userId);
    
    if (patUpdErr) throw new Error(`ข้อผิดพลาดอัปเดตข้อมูลคนไข้: ${patUpdErr.message}`);
    returnedPatientId = existingPatient.patient_id;
  }

  return returnedPatientId;
}

// --- Dentist History ---
export async function getDentistTreatmentHistory(dentistId: number) {
  const { data, error } = await supabase
    .from('treatment_record')
    .select(`
      treatment_id,
      treatment_date,
      doctor_note,
      patient:patient_id (
        patient_id,
        users:user_id (
          profile:citizen_id ( first_name, last_name )
        )
      ),
      treatment_detail (
        td_id,
        tooth_number,
        diagnosis,
        actual_price,
        service:service_id ( service_name )
      )
    `)
    .eq('dentist_id', dentistId)
    .order('treatment_date', { ascending: false });

  if (error) {
    console.error("Error fetching dentist history:", error);
    return [];
  }

  // Format data for easier display in UI
  const history: any[] = [];
  data.forEach((record: any) => {
    const patientName = record.patient?.users?.profile 
      ? `${record.patient.users.profile.first_name} ${record.patient.users.profile.last_name}`
      : 'Unknown Patient';

    if (record.treatment_detail && record.treatment_detail.length > 0) {
      record.treatment_detail.forEach((detail: any) => {
        history.push({
          id: detail.td_id,
          date: record.treatment_date,
          patientName,
          toothNumber: detail.tooth_number,
          diagnosis: detail.diagnosis,
          serviceName: detail.service?.service_name || '-',
          actualPrice: detail.actual_price,
          note: record.doctor_note
        });
      });
    } else {
      history.push({
        id: `rec-${record.treatment_id}`,
        date: record.treatment_date,
        patientName,
        toothNumber: '-',
        diagnosis: '-',
        serviceName: '-',
        actualPrice: 0,
        note: record.doctor_note
      });
    }
  });

  return history;
}

// ============================================================================
// PASSWORD RESET (ลืมรหัสผ่าน)
// ============================================================================

/**
 * สร้าง OTP 6 หลักแบบสุ่ม
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * ขั้นตอนที่ 1: ส่ง OTP ตัวเลข 6 หลักไปยังอีเมลผ่าน Supabase
 * - ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือไม่
 * - Supabase จะส่งตัวเลข OTP 6 หลักไปทางอีเมลโดยอัตโนมัติ
 */
export async function sendPasswordResetOTP(email: string): Promise<void> {
  // 1. ตรวจสอบว่ามีอีเมลนี้ในระบบหรือไม่
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('user_id, email')
    .eq('email', email)
    .single();

  if (userError || !userData) {
    throw new Error("ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง");
  }

  // 2. ใช้ Supabase signInWithOtp เพื่อส่งตัวเลข OTP 6 หลักไปยังอีเมล
  // shouldCreateUser: false = ไม่สร้าง user ใหม่
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    console.error("signInWithOtp error:", error);
    throw new Error("ไม่สามารถส่ง OTP ได้ กรุณาตรวจสอบอีเมลและลองใหม่อีกครั้ง");
  }
}


/**
 * ขั้นตอนที่ 2: ตรวจสอบ OTP ว่าถูกต้องผ่าน Supabase Auth
 * เมื่อสำเร็จ user จะถูก logged in อัตโนมัติ
 */
export async function verifyPasswordResetOTP(email: string, otpCode: string): Promise<boolean> {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otpCode,
    type: 'email',
  });

  if (error) {
    console.error("verifyOtp error:", error);
    throw new Error("รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว กรุณาส่ง OTP ใหม่");
  }

  return true;
}

/**
 * ขั้นตอนที่ 3: เปลี่ยนรหัสผ่านใหม่
 * - ตรวจสอบว่ามี OTP ที่ผ่านการยืนยันแล้ว
 * - อัปเดตรหัสผ่านใน Supabase Auth (ผ่าน admin API)
 * - ลบ OTP ที่ใช้แล้วออกจากตาราง
 */
export async function resetPassword(email: string, newPassword: string): Promise<boolean> {
  // หลังจาก verifyOtp สำเร็จแล้ว ผู้ใช้จะถูก logged in อัตโนมัติโดย Supabase
  // จึงสามารถเรียก updateUser ได้เลยโดยไม่ต้องใช้ Admin API
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("updateUser password error:", error);
    throw new Error("ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง");
  }

  return true;

}
