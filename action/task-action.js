"use server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

// Get Tasks
export const getTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, project:projects(title), assigned_user:staff(name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  // Map DB fields to UI fields if necessary
  return data.map((task) => ({
    ...task,
    assignDate: task.created_at, // or whatever
    dueDate: task.due_date,
    assign: task.assigned_user ? [task.assigned_user] : []
  }));
};

// Create Task
export const createTask = async (data) => {
  try {
    const { error } = await supabase.from("tasks").insert([data]);
    if (error) throw new Error(error.message);
    revalidatePath("/task");
    return { status: "success", message: "Task created successfully" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Update Task
export const updateTask = async (id, data) => {
  try {
    const { error } = await supabase.from("tasks").update(data).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/task");
    return { status: "success", message: "Task updated successfully" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Delete Task
export const deleteTask = async (id) => {
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/task");
    return { status: "success", message: "Task deleted successfully" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};
