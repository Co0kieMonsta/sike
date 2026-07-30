"use client";

import { useEffect, useState } from "react";
import { getCategories, getEvents } from "@/config/calendar.config";
import CalendarView from "./calender-view";
import { Loader2 } from "lucide-react";

const CalenderPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [eventsRes, categoriesRes] = await Promise.all([
        getEvents(),
        getCategories()
      ]);
      setEvents(eventsRes?.data || []);
      setCategories(categoriesRes?.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <CalendarView events={events} categories={categories} />
    </div>
  );
};

export default CalenderPage;
