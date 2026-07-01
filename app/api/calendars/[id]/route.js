import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: "success",
      message: "Event deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error.message,
    });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updatedEventData = await request.json();

    // Map frontend data to DB columns if necessary
    const updatePayload = {};
    if (updatedEventData.title) updatePayload.title = updatedEventData.title;
    if (updatedEventData.start) updatePayload.start_date = updatedEventData.start;
    if (updatedEventData.end) updatePayload.end_date = updatedEventData.end;
    if (updatedEventData.allDay !== undefined) updatePayload.all_day = updatedEventData.allDay;
    if (updatedEventData.extendedProps?.calendar) updatePayload.calendar_label = updatedEventData.extendedProps.calendar;
    if (updatedEventData.description) updatePayload.description = updatedEventData.description;

    const { data, error } = await supabase
      .from("bookings")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    const updatedEvent = {
        id: data.id,
        title: data.title,
        start: new Date(data.start_date),
        end: new Date(data.end_date),
        allDay: data.all_day,
        extendedProps: {
            calendar: data.calendar_label,
            description: data.description
        }
    }


    return NextResponse.json({
      status: "success",
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error.message,
    });
  }
}
