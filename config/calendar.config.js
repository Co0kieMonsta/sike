import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { logAction } from "./audit.config";

export const getEvents = async (selectedCategory) => {
  try {
    const calendarsRef = collection(db, "docs_calendars");
    const snapshot = await getDocs(calendarsRef);
    const events = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
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
    const projectEvents = projectsSnapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
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

    return { status: "success", data: [...events, ...projectEvents] };
  } catch (error) {
    return { status: "error", message: error.message };
  }
};

export const getCategories = async () => {
  try {
    const categoriesRef = collection(db, "calendars_categories");
    const snapshot = await getDocs(categoriesRef);
    const categories = snapshot.docs.map((doc) => ({
      value: doc.data().value,
      label: doc.data().label,
      className: doc.data().className,
    }));
    return { status: "success", data: categories };
  } catch (error) {
    return { status: "error", message: error.message };
  }
};

export const createEvent = async (data) => {
  try {
    const calendarsRef = collection(db, "docs_calendars");
    const newBooking = {
      title: data.title,
      start_date: data.start,
      end_date: data.end,
      all_day: data.allDay || false,
      calendar_label: data.extendedProps?.calendar || "business",
      description: data.description || "",
      vehiculo: data.vehiculo || "",
      created_at: new Date().toISOString(),
    };
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
    };
    
    await logAction("calendar_events", docRef.id, "CREATE", null, newBooking);
    
    return { status: "success", data: newEvent };
  } catch (error) {
    return { status: "error", message: error.message };
  }
};

export const deleteEvent = async (id) => {
  try {
    const oldDoc = await getDoc(doc(db, "docs_calendars", id));
    const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

    await deleteDoc(doc(db, "docs_calendars", id));
    
    await logAction("calendar_events", id, "DELETE", oldData, null);

    return { status: "success" };
  } catch (error) {
    return { status: "error", message: error.message };
  }
};

export const updateEvent = async (id, data) => {
  try {
    const updateData = {
      title: data.title,
      start_date: data.start,
      end_date: data.end,
      all_day: data.allDay || false,
      calendar_label: data.extendedProps?.calendar || "business",
      description: data.description || "",
      vehiculo: data.vehiculo || "",
    };
    
    const oldDoc = await getDoc(doc(db, "docs_calendars", id));
    const oldData = oldDoc.exists() ? { id: oldDoc.id, ...oldDoc.data() } : null;

    await updateDoc(doc(db, "docs_calendars", id), updateData);
    
    const newData = { ...oldData, ...updateData };
    await logAction("calendar_events", id, "UPDATE", oldData, newData);

    return { status: "success", data: updateData };
  } catch (error) {
    return { status: "error", message: error.message };
  }
};
