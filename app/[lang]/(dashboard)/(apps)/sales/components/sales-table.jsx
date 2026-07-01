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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { SaleDetailsSheet } from "./sale-details-sheet";

export function SalesTable({ data }) {
  const [selectedSale, setSelectedSale] = useState(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
             <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No sales found.
                </TableCell>
             </TableRow>
          ) : (
            data.map((sale) => (
                <TableRow key={sale.id}>
                <TableCell>{format(new Date(sale.created_at), "MMM d, yyyy HH:mm")}</TableCell>
                <TableCell>{sale.clients?.name || "Guest"}</TableCell>
                <TableCell className="capitalize">{sale.payment_method}</TableCell>
                <TableCell>
                    <Badge variant={sale.status === "completed" ? "success" : "default"}>
                    {sale.status}
                    </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                    ${sale.total.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                    <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedSale(sale)}
                    >
                    <Eye className="h-4 w-4" />
                    </Button>
                </TableCell>
                </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <SaleDetailsSheet 
        sale={selectedSale} 
        open={!!selectedSale} 
        onClose={() => setSelectedSale(null)} 
      />
    </>
  );
}
