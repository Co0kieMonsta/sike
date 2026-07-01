
"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "../../users/components/data-table-view-options"; // Reuse
import { DataTableFacetedFilter } from "../../users/components/data-table-faceted-filter"; // Reuse

import { Plus, Trash2, Download, Upload } from "lucide-react";

export function DataTableToolbar({
  table,
  onRefresh,
  onAdd,
  onDeleteSelected,
  onExport,
}) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const handleFilterChange = (event) => {
    const value = event.target.value;
    table.getColumn("cliente_nombre")?.setFilterValue(value);
  };

  const statuses = [
      {
        value: "pendiente",
        label: "Pendiente",
      },
      {
        value: "aceptada",
        label: "Aceptada",
      },
      {
        value: "rechazada",
        label: "Rechazada",
      },
  ];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Filtrar por clientes..."
          value={table.getColumn("cliente_nombre")?.getFilterValue() ?? ""}
          onChange={handleFilterChange}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        
        {table.getColumn("estado") && (
          <DataTableFacetedFilter
            column={table.getColumn("estado")}
            title="Estado"
            options={statuses}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {table.getFilteredSelectedRowModel().rows.length > 0 && onDeleteSelected && (
           <Button
             variant="outline"
             size="sm"
             className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50"
             onClick={() => onDeleteSelected(table.getFilteredSelectedRowModel().rows)}
           >
             <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
             Eliminar ({table.getFilteredSelectedRowModel().rows.length})
           </Button>
        )}

        {onExport && (
            <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={onExport}
            >
                <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                Exportar
            </Button>
        )}

        <Button 
            onClick={onAdd}
            size="sm"
            className="h-8"
        >
          <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          Crear Cotización
        </Button>
        
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
