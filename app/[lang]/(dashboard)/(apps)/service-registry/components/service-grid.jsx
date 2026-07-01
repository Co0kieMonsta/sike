"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ServiceGrid = ({ services, onAddToCart }) => {
  if (services.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No services found. Add a new service to get started.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 -mx-4 px-4 h-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 md:pb-4">
        {services.map((service) => (
            <Card key={service.id} className="flex flex-col h-full hover:border-primary/50 transition-colors group">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-bold leading-tight">{service.name}</CardTitle>
                </div>
                 <div className="mt-1">
                    <span className="text-lg font-bold text-primary">
                        ${service.price}
                    </span>
                 </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-1 space-y-2">
                {service.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">
                        {service.description}
                    </p>
                ) : (
                    <p className="text-xs text-muted-foreground italic">No description available.</p>
                )}
                
                {service.duration && (
                     <div className="flex items-center text-[10px] font-medium text-muted-foreground bg-muted/50 w-fit px-2 py-0.5 rounded-md">
                        <Clock className="mr-1 h-3 w-3" />
                        {service.duration} mins
                     </div>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full h-9 text-sm shadow-sm group-hover:shadow-md transition-all" onClick={() => onAddToCart(service)}>
                +
                </Button>
            </CardFooter>
            </Card>
        ))}
        </div>
    </ScrollArea>
  );
};
