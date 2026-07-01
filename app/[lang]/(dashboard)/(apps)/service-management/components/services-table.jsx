"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { ServiceModal } from "@/app/[lang]/(dashboard)/(apps)/service-registry/components/add-service-modal";
import { deleteService } from "@/action/services";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export const ServicesTable = ({ services, categories }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const router = useRouter();

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
        const result = await deleteService(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Service deleted");
            router.refresh();
        }
    } catch (error) {
        toast.error("Failed to delete service");
    }
  };

  const handleEdit = (service) => {
    setServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setServiceToEdit(null);
    setIsModalOpen(true);
  }

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : "Uncategorized";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            placeholder="Search services..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredServices.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">No services found.</TableCell>
                    </TableRow>
                ) : (
                    filteredServices.map((service) => (
                        <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{getCategoryName(service.category_id)}</Badge>
                            </TableCell>
                            <TableCell>${service.price}</TableCell>
                            <TableCell>{service.duration} mins</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEdit(service)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(service.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      <ServiceModal 
        open={isModalOpen} 
        onClose={() => {
            setIsModalOpen(false);
            setServiceToEdit(null);
            router.refresh();
        }} 
        categories={categories}
        serviceToEdit={serviceToEdit}
      />
    </div>
  );
};
