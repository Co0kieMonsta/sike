"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DataTableToolbar({ table, onAdd }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrar activos..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onAdd} size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          Registrar Activo
        </Button>
      </div>
    </div>
  );
}
