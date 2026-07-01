"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getClients } from "@/config/clients.config";

export function ClientSelector({ onSelect, refreshTrigger }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await getClients();
        if (response && Array.isArray(response)) {
             setClients(response);
        } else if (response && response.data && Array.isArray(response.data)) {
            setClients(response.data);
        } else {
             setClients([]);
        }
      } catch (error) {
        console.error("Failed to load clients", error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [refreshTrigger]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          {value
            ? clients.find((client) => client.id === value)?.name
            : "Select client..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search client..." />
          <CommandEmpty>No client found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {clients.map((client) => (
              <CommandItem
                key={client.id}
                value={`${client.name} ${client.car_plate || ""}`}
                onSelect={(currentValue) => {
                  const selectedId = client.id;
                  setValue(selectedId === value ? "" : selectedId);
                  onSelect(selectedId === value ? null : client);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === client.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                    <span>{client.name}</span>
                    {client.car_plate && (
                        <span className="text-xs text-muted-foreground">{client.car_plate}</span>
                    )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
