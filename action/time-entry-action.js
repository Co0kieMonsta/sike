"use server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

// Get Time Entries with filters
export const getTimeEntries = async ({ staffId, startDate, endDate }) => {
  let query = supabase
    .from("time_entries")
    .select(`
      id,
      staff_id,
      clock_in,
      clock_out,
      total_hours,
      date,
      status,
      staff ( name ),
      breaks ( start_time, end_time, duration )
    `)
    .order("date", { ascending: false })
    .order("clock_in", { ascending: false });

  if (staffId && staffId !== "all") {
    query = query.eq("staff_id", staffId);
  }
  if (startDate) {
    query = query.gte("date", startDate);
  }
  if (endDate) {
    query = query.lte("date", endDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// Create Manual Entry
export const createManualEntry = async (data) => {
  try {
    const { staff_id, date, clock_in, clock_out } = data;
    
    // Calculate total hours
    const start = new Date(clock_in);
    const end = new Date(clock_out);
    const diffMs = end - start;
    const total_hours = (diffMs / (1000 * 60 * 60)).toFixed(2);

    const { error } = await supabase.from("time_entries").insert([
      {
        staff_id,
        date,
        clock_in,
        clock_out,
        total_hours,
        status: "completed",
      },
    ]);

    if (error) throw new Error(error.message);
    revalidatePath("/staff/timesheets");
    return { status: "success", message: "Time entry created successfully" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Update Time Entry
export const updateTimeEntry = async (id, data) => {
  try {
    const { clock_in, clock_out } = data;
    // Recalculate if both are present
    const start = new Date(clock_in);
    const end = new Date(clock_out);
    const diffMs = end - start;
    const total_hours = (diffMs / (1000 * 60 * 60)).toFixed(2);

    const payload = {
        ...data,
        total_hours,
        status: "completed"
    };

    const { error } = await supabase.from("time_entries").update(payload).eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/staff/timesheets");
    return { status: "success", message: "Time entry updated successfully" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Delete Time Entry
export const deleteTimeEntry = async (id) => {
  try {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/staff/timesheets");
    return { status: "success", message: "Time entry deleted successfully" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};
