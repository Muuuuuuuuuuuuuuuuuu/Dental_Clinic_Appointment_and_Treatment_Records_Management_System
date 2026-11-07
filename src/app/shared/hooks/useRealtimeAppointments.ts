import { useState, useEffect, useCallback } from 'react';
import { supabase, getAppointments } from '../supabaseApi';
import { Appointment } from '../data';

/**
 * ⚡ [HOOK] useRealtimeAppointments
 * จัดการ Subscription รับการอัปเดตนัดหมายแบบ Realtime
 * - รองรับ Local Window Event ('appointments-updated') ทันทีเมื่อมีการอัปเดตในแท็บเดียวกัน
 * - รองรับ Supabase Realtime ('postgres_changes' บนตาราง appointment) สำหรับข้ามแท็บและข้ามเครื่อง
 */
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
    // 1. ดึงข้อมูลครั้งแรกเมื่อ Component Mount
    fetchAppointments();

    // 2. รับ event อัปเดตภายในแท็บเดียวกัน และข้ามแท็บ
    const handleLocalUpdate = () => {
      fetchAppointments();
    };
    window.addEventListener('appointments-updated', handleLocalUpdate);

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'icemu-sync-update') {
        fetchAppointments();
      }
    };
    window.addEventListener('storage', handleStorageUpdate);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('icemu-updates');
        bc.onmessage = () => {
          fetchAppointments();
        };
      } catch (e) {}
    }

    // 3. สร้าง Realtime Channel เฉพาะของอินสแตนซ์นี้เพื่อป้องกันข้อผิดพลาดการ subscribe ซ้ำซ้อน
    const channelName = `rt-appts-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointment' },
        (payload) => {
          fetchAppointments();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment' },
        (payload) => {
          fetchAppointments();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'treatment_record' },
        (payload) => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('appointments-updated', handleLocalUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments]);

  return { appointments, setAppointments, loading, refetch: fetchAppointments };
}
