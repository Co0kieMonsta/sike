"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesTable } from "./services-table";
import { CategoriesTable } from "./categories-table";

export const ServiceManagementMain = ({ initialServices, initialCategories }) => {
  return (
    <Tabs defaultValue="services" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
      </TabsList>
      
      <TabsContent value="services">
        <ServicesTable services={initialServices} categories={initialCategories} />
      </TabsContent>
      
      <TabsContent value="categories">
        <CategoriesTable categories={initialCategories} />
      </TabsContent>
    </Tabs>
  );
};
