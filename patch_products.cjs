const fs = require('fs');

let apiFile = fs.readFileSync('src/app/shared/api/treatmentApi.ts', 'utf8');

if (!apiFile.includes('export async function getProducts')) {
  const patchCode = `
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
    stockQuantity: d.stock_quantity,
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
    stock_quantity: product.stockQuantity,
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
  if (updates.stockQuantity !== undefined) mappedUpdates.stock_quantity = updates.stockQuantity;
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
`;
  fs.writeFileSync('src/app/shared/api/treatmentApi.ts', apiFile + "\n" + patchCode);
}
