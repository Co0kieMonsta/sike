"use server";

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";

// --- Service Catalog Actions ---

export async function getServices() {
  noStore();
  
  const { data, error } = await supabase
    .from("service_catalog")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services");
  }

  return data;
}

export async function createService(data) {
  // data = { name, description, price, duration, category_id }
  const { data: newService, error } = await supabase
    .from("service_catalog")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error creating service:", error);
    return { error: error.message };
  }

  revalidatePath("/service-registry");
  return { success: true, data: newService };
}

// --- Service Categories Actions ---

export async function getCategories() {
    noStore();
    const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
    return data;
}

export async function createCategory(data) {
    const { data: newCategory, error } = await supabase
        .from("service_categories")
        .insert([data])
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }
    revalidatePath("/service-registry");
    return { success: true, data: newCategory };
}

export async function deleteCategory(id) {
    const { error } = await supabase
        .from("service_categories")
        .delete()
        .eq("id", id);
    
    if (error) {
        return { error: error.message };
    }
    revalidatePath("/service-registry");
    return { success: true };
}

export async function updateCategory(id, data) {
    const { data: updatedCategory, error } = await supabase
        .from("service_categories")
        .update(data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }
    revalidatePath("/service-registry");
    return { success: true, data: updatedCategory };
}

// --- Service Actions (Update/Delete) ---

export async function updateService(id, data) {
    const { data: updatedService, error } = await supabase
        .from("service_catalog")
        .update(data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }
    revalidatePath("/service-registry");
    return { success: true, data: updatedService };
}

export async function deleteService(id) {
    const { error } = await supabase
        .from("service_catalog")
        .delete()
        .eq("id", id);
    
    if (error) {
        return { error: error.message };
    }
    revalidatePath("/service-registry");
    return { success: true };
}

// --- Service Order Actions ---

export async function createServiceOrder(data) {
  // data = { total, payment_method, client_id, items: [{ service_id, name, price }] }
  
  // 1. Create Order Record
  const { data: order, error: orderError } = await supabase
    .from("service_orders")
    .insert([{
        total: data.total,
        payment_method: data.payment_method,
        client_id: data.client_id || null,
        vehicle_brand: data.vehicle_brand || null,
        vehicle_model: data.vehicle_model || null,
        vehicle_color: data.vehicle_color || null,
        vehicle_plate: data.vehicle_plate || null,
        status: 'completed',
        created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (orderError) {
    console.error("Error creating service order:", orderError);
    return { error: orderError.message };
  }

  const orderId = order.id;

  // 2. Create Order Items
  const orderItems = data.items.map(item => ({
    service_order_id: orderId,
    service_id: item.id, // Assuming item.id is the service_catalog id
    service_name: item.name,
    price: item.price
  }));

  const { error: itemsError } = await supabase
    .from("service_order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Error creating service order items:", itemsError);
    // In a real app, we might want to rollback the order here
    return { error: "Order created but failed to save items." };
  }

  revalidatePath("/service-registry");
  return { success: true, orderId };
}

export async function getServiceOrders() {
    noStore();
    
    // Fetch orders with client details
    const { data, error } = await supabase
        .from("service_orders")
        .select(`
            *,
            clients (id, name, email)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching service orders:", error);
        return [];
    }

    return data;
}

export async function getServiceOrderDetails(orderId) {
    noStore();

    // Fetch order items for a specific order
    const { data, error } = await supabase
        .from("service_order_items")
        .select("*")
        .eq("service_order_id", orderId);

    if (error) {
        console.error("Error fetching service order details:", error);
        return [];
    }

    return data;
}
