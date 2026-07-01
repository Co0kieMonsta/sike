"use server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

// Clock In
export const clockIn = async (pinCode) => {
  try {
    // 1. Find staff by PIN
    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("id, name")
      .eq("pin_code", pinCode)
      .single();

    if (staffError || !staff) {
      throw new Error("Invalid PIN code.");
    }

    // 2. Check if already clocked in today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const { data: activeEntry, error: activeError } = await supabase
      .from("time_entries")
      .select("id")
      .eq("staff_id", staff.id)
      .eq("status", "active")
      .single();

    if (activeEntry) {
        throw new Error(`Hello ${staff.name}, you are already clocked in.`);
    }

    // 3. Create active time entry
    const { error: insertError } = await supabase.from("time_entries").insert([
      {
        staff_id: staff.id,
        clock_in: new Date().toISOString(),
        status: "active",
      },
    ]);

    if (insertError) throw new Error(insertError.message);

    return { status: "success", message: `Welcome ${staff.name}! Clocked in successfully.` };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Start Break
export const startBreak = async (pinCode) => {
    try {
        // 1. Find staff
        const { data: staff, error: staffError } = await supabase
            .from("staff")
            .select("id, name")
            .eq("pin_code", pinCode)
            .single();

        if (staffError || !staff) throw new Error("Invalid PIN code.");

        // 2. Find active time entry
        const { data: activeEntry, error: activeError } = await supabase
            .from("time_entries")
            .select("id")
            .eq("staff_id", staff.id)
            .eq("status", "active")
            .single();

        if (!activeEntry) throw new Error("You are not clocked in.");

        // 3. Check if already on break (open break record)
        const { data: openBreak } = await supabase
            .from("breaks")
            .select("id")
            .eq("time_entry_id", activeEntry.id)
            .is("end_time", null)
            .single();

        if (openBreak) throw new Error("You are already on a break.");

        // 4. Create break record
        const { error: insertError } = await supabase.from("breaks").insert([{
            time_entry_id: activeEntry.id,
            start_time: new Date().toISOString()
        }]);

        if (insertError) throw new Error(insertError.message);

        return { status: "success", message: "Break started." };
    } catch (error) {
        return { status: "fail", message: error.message };
    }
};

// End Break
export const endBreak = async (pinCode) => {
    try {
        // 1. Find staff
        const { data: staff, error: staffError } = await supabase
            .from("staff")
            .select("id, name")
            .eq("pin_code", pinCode)
            .single();

        if (staffError || !staff) throw new Error("Invalid PIN code.");

        // 2. Find active time entry
        const { data: activeEntry } = await supabase
            .from("time_entries")
            .select("id")
            .eq("staff_id", staff.id)
            .eq("status", "active")
            .single();

        if (!activeEntry) throw new Error("You are not clocked in.");

        // 3. Find open break
        const { data: openBreak } = await supabase
            .from("breaks")
            .select("id, start_time")
            .eq("time_entry_id", activeEntry.id)
            .is("end_time", null)
            .single();

        if (!openBreak) throw new Error("You are not on a break.");

        // 4. Calculate duration and close break
        const endTime = new Date();
        const startTime = new Date(openBreak.start_time);
        const duration = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2);

        const { error: updateError } = await supabase.from("breaks").update({
            end_time: endTime.toISOString(),
            duration: duration
        }).eq("id", openBreak.id);

        if (updateError) throw new Error(updateError.message);

        return { status: "success", message: "Break ended." };

    } catch (error) {
        return { status: "fail", message: error.message };
    }
};

// Clock Out
export const clockOut = async (pinCode) => {
  try {
    // 1. Find staff by PIN
    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("id, name")
      .eq("pin_code", pinCode)
      .single();

    if (staffError || !staff) {
      throw new Error("Invalid PIN code.");
    }

    // 2. Find active entry
    const { data: activeEntry, error: activeError } = await supabase
      .from("time_entries")
      .select("id, clock_in")
      .eq("staff_id", staff.id)
      .eq("status", "active")
      .single();

    if (!activeEntry) {
      throw new Error(`Hello ${staff.name}, you are not clocked in.`);
    }

    // Check if currently on break (must end break before clocking out)
    const { data: openBreak } = await supabase
        .from("breaks")
        .select("id")
        .eq("time_entry_id", activeEntry.id)
        .is("end_time", null)
        .single();
    
    if (openBreak) throw new Error("Please end your break before clocking out.");

    // 3. Calculate total work hours (Total Session - Total Break Time)
    const clockInTime = new Date(activeEntry.clock_in);
    const clockOutTime = new Date();
    const sessionDiffMs = clockOutTime - clockInTime;
    let totalHours = sessionDiffMs / (1000 * 60 * 60);

    // Get total break duration
    const { data: breaks } = await supabase
        .from("breaks")
        .select("duration")
        .eq("time_entry_id", activeEntry.id);
    
    const totalBreakHours = breaks?.reduce((sum, b) => sum + (parseFloat(b.duration) || 0), 0) || 0;
    
    totalHours = (totalHours - totalBreakHours).toFixed(2);

    // 4. Update entry
    const { error: updateError } = await supabase
      .from("time_entries")
      .update({
        clock_out: clockOutTime.toISOString(),
        total_hours: totalHours,
        status: "completed",
      })
      .eq("id", activeEntry.id);

    if (updateError) throw new Error(updateError.message);

    return { status: "success", message: `Goodbye ${staff.name}! Clocked out. Total time: ${totalHours} hrs.` };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};
