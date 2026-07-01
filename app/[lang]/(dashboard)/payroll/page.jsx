"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generatePayroll, savePayroll } from "@/action/payroll-action";
import toast from "react-hot-toast";
import { DollarSign, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

const PayrollPage = () => {
    // Default range: Last 30 days
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [payrollData, setPayrollData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const response = await generatePayroll(startDate, endDate);
    if (response.status === "success") {
        setPayrollData(response.data);
        if (response.data.length === 0) {
            toast("No billable hours found for this period.", { icon: "ℹ️" });
        }
    } else {
        toast.error(response.message);
    }
    setIsLoading(false);
  };

  const handleProcessPayment = async () => {
    if (payrollData.length === 0) return;
    if (!confirm(`Are you sure you want to process payroll for ${payrollData.length} employees? This will create payment records.`)) return;

    setIsProcessing(true);
    const response = await savePayroll(payrollData, startDate, endDate);
    if (response.status === "success") {
        toast.success(response.message);
        setPayrollData([]); // Clear preview
    } else {
        toast.error(response.message);
    }
    setIsProcessing(false);
  };

  const totalGross = payrollData.reduce((sum, item) => sum + parseFloat(item.gross_pay), 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payroll Management</h1>
        <p className="text-muted-foreground">Calculate and process staff salaries.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-lg border shadow-sm">
        <div className="grid gap-2 w-full md:w-auto">
            <Label htmlFor="start">Start Date</Label>
            <Input 
                id="start" 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
            />
        </div>
        <div className="grid gap-2 w-full md:w-auto">
            <Label htmlFor="end">End Date</Label>
            <Input 
                id="end" 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
            />
        </div>
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate Report
        </Button>
      </div>

      {payrollData.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Payroll Preview</span>
                    <span className="text-xl text-green-600">Total: ${totalGross.toFixed(2)}</span>
                </CardTitle>
                <CardDescription>
                    Review calculated pay for period {format(new Date(startDate), "MMM d")} - {format(new Date(endDate), "MMM d, yyyy")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Staff Name</TableHead>
                            <TableHead>Total Hours</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead className="text-right">Gross Pay</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payrollData.map((item) => (
                            <TableRow key={item.staff_id}>
                                <TableCell className="font-medium">{item.staff_name}</TableCell>
                                <TableCell>{item.total_hours}</TableCell>
                                <TableCell>${item.hourly_rate}/hr</TableCell>
                                <TableCell className="text-right font-bold text-green-600">${item.gross_pay}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleProcessPayment} disabled={isProcessing} size="lg">
                        {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <DollarSign className="mr-2 h-5 w-5" />}
                        Process Payment
                    </Button>
                </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
};

export default PayrollPage;
