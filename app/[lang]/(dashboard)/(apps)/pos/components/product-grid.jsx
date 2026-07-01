"use client";

import React from "react";
import { ProductCard } from "./product-card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ProductGrid = ({ products, onAddToCart }) => {
  if (products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 -mx-4 px-4 h-full">
        <div className="grid grid-cols-3 gap-4 pb-20 md:pb-4">
        {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
        </div>
    </ScrollArea>
  );
};
