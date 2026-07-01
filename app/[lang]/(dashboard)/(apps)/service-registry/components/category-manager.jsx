"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { createCategory, deleteCategory } from "@/action/services";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

export const CategoryManager = ({ open, onClose, categories }) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsLoading(true);
    try {
      const result = await createCategory({ name: newCategoryName });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category added");
        setNewCategoryName("");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to add category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if(!confirm("Are you sure? This might affect services linked to this category.")) return;
    try {
        const result = await deleteCategory(id);
        if(result.error) {
            toast.error(result.error);
        } else {
            toast.success("Category deleted");
            router.refresh();
        }
    } catch(err) {
        toast.error("Failed to delete");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 items-end mb-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="category">New Category</Label>
                <Input 
                    id="category" 
                    placeholder="e.g. Carwash" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
            </div>
            <Button onClick={handleAddCategory} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
        </div>

        <div className="border rounded-md">
            <div className="p-2 bg-muted font-medium text-sm">Existing Categories</div>
            <ScrollArea className="h-[300px]">
                {categories.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No categories found.</div>
                ) : (
                    <div className="divide-y">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-3 text-sm">
                                <span>{cat.name}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                                    onClick={() => handleDeleteCategory(cat.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
