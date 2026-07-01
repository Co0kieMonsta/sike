import React from "react";
import FeedbackForm from "@/components/support/feedback-form";
import BugReportForm from "@/components/support/bug-report-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

const SupportPage = () => {
  const whatsappNumber = "1234567890"; // Placeholder
  const whatsappMessage = encodeURIComponent("Hello, I need help with the Invoice App.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">We are here to help. Send us your feedback, report bugs, or chat with us.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feedback Section */}
        <FeedbackForm />

        {/* Bug Report Section */}
        <BugReportForm />

        {/* WhatsApp Section */}
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">Need Immediate Help?</CardTitle>
            <CardDescription className="text-green-600/80 dark:text-green-400/80">
              Chat with our support team directly on WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square relative flex items-center justify-center bg-green-100 dark:bg-green-900/40 rounded-full w-24 h-24 mx-auto mb-4">
               <MessageCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-center text-sm text-muted-foreground mb-4">
                Our support team is available Mon-Fri, 9am - 5pm.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat on WhatsApp
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
