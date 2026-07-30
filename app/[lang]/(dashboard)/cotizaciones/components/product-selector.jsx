"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function ProductSelector({ products, value, onSelect }) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  // Find selected product name for display
  const selectedProduct = products.find((product) => product.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedProduct ? selectedProduct.name : "Seleccionar..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar producto..." 
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
                <div className="p-2 text-center">
                    <p className="text-sm text-muted-foreground mb-2">No encontrado.</p>
                    <Button 
                        type="button"
                        variant="secondary" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                            onSelect(searchTerm)
                            setOpen(false)
                        }}
                    >
                        Usar "{searchTerm}"
                    </Button>
                </div>
            </CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => {
                    onSelect(product)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === product.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {product.imageUrl ? (
                      <div className="w-8 h-8 rounded shrink-0 overflow-hidden border">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded shrink-0 border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        -
                      </div>
                    )}
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="truncate">{product.name}</span>
                      <span className="text-xs text-muted-foreground">${product.price}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
