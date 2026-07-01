"use client";

import React, { useState, useMemo } from "react";
import { ServiceGrid } from "./service-grid";
import { ServiceCart } from "./service-cart";
import { ServiceCheckout } from "./service-checkout";
import { ServiceModal } from "./add-service-modal";
import { CategoryManager } from "./category-manager";
import { ClientSelector } from "@/app/[lang]/(dashboard)/(apps)/pos/components/client-selector"; // Reuse client selector
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ShoppingCart, UserPlus, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "react-hot-toast";
import { createServiceOrder } from "@/action/services";
import { ClientModal } from "@/app/[lang]/(dashboard)/(apps)/clients/components/client-modal";
import { createClient } from "@/config/clients.config";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


export const ServiceRegistryMain = ({ initialServices, initialCategories = [] }) => {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState("all"); // 'all' or category_id

    // Client Creation State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientsRefreshTrigger, setClientsRefreshTrigger] = useState(0);

  // Vehicle Details State
  const [vehicleDetails, setVehicleDetails] = useState({
    brand: "",
    model: "",
    color: "",
    plate: ""
  });

  // Auto-fill vehicle details when client is selected
  React.useEffect(() => {
    if (selectedClient) {
        setVehicleDetails({
            brand: selectedClient.car_brand || "",
            model: selectedClient.car_model || "",
            color: selectedClient.car_color || "",
            plate: selectedClient.car_plate || ""
        });
    } else {
         setVehicleDetails({
            brand: "",
            model: "",
            color: "",
            plate: ""
        });
    }
  }, [selectedClient]);

  const filteredServices = useMemo(() => {
    let filtered = initialServices;

    // Filter by Category
    if (selectedCategory !== "all") {
        filtered = filtered.filter(s => s.category_id === selectedCategory);
    }

    // Filter by Search
    return filtered.filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialServices, searchQuery, selectedCategory]);

  const addToCart = (service) => {
    // Services might not have "quantity" in the same way as products, 
    // but we can allow multiple of the same service (e.g. 2x Car Wash)
    setCart((prev) => {
      const existing = prev.find((item) => item.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId) => {
    setCart((prev) => prev.filter((item) => item.id !== serviceId));
  };

  const updateQuantity = (serviceId, delta) => {
     setCart((prev) =>
      prev.map((item) => {
        if (item.id === serviceId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const handleCheckout = () => {
    if (cart.length === 0) {
        toast.error("Cart is empty");
        return;
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (orderData) => {
     // orderData = { paymentMethod, total, notes }
     setIsLoading(true);
     try {
        const result = await createServiceOrder({
            total: orderData.total,
            payment_method: orderData.paymentMethod,
            client_id: selectedClient?.id,
            vehicle_brand: vehicleDetails.brand,
            vehicle_model: vehicleDetails.model,
            vehicle_color: vehicleDetails.color,
            vehicle_plate: vehicleDetails.plate,
            items: cart
        });

        if (result.error) {
            toast.error("Failed: " + result.error);
        } else {
            toast.success("Order created successfully!");
            setCart([]);
            setIsCheckoutOpen(false);
            // Optionally clear client/vehicle
        }
     } catch (err) {
        console.error(err);
        toast.error("An error occurred");
     } finally {
        setIsLoading(false);
     }
  };

    const handleCreateClient = async (data) => {
    setIsCreatingClient(true);
    try {
        const response = await createClient(data);
        if (response.status === "success") {
            toast.success("Client created successfully");
            setIsClientModalOpen(false);
            setClientsRefreshTrigger(prev => prev + 1);
        } else {
            toast.error(response.message || "Error creating client");
        }
    } catch (error) {
        toast.error("Error creating client");
    } finally {
        setIsCreatingClient(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row h-full w-full gap-4 relative">
        <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
          {/* Header */}
          <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search services..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-none">
                <Button 
                    variant={selectedCategory === "all" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setSelectedCategory("all")}
                    className="rounded-full"
                >
                    All
                </Button>
                {initialCategories.map(cat => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.id)}
                        className="rounded-full whitespace-nowrap"
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>
            
             <div className="flex flex-col gap-4">
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                     <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 sm:flex-none">
                            <ClientSelector onSelect={setSelectedClient} refreshTrigger={clientsRefreshTrigger} />
                        </div>
                        <Button size="icon" variant="outline" onClick={() => setIsClientModalOpen(true)}>
                            <UserPlus className="h-4 w-4" />
                        </Button>
                     </div>
                     <div className="text-sm text-muted-foreground">
                        {selectedClient ? (
                            <span>Client: <span className="font-medium text-foreground">{selectedClient.name}</span></span>
                        ) : (
                            <span>No Client Selected</span>
                        )}
                     </div>
                 </div>

                 {/* Vehicle Details Inputs */}
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Input 
                        placeholder="Plate (e.g. ABC-123)" 
                        value={vehicleDetails.plate} 
                        onChange={(e) => setVehicleDetails(prev => ({ ...prev, plate: e.target.value }))}
                        className="h-9"
                    />
                     <Input 
                        placeholder="Brand (e.g. Toyota)" 
                        value={vehicleDetails.brand} 
                        onChange={(e) => setVehicleDetails(prev => ({ ...prev, brand: e.target.value }))}
                        className="h-9"
                    />
                     <Input 
                        placeholder="Model (e.g. Camry)" 
                        value={vehicleDetails.model} 
                        onChange={(e) => setVehicleDetails(prev => ({ ...prev, model: e.target.value }))}
                        className="h-9"
                    />
                     <Input 
                        placeholder="Color (e.g. Red)" 
                        value={vehicleDetails.color} 
                        onChange={(e) => setVehicleDetails(prev => ({ ...prev, color: e.target.value }))}
                        className="h-9"
                    />
                 </div>
             </div>
          </div>

          {/* Service Grid */}
          <ServiceGrid services={filteredServices} onAddToCart={addToCart} />
        </div>

        {/* Desktop Cart */}
        <div className="hidden md:block w-[400px] flex-none h-full">
            <ServiceCart 
                cart={cart}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
                onClear={clearCart}
                onCheckout={handleCheckout}
            />
        </div>
      </div>

       {/* Mobile Cart Sheet */}
       <Sheet>
        <SheetTrigger asChild>
          <Button className="md:hidden fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50" size="icon">
            <ShoppingCart className="h-6 w-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0 border-l">
             <SheetHeader className="sr-only">
                <SheetTitle>Service Cart</SheetTitle>
             </SheetHeader>
             <ServiceCart 
                cart={cart}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
                onClear={clearCart}
                onCheckout={() => {
                   handleCheckout();
                }}
            />
        </SheetContent>
      </Sheet>

      {/* Modals */}
      <ServiceCheckout 
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={cart.reduce((acc, item) => acc + item.price * item.quantity, 0)}
        onConfirm={handleConfirmOrder}
        isLoading={isLoading}
        clientName={selectedClient?.name}
      />

      <ServiceModal 
        open={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        categories={initialCategories}
      />
      
      <CategoryManager 
        open={isCategoryManagerOpen} 
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={initialCategories}
      />

       <ClientModal 
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSubmit={handleCreateClient}
        isLoading={isCreatingClient}
      />
    </>
  );
};

