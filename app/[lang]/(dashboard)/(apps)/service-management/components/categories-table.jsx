"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { createCategory, deleteCategory } from "@/action/services";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const CategoriesTable = ({ categories }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This might affect services linked to this category.")) return;
    try {
        const result = await deleteCategory(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Category deleted");
            router.refresh();
        }
    } catch (error) {
        toast.error("Failed to delete");
    }
  };

  const handleAddCategory = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
          const result = await createCategory({ name: newCategoryName });
          if (result.error) {
              toast.error(result.error);
          } else {
              toast.success("Category created");
              setNewCategoryName("");
              setIsAddModalOpen(false);
              router.refresh();
          }
      } catch (error) {
          toast.error("Failed to create");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {categories.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center">No categories found.</TableCell>
                    </TableRow>
                ) : (
                    categories.map((cat) => (
                        <TableRow key={cat.id}>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{cat.id}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required placeholder="e.g. Maintenance" />
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
