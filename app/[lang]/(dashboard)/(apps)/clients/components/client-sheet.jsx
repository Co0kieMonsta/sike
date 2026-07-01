"use client";
import React, { useEffect, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";

const schema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  car_brand: z.string().optional(),
  car_model: z.string().optional(),
  car_color: z.string().optional(),
  car_plate: z.string().optional(),
  status: z.string().optional(),
});

export const ClientSheet = ({ open, onClose, client, onSubmit, isLoading }) => {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      car_brand: "",
      car_model: "",
      car_color: "",
      car_plate: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (client) {
      setValue("name", client.name || "");
      setValue("email", client.email || "");
      setValue("phone", client.phone || "");
      setValue("address", client.address || "");
      setValue("car_brand", client.car_brand || "");
      setValue("car_model", client.car_model || "");
      setValue("car_color", client.car_color || "");
      setValue("car_plate", client.car_plate || "");
      setValue("status", client.status || "active");
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        car_brand: "",
        car_model: "",
        car_color: "",
        car_plate: "",
        status: "active",
      });
    }
  }, [client, setValue, reset, open]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="px-6 w-full sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{client ? "Edit Client" : "Add New Client"}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] pr-4">
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  {...register("phone")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                {...register("address")}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">Car Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="car_brand">Brand</Label>
                  <Input
                    id="car_brand"
                    placeholder="Toyota"
                    {...register("car_brand")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="car_model">Model</Label>
                  <Input
                    id="car_model"
                    placeholder="Camry"
                    {...register("car_model")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="car_color">Color</Label>
                  <Input
                    id="car_color"
                    placeholder="Black"
                    {...register("car_color")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="car_plate">Plate Number</Label>
                  <Input
                    id="car_plate"
                    placeholder="XYZ-123"
                    {...register("car_plate")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {client ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
