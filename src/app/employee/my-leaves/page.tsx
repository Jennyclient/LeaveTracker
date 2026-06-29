"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { leaveRequests, leaveTypes } from "@/data/mock-data";
import { formatDate } from "@/lib/format";

export default function MyLeavesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const myLeaves = leaveRequests.filter((r) => {
    if (r.employeeId !== "emp-001") return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (typeFilter !== "all" && r.leaveTypeId !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leaves"
        description="View your leave request history"
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Leave Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {leaveTypes.slice(0, 4).map((lt) => (
              <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leave Dates</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myLeaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>
                  {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                </TableCell>
                <TableCell>{leave.leaveType}</TableCell>
                <TableCell>{leave.days}{leave.halfDay ? " (Half)" : ""}</TableCell>
                <TableCell><StatusBadge status={leave.status} /></TableCell>
                <TableCell>{formatDate(leave.appliedDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
