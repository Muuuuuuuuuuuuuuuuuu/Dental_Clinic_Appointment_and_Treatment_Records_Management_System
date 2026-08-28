import { useState, useEffect, useCallback } from 'react';
import { supabase, getAppointments } from './supabaseApi';
import { Appointment } from './data';

// Singleton manager to prevent "cannot add callbacks after subscribe()" error
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
    // Initial fetch
    fetchAppointments();

    // Register this component's listener
    const listener = () => fetchAppointments();
    listeners.add(listener);

    // Initialize the shared channel if it doesn't exist
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
      // Remove this component's listener
      listeners.delete(listener);
      // If no more components are listening, cleanup the channel
      if (listeners.size === 0 && sharedChannel) {
        supabase.removeChannel(sharedChannel);
        sharedChannel = null;
      }
    };
  }, [fetchAppointments]);

  return { appointments, loading, refetch: fetchAppointments, setAppointments };
}
