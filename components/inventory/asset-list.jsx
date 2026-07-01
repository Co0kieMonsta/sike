"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Pencil, Trash2, Search, Building } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import { createInventoryAsset, updateInventoryAsset, deleteInventoryAsset } from "@/action/inventory";

const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  asset_code: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  value: z.coerce.number().min(0, "Value must be 0 or more"),
  location: z.string().optional(),
  acquired_date: z.string().optional(), // Or use a date object/date picker if available, handling string for now for simplicity
  description: z.string().optional(),
  status: z.enum(["active", "maintenance", "retired"]),
  image: z.string().optional(),
});

export default function AssetList({ assets, categories }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const assetCategories = categories.filter(c => c.type === 'asset');

  const form = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      asset_code: "",
      category_id: "",
      value: 0,
      location: "",
      acquired_date: "",
      description: "",
      status: "active",
      image: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Ensure empty strings for date are null if required by DB or handled
      if (data.acquired_date === "") data.acquired_date = null;

      if (editingAsset) {
        await updateInventoryAsset(editingAsset.id, data);
        toast.success("Asset updated successfully");
      } else {
        await createInventoryAsset(data);
        toast.success("Asset created successfully");
      }
      setIsOpen(false);
      setEditingAsset(null);
      form.reset({
        name: "",
        asset_code: "",
        category_id: "",
        value: 0,
        location: "",
        acquired_date: "",
        description: "",
        status: "active",
        image: "",
      });
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    form.reset({
      name: asset.name,
      asset_code: asset.asset_code || "",
      category_id: asset.category_id,
      value: asset.value,
      location: asset.location || "",
      acquired_date: asset.acquired_date || "",
      description: asset.description || "",
      status: asset.status || "active",
      image: asset.image || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteInventoryAsset(id);
      toast.success("Asset deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete asset");
      console.error(error);
    }
  };

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.asset_code && asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Assets</h2>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingAsset(null);
            form.reset({
              name: "",
              asset_code: "",
              category_id: "",
              value: 0,
              location: "",
              acquired_date: "",
              description: "",
              status: "active",
              image: "",
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingAsset ? "Edit Asset" : "Add Asset"}</DialogTitle>
              <DialogDescription>
                {editingAsset ? "Update asset details." : "Register a new asset."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Asset Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="asset_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Code</FormLabel>
                        <FormControl>
                          <Input placeholder="AST-123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assetCategories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                         <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Office 1B" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                   control={form.control}
                   name="acquired_date"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Acquired Date</FormLabel>
                       <FormControl>
                         <Input type="date" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Asset Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">{editingAsset ? "Update" : "Create"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset List</CardTitle>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No assets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           <Building className="h-4 w-4 text-muted-foreground" />
                           {asset.name}
                        </div>
                      </TableCell>
                      <TableCell>{asset.category?.name || '-'}</TableCell>
                      <TableCell>{asset.asset_code || '-'}</TableCell>
                      <TableCell>{asset.location || '-'}</TableCell>
                      <TableCell className="text-right">${asset.value.toFixed(2)}</TableCell>
                      <TableCell>
                         <Badge variant={asset.status === 'active' ? 'success' : asset.status === 'maintenance' ? 'warning' : 'destructive'}>
                          {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the asset.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(asset.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
