import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { AdminInfo, StaffInfo, PatientInfo } from '../data';

// --- ข้อมูลผู้ดูแลระบบ ---
export async function getAdmins() {
  const { data, error } = await supabase.from('users').select(`
    user_id,
    email,
    account_status,
    profile (first_name, last_name, phone_number, citizen_id, gender, birth_date, current_address),
    staff (position, employment_status, hire_date)
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

// --- ข้อมูลพนักงาน ---
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

// --- ข้อมูลคนไข้ ---
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
    // ค้นหาจากเบอร์โทรศัพท์ ชื่อ หรือนามสกุล
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
  userId?: string;
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

  const defaultPassword = patient.password || '123456789';

  // 1. สร้างบัญชีผู้ใช้ใน Supabase Auth จริงๆ หรือดึง user_id กรณีผ่าน OTP มาแล้ว
  let realUserId = (patient as any).userId || '';
  if (!realUserId) {
    const { data: authData } = await adminAuthClient.auth.admin.createUser({
      email: patient.email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { must_change_password: true }
    });

    if (authData?.user) {
      realUserId = authData.user.id;
    } else {
      // ถ้าผู้ใช้มีอยู่แล้วใน Auth ให้ค้นหา ID ผ่าน generateLink (หลีกเลี่ยง listUsers 500)
      try {
        const { data: linkData } = await adminAuthClient.auth.admin.generateLink({
          type: 'magiclink',
          email: patient.email
        });
        const foundId = (linkData as any)?.user?.id || (linkData as any)?.id;
        if (foundId) {
          realUserId = foundId;
          await adminAuthClient.auth.admin.updateUserById(foundId, {
            email_confirm: true,
            password: defaultPassword,
            user_metadata: { must_change_password: true }
          });
        }
      } catch (linkErr) {
        console.warn("generateLink error:", linkErr);
      }
    }
  }

  // ถ้ายังไม่พบจาก Auth ลองค้นหาจากตาราง users
  if (!realUserId) {
    const { data: uData } = await supabase.from('users').select('user_id').eq('email', patient.email).maybeSingle();
    if (uData?.user_id) realUserId = uData.user_id;
  }

  if (!realUserId) {
    realUserId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'pat-' + Date.now();
  }

  try {
    await adminAuthClient.auth.admin.updateUserById(realUserId, {
      email_confirm: true,
      password: defaultPassword,
      user_metadata: { must_change_password: true }
    });
  } catch (updErr) {
    // ข้ามข้อผิดพลาด
  }

  // 2. สร้าง Profile
  // gender ต้องเป็น 'ชาย' หรือ 'หญิง' เท่านั้น (DB CHECK constraint)
  const validGender = (patient.gender === 'ชาย' || patient.gender === 'หญิง') ? patient.gender : null;
  const { error: pErr } = await supabase.from('profile').upsert({
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
  const { error: uErr } = await supabase.from('users').upsert({
    user_id: realUserId,
    citizen_id: patient.citizenId,
    email: patient.email,
    role: 'คนไข้',
    account_status: 'active'
  }, { onConflict: 'user_id' });
  if (uErr) { console.error("Users insert error:", uErr); throw uErr; }

  // 4. สร้าง หรือ ลิงก์ Patient
  let patData: any = null;
  const { data: existingPat } = await supabase.from('patient').select('patient_id').eq('user_id', realUserId).maybeSingle();
  if (existingPat) {
    patData = existingPat;
  } else {
    // หาดูว่าเคยมี patient ที่ผูกกับ citizen_id หรือ email นี้มาก่อนหรือไม่
    const { data: oldUserByCitizen } = await supabase.from('users').select('user_id').eq('citizen_id', patient.citizenId).maybeSingle();
    const { data: oldUserByEmail } = await supabase.from('users').select('user_id').eq('email', patient.email).maybeSingle();
    const oldId = (oldUserByCitizen?.user_id && oldUserByCitizen.user_id !== realUserId ? oldUserByCitizen.user_id : null) ||
                  (oldUserByEmail?.user_id && oldUserByEmail.user_id !== realUserId ? oldUserByEmail.user_id : null);
    
    if (oldId) {
      const { data: oldPat } = await supabase.from('patient').select('patient_id').eq('user_id', oldId).maybeSingle();
      if (oldPat) {
        await supabase.from('patient').update({ user_id: realUserId }).eq('patient_id', oldPat.patient_id);
        patData = oldPat;
        await supabase.from('users').delete().eq('user_id', oldId);
      }
    }

    if (!patData) {
      const { data: newPat, error: patErr } = await supabase.from('patient').insert({
        user_id: realUserId
      }).select().single();
      if (patErr) { console.error("Patient insert error:", patErr); throw patErr; }
      patData = newPat;
    }
  }

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

// --- อัปเดตข้อมูลส่วนตัวคนไข้ ---
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

