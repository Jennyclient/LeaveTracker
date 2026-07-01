"use client";

import { useState } from "react";
import { Check, Eye, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import type { LeaveRequest } from "@/types";

export default function TeamRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const leaveRequests: LeaveRequest[] = [];
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const teamRequests = leaveRequests.filter((r) => r.managerId === user?.id);

  const handleAction = (action: string) => {
    if (!selectedRequest) return;
    toast.success(`Leave request ${action} for ${selectedRequest.employeeName}`);
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Requests"
        description="Review and approve leave requests from your team"
      />

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamRequests.length === 0 ? (
              <TableEmptyRow colSpan={7} message="No team leave requests found" />
            ) : (
              teamRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.employeeName}</TableCell>
                <TableCell>{req.leaveType}</TableCell>
                <TableCell>{formatDate(req.startDate)}</TableCell>
                <TableCell>{formatDate(req.endDate)}</TableCell>
                <TableCell>{req.days}</TableCell>
                <TableCell><StatusBadge status={req.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {req.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-emerald-600"
                          onClick={() => {
                            toast.success(`Approved leave for ${req.employeeName}`);
                          }}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-600"
                          onClick={() => {
                            toast.error(`Rejected leave for ${req.employeeName}`);
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      </>
                    )}
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
      </div>

      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Leave Request Details</SheetTitle>
            <SheetDescription>
              {selectedRequest?.employeeName} — {selectedRequest?.leaveType}
            </SheetDescription>
          </SheetHeader>
          {selectedRequest && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDate(selectedRequest.startDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{formatDate(selectedRequest.endDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days</p>
                  <p className="font-medium">{selectedRequest.days}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="mt-1 text-sm">{selectedRequest.reason}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <p className="mt-1 text-sm">{formatDate(selectedRequest.appliedDate)}</p>
              </div>
              {selectedRequest.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={() => handleAction("approved")}>
                    <Check className="mr-2 size-4" /> Approve
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleAction("rejected")}>
                    <X className="mr-2 size-4" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
