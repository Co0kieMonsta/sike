"use client";
import { X, Plus, RefreshCw, Download, Upload, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { roles, statuses } from "./columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DataTableToolbar({ table, onRefresh, onAddUser, onDeleteSelected, onExport, onImport }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-1 flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar usuarios..."
            value={table.getColumn("name")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-9 min-w-[200px] max-w-sm"
          />

          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Estado"
              options={statuses}
            />
          )}
          {table.getColumn("role") && (
            <DataTableFacetedFilter
              column={table.getColumn("role")}
              title="Rol"
              options={roles}
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
                <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                Acciones
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Exportar usuarios
                </DropdownMenuItem>
              )}
              {onImport && (
                <DropdownMenuItem onClick={onImport}>
                  <Upload className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Importar usuarios
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onAddUser && (
                <DropdownMenuItem onClick={onAddUser}>
                  <UserPlus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Crear usuario
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {onAddUser && (
            <Button
              size="sm"
              onClick={onAddUser}
              className="h-9"
            >
              <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {hasSelection && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} usuario(s) seleccionado(s)
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
              Eliminar seleccionados
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

