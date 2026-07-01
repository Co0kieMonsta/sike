"use server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

// Get Projects
export const getProjects = async () => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  // Map DB fields back to UI fields if necessary
  return data.map((project) => ({
    ...project,
    assignDate: project.start_date,
    dueDate: project.end_date,
  }));
};

// Create Project
export const createProject = async (data) => {
  const dbData = {
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    status: data.status || "active",
    priority: data.priority,
    assign: data.assign,
    start_date: data.assignDate,
    end_date: data.dueDate,
    image: data.image,
    is_favorite: data.isFavorite || false,
    percentage: data.percentage || 0,
  };

  try {
    const { error } = await supabase.from("projects").insert([dbData]);
    if (error) throw new Error(error.message);
    revalidatePath("/projects");
    return { status: "success", message: "Project created successfully" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Update Project
export const updateProject = async (id, data) => {
  const dbData = {
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    status: data.status,
    priority: data.priority,
    assign: data.assign,
    start_date: data.assignDate,
    end_date: data.dueDate,
    image: data.image,
    ...(data.isFavorite !== undefined && { is_favorite: data.isFavorite }),
    ...(data.percentage !== undefined && { percentage: data.percentage }),
  };

  try {
    const { error } = await supabase.from("projects").update(dbData).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/projects");
    return { status: "success", message: "Project updated successfully" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Delete Project
export const deleteProject = async (id) => {
  try {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/projects");
    return { status: "success", message: "Project deleted successfully" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Get Single Project
export const getProject = async (id) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching project ${id}:`, error);
    return null;
  }

  return {
    ...data,
    assignDate: data.start_date,
    dueDate: data.end_date,
  };
};

// Get Staff
export const getStaff = async () => {
  const { data, error } = await supabase
    .from("staff")
    .select("id, name, email")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
  return data;
};

export const addProjectAction = createProject;
export const editProjectAction = updateProject;
export const deleteProjectAction = deleteProject;
