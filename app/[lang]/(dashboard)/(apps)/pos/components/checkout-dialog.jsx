"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CreditCard, Banknote, Smartphone } from "lucide-react";

export const CheckoutDialog = ({ open, onClose, total, onConfirm, isLoading, clientName }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleConfirm = () => {
    onConfirm(paymentMethod);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Sale</DialogTitle>
          <DialogDescription>
            Select a payment method to finalize the transaction.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
            </div>
            
            {clientName && (
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-2 mt-2">
                    <span>Customer:</span>
                    <span className="font-medium text-foreground">{clientName}</span>
                </div>
            )}

            <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup defaultValue="cash" value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-4">
                    <div>
                        <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                        <Label
                        htmlFor="cash"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                        <Banknote className="mb-3 h-6 w-6" />
                        Cash
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="card" id="card" className="peer sr-only" />
                        <Label
                        htmlFor="card"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                        <CreditCard className="mb-3 h-6 w-6" />
                        Card
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="transfer" id="transfer" className="peer sr-only" />
                        <Label
                        htmlFor="transfer"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                        <Smartphone className="mb-3 h-6 w-6" />
                        Transfer
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
