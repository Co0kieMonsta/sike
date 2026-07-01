"use server";
import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export const submitSupportTicket = async (data) => {
  try {
    const { type, title, description, contact_email, severity } = data;

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert([
        {
          type,
          title,
          description,
          contact_email: contact_email || null,
          severity: severity || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/support");
    return { status: "success", message: "Ticket submitted successfully", data: ticket };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
};
