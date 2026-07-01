"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitSupportTicket } from "@/action/support-action";
import toast from "react-hot-toast";
import { Loader2, Bug } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const schema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Please provide steps to reproduce" }),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

const BugReportForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      severity: "low",
    },
  });

  const onSubmit = (data) => {
    startTransition(async () => {
      const response = await submitSupportTicket({ ...data, type: "bug_report" });
      if (response.status === "success") {
        toast.success("Bug report submitted! We will look into it.");
        reset();
      } else {
        toast.error(response.message);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report a Bug</CardTitle>
        <CardDescription>Found an issue? Let us know.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bug-title">Issue Title</Label>
            <Input id="bug-title" placeholder="Brief description of the bug" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
             <Label htmlFor="bug-desc">Steps to Reproduce</Label>
             <Textarea id="bug-desc" placeholder="1. Go to... 2. Click on..." className="min-h-[100px]" {...register("description")} />
             {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bug-severity">Severity</Label>
            <Controller
              control={control}
              name="severity"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor cosmetic issue</SelectItem>
                    <SelectItem value="medium">Medium - Feature not working as expected</SelectItem>
                    <SelectItem value="high">High - Feature broken</SelectItem>
                    <SelectItem value="critical">Critical - System crash or data loss</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.severity && <p className="text-sm text-destructive">{errors.severity.message}</p>}
          </div>

          <Button type="submit" disabled={isPending} variant="destructive" className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bug className="mr-2 h-4 w-4" />}
            Report Bug
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BugReportForm;
