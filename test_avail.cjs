require('ts-node').register();
const { getAvailableTimeSlots } = require('./src/app/shared/supabaseApi');

async function test() {
  const date = new Date();
  date.setDate(date.getDate() + 1); // tomorrow
  const dateStr = date.toISOString().split('T')[0];
  console.log(`Checking for ${dateStr}...`);
  try {
    const slots = await getAvailableTimeSlots(dateStr, undefined, undefined);
    console.log("Slots:", slots);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
