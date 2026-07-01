"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const ServiceList = ({ services, onEdit, onDelete }) => {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border rounded-md border-dashed">
        No service history found for this client.
      </div>
    );
  }

  const getStatusColor = (status) => {
      switch(status) {
          case 'completed': return 'success';
          case 'in_progress': return 'warning';
          case 'pending': return 'secondary';
          case 'cancelled': return 'destructive';
          default: return 'default';
      }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Service</TableHead>
            <TableHead className="text-left">Date</TableHead>
            <TableHead className="text-left">Status</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="text-left">
                  <div className="font-medium">{service.type}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">{service.notes}</div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-left">
                  {service.date ? format(new Date(service.date), 'MMM d, yyyy') : '-'}
              </TableCell>
              <TableCell className="text-left">
                <Badge variant={getStatusColor(service.status)}>
                    {service.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">${service.cost}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-[10000]">
                    <DropdownMenuItem onClick={() => onEdit(service)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(service)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
