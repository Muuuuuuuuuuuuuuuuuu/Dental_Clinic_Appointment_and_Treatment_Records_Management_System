import { supabase } from '../utils/supabaseClient';
import { notifyAppointmentsUpdated } from './appointmentApi';

/**
 * 🏥 Treatment API Module
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
    appointment!inner(start_time, appointment_status, dentist ( users ( profile (first_name, last_name) ) ), appointment_detail ( service (service_name) )),
    attending_dentist:dentist ( users ( profile (first_name, last_name) ) ),
    payment (total_amount),
    treatment_detail ( service_id, location_code, quantity, actual_price, service (service_name) ),\n    treatment_product ( product_id, quantity, actual_price, product (product_name) )
  `).eq('appointment.patient_id', targetPatientId)
    .in('appointment.appointment_status', ['เสร็จสิ้น', 'รอชำระเงิน', 'ชำระเงินแล้ว'])
    .order('treatment_date', { ascending: false });

  if (error) {
    console.error("getPatientTreatmentRecords error:", error);
    return [];
  }

  return data.map((d: any) => {
    const dr = d.attending_dentist?.users?.profile || (d.appointment && !Array.isArray(d.appointment) ? d.appointment.dentist?.users?.profile : undefined);
    const appt = d.appointment ? (Array.isArray(d.appointment) ? d.appointment[0] : d.appointment) : undefined;
    const apptDetail = appt?.appointment_detail ? (Array.isArray(appt.appointment_detail) ? appt.appointment_detail[0] : appt.appointment_detail) : undefined;
    const pay = d.payment ? (Array.isArray(d.payment) ? d.payment[0] : d.payment) : undefined;

    const srvName = apptDetail?.service?.service_name || 'ไม่ระบุบริการ';
    const costAmt = pay ? pay.total_amount : null;

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
      detailedServices = d.treatment_detail.map((td: any) => ({
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

    return {
      id: d.treatment_id,
      service: srvName,
      treatmentServices,
      detailedServices,
      extraProducts,
      doctor: dr ? `${dr.first_name} ${dr.last_name}` : 'ไม่ระบุแพทย์',
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

export async function getPatientActiveTreatmentPlan(patientId: number) {
  const { data: plan } = await supabase.from('treatment_plan')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (plan) {
    const { data: items } = await supabase.from('treatment_plan_item').select('*').eq('plan_id', plan.plan_id);
    const planDetails = (items || []).map(item => ({
      month: item.month_number,
      services: item.services_json || [],
      odontogram_data: item.odontogram_data || {},
      notes: item.notes || '',
      status: item.status
    })).sort((a, b) => a.month - b.month);
    
    plan.plan_details = planDetails;
  }
  
  return plan;
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

export async function saveTreatment(apptId: number, notes: string, recommendations: string, services: string[], cost: number, toothData?: Record<number, string>, doctorId?: number, planId?: number, planMonth?: number, detailedServices?: any[], medicines?: any[]) {
  // 1. Update appointment status
  await supabase.from('appointment').update({ appointment_status: 'รอชำระเงิน' }).eq('appointment_id', apptId);

  // 2. Fetch treatment_record
  const { data: trData } = await supabase.from('treatment_record').select('treatment_id').eq('appointment_id', apptId).maybeSingle();
  let treatmentId = trData?.treatment_id;

  // Update or insert treatment record
  if (treatmentId) {
    const updatePayload: any = {
      doctor_note: notes,
      recommendations: recommendations || null,
      treatment_services: services || [],
      odontogram_data: toothData || null
    };
    if (doctorId) updatePayload.attending_dentist_id = doctorId;

    const { error: updateErr } = await supabase.from('treatment_record').update(updatePayload).eq('treatment_id', treatmentId);
    if (updateErr) console.error("Error updating treatment_record:", updateErr);
  } else {
    const { data: apptData } = await supabase.from('appointment').select('patient_id, dentist_id, treatment_record(attending_dentist_id)').eq('appointment_id', apptId).single();
    if (apptData) {
      const { data: newTr, error: insertErr } = await supabase.from('treatment_record').insert({
        appointment_id: apptId,
        attending_dentist_id: doctorId || apptData.treatment_record?.[0]?.attending_dentist_id || apptData.dentist_id || null,
        treatment_date: new Date().toISOString().split('T')[0],
        doctor_note: notes,
        recommendations: recommendations || null,
        treatment_services: services || [],
        odontogram_data: toothData || null
      }).select().single();
      if (insertErr) console.error("Error inserting treatment_record:", insertErr);
      if (newTr) treatmentId = newTr.treatment_id;
    }
  }

  // 3. Update or Insert treatment_detail
  if (treatmentId && detailedServices && detailedServices.length > 0) {
    // Delete existing details for this treatment to avoid duplicates if re-saving
    await supabase.from('treatment_detail').delete().eq('treatment_id', treatmentId);
    
    // Insert new details
    const tdInserts = detailedServices.map(s => ({
      treatment_id: treatmentId,
      service_id: s.id,
      location_code: s.locationCode || null,
      diagnosis: s.name || null,
      quantity: s.qty || 1,
      actual_price: s.price || 0
    }));
    const { error: tdErr } = await supabase.from('treatment_detail').insert(tdInserts);
    if (tdErr) console.error("Error inserting treatment_detail:", tdErr);
  }

  // 3.5 Update or Insert treatment_product (medicines)
  if (treatmentId && medicines && medicines.length > 0) {
    await supabase.from('treatment_product').delete().eq('treatment_id', treatmentId);
    
    const tpInserts = medicines.map((m: any) => ({
      treatment_id: treatmentId,
      product_id: m.id,
      quantity: m.qty || 1,
      actual_price: m.price || 0,
      dosage_instruction: m.instruction || null
    }));
    const { error: tpErr } = await supabase.from('treatment_product').insert(tpInserts);
    if (tpErr) console.error("Error inserting treatment_product:", tpErr);
  }

  // 4. (Removed) Payment record is now ONLY created by the Staff during checkout.

  // 5. Update Treatment Plan Progress if provided
  if (planId && planMonth) {
    // Update the new relational table
    await supabase.from('treatment_plan_item')
      .update({ status: 'completed' })
      .eq('plan_id', planId)
      .eq('month_number', planMonth);
  }

  notifyAppointmentsUpdated();
}

export async function processPaymentApi(apptId: number, finalCost: number, method: string, extraProducts?: any[], adjustedServices?: any[]) {
  // 1. Update appointment status to เสร็จสิ้น
  const { error: apptError } = await supabase.from('appointment').update({ appointment_status: 'เสร็จสิ้น' }).eq('appointment_id', apptId);
  if (apptError) throw apptError;

  // 2. Fetch treatment_record and patient_id
  const { data: apptData } = await supabase.from('appointment').select('patient_id, treatment_record(treatment_id)').eq('appointment_id', apptId).maybeSingle();
  const trData = apptData?.treatment_record;
  let treatmentId = Array.isArray(trData) ? trData[0]?.treatment_id : (trData as any)?.treatment_id;
  let patientId = apptData?.patient_id;

  if (treatmentId) {
    const { data: { user } } = await supabase.auth.getUser();
    let staffId = null;
    if (user) {
      // Find staff profile by joining with users or directly querying staff
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
    
    // Update treatment_detail for services and treatment_product for prescribed products
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

    // Insert extraProducts safely (only new ones)
    if (extraProducts && extraProducts.length > 0) {
      // First, get existing products to avoid inserting duplicates if somehow passed
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


export async function getTreatmentPlans(hn?: string) {
  let query = supabase.from('treatment_plan').select(`
    plan_id, patient_id, plan_name, total_cost, dentist_id, package_id,
    installment (installment_id, installment_number, amount, due_date, paid),
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

  // Fetch normalized items from the new table
  const planIds = data.map((d: any) => d.plan_id);
  let itemsByPlan: Record<number, any[]> = {};
  if (planIds.length > 0) {
    const { data: itemsData } = await supabase.from('treatment_plan_item').select('*').in('plan_id', planIds);
    if (itemsData) {
      itemsData.forEach((item: any) => {
        if (!itemsByPlan[item.plan_id]) itemsByPlan[item.plan_id] = [];
        itemsByPlan[item.plan_id].push({
          month: item.month_number,
          services: item.services_json || [],
          odontogram_data: item.odontogram_data || {},
          notes: item.notes || '',
          status: item.status
        });
      });
    }
  }

  return data.map((d: any) => {
    const prof = d.patient?.users?.profile;
    const installments = (d.installment || []).map((inst: any) => ({
      id: inst.installment_id,
      installment_number: inst.installment_number,
      dueDate: inst.due_date,
      amount: inst.amount,
      paid: inst.paid
    })).sort((a: any, b: any) => a.installment_number - b.installment_number);
    
    let planDetails = itemsByPlan[d.plan_id] || [];
    if (planDetails.length > 0) {
      planDetails.sort((a: any, b: any) => a.month - b.month);
    }

    const paidAmount = installments.filter((i: any) => i.paid).reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0);
    const totalCost = Number(d.total_cost || 0);

    return {
      id: d.plan_id,
      hn: `HN${String(d.patient_id).padStart(3, '0')}`,
      name: prof ? `${prof.first_name} ${prof.last_name}` : 'ไม่ระบุชื่อ',
      planName: d.plan_name || 'แผนการรักษา',
      totalCost: totalCost,
      paidAmount: paidAmount,
      remainingAmount: totalCost - paidAmount,
      packageId: d.package_id,
      plan_details: planDetails,
      installments: installments
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
// updateTreatmentPlanPaidAmount ถูกลบออกแล้ว
// paid_amount คำนวณอัตโนมัติจาก View treatment_plan_summary (SUM จากตาราง payment)
// ไม่จำเป็นต้อง update ด้วยมืออีกต่อไป

export async function getTreatmentRecords(patientName?: string) {
  let query = supabase.from('treatment_record').select(`
    *,
    appointment!inner(start_time, appointment_status),
    attending_dentist:dentist ( users ( profile (first_name, last_name) ) ),
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

// --- Proactive Long-Term Treatment Tracking ---

export async function getActiveTreatmentTrackings() {
  // Fetch treatment plans that are not fully completed
  const { data: plans, error } = await supabase.from('treatment_plan').select(`
    plan_id, patient_id, plan_name, total_cost, dentist_id,
    dentist (users(profile(first_name, last_name))),
    patient (users(profile(first_name, last_name, phone_number)))
  `);
  
  if (error || !plans) return [];

  const planIds = plans.map(p => p.plan_id);
  
  if (planIds.length === 0) return [];

  // Fetch items for these plans
  const { data: items } = await supabase.from('treatment_plan_item')
    .select('item_id, plan_id, month_number, services_json, status')
    .in('plan_id', planIds)
    .order('month_number', { ascending: true });

  if (!items) return [];

  const trackings: any[] = [];
  
  plans.forEach(plan => {
    const planItems = items.filter(i => i.plan_id === plan.plan_id);
    // Find the next incomplete month
    const nextItem = planItems.find(i => i.status !== 'completed');
    
    if (nextItem) {
      const patientProf = (plan as any).patient?.users?.profile || {};
      const doctorProf = (plan as any).dentist?.users?.profile || {};
      const doctorName = doctorProf.first_name ? `${doctorProf.first_name} ${doctorProf.last_name}` : 'ไม่ระบุ';
      
      // We interpret 'pending' as waiting for booking, 'sent_slip' as slip sent, 'booked' as booked.
      let trackingStatus = 'รอติดตาม';
      if (nextItem.status === 'sent_slip') trackingStatus = 'ส่งใบนัดแล้ว';
      if (nextItem.status === 'booked') trackingStatus = 'นัดหมายแล้ว';
      
      let nextService = '';
      if (nextItem.services_json && nextItem.services_json.length > 0) {
         nextService = nextItem.services_json.map((s:any) => s.service_name || s.name).join(', ');
      }
      
      trackings.push({
        id: nextItem.item_id,
        planId: plan.plan_id,
        patientId: plan.patient_id,
        patientName: `${patientProf.first_name || ''} ${patientProf.last_name || ''}`.trim(),
        patientPhone: patientProf.phone_number || '',
        planName: plan.plan_name,
        doctorId: plan.dentist_id,
        doctorName: doctorName,
        month: nextItem.month_number,
        nextService: nextService,
        trackingStatus: trackingStatus,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], // Mock Due Date based on today for simplicity in UI, ideally from schedule
      });
    }
  });

  return trackings;
}

export async function sendAppointmentSlip(planItemId: number) {
  // We just update the item status to 'sent_slip'
  const { error } = await supabase.from('treatment_plan_item')
    .update({ status: 'sent_slip' })
    .eq('item_id', planItemId);
    
  if (error) throw error;
  return true;
}

// --- Patient Registration ---
export async function getProducts(type?: string) {
  let query = supabase.from('product').select('*').eq('is_active', true).order('product_name', { ascending: true });
  if (type) query = query.eq('product_type', type);
  
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

export async function getTreatmentPackages() {
  const { data, error } = await supabase
    .from('treatment_package')
    .select('*')
    .eq('is_active', true)
    .order('package_name', { ascending: true });
    
  if (error) {
    console.error("getTreatmentPackages error:", error);
    return [];
  }
  return data;
}

export async function addTreatmentPackage(pkg: any) {
  const { data, error } = await supabase.from('treatment_package').insert([{
    package_name: pkg.package_name,
    total_cost: pkg.total_cost,
    down_payment: pkg.down_payment,
    down_payment_months: pkg.down_payment_months,
    monthly_payment: pkg.monthly_payment,
    is_active: pkg.is_active !== undefined ? pkg.is_active : true
  }]).select();
  if (error) throw error;
  return data;
}

export async function updateTreatmentPackage(id: number, updates: any) {
  const { data, error } = await supabase.from('treatment_package').update(updates).eq('package_id', id).select();
  if (error) throw error;
  return data;
}

export async function deleteTreatmentPackage(id: number) {
  const { data, error } = await supabase.from('treatment_package').update({ is_active: false }).eq('package_id', id);
  if (error) throw error;
  return data;
}
