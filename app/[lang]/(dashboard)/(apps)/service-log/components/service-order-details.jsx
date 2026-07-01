"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { getServiceOrderDetails } from "@/action/services";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export const ServiceOrderDetails = ({ open, onClose, order }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && order) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const data = await getServiceOrderDetails(order.id);
          setItems(data || []);
        } catch (error) {
          console.error("Failed to load details", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [open, order]);

  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>
            Transaction ID: {order.id}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
            {/* Client Info */}
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Client Information</h3>
                <div className="bg-muted/50 p-3 rounded-md">
                    {order.clients ? (
                        <div className="space-y-1">
                            <p className="font-medium">{order.clients.name}</p>
                            <p className="text-sm text-muted-foreground">{order.clients.email}</p>
                        </div>
                    ) : (
                        <p className="text-sm">Guest Client</p>
                    )}
                </div>
            </div>

            <Separator />

            {/* Items */}
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Services Performed</h3>
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.service_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ID: {item.service_id?.slice(0,8)}...
                                    </p>
                                </div>
                                <span className="font-medium">${item.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Separator />

             {/* Summary */}
             <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{format(new Date(order.created_at), "PPP p")}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium capitalize">{order.payment_method}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">{order.status}</span>
                </div>
                <div className="border-t my-2" />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
            </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};
