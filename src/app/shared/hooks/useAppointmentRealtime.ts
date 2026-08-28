import { useEffect } from 'react';
import { supabase } from '../supabaseApi';

export function useAppointmentRealtime(onUpdate: () => void) {
  useEffect(() => {
    // Listen to broadcast messages from 'icemu-updates' channel
    const channel = supabase.channel('icemu-updates', { config: { broadcast: { self: true } } });
    
    channel.on('broadcast', { event: 'appointments-updated' }, (payload) => {
      console.log('Realtime update received:', payload);
      onUpdate();
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [onUpdate]);
}
