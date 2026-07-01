import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Transform data to match frontend expectation if needed
    // Frontend expects: { id, title, start, end, allDay, extendedProps: { calendar } }
    const events = data.map((booking) => ({
      id: booking.id,
      title: booking.title,
      start: new Date(booking.start_date),
      end: new Date(booking.end_date),
      allDay: booking.all_day,
      extendedProps: {
        calendar: booking.calendar_label,
        description: booking.description,
      },
    }));

    return NextResponse.json({
      status: "success",
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error.message,
    });
  }
}

export async function POST(request) {
  try {
    const reqBody = await request.json();
    
    // Map frontend data to DB columns
    const { title, start, end, allDay, extendedProps, description } = reqBody;
    const calendar_label = extendedProps?.calendar || "business";

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          title,
          start_date: start,
          end_date: end,
          all_day: allDay,
          calendar_label,
          description: description || "",
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const newEvent = {
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
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error.message,
    });
  }
}
