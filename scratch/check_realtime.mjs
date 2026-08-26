// Check Realtime via Supabase JS SDK - listen to appointment table for 5 seconds
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jggwuyqpcouziysxhaws.supabase.co',
  'sb_publishable_Q5sT7uhyo5aro4mMVSk1Qw_MoeNSzWK'
);

console.log('Testing Supabase Realtime on appointment table...');
console.log('If Realtime is enabled, you should see "SUBSCRIBED" status below.\n');

let subscribeStatus = 'UNKNOWN';

const channel = supabase
  .channel('test-realtime-check')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'appointment' },
    (payload) => {
      console.log('✅ Got realtime event:', payload.eventType);
    }
  )
  .subscribe((status, err) => {
    subscribeStatus = status;
    if (status === 'SUBSCRIBED') {
      console.log('✅ SUBSCRIBED — Realtime IS ENABLED for appointment table!');
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      console.log('❌ FAILED:', status, err?.message || '');
      console.log('   → Realtime is NOT enabled for appointment table');
    } else {
      console.log('⏳ Status:', status);
    }
  });

// Wait 6 seconds then cleanup
setTimeout(async () => {
  console.log('\nFinal status:', subscribeStatus);
  await supabase.removeChannel(channel);
  process.exit(0);
}, 6000);
