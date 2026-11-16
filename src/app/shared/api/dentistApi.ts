import { supabase, supabaseAdmin } from './supabaseClient';
import { DentistInfo } from '../data';

/**
 * โมดูลจัดการข้อมูลทันตแพทย์
 * จัดการข้อมูลทันตแพทย์ทั้งหมด
 */

/**
 * ดึงรายชื่อทันตแพทย์ทั้งหมด รวมถึงข้อมูล Profile และ Service ที่ทำได้
 * @returns {Promise<DentistInfo[]>} อาร์เรย์ของข้อมูลทันตแพทย์
 */
export async function getDentists(): Promise<DentistInfo[]> {
  let { data, error } = await supabase.from('dentist').select(`
    *,
    staff (
      staff_id,
      position,
      user_id,
      users (
        user_id,
        email,
        account_status,
        profile (first_name, last_name, phone_number, citizen_id, gender, birth_date, current_address)
      )
    ),
    dentist_service (
      service_id
    )
  `);

  if (error) {
    const fallback = await supabase.from('dentist').select(`
      *,
      users (
        email,
        account_status,
        profile (first_name, last_name, phone_number, citizen_id, gender, birth_date, current_address)
      ),
      dentist_service (
        service_id
      )
    `);
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) {
    console.error("getDentists error:", error);
    return [];
  }

  return data.map((d: any) => {
    const userObj = d.staff?.users || d.users;
    const p = userObj?.profile;
    const staffId = d.staff_id || d.staff?.staff_id;
    const userId = userObj?.user_id || d.staff?.user_id || d.user_id;
    
    // คำนวณอายุงานจาก graduation_year
    let expYears = 0;
    if (d.graduation_year) {
      const now = new Date();
      expYears = Math.max(0, now.getFullYear() - d.graduation_year);
    }

    return {
      id: d.dentist_id,
      staffId: staffId,
      name: p ? `${d.title_name || ''} ${p.first_name} ${p.last_name}` : 'ไม่ระบุชื่อ',
      titleName: d.title_name || 'ทพ.',
      firstName: p?.first_name || '',
      lastName: p?.last_name || '',
      gender: p?.gender || '',
      birthDate: p?.birth_date || '',
      address: p?.current_address || '',
      specialty: d.specialization || 'ทันตกรรมทั่วไป',
      license: d.license_number,
      university: d.university || 'N/A',
      experienceYears: expYears,
      graduationYear: d.graduation_year,
      imageUrl: d.image_url || '',
      startDate: d.start_date || '',
      email: userObj?.email || '',
      phone: p?.phone_number || '',
      citizenId: p?.citizen_id || '',
      active: userObj?.account_status === 'active',
      userId: userId,
      serviceIds: d.dentist_service?.map((ds: any) => ds.service_id) || [],
      defaultRoom: d.default_room
    };
  }) as DentistInfo[];
}

/**
 * อัปโหลดรูปโปรไฟล์ทันตแพทย์
 * @param file ไฟล์รูปภาพ
 * @returns {Promise<string>} Public URL ของรูปภาพ
 */
export async function uploadAvatar(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('dentist_profiles')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw new Error('ไม่สามารถอัปโหลดรูปภาพได้');
  }

  const { data } = supabase.storage
    .from('dentist_profiles')
    .getPublicUrl(filePath);

  return data.publicUrl;
}



/**
 * เพิ่มทันตแพทย์ใหม่ลงในระบบ (Auth -> Profile -> Users -> Dentist)
 * @param dentist ข้อมูลทันตแพทย์ (ไม่รวม ID)
 * @returns {Promise<DentistInfo>} ข้อมูลทันตแพทย์ที่สร้างเสร็จ
 */
export async function addDentist(dentist: Omit<DentistInfo, 'id'>): Promise<DentistInfo> {
  const adminAuthClient = supabaseAdmin;
  const defaultPassword = dentist.password || 'password123';
  let realUserId = dentist.userId || '';

  if (!realUserId) {
    const { data: authData, error: authErr } = await adminAuthClient.auth.admin.createUser({
      email: dentist.email.trim(),
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { must_change_password: true, password_changed: false }
    });

    if (authData?.user?.id) {
      realUserId = authData.user.id;
    } else {
      try {
        const { data: linkData } = await adminAuthClient.auth.admin.generateLink({
          type: 'magiclink',
          email: dentist.email.trim()
        });
        const foundId = (linkData as any)?.user?.id || (linkData as any)?.id;
        if (foundId) {
          realUserId = foundId;
        }
      } catch (e) {
        console.warn("generateLink fallback warning:", e);
      }
      if (!realUserId && authErr) {
        console.error("Auth creation failed:", authErr);
        throw new Error("ไม่สามารถสร้างบัญชีผู้ใช้ได้ (อีเมลอาจซ้ำ หรือไม่มีสิทธิ์ Admin)");
      }
    }
  }

  try {
    if (realUserId) {
      await adminAuthClient.auth.admin.updateUserById(realUserId, {
        email_confirm: true,
        password: defaultPassword,
        user_metadata: { must_change_password: true, password_changed: false }
      });
    }
  } catch (e) {
    // ข้ามข้อผิดพลาดกรณีไม่มี Service Role Key
  }

  try {
    const cleanEmail = dentist.email.trim().toLowerCase();
    localStorage.setItem(`supat_must_change_pwd_${cleanEmail}`, "true");
    localStorage.removeItem(`supat_pwd_changed_${cleanEmail}`);
  } catch (e) {}

  const citizenIdToUse = dentist.citizenId?.replace(/\D/g, '').trim();
  if (!citizenIdToUse || citizenIdToUse.length !== 13) {
    throw new Error("ต้องระบุเลขบัตรประชาชน 13 หลักให้ถูกต้อง");
  }

  const { error: pErr } = await supabase.from('profile').upsert({
    citizen_id: citizenIdToUse,
    first_name: dentist.firstName?.trim() || '',
    last_name: dentist.lastName?.trim() || '',
    phone_number: dentist.phone?.trim() || null,
    gender: (dentist.gender === 'ชาย' || dentist.gender === 'หญิง') ? dentist.gender : null,
    birth_date: dentist.birthDate || null,
    current_address: dentist.address?.trim() || null
  });
  if (pErr) {
    console.error("Profile upsert error:", pErr);
    throw pErr;
  }

  const { error: uErr } = await supabase.from('users').upsert({
    user_id: realUserId,
    citizen_id: citizenIdToUse,
    email: dentist.email.trim(),
    role: 'ทันตแพทย์',
    account_status: dentist.active ? 'active' : 'inactive'
  }, { onConflict: 'user_id' });
  if (uErr) {
    console.error("Users upsert error:", uErr);
    throw uErr;
  }

  // สร้าง staff record ให้ทันตแพทย์ (position = 'ทันตแพทย์')
  let staffId: number | undefined;
  const { data: staffData, error: sErr } = await supabase.from('staff').insert({
    user_id: realUserId,
    position: 'ทันตแพทย์',
    employment_status: dentist.active ? 'ปฏิบัติงานปกติ' : 'พักงาน',
    hire_date: dentist.startDate || new Date().toISOString().split('T')[0]
  }).select('staff_id').maybeSingle();

  if (sErr) {
    console.error("Staff insert error for dentist:", sErr);
  }
  if (staffData) {
    staffId = staffData.staff_id;
  }

  const dentistInsert: any = {
    title_name: dentist.titleName || 'ทพ.',
    specialization: dentist.specialty,
    license_number: dentist.license,
    university: dentist.university || 'N/A',
    image_url: dentist.imageUrl || null,
    start_date: dentist.startDate || null,
    graduation_year: dentist.graduationYear || null,
  };
  if (staffId) dentistInsert.staff_id = staffId;
  dentistInsert.user_id = realUserId;

  let { data, error } = await supabase.from('dentist').insert(dentistInsert).select().single();
  if (error && error.message?.includes('user_id')) {
    delete dentistInsert.user_id;
    const retry = await supabase.from('dentist').insert(dentistInsert).select().single();
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;

  if (dentist.serviceIds && dentist.serviceIds.length > 0) {
    const dsInserts = dentist.serviceIds.map(sid => ({ dentist_id: data.dentist_id, service_id: sid }));
    await supabase.from('dentist_service').insert(dsInserts);
  }

  return { 
    ...dentist, 
    id: data.dentist_id, 
    staffId: staffId || data.staff_id,
    userId: realUserId,
    name: `${dentist.titleName || ''} ${dentist.firstName || ''} ${dentist.lastName || ''}`.trim()
  };
}

/**
 * แก้ไขข้อมูลทันตแพทย์
 * @param id รหัสทันตแพทย์
 * @param updates ข้อมูลที่ต้องการแก้ไข
 * @returns {Promise<DentistInfo>} ข้อมูลทันตแพทย์หลังแก้ไข
 */
export async function updateDentist(id: number, updates: Partial<DentistInfo>): Promise<DentistInfo> {
  const dentistUpdates: any = {};
  if (updates.specialty !== undefined) dentistUpdates.specialization = updates.specialty;
  if (updates.license !== undefined) dentistUpdates.license_number = updates.license;
  if (updates.titleName !== undefined) dentistUpdates.title_name = updates.titleName;
  if (updates.university !== undefined) dentistUpdates.university = updates.university;
  if (updates.imageUrl !== undefined) dentistUpdates.image_url = updates.imageUrl;
  if (updates.startDate !== undefined) dentistUpdates.start_date = updates.startDate;
  if (updates.graduationYear !== undefined) dentistUpdates.graduation_year = updates.graduationYear;

  if (Object.keys(dentistUpdates).length > 0) {
    const { error } = await supabase.from('dentist').update(dentistUpdates).eq('dentist_id', id);
    if (error) throw error;
  }

  const { data: dentistData } = await supabase.from('dentist').select('staff_id, staff(user_id)').eq('dentist_id', id).single() as any;
  const staffObj = Array.isArray(dentistData?.staff) ? dentistData?.staff[0] : dentistData?.staff;
  const realUserId = staffObj?.user_id;
  if (realUserId) {
    if (updates.active !== undefined) {
      await supabase.from('users').update({ account_status: updates.active ? 'active' : 'inactive' }).eq('user_id', realUserId);
      if (dentistData?.staff_id) {
        await supabase.from('staff').update({ employment_status: updates.active ? 'ปฏิบัติงานปกติ' : 'พักงาน' }).eq('staff_id', dentistData.staff_id);
      }
    }

    const profileUpdates: any = {};
    if (updates.firstName !== undefined) profileUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) profileUpdates.last_name = updates.lastName;
    if (updates.phone !== undefined) profileUpdates.phone_number = updates.phone;
    if (updates.gender !== undefined) profileUpdates.gender = (updates.gender === 'ชาย' || updates.gender === 'หญิง') ? updates.gender : null;
    if (updates.birthDate !== undefined) profileUpdates.birth_date = updates.birthDate;
    if (updates.address !== undefined) profileUpdates.current_address = updates.address;

    if (Object.keys(profileUpdates).length > 0) {
      const { data: userData } = await supabase.from('users').select('citizen_id').eq('user_id', realUserId).single();
      if (userData?.citizen_id) {
        await supabase.from('profile').update(profileUpdates).eq('citizen_id', userData.citizen_id);
      }
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

/**
 * ลบทันตแพทย์ออกจากระบบ
 * @param id รหัสทันตแพทย์
 */
export async function deleteDentist(id: number): Promise<void> {
  const { data: dentistData } = await supabase.from('dentist').select('staff_id').eq('dentist_id', id).single();
  await supabase.from('dentist').delete().eq('dentist_id', id);
  if (dentistData?.staff_id) {
    await supabase.from('staff').delete().eq('staff_id', dentistData.staff_id);
  }
}

/**
 * ดึงข้อมูลหมอสำหรับหน้า Landing Page
 */
export async function getLandingDoctors() {
  let { data, error } = await supabase.from('dentist').select(`
    *,
    staff (
      staff_id,
      user_id,
      users ( profile (first_name, last_name) )
    )
  `);

  if (error || !data) {
    const fallback = await supabase.from('dentist').select('*, users(profile(first_name, last_name))');
    data = fallback.data || [];
  }

  const currentYear = new Date().getFullYear();

  return data.map((d: any) => {
    let expYears = 0;
    if (d.graduation_year) {
      expYears = Math.max(0, currentYear - d.graduation_year);
    }
    const userObj = d.staff?.users || d.users;
    const p = userObj?.profile;
    
    return {
      id: d.dentist_id,
      staffId: d.staff_id || d.staff?.staff_id,
      userId: userObj?.user_id || d.user_id,
      name: `${d.title_name || ''} ${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'ไม่ระบุชื่อ',
      specialty: d.specialization || 'ทันตแพทย์',
      img: d.image_url || 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&auto=format',
      years: `ประสบการณ์ ${expYears} ปี`,
      university: d.university || "ทันตแพทยศาสตรบัณฑิต",
      graduationYear: d.graduation_year
    };
  });
}

/**
 * ดึงหมอที่ทำบริการ (service_id) นั้นได้ ผ่านตาราง dentist_service
 * @param serviceId รหัสบริการ
 */
export async function getDentistsByService(serviceId: number) {
  let { data, error } = await supabase
    .from('dentist_service')
    .select(`
      dentist_id, 
      dentist (
        dentist_id,
        staff_id,
        title_name, 
        specialization, 
        image_url, 
        staff (
          user_id,
          users ( profile (first_name, last_name) )
        )
      )
    `)
    .eq('service_id', serviceId);

  if (error || !data) {
    console.error("getDentistsByService error:", error);
    return [];
  }

  return data.map((row: any) => {
    const d = row.dentist;
    if (!d) return null;
    const userObj = d.staff?.users || d.users;
    const p = userObj?.profile;
    const resolvedUserId = d.staff?.user_id || userObj?.user_id || d.user_id;
    const resolvedStaffId = d.staff_id || d.staff?.staff_id;
    return {
      id: d.dentist_id,
      staffId: resolvedStaffId,
      userId: resolvedUserId,
      name: `${d.title_name || ''} ${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'ไม่ระบุชื่อ',
      specialty: d.specialization || 'ทันตแพทย์',
      img: d.image_url || 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&auto=format'
    };
  }).filter(Boolean);
}

/**
 * ดึงประวัติการรักษาของทันตแพทย์
 * @param dentistId รหัสทันตแพทย์
 */
export async function getDentistTreatmentHistory(dentistId: number) {
  const { data, error } = await supabase
    .from('treatment_record')
    .select(`
      treatment_id,
      treatment_date,
      doctor_note,
      appointment!inner (
        patient (
          users ( profile ( first_name, last_name ) )
        ),
        appointment_detail ( service (service_name) )
      )
    `)
    .eq('attending_dentist_id', dentistId)
    .order('treatment_date', { ascending: false });

  if (error) {
    console.error("Error fetching dentist history:", error);
    return [];
  }

  // จัดรูปแบบข้อมูลเพื่อนำไปแสดงผลบนหน้าจอ
  const history: any[] = [];
  data.forEach((record: any) => {
    const patientProfile = record.appointment?.patient?.users?.profile || (Array.isArray(record.appointment) ? record.appointment[0]?.patient?.users?.profile : null);
    const patientName = patientProfile
      ? `${patientProfile.first_name} ${patientProfile.last_name}`
      : 'Unknown Patient';
    const apptDetails = Array.isArray(record.appointment) ? record.appointment[0]?.appointment_detail : record.appointment?.appointment_detail;
    const serviceName = Array.isArray(apptDetails) ? apptDetails[0]?.service?.service_name : apptDetails?.service?.service_name;

    let parsedNote = record.doctor_note || '';
    let parsedDiagnosis = record.recommendations || '-';
    
    if (parsedNote.includes("|||")) {
      const parts = parsedNote.split("|||");
      parsedNote = parts.slice(1).join("|||");
    }
    
    if (parsedNote.includes('\\nคำแนะนำ: ')) {
      const noteParts = parsedNote.split('\\nคำแนะนำ: ');
      parsedNote = noteParts[0];
      if (parsedDiagnosis === '-' && noteParts.length > 1) parsedDiagnosis = noteParts[1];
    }

    history.push({
      id: `rec-${record.treatment_id}`,
      date: record.treatment_date,
      patientName,
      toothNumber: '-',
      diagnosis: parsedDiagnosis,
      serviceName: serviceName || '-',
      actualPrice: 0,
      note: parsedNote
    });
  });

  return history;
}
