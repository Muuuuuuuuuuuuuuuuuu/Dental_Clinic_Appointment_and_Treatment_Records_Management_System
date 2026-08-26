import { useState, useEffect, useCallback } from 'react';
import { supabase, getAppointments } from './supabaseApi';
import { Appointment } from './data';

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
    // Initial fetch
    fetchAppointments();

    // Subscribe to postgres changes and legacy broadcast channel
    const channel = supabase
      .channel('public:appointment-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointment' },
        (payload) => {
          console.log('Realtime appointment change received:', payload);
          fetchAppointments();
        }
      )
      .on(
        'broadcast',
        { event: 'appointments-updated' },
        () => {
          console.log('Broadcast appointment change received');
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments]);

  return { appointments, loading, refetch: fetchAppointments, setAppointments };
}
