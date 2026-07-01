import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { cn, formatDate } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CalendarIcon } from "lucide-react";
import {
  AddEvent,
  deleteEventAction,
  updateEventAction,
} from "@/action/calendar-action";
import toast from "react-hot-toast";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
const schema = z.object({
  title: z.string().min(3, { message: "Required" }),
  description: z.string().optional(),
});

const EventSheet = ({ open, onClose, categories, event, selectedDate }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isPending, startTransition] = React.useTransition();
  const [calendarProps, setCalendarProps] = React.useState(categories[0].value);
  // delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState(null);

  const {
    register,
    control,
    reset,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
  });

  const onSubmit = (data) => {
    startTransition(async () => {
      // Combine date and time
      const startDateTime = new Date(startDate);
      const [startHour, startMinute] = startTime.split(":");
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

      const endDateTime = new Date(endDate);
      const [endHour, endMinute] = endTime.split(":");
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

      // if event is  null only create event

      if (!event) {
        data.start = startDateTime;
        data.end = endDateTime;
        data.allDay = false;
        data.extendedProps = {
          calendar: calendarProps,
          description: data.description,
        };

        let response = await AddEvent(data);
        if (response?.status === "success") {
          toast.success(response?.message);
          reset();
          onClose();
        } else {
          toast.error(response?.message);
        }
      }
      // if event is not null only update event
      if (event) {
        data.start = startDateTime;
        data.end = endDateTime;
        data.extendedProps = {
          calendar: calendarProps,
          description: data.description,
        };
        let response = await updateEventAction(event?.event?.id, data);
        if (response?.status === "success") {
          toast.success(response?.message);
          reset();
          onClose();
        } else {
          toast.error(response?.message);
        }
      }
    });
  };
  useEffect(() => {
    if (selectedDate) {
      setStartDate(selectedDate.date);
      setEndDate(selectedDate.date);
      // Reset time to default on new selection if needed or keep previous
    }
    if (event) {
      setStartDate(event?.event?.start);
      setEndDate(event?.event?.end);
      
      const start = event?.event?.start;
      const end = event?.event?.end;
      if (start) {
        setStartTime(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`);
      }
      if (end) {
        setEndTime(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
      }

      const eventCalendar = event?.event?.extendedProps?.calendar;
      if (eventCalendar) {
        setCalendarProps(eventCalendar);
      } else {
        setCalendarProps(categories[0].value);
      }
      setValue("description", event?.event?.extendedProps?.description || "");
    }
    setValue("title", event?.event?.title || "");
  }, [event, selectedDate, open]);

  const onDeleteEventAction = async () => {
    try {
      if (!eventIdToDelete) {
        toast.error("Event ID not found");
        return;
      }

      const response = await deleteEventAction(eventIdToDelete);
      if (response?.status === "success") {
        toast.success(response?.message);
        reset();
        onClose();
      } else {
        toast.error(response?.message);
        reset();
        onClose();
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleOpenDeleteModal = (eventId) => {
    setEventIdToDelete(eventId);
    setDeleteModalOpen(true);
    onClose();
  };

  return (
    <>
      <DeleteConfirmationDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onDeleteEventAction}
        defaultToast={false}
      />
      <Sheet open={open}>
        <SheetContent
          onPointerDownOutside={onClose}
          onClose={onClose}
          className="px-0"
        >
          <SheetHeader className="px-6">
            <SheetTitle>
              {event ? "Edit Event" : "Create Event"} {event?.title}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 h-full">
            <form className=" h-full" onSubmit={handleSubmit(onSubmit)}>
              <div className="h-[calc(100vh-130px)]">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pb-5 px-6">
                    <div className=" space-y-1.5">
                      <Label htmlFor="title">Event Name</Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="Enter Event Name"
                        {...register("title")}
                      />
                      {errors && (
                        <div className=" text-destructive">
                          {errors?.title?.message}
                        </div>
                      )}
                    </div>
                    <div className=" space-y-1.5">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter Event Description"
                        className="min-h-[100px]"
                        {...register("description")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="startDate" className="mb-1.5">
                        Start Date
                      </Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-between text-left font-normal border-default-200 text-default-600",
                                !startDate && "text-muted-foreground"
                              )}
                            >
                              {startDate ? (
                                formatDate(startDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="h-4 w-4 " />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Controller
                              name="startDate"
                              control={control}
                              render={({ field }) => (
                                <Calendar
                                  mode="single"
                                  selected={startDate}
                                  onSelect={setStartDate}
                                  initialFocus
                                />
                              )}
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-[120px]"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="endDate" className="mb-1.5">
                        End Date
                      </Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-between text-left font-normal border-default-200 text-default-600",
                                !endDate && "text-muted-foreground"
                              )}
                            >
                              {endDate ? (
                                formatDate(endDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className=" h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Controller
                              name="endDate"
                              control={control}
                              render={({ field }) => (
                                <Calendar
                                  mode="single"
                                  selected={endDate}
                                  onSelect={setEndDate}
                                  initialFocus
                                />
                              )}
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-[120px]"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="calendarProps" className="mb-1.5">
                        Label
                      </Label>
                      <Controller
                        name="calendarProps"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={calendarProps}
                            onValueChange={(data) => setCalendarProps(data)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Label" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  value={category.value}
                                  key={category.value}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </div>
              <div className="pb-12 flex flex-wrap gap-2 px-6">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {event ? "Updating..." : "Adding..."}
                    </>
                  ) : event ? (
                    "Update Event"
                  ) : (
                    "Add Event"
                  )}
                </Button>
                {event && (
                  <Button
                    type="button"
                    color="destructive"
                    onClick={() => handleOpenDeleteModal(event?.event?.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EventSheet;
