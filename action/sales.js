"use server";

import { supabase } from "@/lib/supabaseClient";
import { unstable_noStore as noStore } from "next/cache";

export async function getSales() {
  noStore();
  
  const { data, error } = await supabase
    .from("sales")
    .select(`
      *,
      clients (
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {

    console.error("Error fetching sales:", JSON.stringify(error, null, 2));
    // Fallback: Return data without clients if join fails (optional strategy, but better to fix DB)
    throw new Error(`Failed to fetch sales: ${error.message}`);
  }

  return data;
}

export async function getSaleDetails(saleId) {
  noStore();

  // Fetch items
  const { data: items, error: itemsError } = await supabase
    .from("sale_items")
    .select("*")
    .eq("sale_id", saleId);

  if (itemsError) {
    console.error("Error fetching sale items:", itemsError);
    throw new Error("Failed to fetch sale items");
  }

  // Also fetch the sale again to get client info if not passed
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("*, clients(*)")
    .eq("id", saleId)
    .single();

  if (saleError) {
     console.error("Error fetching sale details:", saleError);
  }

  return { items, sale };  
}
