"use client";
import { X, Plus, RefreshCw, Download, Upload, Trash2, Filter, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { tipos, estados } from "./columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DataTableToolbar({ 
  table, 
  onRefresh, 
  onAddTransaction, 
  onDeleteSelected, 
  onExport, 
  onImport,
  summary
}) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-1 flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar transacciones..."
            value={table.getColumn("descripcion")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("descripcion")?.setFilterValue(event.target.value)
            }
            className="h-9 min-w-[200px] max-w-sm"
          />

          {table.getColumn("tipo") && (
            <DataTableFacetedFilter
              column={table.getColumn("tipo")}
              title="Tipo"
              options={tipos}
            />
          )}
          {table.getColumn("estado") && (
            <DataTableFacetedFilter
              column={table.getColumn("estado")}
              title="Estado"
              options={estados}
            />
          )}
          {isFiltered && (
            <Button
              variant="outline"
              onClick={() => table.resetColumnFilters()}
              className="h-9 px-2 lg:px-3"
            >
              <X className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9"
            >
              <RefreshCw className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Actualizar
            </Button>
          )}
          
          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                Más
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Exportar transacciones
                </DropdownMenuItem>
              )}
              {onImport && (
                <DropdownMenuItem onClick={onImport}>
                  <Upload className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Importar transacciones
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onAddTransaction && (
                <DropdownMenuItem onClick={onAddTransaction}>
                  <DollarSign className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Nueva transacción
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {onAddTransaction && (
            <Button
              size="sm"
              onClick={onAddTransaction}
              className="h-9"
            >
              <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Nueva Transacción
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Summary Bar */}
      {summary && (
        <div className="flex flex-wrap items-center gap-4 rounded-md border bg-muted/30 px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Ingresos:</span>
            <span className="font-semibold text-green-600">
              ${summary.ingresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Egresos:</span>
            <span className="font-semibold text-red-600">
              ${summary.egresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Balance:</span>
            <span className={`font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary.balance?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {hasSelection && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} transacción(es) seleccionada(s)
          </span>
          <div className="flex-1" />
          {onDeleteSelected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteSelected(selectedRows)}
              className="h-8"
            >
              <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Eliminar seleccionadas
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

