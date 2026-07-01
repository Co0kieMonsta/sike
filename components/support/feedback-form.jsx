"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitSupportTicket } from "@/action/support-action";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const schema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  contact_email: z.string().email().optional().or(z.literal("")),
});

const FeedbackForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    startTransition(async () => {
      const response = await submitSupportTicket({ ...data, type: "feedback" });
      if (response.status === "success") {
        toast.success("Feedback submitted! Thank you.");
        reset();
      } else {
        toast.error(response.message);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Feedback</CardTitle>
        <CardDescription>Tell us what you think about the app.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-title">Title</Label>
            <Input id="feedback-title" placeholder="Summary of your feedback" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
             <Label htmlFor="feedback-desc">Details</Label>
             <Textarea id="feedback-desc" placeholder="Share your thoughts..." className="min-h-[100px]" {...register("description")} />
             {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-email">Email (Optional)</Label>
            <Input id="feedback-email" placeholder="For follow-up" {...register("contact_email")} />
            {errors.contact_email && <p className="text-sm text-destructive">{errors.contact_email.message}</p>}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
