import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jggwuyqpcouziysxhaws.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3d1eXFwY291eml5c3hoYXdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNDc1MiwiZXhwIjoyMDk4NTAwNzUyfQ.QbKCunwMlSQyHnqlcBKGxRz0Von3sJfqd9fYG-m_qOw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  // Find products that cost 60 baht
  const { data: products } = await supabase.from('product').select('*').eq('price', 60);
  console.log('Products that cost 60 baht:', products);
  
  if (products && products.length > 0) {
    const prodId = products[0].product_id;
    
    // Find treatments that cost 1060 baht
    const { data: payments } = await supabase.from('payment').select('*, treatment_record(treatment_id, patient_id)').eq('total_amount', 1060);
    console.log('Payments of 1060:', JSON.stringify(payments, null, 2));
    
    if (payments && payments.length > 0) {
      const treatmentId = payments[0].treatment_id;
      
      // Check if it already has products
      const { data: tp } = await supabase.from('treatment_product').select('*').eq('treatment_id', treatmentId);
      console.log('Existing treatment_products:', tp);
      
      if (!tp || tp.length === 0) {
         console.log('Inserting product for treatment:', treatmentId);
         const { error } = await supabase.from('treatment_product').insert({
            treatment_id: treatmentId,
            product_id: prodId,
            quantity: 1,
            actual_price: 60
         });
         if (error) console.error('Insert error:', error);
         else console.log('Successfully fixed the DB!');
      }
    }
  }
}

run();
