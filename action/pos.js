"use server";

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export async function createSale(data) {
  // data = { total, payment_method, client_id, items: [{ id, quantity, price, name }] }
  
  // 1. Create Sale Record
  const { data: sale, error: saleError } = await supabase
    .from("sales") // Ensure this table exists!
    .insert([{
        total: data.total,
        payment_method: data.payment_method,
        status: 'completed',
        client_id: data.client_id || null, // Link to client
        created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (saleError) {
    console.error("Error creating sale:", saleError);
    // If table doesn't exist, we might need to handle that or user needs to run migration
    return { error: saleError.message };
  }

  const saleId = sale.id;

  // 2. Create Sale Items & Update Inventory
  // Note: Supabase doesn't support transactions in JS client easily without RPC.
  // We will do this sequentially for now.
  
  const items = data.items.map(item => ({
      sale_id: saleId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price, // Snapshot price at time of sale
      product_name: item.name
  }));

  const { error: itemsError } = await supabase
    .from("sale_items") // Ensure this table exists!
    .insert(items);

  if (itemsError) {
    console.error("Error creating sale items:", itemsError);
    // Ideally we would rollback here (delete sale)
    return { error: itemsError.message };
  }

  // 3. Update Inventory
  // Iterate and decrement. 
  // For better performance/safety, this should be an RPC call.
  for (const item of data.items) {
      const { error: inventoryError } = await supabase.rpc('decrement_inventory', { 
          row_id: item.id, 
          quantity: item.quantity 
      });
      
      // Fallback if RPC doesn't exist (race condition prone but functional for basic use)
      if (inventoryError) {
          // Fetch current
          const { data: current } = await supabase.from('inventory_products').select('quantity').eq('id', item.id).single();
          if (current) {
              await supabase.from('inventory_products')
                .update({ quantity: Math.max(0, current.quantity - item.quantity) })
                .eq('id', item.id);
          }
      }
  }

  revalidatePath("/inventory/products");
  revalidatePath("/(dashboard)/(apps)/pos");
  
  return { success: true, saleId };
}
