"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Car, Calendar, Tool } from "lucide-react";
import { ServiceList } from "./service-list";
import { ServiceModal } from "./service-modal";
import { getServices, createService, updateService, deleteService } from "@/config/services.config";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const ClientServicesSheet = ({ open, onClose, client }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isPending, startTransition] = useTransition();

  const fetchServices = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const response = await getServices(client.id);
      if (response.status === "success") {
        setServices(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && client) {
      fetchServices();
    }
  }, [open, client]);

  const handleAddService = () => {
    setSelectedService(null);
    setServiceModalOpen(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setServiceModalOpen(true);
  };

  const handleDeleteService = async (service) => {
      // In a real app, confirm with dialog
      if(!confirm("Are you sure you want to delete this service record?")) return;

      try {
          const response = await deleteService(service.id);
          if (response.status === "success") {
              toast.success("Service deleted");
              fetchServices();
          } else {
              toast.error(response.message);
          }
      } catch (error) {
          toast.error("Error deleting service");
      }
  };

  const handleServiceSubmit = async (data) => {
    startTransition(async () => {
      try {
        let response;
        if (selectedService) {
          response = await updateService(selectedService.id, data);
        } else {
          response = await createService({ ...data, clientId: client.id });
        }

        if (response.status === "success") {
          toast.success(selectedService ? "Service updated" : "Service created");
          setServiceModalOpen(false);
          fetchServices();
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Error saving service");
      }
    });
  };

  if (!client) return null;

  return (
    <>
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-[800px] sm:w-[800px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl flex items-center gap-2">
                        Service History
                        <Badge variant="outline" className="ml-2">
                            {client.name}
                        </Badge>
                    </SheetTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                            <Car className="h-4 w-4" />
                            {client.car_brand} {client.car_model} - {client.car_plate}
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Services</h3>
                        <Button onClick={handleAddService} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Service
                        </Button>
                    </div>

                    <Separator />

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <ServiceList 
                            services={services} 
                            onEdit={handleEditService} 
                            onDelete={handleDeleteService} 
                        />
                    )}
                </div>
            </SheetContent>
        </Sheet>

        <ServiceModal
            open={serviceModalOpen}
            onClose={() => setServiceModalOpen(false)}
            service={selectedService}
            onSubmit={handleServiceSubmit}
            isLoading={isPending}
        />
    </>
  );
};
