"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClientDataTable } from "./components/client-data-table";
import { columns } from "./components/columns";
import { ClientModal } from "./components/client-modal";
import { ClientServicesSheet } from "./components/client-services-sheet";
// ... imports ...

// ... inside component ...

import { DataTableRowActions } from "@/app/[lang]/(dashboard)/users/components/data-table-row-actions";
import { getClients, createClient, updateClient, deleteClient } from "@/config/clients.config";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Trash2, Car } from "lucide-react";

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [servicesSheetOpen, setServicesSheetOpen] = useState(false);
  const [selectedClientForServices, setSelectedClientForServices] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await getClients();
      if (response.status === "success") {
        setClients(response.data);
      } else {
        toast.error(response.message || "Error loading clients");
      }
    } catch (error) {
      toast.error("Error loading clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = () => {
    setSelectedClient(null);
    setSheetOpen(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setSheetOpen(true);
  };

  const handleDeleteClient = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleViewServices = (client) => {
    setSelectedClientForServices(client);
    setServicesSheetOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      const response = await deleteClient(clientToDelete.id);
      if (response.status === "success") {
        toast.success("Client deleted successfully");
        await fetchClients();
      } else {
        toast.error(response.message || "Error deleting client");
      }
    } catch (error) {
      toast.error("Error deleting client");
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleFormSubmit = async (data) => {
    setFormLoading(true);
    try {
      let response;
      if (selectedClient) {
        response = await updateClient(selectedClient.id, data);
      } else {
        response = await createClient(data);
      }

      if (response.status === "success") {
        toast.success(
          selectedClient
            ? "Client updated successfully"
            : "Client created successfully"
        );
        setSheetOpen(false);
        await fetchClients();
      } else {
        toast.error(response.message || "Error saving client");
      }
    } catch (error) {
      toast.error("Error saving client");
    } finally {
      setFormLoading(false);
    }
  };

   // Enhance columns with action handlers
   const enhancedColumns = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }) => (
          <DataTableRowActions
            row={row}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onView={handleViewServices}
          />
        ),
      };
    }
    return col;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients Management
          </CardTitle>
          <CardDescription>
            Manage clients and their car details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientDataTable
            columns={enhancedColumns}
            data={clients}
            onRefresh={fetchClients}
            onAddClient={handleAddClient}
          />
        </CardContent>
      </Card>

      <ClientModal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        client={selectedClient}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
      />

       <ClientServicesSheet
        open={servicesSheetOpen}
        onClose={() => setServicesSheetOpen(false)}
        client={selectedClientForServices}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              <span className="font-semibold"> {clientToDelete?.name} </span>
              and their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClientToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientsPage;
