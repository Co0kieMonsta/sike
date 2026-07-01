"use client";
import React, { useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";




// Car brands list
const carBrands = [
  { label: "Toyota", value: "Toyota" },
  { label: "Honda", value: "Honda" },
  { label: "Ford", value: "Ford" },
  { label: "Chevrolet", value: "Chevrolet" },
  { label: "Nissan", value: "Nissan" },
  { label: "Hyundai", value: "Hyundai" },
  { label: "Kia", value: "Kia" },
  { label: "Volkswagen", value: "Volkswagen" },
  { label: "Mazda", value: "Mazda" },
  { label: "Subaru", value: "Subaru" },
  { label: "Mercedes-Benz", value: "Mercedes-Benz" },
  { label: "BMW", value: "BMW" },
  { label: "Audi", value: "Audi" },
  { label: "Lexus", value: "Lexus" },
  { label: "Jeep", value: "Jeep" },
  { label: "Dodge", value: "Dodge" },
  { label: "Ram", value: "Ram" },
  { label: "GMC", value: "GMC" },
  { label: "Tesla", value: "Tesla" },
  { label: "Volvo", value: "Volvo" },
  { label: "Other", value: "Other" },
];

const carColors = [
  { label: "White", value: "White", hex: "#FFFFFF" },
  { label: "Black", value: "Black", hex: "#000000" },
  { label: "Silver", value: "Silver", hex: "#C0C0C0" },
  { label: "Gray", value: "Gray", hex: "#808080" },
  { label: "Red", value: "Red", hex: "#FF0000" },
  { label: "Blue", value: "Blue", hex: "#0000FF" },
  { label: "Brown", value: "Brown", hex: "#A52A2A" },
  { label: "Green", value: "Green", hex: "#008000" },
  { label: "Beige", value: "Beige", hex: "#F5F5DC" },
  { label: "Orange", value: "Orange", hex: "#FFA500" },
  { label: "Gold", value: "Gold", hex: "#FFD700" },
  { label: "Yellow", value: "Yellow", hex: "#FFFF00" },
  { label: "Purple", value: "Purple", hex: "#800080" },
  { label: "Other", value: "Other", hex: "transparent" },
];

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

export const ClientModal = ({ open, onClose, client, onSubmit, isLoading }) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
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
      form.reset({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        car_brand: client.car_brand || "",
        car_model: client.car_model || "",
        car_color: client.car_color || "",
        car_plate: client.car_plate || "",
        status: client.status || "active",
      });
    } else {
      form.reset({
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
  }, [client, form, open]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input placeholder="+1234567890" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Car Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="car_brand"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger size="md">
                                            <SelectValue placeholder="Select brand" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[200px]">
                                        {carBrands.map((brand) => (
                                            <SelectItem key={brand.value} value={brand.value}>
                                                {brand.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="car_model"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl>
                                    <Input placeholder="Camry" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <FormField
                            control={form.control}
                            name="car_color"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger size="md">
                                            <SelectValue placeholder="Select color" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[200px]">
                                        {carColors.map((color) => (
                                            <SelectItem key={color.value} value={color.value}>
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="h-4 w-4 rounded-full border border-default-300" 
                                                        style={{ backgroundColor: color.hex }}
                                                    />
                                                    {color.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="car_plate"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plate Number</FormLabel>
                                <FormControl>
                                    <Input 
                                      placeholder="AAA-555" 
                                      {...field} 
                                      maxLength={7}
                                      onChange={(e) => {
                                        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                                        if (value.length > 3) {
                                          value = value.slice(0, 3) + "-" + value.slice(3, 6);
                                        }
                                        field.onChange(value);
                                      }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <DialogFooter>
                     <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {client ? "Update" : "Save"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
