"use client";
import { X, Plus, RefreshCw, Download, Upload, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/app/[lang]/(dashboard)/users/components/data-table-view-options";
import { DataTableFacetedFilter } from "@/app/[lang]/(dashboard)/users/components/data-table-faceted-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ClientDataTableToolbar({ table, onRefresh, onAddClient, onDeleteSelected, onExport, onImport }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const statuses = [
    {
      value: "active",
      label: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-1 flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Search clients..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) =>
              table.setGlobalFilter(event.target.value)
            }
            className="h-9 min-w-[200px] max-w-sm"
          />

          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          )}
          
          {isFiltered && (
            <Button
              variant="outline"
              onClick={() => table.resetColumnFilters()}
              className="h-9 px-2 lg:px-3"
            >
              <X className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Clear
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
              Refresh
            </Button>
          )}
          
          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Export Clients
                </DropdownMenuItem>
              )}
              {onImport && (
                <DropdownMenuItem onClick={onImport}>
                  <Upload className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Import Clients
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onAddClient && (
                <DropdownMenuItem onClick={onAddClient}>
                  <UserPlus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  Add Client
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {onAddClient && (
            <Button
              size="sm"
              onClick={onAddClient}
              className="h-9"
            >
              <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              Add Client
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {hasSelection && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} client(s) selected
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
              Delete Selected
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
