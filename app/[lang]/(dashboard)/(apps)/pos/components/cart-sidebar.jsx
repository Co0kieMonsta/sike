"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

export const CartSidebar = ({ cart, onRemove, onUpdateQuantity, onClear, onCheckout }) => {
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.selling_price || item.price || 0) * item.quantity, 0);
  }, [cart]);

  const tax = subtotal * 0.0; // Configurable tax rate
  const total = subtotal + tax;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Current Order
        </CardTitle>
        <div className="text-sm text-muted-foreground">{cart.length} Items</div>
      </CardHeader>
      <Separator />
      
      <ScrollArea className="flex-1 p-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
            <ShoppingCart className="h-12 w-12" />
            <p>Cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-2">
                 <div className="h-16 w-16 bg-muted rounded-md flex-none overflow-hidden relative">
                    {/* Placeholder for image if needed */}
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Img</div>
                 </div>
                 <div className="flex-1 flex flex-col justify-between">
                    <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                    <div className="text-xs text-muted-foreground">${item.selling_price || item.price} x {item.quantity}</div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                 </div>
                 <div className="flex flex-col justify-between items-end">
                    <div className="font-bold text-sm">
                        ${((item.selling_price || item.price || 0) * item.quantity).toFixed(2)}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive/80"
                        onClick={() => onRemove(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 bg-muted/50 mt-auto space-y-4">
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (0%)</span>
                <span>${tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onClear} disabled={cart.length === 0}>
                Clear
            </Button>
            <Button disabled={cart.length === 0} onClick={onCheckout}>
                Checkout
            </Button>
        </div>
      </div>
    </Card>
  );
};
