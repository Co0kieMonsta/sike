export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const docRef = doc(db, "docs_calendars", id);
    await deleteDoc(docRef);

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
    const { id } = await params;
    const updatedEventData = await request.json();

    const updatePayload = {};
    if (updatedEventData.title) updatePayload.title = updatedEventData.title;
    if (updatedEventData.start) updatePayload.start_date = updatedEventData.start;
    if (updatedEventData.end) updatePayload.end_date = updatedEventData.end;
    if (updatedEventData.allDay !== undefined) updatePayload.all_day = updatedEventData.allDay;
    if (updatedEventData.extendedProps?.calendar) updatePayload.calendar_label = updatedEventData.extendedProps.calendar;
    if (updatedEventData.description) updatePayload.description = updatedEventData.description;
    if (updatedEventData.extendedProps?.vehiculo) updatePayload.vehiculo = updatedEventData.extendedProps.vehiculo;

    const docRef = doc(db, "docs_calendars", id);
    await updateDoc(docRef, updatePayload);
    
    // fetch updated to return
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    const updatedEvent = {
        id: docSnap.id,
        title: data.title,
        start: data.start_date,
        end: data.end_date,
        allDay: data.all_day,
        extendedProps: {
            calendar: data.calendar_label,
            description: data.description,
            vehiculo: data.vehiculo
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
