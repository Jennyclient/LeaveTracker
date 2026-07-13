"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Eye, FileText } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/components/shared/date-range-picker";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatHalfDayPeriod } from "@/lib/format";
import {
  getAdminLeaveRequests,
  updateLeaveRequestAction,
  type LeaveRequestAction,
} from "@/lib/leave-requests";
import { toast } from "sonner";
import type { LeaveRequest } from "@/types";

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [employeeNameFilter, setEmployeeNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>();

  const loadLeaveRequests = useCallback(async () => {
    const requests = await getAdminLeaveRequests({
      employeeName: employeeNameFilter || undefined,
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter as "pending" | "approved" | "rejected" | "cancelled"),
      sortOrder,
      startDate: dateRange?.startDate || undefined,
      endDate: dateRange?.endDate || undefined,
    });

    setLeaveRequests(requests);
    return requests;
  }, [employeeNameFilter, statusFilter, sortOrder, dateRange]);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (!cancelled) {
        setIsLoading(true);
      }
      try {
        await loadLeaveRequests();
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to fetch leave requests";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loadLeaveRequests]);

  const filtered = useMemo(() => leaveRequests, [leaveRequests]);

  const handleAction = async (
    req: LeaveRequest,
    action: LeaveRequestAction
  ) => {
    if (!req.employeeId || !req.leaveTypeId) {
      toast.error("Missing employee or leave type details for this request");
      return;
    }

    setActioningId(req.id);
    try {
      await updateLeaveRequestAction(req.id, {
        action,
        employeeId: req.employeeId,
        leaveType: req.leaveTypeId,
      });

      await loadLeaveRequests();
      setSelectedRequest(null);

      toast.success(
        `Leave request for ${req.employeeName} ${action === "APPROVE" ? "approved" : "rejected"}`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update leave request";
      toast.error(message);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Review and manage all leave requests"
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search employee name"
          value={employeeNameFilter}
          onChange={(e) => setEmployeeNameFilter(e.target.value)}
          className="w-52"
        />
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
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>No. of Days</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-medium"
                    onClick={() =>
                      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                    }
                  >
                    Start Date
                    <ArrowUpDown className="size-3.5 text-muted-foreground" />
                  </button>
                </TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmptyRow colSpan={8} message="No leave requests found" />
              ) : (
                filtered.map((req) => (
                  <TableRow key={req.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{req.employeeName}</TableCell>
                    <TableCell>{req.leaveType}</TableCell>
                    <TableCell>{req.days}</TableCell>
                    <TableCell>{req.manager}</TableCell>
                    <TableCell>{formatDate(req.startDate)}</TableCell>
                    <TableCell>{formatDate(req.endDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={selectedRequest !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest?.employeeName} - {selectedRequest?.leaveType}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Start Date
                  </p>
                  <p className="mt-1 font-medium">{formatDate(selectedRequest.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    End Date
                  </p>
                  <p className="mt-1 font-medium">{formatDate(selectedRequest.endDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Employee
                  </p>
                  <p className="mt-1 font-medium">{selectedRequest.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Employee ID
                  </p>
                  <p className="mt-1 font-medium">{selectedRequest.employeeId || "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Manager
                  </p>
                  <p className="mt-1 font-medium">{selectedRequest.manager}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Leave Type
                  </p>
                  <p className="mt-1 font-medium">{selectedRequest.leaveType}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    No. of Days
                  </p>
                  <p className="mt-1 font-medium">{selectedRequest.days}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Applied On
                  </p>
                  <p className="mt-1 font-medium">{formatDate(selectedRequest.appliedDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Half Day
                  </p>
                  <p className="mt-1 font-medium">
                    {selectedRequest.halfDay
                      ? formatHalfDayPeriod(selectedRequest.halfDayPeriod) ||
                        "Yes"
                      : "No"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
                <p className="mt-2 text-sm leading-relaxed">
                  {selectedRequest.reason || "-"}
                </p>
              </div>

              {selectedRequest.attachmentDoc && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Attachment
                  </p>
                  <a
                    href={selectedRequest.attachmentDoc}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <FileText className="size-4" />
                    View document
                  </a>
                </div>
              )}

              {selectedRequest.status === "pending" && (
                <div className="flex justify-end gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    disabled={actioningId === selectedRequest.id}
                    onClick={() => void handleAction(selectedRequest, "REJECT")}
                  >
                    Reject
                  </Button>
                  <Button
                    disabled={actioningId === selectedRequest.id}
                    onClick={() => void handleAction(selectedRequest, "APPROVE")}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
