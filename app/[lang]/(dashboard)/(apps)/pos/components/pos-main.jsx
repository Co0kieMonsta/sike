"use client";

import React, { useState, useMemo } from "react";
import { ProductGrid } from "./product-grid";
import { CartSidebar } from "./cart-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CheckoutDialog } from "./checkout-dialog";
import { createSale } from "@/action/pos";
import { toast } from "react-hot-toast";
import { ClientSelector } from "./client-selector";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingCart, UserPlus } from "lucide-react";
import { ClientModal } from "../../clients/components/client-modal";
import { createClient } from "@/config/clients.config";

export const POSMain = ({ initialProducts, categories }) => {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientsRefreshTrigger, setClientsRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialProducts, searchQuery, selectedCategory]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleConfirmSale = async (paymentMethod) => {
    setIsLoading(true);
    try {
        const total = cart.reduce((acc, item) => acc + (item.selling_price || item.price || 0) * item.quantity, 0);
        
        const result = await createSale({
            total,
            payment_method: paymentMethod,
            client_id: selectedClient?.id, // Pass selected client ID
            items: cart
        });

        if (result.error) {
            toast.error("Failed to process sale: " + result.error);
        } else {
            toast.success("Sale completed successfully!");
            setCart([]);
            setIsCheckoutOpen(false);
        }
    } catch (error) {
        toast.error("An unexpected error occurred.");
        console.error(error);
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
            // Optionally auto-select the new client here if response returns the created client object
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
      <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-full gap-4 relative">
        <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
          {/* Header / Filter Bar */}
          <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products by name or SKU..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
             <div className="flex-1 flex items-center gap-2">
                <ClientSelector onSelect={setSelectedClient} refreshTrigger={clientsRefreshTrigger} />
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
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="rounded-full"
              >
                All Items
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="rounded-full"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

          {/* Product Grid */}
          <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
        </div>

        {/* Desktop Cart Sidebar */}
        <div className="hidden md:block w-[400px] flex-none h-full">
          <CartSidebar 
              cart={cart} 
              onRemove={removeFromCart} 
              onUpdateQuantity={updateQuantity}
              onClear={clearCart}
              onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Mobile Cart Floating Button */}
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
                <SheetTitle>Shopping Cart</SheetTitle>
             </SheetHeader>
             <CartSidebar 
                cart={cart} 
                onRemove={removeFromCart} 
                onUpdateQuantity={updateQuantity}
                onClear={clearCart}
                onCheckout={() => {
                   // Close sheet if possible (might need controlled state)
                   handleCheckout();
                }}
            />
        </SheetContent>
      </Sheet>

      <CheckoutDialog 
        open={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        total={cart.reduce((acc, item) => acc + (item.selling_price || item.price || 0) * item.quantity, 0)}
        onConfirm={handleConfirmSale}
        isLoading={isLoading}
        clientName={selectedClient?.name}
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
