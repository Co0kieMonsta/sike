"use client";

import { useState } from "react";
import { DataTable } from "../../../cars/components/data-table";
import { columns } from "./columns";
import { DataTableToolbar } from "./data-table-toolbar";
import { AssetFormDialog } from "./asset-form-dialog";
import { createAsset, updateAsset } from "@/config/inventory.config";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function AssetsPageClient({ initialAssets, categories }) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDialog = (asset = null) => {
    setEditingAsset(asset);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingAsset(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      let response;
      if (editingAsset) {
        response = await updateAsset(editingAsset.id, data);
      } else {
        response = await createAsset(data);
      }

      if (response.status === "success") {
        toast.success(editingAsset ? "Activo actualizado" : "Activo registrado");
        handleCloseDialog();
        router.refresh();
      } else {
        toast.error(response.message || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error al guardar");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhance columns with the onEdit action
  const tableColumns = columns.map(col => {
    if (col.id === 'actions') {
      return {
        ...col,
        cell: ({ row }) => {
          const AssetRowActions = col.cell({ row }).type;
          return <AssetRowActions row={row} onEdit={handleOpenDialog} />;
        }
      };
    }
    return col;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Activos y Herramientas</CardTitle>
          <CardDescription>
            Gestiona la maquinaria, equipos y herramientas del taller.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tableColumns}
            data={initialAssets}
            toolbar={(table) => (
              <DataTableToolbar table={table} onAdd={() => handleOpenDialog(null)} />
            )}
          />
        </CardContent>
      </Card>

      <AssetFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        asset={editingAsset}
        isLoading={isLoading}
        categories={categories}
      />
    </div>
  );
}
