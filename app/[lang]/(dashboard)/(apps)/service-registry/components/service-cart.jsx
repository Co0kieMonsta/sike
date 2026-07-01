"use client";

import { Trash2, ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const ServiceCart = ({ cart, onRemove, onUpdateQuantity, onClear, onCheckout }) => {
  
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.00; // 0% tax for services? Configurable later.
  const total = subtotal + tax;

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <h2 className="font-semibold flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Current Order
        </h2>
        {cart.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-8 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground space-y-4">
            <ShoppingCart className="h-12 w-12 opacity-20" />
            <p>Order is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm leading-none">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">${item.price}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6 rounded-full"
                        onClick={() => {
                            if (item.quantity > 1) {
                                onUpdateQuantity(item.id, -1);
                            } else {
                                onRemove(item.id);
                            }
                        }}
                      >
                         <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-4 text-center text-sm">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6 rounded-full"
                         onClick={() => onUpdateQuantity(item.id, 1)}
                      >
                         <Plus className="h-3 w-3" />
                      </Button>
                   </div>
                   <span className="font-medium text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 bg-muted/10 border-t space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
             <span className="text-muted-foreground">Tax (0%)</span>
             <span>${tax.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <Button 
            className="w-full" 
            size="lg" 
            disabled={cart.length === 0}
            onClick={onCheckout}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};
