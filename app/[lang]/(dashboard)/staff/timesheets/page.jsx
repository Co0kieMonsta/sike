"use client";
import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, Calendar as CalendarIcon, Filter, Printer } from "lucide-react";
import { getTimeEntries, createManualEntry, updateTimeEntry, deleteTimeEntry } from "@/action/time-entry-action";
import { getStaff } from "@/action/staff-action";
import toast from "react-hot-toast";
import { format } from "date-fns";

const TimesheetPage = () => {
    // Filters
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // Data
  const [timesheets, setTimesheets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    staff_id: "",
    date: "",
    clock_in: "",
    clock_out: "",
  });

  // Load Staff
  useEffect(() => {
    const loadStaff = async () => {
        const data = await getStaff();
        setStaffList(data || []);
    }
    loadStaff();
  }, []);

  // Load Entries
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
        const data = await getTimeEntries({ 
            staffId: selectedStaff, 
            startDate, 
            endDate 
        });
        setTimesheets(data || []);
    } catch (error) {
        toast.error("Failed to load time entries");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [selectedStaff, startDate, endDate]); // Auto-refresh on filter change

  // CRUD
  const handleOpenModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        staff_id: entry.staff_id,
        date: entry.date,
        clock_in: new Date(entry.clock_in).toISOString().slice(0, 16), // Format for datetime-local
        clock_out: entry.clock_out ? new Date(entry.clock_out).toISOString().slice(0, 16) : "",
      });
    } else {
      setEditingEntry(null);
      setFormData({
        staff_id: "",
        date: new Date().toISOString().split("T")[0],
        clock_in: "",
        clock_out: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (editingEntry) {
            await updateTimeEntry(editingEntry.id, {
                clock_in: new Date(formData.clock_in).toISOString(),
                clock_out: new Date(formData.clock_out).toISOString(),
            });
            toast.success("Entry updated");
        } else {
            await createManualEntry({
                ...formData,
                clock_in: new Date(formData.clock_in).toISOString(),
                clock_out: new Date(formData.clock_out).toISOString(),
            });
            toast.success("Entry created");
        }
        setIsModalOpen(false);
        fetchEntries();
    } catch (error) {
        toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
      if (confirm("Delete this time entry?")) {
        await deleteTimeEntry(id);
        toast.success("Entry deleted");
        fetchEntries();
      }
  }

  const handlePrint = () => {
      window.print();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Timesheet Management</h1>
           <p className="text-muted-foreground">View, edit, and export staff working hours.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print / Export
            </Button>
            <Button onClick={() => handleOpenModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
            </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="print:hidden">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
             <div className="grid gap-2 w-full md:w-[200px]">
                <Label>Staff Member</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Staff" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Staff</SelectItem>
                        {staffList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
             <div className="grid gap-2 w-full md:w-auto">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
             </div>
             <div className="grid gap-2 w-full md:w-auto">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
             </div>
             <Button variant="ghost" onClick={fetchEntries} disabled={isLoading}>
                 <Filter className="mr-2 h-4 w-4" />
                 Refresh
             </Button>
          </CardContent>
      </Card>

      {/* Report View (Visible in Print) */}
      <div className="hidden print:block mb-8">
          <h2 className="text-xl font-bold">Timesheet Report</h2>
          <p>Period: {startDate} to {endDate}</p>
          <p>Staff: {selectedStaff === 'all' ? 'All Staff' : staffList.find(s => s.id === selectedStaff)?.name}</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Staff Name</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Breaks</TableHead>
                <TableHead className="text-right">Total Hours</TableHead>
                <TableHead className="text-right print:hidden">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.date), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{entry.staff?.name}</TableCell>
                  <TableCell>{format(new Date(entry.clock_in), "h:mm a")}</TableCell>
                  <TableCell>{entry.clock_out ? format(new Date(entry.clock_out), "h:mm a") : "-"}</TableCell>
                  <TableCell>
                    {entry.breaks?.map((b, i) => (
                        <div key={i} className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(b.start_time), "h:mm a")} - {b.end_time ? format(new Date(b.end_time), "h:mm a") : "Active"}
                        </div>
                    ))}
                    {(!entry.breaks || entry.breaks.length === 0) && <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-right font-bold">{entry.total_hours || "0.00"}</TableCell>
                  <TableCell className="text-right print:hidden">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(entry)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
               {timesheets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No records found for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Entry" : "Add Manual Entry"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingEntry && (
                <div className="grid gap-2">
                    <Label>Staff Member</Label>
                    <Select 
                        value={formData.staff_id} 
                        onValueChange={(val) => setFormData({...formData, staff_id: val})}
                        disabled={!!editingEntry}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Staff" />
                        </SelectTrigger>
                        <SelectContent>
                             {staffList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            )}
            
            <div className="grid gap-2">
                <Label>Date</Label>
                <Input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    disabled={!!editingEntry} // Keep date fixed on edit for simplicity or allow change
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Clock In</Label>
                    <Input 
                        type="datetime-local" 
                        value={formData.clock_in}
                        onChange={e => setFormData({...formData, clock_in: e.target.value})}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Clock Out</Label>
                    <Input 
                        type="datetime-local" 
                        value={formData.clock_out}
                        onChange={e => setFormData({...formData, clock_out: e.target.value})}
                        required
                    />
                </div>
            </div>

            <DialogFooter>
              <Button type="submit">Save Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimesheetPage;
