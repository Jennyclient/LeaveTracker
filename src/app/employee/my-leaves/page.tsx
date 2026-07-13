"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { TableBodySkeleton } from "@/components/shared/loading-skeleton";
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
import { formatDate, formatHalfDayPeriod } from "@/lib/format";
import { getEmployeeLeaveRequests } from "@/lib/leave-requests";
import { getEmployeeLeaveTypes } from "@/lib/leave-types";
import { toast } from "sonner";
import type { LeaveRequest, LeaveType } from "@/types";

export default function MyLeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [requests, types] = await Promise.all([
          getEmployeeLeaveRequests(),
          getEmployeeLeaveTypes(),
        ]);

        if (cancelled) {
          return;
        }

        setLeaveRequests(requests);
        setLeaveTypes(types.filter((lt) => lt.status === "active"));
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to fetch leave requests";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const myLeaves = leaveRequests.filter((r) => {
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
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Leave Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {leaveTypes.map((lt) => (
              <SelectItem key={lt.id} value={lt.id}>
                {lt.leaveName}
              </SelectItem>
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
            {isLoading ? (
              <TableBodySkeleton rows={5} columns={5} />
            ) : myLeaves.length === 0 ? (
              <TableEmptyRow colSpan={5} message="No leave requests found" />
            ) : (
              myLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                  </TableCell>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>
                    {leave.days}
                    {leave.halfDay
                      ? ` (Half${
                          leave.halfDayPeriod
                            ? ` - ${formatHalfDayPeriod(leave.halfDayPeriod)}`
                            : ""
                        })`
                      : ""}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={leave.status} />
                  </TableCell>
                  <TableCell>{formatDate(leave.appliedDate)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
