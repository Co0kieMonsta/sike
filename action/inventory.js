"use server";

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

// --- Categories ---

export async function getInventoryCategories(type = null) {
  noStore();
  let query = supabase.from("inventory_categories").select("*").order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching inventory categories:", error);
    throw new Error("Failed to fetch inventory categories");
  }

  return data;
}

export async function createInventoryCategory(data) {

  const { error } = await supabase.from("inventory_categories").insert([data]);

  if (error) {
    console.error("Error creating inventory category:", error);
    throw new Error("Failed to create inventory category");
  }

  revalidatePath("/inventory/categories");
  revalidatePath("/inventory/products");
  revalidatePath("/inventory/assets");
  return { success: true };
}

export async function updateInventoryCategory(id, data) {

  const { error } = await supabase.from("inventory_categories").update(data).eq("id", id);

  if (error) {
    console.error("Error updating inventory category:", error);
    throw new Error("Failed to update inventory category");
  }

  revalidatePath("/inventory/categories");
  revalidatePath("/inventory/products");
  revalidatePath("/inventory/assets");
  return { success: true };
}

export async function deleteInventoryCategory(id) {

  const { error } = await supabase.from("inventory_categories").delete().eq("id", id);

  if (error) {
    console.error("Error deleting inventory category:", error);
    throw new Error("Failed to delete inventory category");
  }

  revalidatePath("/inventory/categories");
  return { success: true };
}

// --- Products ---

export async function getInventoryProducts() {
  noStore();
  console.log("Fetching inventory products...");
  const { data, error } = await supabase
    .from("inventory_products")
    .select(`
      *,
      category:inventory_categories(name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inventory products:", error);
    throw new Error("Failed to fetch inventory products");
  }

  console.log("Fetched products count:", data?.length);
  return data;
}

export async function createInventoryProduct(data) {

  const { error } = await supabase.from("inventory_products").insert([data]);

  if (error) {
    console.error("Error creating inventory product:", error);
    throw new Error("Failed to create inventory product");
  }

  revalidatePath("/inventory/products");
  return { success: true };
}

export async function updateInventoryProduct(id, data) {

  const { error } = await supabase.from("inventory_products").update(data).eq("id", id);

  if (error) {
    console.error("Error updating inventory product:", error);
    throw new Error("Failed to update inventory product");
  }

  revalidatePath("/inventory/products");
  return { success: true };
}

export async function deleteInventoryProduct(id) {

  const { error } = await supabase.from("inventory_products").delete().eq("id", id);

  if (error) {
    console.error("Error deleting inventory product:", error);
    throw new Error("Failed to delete inventory product");
  }

  revalidatePath("/inventory/products");
  return { success: true };
}

// --- Assets ---

export async function getInventoryAssets() {
  noStore();
  const { data, error } = await supabase
    .from("inventory_assets")
    .select(`
      *,
      category:inventory_categories(name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inventory assets:", error);
    throw new Error("Failed to fetch inventory assets");
  }

  return data;
}

export async function createInventoryAsset(data) {

  const { error } = await supabase.from("inventory_assets").insert([data]);

  if (error) {
    console.error("Error creating inventory asset:", error);
    throw new Error("Failed to create inventory asset");
  }

  revalidatePath("/inventory/assets");
  return { success: true };
}

export async function updateInventoryAsset(id, data) {

  const { error } = await supabase.from("inventory_assets").update(data).eq("id", id);

  if (error) {
    console.error("Error updating inventory asset:", error);
    throw new Error("Failed to update inventory asset");
  }

  revalidatePath("/inventory/assets");
  return { success: true };
}

export async function deleteInventoryAsset(id) {

  const { error } = await supabase.from("inventory_assets").delete().eq("id", id);

  if (error) {
    console.error("Error deleting inventory asset:", error);
    throw new Error("Failed to delete inventory asset");
  }

  revalidatePath("/inventory/assets");
  return { success: true };
}
