"use client";
import React, { useState, useEffect, useTransition } from "react";
import { toast } from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm, Controller } from "react-hook-form";
import Select, { components } from "react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import { addProjectAction, editProjectAction } from "@/action/project-action";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { faker } from "@faker-js/faker";
import { getStaff } from "@/action/project-action";
const assignOption = []; // Initial empty state
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";


const OptionComponent = ({ data, ...props }) => {
  //const Icon = data.icon;

  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 ring-1 ring-border   ring-offset-background">
          <AvatarImage src={data.image} />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <div className="text-sm font-medium text-default-900">{data.label}</div>
      </div>
    </components.Option>
  );
};
const schema = z.object({
  title: z.string().min(2, { message: "Project name is required." }),
  description: z.string().optional(),
  subtitle: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assign: z.array(z.any()).optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  image: z.string().optional(),
});

const ProjectsSheet = ({ open, project, onClose, selectedId }) => {
  // form state

  const [selectedFile, setSelectedFile] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [staffOptions, setStaffOptions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("project-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;
      setValue("image", publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchStaff = async () => {
      const staffData = await getStaff();
      const formattedOptions = staffData.map((staff) => ({
        value: staff.id,
        label: staff.name,
        image: faker.image.avatarLegacy(), // Placeholder for now as DB has no image
      }));
      setStaffOptions(formattedOptions);
    };
    fetchStaff();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const ResetForm = async () => {
    reset();
  };

  const onSubmit = (data) => {
    // data.priority and data.assign are already in data from Controller
    const assignDateISO = data.startDate ? new Date(data.startDate).toISOString() : null;
    const dueDateISO = data.endDate ? new Date(data.endDate).toISOString() : null;
    const payload = {
      ...project,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assign: data.assign,
      assignDate: assignDateISO,
      dueDate: dueDateISO,
      image: data.image,
    };
    var result;

    if (project) {
      startTransition(async () => {
        result = await editProjectAction(selectedId, payload);
        if (result?.status === "fail") {
          toast.error(result.message);
        } else {
          toast.success("Successfully Updated");
          onClose();
        }
      });
    } else {
      startTransition(async () => {
        result = await addProjectAction(payload);
        if (result?.status === "fail") {
          toast.error(result.message);
        } else {
          toast.success("Successfully Added");
          onClose();
        }
      });
    }

    // onClose(); // Removed premature close
    // reset(); // Removed premature reset
  };

  useEffect(() => {
    setValue("title", project?.title || "");
    setValue("description", project?.description || "");
    setValue("assign", project?.assign || []);
    setValue("priority", project?.priority || "");
    setValue("startDate", project?.assignDate ? new Date(project.assignDate) : undefined);
    setValue("endDate", project?.dueDate ? new Date(project.dueDate) : undefined);
    setValue("image", project?.image || "");
  }, [open, project, setValue]);

  // Explicit cleanup for body lock when sheet closes OR unmounts
  useEffect(() => {
    if (!open) {
      // Logic for when it closes normally
      setTimeout(() => {
        document.body.removeAttribute("data-scroll-locked");
        document.body.style.pointerEvents = "";
        document.body.style.overflow = "";
      }, 0);
    }

    return () => {
      // Nuclear cleanup on unmount
      document.body.removeAttribute("data-scroll-locked");
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          onClose={() => {
            ResetForm();
            onClose();
          }}
          className="px-6"
        >
          <SheetHeader className="px-0">
            <SheetTitle>
              {project ? "Edit " : "Create a new"} Project
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100%-40px)]">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4  mt-6">
                <div className="flex items-center gap-4">
                  <div className="text-xs font-medium text-default-600">
                    Thumbnail
                  </div>

                  <Controller
                    name="image"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Label
                          htmlFor="projectLogo"
                          className="h-12 w-12 flex justify-center items-center bg-default-100 rounded cursor-pointer overflow-hidden relative"
                        >
                          {isUploading ? (
                            <Loader2 className="w-6 h-6 text-default-400 animate-spin" />
                          ) : field.value ? (
                            <img
                              src={field.value}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Plus className="w-6 h-6 text-default-400" />
                          )}
                        </Label>
                        <Input
                          type="file"
                          accept="image/*"
                          id="projectLogo"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="projectName" className="mb-1.5">
                    Project Name
                  </Label>
                  <Input
                    type="text"
                    {...register("title")}
                    placeholder="Project Name"
                    className={cn("", {
                      "border-destructive focus:border-destructive":
                        errors.title,
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-1.5">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Project Description"
                    {...register("description")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status" className="mb-1.5">
                      Status
                    </Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <UiSelect
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To do</SelectItem>
                            <SelectItem value="inprogress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </UiSelect>
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority" className="mb-1.5">
                      Priority
                    </Label>
                      <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                          <UiSelect
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </UiSelect>
                        )}
                      />
                  </div>
                </div>
                <div>
                  <Label htmlFor="assign" className="mb-1.5">
                    Assign
                  </Label>
                  <Controller
                    name="assign"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={staffOptions}
                        className="react-select"
                        classNamePrefix="select"
                        isMulti
                        components={{
                          Option: OptionComponent,
                        }}
                        id="icon_s"
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="mb-1.5">
                      Start Date
                    </Label>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal border-default-300 bg-background ",
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
                              selected={field.value}
                              onSelect={(date) => field.onChange(date)}
                              initialFocus
                            />
                          )}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="mb-1.5">
                      End Date
                    </Label>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal border-default-300 bg-background",
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
                              selected={field.value}
                              onSelect={(date) => field.onChange(date)}
                              initialFocus
                            />
                          )}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-6">
                <Button
                  color="warning"
                  variant="soft"
                  className="flex-1"
                  onClick={() => {
                    onClose()
                  }}
                >
                    Cancel
                  </Button>

                <Button type="submit" disabled={isPending} className="flex-1">
                  {project ? "Update" : "  Create  "} Project
                </Button>
              </div>
            </form>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProjectsSheet;
