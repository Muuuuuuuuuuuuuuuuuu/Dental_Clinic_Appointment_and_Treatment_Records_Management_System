import { supabase } from './supabaseClient';
import { notifyAppointmentsUpdated } from './appointmentApi';

/**
 * โมดูลจัดการข้อมูลการรักษา
 * จัดการประวัติการรักษา แผนการรักษา และการชำระเงิน
 */
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
    appointment!inner(start_time, appointment_status, dentist ( staff ( users ( profile (first_name, last_name) ) ) ), appointment_detail ( service (service_name) )),
    attending_dentist:dentist ( staff ( users ( profile (first_name, last_name) ) ) ),
    payment (
      payment_id,
      total_amount,
      payment_method,
      payment_status,
      paid_at,
      staff:staff_id ( users ( profile (first_name, last_name) ) )
    ),
    treatment_detail ( service_id, location_code, quantity, actual_price, service (service_name) ),\n    treatment_product ( product_id, quantity, actual_price, product (product_name) )
  `).eq('appointment.patient_id', targetPatientId)
    .in('appointment.appointment_status', ['เสร็จสิ้น', 'รอชำระเงิน', 'ชำระเงินแล้ว'])
    .order('treatment_date', { ascending: false });

  if (error) {
    console.error("getPatientTreatmentRecords error:", error);
    return [];
  }

  return data.map((d: any) => {
    const dr = d.attending_dentist?.staff?.users?.profile || d.attending_dentist?.users?.profile || (d.appointment && !Array.isArray(d.appointment) ? (d.appointment.dentist?.staff?.users?.profile || d.appointment.dentist?.users?.profile) : undefined);
    const appt = d.appointment ? (Array.isArray(d.appointment) ? d.appointment[0] : d.appointment) : undefined;
    const apptDetail = appt?.appointment_detail ? (Array.isArray(appt.appointment_detail) ? appt.appointment_detail[0] : appt.appointment_detail) : undefined;
    const pay = d.payment ? (Array.isArray(d.payment) ? d.payment[0] : d.payment) : undefined;

    const srvName = apptDetail?.service?.service_name || 'ไม่ระบุบริการ';
    const costAmt = pay ? pay.total_amount : null;
    const cashierProfile = pay?.staff?.users?.profile;
    const cashierName = cashierProfile ? `${cashierProfile.first_name} ${cashierProfile.last_name}` : (pay?.staff_id ? `เจ้าหน้าที่ (ID: ${pay.staff_id})` : null);
    const paymentMethod = pay?.payment_method || null;
    const paidAt = pay?.paid_at || null;

    let treatmentNotes = d.doctor_note || '';
    let recommendations = d.recommendations || '';
    let treatmentServices: string[] = d.treatment_services || [];
    let detailedServices: any[] = [];
    let extraProducts: any[] = [];

    if (d.doctor_note && d.doctor_note.includes("|||")) {
      let rawNote = d.doctor_note;
      const parts = rawNote.split("|||");
      if (treatmentServices.length === 0) {
        try { treatmentServices = JSON.parse(parts[0]); } catch (e) { }
      }
      rawNote = parts.slice(1).join("|||");
      
      const noteParts = rawNote.split('\\nคำแนะนำ: ');
      treatmentNotes = noteParts[0];
      if (!recommendations && noteParts.length > 1) recommendations = noteParts[1];
    }
    
    if (d.treatment_detail) {
      const seenDetailKeys = new Set<string>();
      detailedServices = d.treatment_detail
        .filter((td: any) => {
          const key = `${td.service_id}-${td.location_code || ''}`;
          if (seenDetailKeys.has(key)) return false;
          seenDetailKeys.add(key);
          return true;
        })
        .map((td: any) => ({
          serviceId: td.service_id,
          name: td.service?.service_name || 'ไม่ระบุ',
          locationCode: td.location_code,
          qty: td.quantity,
          price: td.actual_price
        }));
    }

    if (d.treatment_product) {
      extraProducts = d.treatment_product.map((tp: any) => ({
        productId: tp.product_id,
        name: tp.product?.product_name || 'ไม่ระบุ',
        qty: tp.quantity,
        price: tp.actual_price
      }));
    }

    const actualServiceText = detailedServices.length > 0
      ? detailedServices.map((s: any) => `${s.name}${s.locationCode && s.locationCode !== 'MOUTH' ? ` (ซี่ ${s.locationCode})` : ''}`).join(', ')
      : treatmentServices.length > 0
      ? treatmentServices.join(', ')
      : srvName;

    return {
      id: d.treatment_id,
      service: actualServiceText,
      treatmentServices,
      detailedServices,
      extraProducts,
      doctor: dr ? `${dr.first_name} ${dr.last_name}` : 'ไม่ระบุแพทย์',
      cashier: cashierName,
      paymentMethod: paymentMethod,
      paidAt: paidAt,
      date: d.treatment_date,
      time: d.appointment?.start_time?.slice(0, 5) || '00:00',
      cost: costAmt !== null ? costAmt.toLocaleString() : null,
      notes: treatmentNotes,
      teeth: '',
      recommendations: recommendations,
      odontogramData: d.odontogram_data
    };
  });
}

export async function getPatientLatestOdontogram(patientId: number) {
  const { data } = await supabase.from('treatment_record')
    .select('odontogram_data, appointment!inner(patient_id)')
    .eq('appointment.patient_id', patientId)
    .not('odontogram_data', 'is', null)
    .order('treatment_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.odontogram_data || {};
}

export async function savePatientOdontogram(
  apptId: number,
  toothData: Record<number | string, any>,
  extraTeeth: any[],
  doctorId?: number
) {
  const fullOdontogram = { ...toothData, extraTeeth, wholeMouth: false };
  const { data: trData } = await supabase
    .from('treatment_record')
    .select('treatment_id')
    .eq('appointment_id', apptId)
    .maybeSingle();

  if (trData) {
    const updatePayload: any = { odontogram_data: fullOdontogram };
    if (doctorId) updatePayload.attending_dentist_id = doctorId;
    const { error } = await supabase
      .from('treatment_record')
      .update(updatePayload)
      .eq('treatment_id', trData.treatment_id);
    if (error) {
      console.error("Error updating odontogram_data:", error);
      return false;
    }
    return true;
  } else {
    const { data: apptData } = await supabase
      .from('appointment')
      .select('patient_id, dentist_id')
      .eq('appointment_id', apptId)
      .maybeSingle();

    const { error } = await supabase
      .from('treatment_record')
      .insert({
        appointment_id: apptId,
        attending_dentist_id: doctorId || apptData?.dentist_id || null,
        treatment_date: new Date().toISOString().split('T')[0],
        doctor_note: '',
        odontogram_data: fullOdontogram
      });
    if (error) {
      console.error("Error inserting odontogram_data:", error);
      return false;
    }
    return true;
  }
}

export async function saveTreatment(
  apptId: number, 
  notes: string, 
  recommendations: string, 
  services: string[], 
  cost: number, 
  toothData?: Record<number | string, any>, 
  doctorId?: number, 
  detailedServices?: any[], 
  medicines?: any[],
  updateStatusToWaitPayment: boolean = true
) {
  // 1. ดึงข้อมูลระเบียนการรักษา
  const { data: trData } = await supabase.from('treatment_record').select('treatment_id').eq('appointment_id', apptId).maybeSingle();
  let treatmentId = trData?.treatment_id;

  // อัปเดตหรือเพิ่มข้อมูลระเบียนการรักษาใหม่
  if (treatmentId) {
    const updatePayload: any = {
      doctor_note: notes,
      recommendations: recommendations || null,
      treatment_services: services || [],
      odontogram_data: toothData || null
    };
    if (doctorId) updatePayload.attending_dentist_id = doctorId;

    const { error: updateErr } = await supabase.from('treatment_record').update(updatePayload).eq('treatment_id', treatmentId);
    if (updateErr) {
      console.error("Error updating treatment_record:", updateErr);
      throw new Error("เกิดข้อผิดพลาดในการอัปเดตบันทึกการรักษา: " + updateErr.message);
    }
  } else {
    const { data: apptData, error: apptFetchErr } = await supabase
      .from('appointment')
      .select('patient_id, dentist_id')
      .eq('appointment_id', apptId)
      .maybeSingle();

    if (apptFetchErr) {
      console.error("Error fetching appointment for treatment_record:", apptFetchErr);
    }

    const { data: newTr, error: insertErr } = await supabase.from('treatment_record').insert({
      appointment_id: apptId,
      attending_dentist_id: doctorId || apptData?.dentist_id || null,
      treatment_date: new Date().toISOString().split('T')[0],
      doctor_note: notes,
      recommendations: recommendations || null,
      treatment_services: services || [],
      odontogram_data: toothData || null
    }).select().single();

    if (insertErr) {
      console.error("Error inserting treatment_record:", insertErr);
      throw new Error("เกิดข้อผิดพลาดในการบันทึกประวัติการรักษา: " + insertErr.message);
    }
    if (newTr) treatmentId = newTr.treatment_id;
  }

  // 2. อัปเดตหรือเพิ่มรายละเอียดหัตถการที่ทำ
  if (treatmentId && detailedServices && detailedServices.length > 0) {
    await supabase.from('treatment_detail').delete().eq('treatment_id', treatmentId);
    
    const seenKeys = new Set<string>();
    const uniqueServices = detailedServices.filter(s => {
      const key = `${s.id || s.serviceId}-${s.locationCode || ''}`;
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });

    const tdInserts = uniqueServices.map(s => ({
      treatment_id: treatmentId,
      service_id: s.id || s.serviceId,
      location_code: s.locationCode || null,
      diagnosis: s.name || null,
      quantity: s.qty || 1,
      actual_price: s.price || 0
    }));
    const { error: tdErr } = await supabase.from('treatment_detail').insert(tdInserts);
    if (tdErr) console.error("Error inserting treatment_detail:", tdErr);
  }

  // 3. อัปเดตหรือเพิ่มรายการยาและเวชภัณฑ์ที่สั่งจ่าย
  if (treatmentId && medicines && medicines.length > 0) {
    await supabase.from('treatment_product').delete().eq('treatment_id', treatmentId);
    
    const tpInserts = medicines.map((m: any) => ({
      treatment_id: treatmentId,
      product_id: m.id || m.productId,
      quantity: m.qty || 1,
      actual_price: m.price || 0,
      dosage_instruction: m.instruction || null
    }));
    const { error: tpErr } = await supabase.from('treatment_product').insert(tpInserts);
    if (tpErr) console.error("Error inserting treatment_product:", tpErr);
  }

  // 4. อัปเดตสถานะนัดหมาย (เฉพาะกรณีส่งจบการรักษา)
  if (updateStatusToWaitPayment) {
    const { data: updatedAppt, error: apptErr } = await supabase
      .from('appointment')
      .update({ appointment_status: 'รอชำระเงิน' })
      .eq('appointment_id', apptId)
      .select()
      .single();

    if (apptErr || !updatedAppt) {
      console.error("Error updating appointment status:", apptErr);
      throw new Error("Failed to update appointment status to รอชำระเงิน: " + (apptErr?.message || "No rows updated"));
    }
  }

  notifyAppointmentsUpdated();
}

export async function processPaymentApi(apptId: number, finalCost: number, method: string, extraProducts?: any[], adjustedServices?: any[]) {
  // 1. Update appointment status to เสร็จสิ้น
  const { error: apptError } = await supabase.from('appointment').update({ appointment_status: 'เสร็จสิ้น' }).eq('appointment_id', apptId);
  if (apptError) throw apptError;

  // 2. ดึงข้อมูลระเบียนการรักษาและรหัสคนไข้
  const { data: apptData } = await supabase.from('appointment').select('patient_id, treatment_record(treatment_id)').eq('appointment_id', apptId).maybeSingle();
  const trData = apptData?.treatment_record;
  let treatmentId = Array.isArray(trData) ? trData[0]?.treatment_id : (trData as any)?.treatment_id;


  if (treatmentId) {
    const { data: { user } } = await supabase.auth.getUser();
    let staffId = null;
    if (user) {
      // ค้นหาข้อมูลพนักงานผู้รับชำระเงิน
      const { data: staffData } = await supabase.from('staff').select('staff_id').eq('user_id', user.id).maybeSingle();
      if (staffData) {
        staffId = staffData.staff_id;
      }
    }

    const { data: payData } = await supabase.from('payment').select('payment_id').eq('treatment_id', treatmentId).maybeSingle();
    if (payData) {
      await supabase.from('payment').update({
        total_amount: finalCost,
        payment_method: method,
        payment_status: 'ชำระแล้ว',
        paid_at: new Date().toISOString(),
        staff_id: staffId
      }).eq('payment_id', payData.payment_id);
    } else {
      await supabase.from('payment').insert({
        treatment_id: treatmentId,
        total_amount: finalCost,
        payment_method: method,
        payment_status: 'ชำระแล้ว',
        paid_at: new Date().toISOString(),
        staff_id: staffId
      });
    }
    
    // อัปเดตรายการหัตถการและรายการเวชภัณฑ์
    if (adjustedServices && adjustedServices.length > 0) {
      for (const s of adjustedServices) {
        if (String(s.serviceId).startsWith('prod-')) {
          const pId = parseInt(String(s.serviceId).replace('prod-', ''), 10);
          await supabase.from('treatment_product')
            .update({ actual_price: s.price, quantity: s.qty })
            .eq('treatment_id', treatmentId)
            .eq('product_id', pId);
        } else {
          await supabase.from('treatment_detail')
            .update({ actual_price: s.price })
            .eq('treatment_id', treatmentId)
            .eq('service_id', s.serviceId || s.id)
            .eq('location_code', s.locationCode || 'NONE');
        }
      }
    }

    // เพิ่มรายการเวชภัณฑ์เพิ่มเติม (เฉพาะรายการใหม่)
    if (extraProducts && extraProducts.length > 0) {
      // ดึงรายการเวชภัณฑ์ที่มีอยู่ก่อนเพื่อป้องกันการบันทึกซ้ำ
      const { data: existingProds } = await supabase.from('treatment_product')
        .select('product_id')
        .eq('treatment_id', treatmentId);
      
      const existingProdIds = existingProds ? existingProds.map((ep: any) => ep.product_id) : [];
      
      const productInserts = extraProducts
        .filter((p: any) => !existingProdIds.includes(p.id))
        .map((p: any) => ({
          treatment_id: treatmentId,
          product_id: p.id,
          quantity: p.qty || 1,
          actual_price: p.price || 0,
          dosage_instruction: p.instruction || null
        }));
        
      if (productInserts.length > 0) {
        await supabase.from('treatment_product').insert(productInserts);
      }
    }
  }

  notifyAppointmentsUpdated();
}

export async function getPatientHistory(patientId: number) {
  const { data, error } = await supabase.from('treatment_record').select(`
    *,
    dentist ( title_name, staff ( users ( profile (first_name, last_name) ) ) ),
    treatment_detail ( tooth_number, diagnosis, actual_price, service (service_name) )
  `).eq('patient_id', patientId);

  if (error) return [];

  return data.map((d: any) => {
    const td = d.treatment_detail?.[0] || {};
    const dp = d.dentist?.staff?.users?.profile || d.dentist?.users?.profile;
    const doctorName = dp ? `${d.dentist?.title_name || ''} ${dp.first_name} ${dp.last_name}` : 'ไม่ระบุ';

    return {
      id: d.treatment_id,
      service: td.service?.service_name || 'ไม่ระบุ',
      doctor: doctorName,
      date: d.treatment_date,
      time: '00:00', // เวลาอาจไม่ได้เก็บอยู่ในตารางระเบียนการรักษาโดยตรง
      cost: td.actual_price ? String(td.actual_price) : '0',
      teeth: td.tooth_number || '',
      notes: d.doctor_note || '',
      medications: [],
      recommendations: td.diagnosis || ''
    };
  });
}



export async function getTreatmentRecords(patientName?: string) {
  let query = supabase.from('treatment_record').select(`
    *,
    appointment!inner(start_time, appointment_status),
    attending_dentist:dentist ( staff ( users ( profile (first_name, last_name) ) ) ),
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
    const dr = d.attending_dentist?.staff?.users?.profile || d.attending_dentist?.users?.profile || d.dentist?.users?.profile;
    const detail = d.treatment_detail?.[0]; // ใช้รายการหัตถการหลักของระเบียนการรักษานั้น
    const srvName = detail?.service?.service_name || detail?.diagnosis || 'ไม่ระบุบริการ';
    const costAmt = d.payment?.[0]?.total_amount || detail?.actual_price || 0;

    return {
      id: d.treatment_id,
      service: srvName,
      doctor: dr ? `${dr.first_name} ${dr.last_name}` : 'ไม่ระบุแพทย์',
      date: d.treatment_date,
      time: d.appointment?.start_time?.slice(0, 5) || '00:00',
      cost: costAmt.toLocaleString(),
      notes: d.doctor_note || '',
      teeth: detail?.tooth_number || '',
      recommendations: detail?.diagnosis || ''
    };
  });
}



// --- การลงทะเบียนคนไข้ใหม่ ---

export async function getProducts(type?: string, includeInactive: boolean = false) {
  let query = supabase.from('product').select('*');
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  if (type) query = query.eq('product_type', type);
  query = query.order('product_type', { ascending: true }).order('product_name', { ascending: true });
  
  const { data, error } = await query;
  if (error) {
    console.error("getProducts error:", error);
    return [];
  }
  return data.map((d: any) => ({
    id: d.product_id,
    name: d.product_name,
    type: d.product_type,
    price: Number(d.price),
    unit: d.unit,
    instruction: d.instruction,
    isActive: d.is_active
  }));
}

export async function addProduct(product: any) {
  const { data, error } = await supabase.from('product').insert([{
    product_name: product.name,
    product_type: product.type,
    price: product.price,
    unit: product.unit,
    instruction: product.instruction,
    is_active: product.isActive
  }]).select();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: number, updates: any) {
  const mappedUpdates: any = {};
  if (updates.name !== undefined) mappedUpdates.product_name = updates.name;
  if (updates.type !== undefined) mappedUpdates.product_type = updates.type;
  if (updates.price !== undefined) mappedUpdates.price = updates.price;
  if (updates.unit !== undefined) mappedUpdates.unit = updates.unit;
  if (updates.instruction !== undefined) mappedUpdates.instruction = updates.instruction;
  if (updates.isActive !== undefined) mappedUpdates.is_active = updates.isActive;

  const { data, error } = await supabase.from('product').update(mappedUpdates).eq('product_id', id).select();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number) {
  const { data, error } = await supabase.from('product').update({ is_active: false }).eq('product_id', id);
  if (error) throw error;
  return data;
}


