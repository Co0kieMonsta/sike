"use server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

// Generate Payroll Preview
export const generatePayroll = async (startDate, endDate) => {
  try {
    // 1. Get all staff
    const { data: staffList, error: staffError } = await supabase
        .from("staff")
        .select("id, name, hourly_rate");
    
    if (staffError) throw new Error(staffError.message);

    const payrollPreview = [];

    // 2. Loop through staff and calculate hours
    for (const staff of staffList) {
        // Get completed time entries in range
        const { data: entries, error: entriesError } = await supabase
            .from("time_entries")
            .select("total_hours")
            .eq("staff_id", staff.id)
            .eq("status", "completed")
            .gte("date", startDate)
            .lte("date", endDate);

        if (entriesError) continue;

        const totalHours = entries.reduce((sum, entry) => sum + (parseFloat(entry.total_hours) || 0), 0);
        const grossPay = (totalHours * staff.hourly_rate).toFixed(2);
        const netPay = grossPay; // Deductions logic can be added here

        if (totalHours > 0) {
            payrollPreview.push({
                staff_id: staff.id,
                staff_name: staff.name,
                hourly_rate: staff.hourly_rate,
                total_hours: totalHours.toFixed(2),
                gross_pay: grossPay,
                net_pay: netPay,
            });
        }
    }

    return { status: "success", data: payrollPreview };

  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

// Save Payroll (Process Payment)
export const savePayroll = async (data, startDate, endDate) => {
    try {
        const payrollRecords = data.map(item => ({
            staff_id: item.staff_id,
            period_start: startDate,
            period_end: endDate,
            total_hours: item.total_hours,
            gross_pay: item.gross_pay,
            net_pay: item.net_pay,
            status: 'paid'
        }));

        const { error } = await supabase.from("payrolls").insert(payrollRecords);
        if (error) throw new Error(error.message);
        
        revalidatePath("/payroll");
        return { status: "success", message: "Payroll processed successfully." };

    } catch (error) {
        return { status: "fail", message: error.message };
    }
}
