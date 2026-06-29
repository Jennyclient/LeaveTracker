"use client";

import { useState } from "react";
import { Check, Eye, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { employees, leaveRequests } from "@/data/mock-data";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function LeaveRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = leaveRequests.filter((req) => {
    if (statusFilter !== "all" && req.status !== statusFilter) return false;
    return true;
  });

  const handleAction = (action: string, name: string) => {
    toast.success(`Leave request for ${name} has been ${action}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Review and manage all leave requests"
      />

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" />
        <Input type="date" className="w-40" />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.employeeName}</TableCell>
                <TableCell>{req.leaveType}</TableCell>
                <TableCell>{formatDate(req.startDate)}</TableCell>
                <TableCell>{formatDate(req.endDate)}</TableCell>
                <TableCell>{req.days}</TableCell>
                <TableCell><StatusBadge status={req.status} /></TableCell>
                <TableCell>{req.manager}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {req.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-emerald-600"
                          onClick={() => handleAction("approved", req.employeeName)}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-600"
                          onClick={() => handleAction("rejected", req.employeeName)}
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon-sm">
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
