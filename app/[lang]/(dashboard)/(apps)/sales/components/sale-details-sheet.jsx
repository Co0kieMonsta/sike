"use client";

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSaleDetails } from "@/action/sales";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export function SaleDetailsSheet({ sale, open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullSale, setFullSale] = useState(null);

  useEffect(() => {
    if (sale?.id && open) {
      setLoading(true);
      getSaleDetails(sale.id)
        .then(({ items, sale: fetchedSale }) => {
            setItems(items);
            // Optionally update sale with more details if needed, 
            // but we might already have passed some via props.
            // fetchedSale has clients joined.
            if (fetchedSale) {
                // We can't easily update the parent 'sale' prop, but we can store local fullSale
                setFullSale(fetchedSale);
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [sale, open]);

  const displaySale = fullSale || sale;

  if (!displaySale) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[540px]">
        <SheetHeader className="mb-6">
          <SheetTitle>Sale Details</SheetTitle>
          <SheetDescription>
            Transaction ID: {displaySale.id}
            <br />
            Date: {format(new Date(displaySale.created_at), "PPP p")}
            <br />
            Client: <span className="font-medium text-foreground">{displaySale.clients?.name || "Guest"}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-medium mb-2">Items Purchased</h3>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.product_name}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">${item.price}</TableCell>
                                        <TableCell className="text-right">
                                            ${(item.quantity * item.price).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium capitalize">{displaySale.payment_method}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">{displaySale.status}</span>
                </div>
                <div className="border-t my-2" />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>${displaySale.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
