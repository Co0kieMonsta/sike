"use server";
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/config/calendar.config";
import { revalidatePath } from "next/cache";

export const AddEvent = async (data) => {
  const response = await createEvent(data);
  revalidatePath("/booking");
  return response;
};

export const deleteEventAction = async (id) => {
  const response = await deleteEvent(id);
  revalidatePath("/booking");
  return response;
};

// update event
export const updateEventAction = async (id, data) => {
  const response = await updateEvent(id, data);
  revalidatePath("/booking");
  return response;
};
