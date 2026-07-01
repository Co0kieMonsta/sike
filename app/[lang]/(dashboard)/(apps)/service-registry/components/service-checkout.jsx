"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Banknote, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const ServiceCheckout = ({ open, onClose, total, onConfirm, isLoading, clientName }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Service Order</DialogTitle>
          <DialogDescription>
            {clientName ? `Processing order for ${clientName}` : "Select payment method to complete the order."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
            <span className="text-muted-foreground text-sm uppercase font-medium">Total Amount</span>
            <span className="text-4xl font-bold">${total.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Payment Method</span>
            <div className="grid grid-cols-3 gap-2">
                <Button
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    className={cn("flex flex-col h-20 gap-1", paymentMethod === "cash" && "border-primary")}
                    onClick={() => setPaymentMethod("cash")}
                >
                    <Banknote className="h-6 w-6" />
                    Cash
                </Button>
                <Button
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    className={cn("flex flex-col h-20 gap-1", paymentMethod === "card" && "border-primary")}
                    onClick={() => setPaymentMethod("card")}
                >
                    <CreditCard className="h-6 w-6" />
                    Card
                </Button>
                <Button
                    variant={paymentMethod === "transfer" ? "default" : "outline"}
                    className={cn("flex flex-col h-20 gap-1", paymentMethod === "transfer" && "border-primary")}
                    onClick={() => setPaymentMethod("transfer")}
                >
                    <Landmark className="h-6 w-6" />
                    Transfer
                </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm({ paymentMethod, total })} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
