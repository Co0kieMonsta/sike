"use server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

// Get all staff
export const getStaff = async () => {
  const { data, error } = await supabase.from("staff").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

// Create new staff
export const createStaff = async (data) => {
  try {
    const { data: newStaff, error } = await supabase.from("staff").insert([data]).select().single();
    if (error) throw new Error(error.message);
    revalidatePath("/staff");
    return { status: "success", message: "Staff created successfully", data: newStaff };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Update staff
export const updateStaff = async (id, data) => {
  try {
    const { data: updatedStaff, error } = await supabase.from("staff").update(data).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    revalidatePath("/staff");
    return { status: "success", message: "Staff updated successfully", data: updatedStaff };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Delete staff
export const deleteStaff = async (id) => {
  try {
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/staff");
    return { status: "success", message: "Staff deleted successfully" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};
