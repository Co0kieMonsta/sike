export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

export async function GET(request) {
  try {
    const calendarsRef = collection(db, "docs_calendars");
    // Just get all for now
    const snapshot = await getDocs(calendarsRef);

    // Transform data to match frontend expectation
    // Frontend expects: { id, title, start, end, allDay, extendedProps: { calendar, vehiculo, motivo } }
    const events = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        start: data.start_date,
        end: data.end_date,
        allDay: data.all_day,
        extendedProps: {
          calendar: data.calendar_label,
          description: data.description,
          vehiculo: data.vehiculo,
        },
      };
    });

    const projectsRef = collection(db, "projects");
    const projectsSnapshot = await getDocs(projectsRef);
    const projectEvents = projectsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, // Keep original ID for routing
        title: `🔧 [Proyecto] ${data.title}`,
        start: data.startDate,
        end: data.endDate || data.startDate,
        allDay: true,
        extendedProps: {
          calendar: "project",
          description: data.description,
          vehiculo: data.carName,
          isProject: true
        },
      };
    });

    const allEvents = [...events, ...projectEvents];

    return NextResponse.json({
      status: "success",
      message: "Events fetched successfully",
      data: allEvents,
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
    const vehiculo = extendedProps?.vehiculo || "";

    const newBooking = {
      title,
      start_date: start,
      end_date: end,
      all_day: allDay || false,
      calendar_label,
      description: description || "",
      vehiculo,
      created_at: new Date().toISOString(),
    };

    const calendarsRef = collection(db, "docs_calendars");
    const docRef = await addDoc(calendarsRef, newBooking);

    const newEvent = {
        id: docRef.id,
        title: newBooking.title,
        start: newBooking.start_date,
        end: newBooking.end_date,
        allDay: newBooking.all_day,
        extendedProps: {
            calendar: newBooking.calendar_label,
            description: newBooking.description,
            vehiculo: newBooking.vehiculo
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
