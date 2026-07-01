"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const ProjectCard = ({ project, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "success";
      case "hold": return "warning";
      default: return "secondary";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
            <Badge variant={getStatusColor(project.status)} className="capitalize">{project.status}</Badge>
        </div>
        <CardDescription className="line-clamp-2 h-10">
            {project.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Calendar className="h-4 w-4" />
            <span>{project.due_date ? format(new Date(project.due_date), "MMM d, yyyy") : "No deadline"}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/project-/${project.id}`}>
            <Button variant="outline">View Details</Button>
        </Link>
        <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive hover:bg-destructive/10"
            onClick={(e) => {
                e.preventDefault();
                onDelete(project.id);
            }}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
