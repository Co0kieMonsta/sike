"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const ProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock = product.quantity <= 0;

  // Helper to validate URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const hasValidImage = product.image && (product.image.startsWith("/") || isValidUrl(product.image));

  return (
    <Card className={cn("overflow-hidden flex flex-col h-full", isOutOfStock && "opacity-60")}>
      <div className="relative aspect-square w-full bg-muted flex items-center justify-center">
        {hasValidImage ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
        )}
        {isOutOfStock && (
           <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
             <Badge variant="destructive">Out of Stock</Badge>
           </div>
        )}
        {!isOutOfStock && product.quantity < 5 && (
            <Badge variant="warning" className="absolute top-2 right-2">
                Low Stock: {product.quantity}
            </Badge>
        )}
      </div>
      <CardContent className="p-3 flex-1 flex flex-col gap-1">
        <div className="font-medium truncate" title={product.name}>{product.name}</div>
        <div className="text-xs text-muted-foreground truncate">{product.sku || "No SKU"}</div>
        <div className="font-bold text-lg mt-auto">${product.selling_price || product.price || 0}</div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button 
            className="w-full" 
            size="sm" 
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
        >
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
      </CardFooter>
    </Card>
  );
};
