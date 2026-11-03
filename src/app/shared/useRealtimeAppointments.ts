import { useState, useEffect, useCallback } from 'react';
import { supabase, getAppointments } from './supabaseApi';
import { Appointment } from './data';

// ตัวจัดการช่องสัญญาณเรียลไทม์ส่วนกลางเพื่อป้องกันการเชื่อมต่อซ้ำซ้อน
let sharedChannel: any = null;
const listeners = new Set<() => void>();

export function useRealtimeAppointments(initialAppointments: Appointment[] = []) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching realtime appointments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // ดึงข้อมูลครั้งแรกเมื่อเริ่มทำงาน
    fetchAppointments();

    // ลงทะเบียนรับการแจ้งเตือนเมื่อข้อมูลอัปเดต
    const listener = () => fetchAppointments();
    listeners.add(listener);

    // สร้างช่องสัญญาณเรียลไทม์หากยังไม่มี
    if (!sharedChannel) {
      sharedChannel = supabase
        .channel('icemu-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointment' },
          (payload) => {
            console.log('Realtime appointment change received:', payload);
            listeners.forEach(fn => fn());
          }
        )
        .on(
          'broadcast',
          { event: 'appointments-updated' },
          () => {
            console.log('Broadcast appointment change received');
            listeners.forEach(fn => fn());
          }
        )
        .subscribe();
    }

    return () => {
      // ยกเลิกการรับแจ้งเตือนเมื่อปิดหน้านี้
      listeners.delete(listener);
      // ปิดช่องสัญญาณเมื่อไม่มีหน้าใดใช้งานอยู่
      if (listeners.size === 0 && sharedChannel) {
        supabase.removeChannel(sharedChannel);
        sharedChannel = null;
      }
    };
  }, [fetchAppointments]);

  return { appointments, loading, refetch: fetchAppointments, setAppointments };
}
