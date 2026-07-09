"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Eye, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import {
  getManagerLeaveRequests,
  updateManagerLeaveRequestAction,
  type LeaveRequestAction,
} from "@/lib/leave-requests";
import { toast } from "sonner";
import type { LeaveRequest } from "@/types";

export default function TeamRequestsPage() {
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null
  );
  const [confirmAction, setConfirmAction] = useState<{
    request: LeaveRequest;
    action: LeaveRequestAction;
  } | null>(null);

  const loadTeamRequests = useCallback(async () => {
    const requests = await getManagerLeaveRequests({ sortOrder: "desc" });
    setTeamRequests(requests);
    return requests;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchRequests() {
      try {
        const requests = await getManagerLeaveRequests({ sortOrder: "desc" });
        if (!cancelled) {
          setTeamRequests(requests);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load team leave requests";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchRequests();

    return () => {
      cancelled = true;
    };
  }, []);

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
      await updateManagerLeaveRequestAction(req.id, {
        action,
        employeeId: req.employeeId,
        leaveType: req.leaveTypeId,
      });

      const requests = await loadTeamRequests();
      const updated = requests.find((item) => item.id === req.id);
      if (updated) {
        setSelectedRequest(updated);
      } else {
        setSelectedRequest(null);
      }

      toast.success(
        action === "APPROVE"
          ? `Approved leave for ${req.employeeName}`
          : `Rejected leave for ${req.employeeName}`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update leave request";
      toast.error(message);
    } finally {
      setActioningId(null);
    }
  };

  const openConfirmAction = (req: LeaveRequest, action: LeaveRequestAction) => {
    setConfirmAction({ request: req, action });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    await handleAction(confirmAction.request, confirmAction.action);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Requests"
        description="Review and approve leave requests from your team"
      />

      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
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
                <TableEmptyRow
                  colSpan={7}
                  message="No team leave requests found"
                />
              ) : (
                teamRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      {req.employeeName}
                    </TableCell>
                    <TableCell>{req.leaveType}</TableCell>
                    <TableCell>{formatDate(req.startDate)}</TableCell>
                    <TableCell>{formatDate(req.endDate)}</TableCell>
                    <TableCell>{req.days}</TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {req.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-emerald-600"
                              disabled={actioningId === req.id}
                              onClick={() => openConfirmAction(req, "APPROVE")}
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-red-600"
                              disabled={actioningId === req.id}
                              onClick={() => openConfirmAction(req, "REJECT")}
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
        )}
      </div>

      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest?.employeeName} — {selectedRequest?.leaveType}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {formatDate(selectedRequest.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {formatDate(selectedRequest.endDate)}
                  </p>
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
                <p className="mt-1 text-sm">
                  {selectedRequest.reason || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <p className="mt-1 text-sm">
                  {formatDate(selectedRequest.appliedDate)}
                </p>
              </div>
              <DialogFooter showCloseButton>
                {selectedRequest.status === "pending" && (
                  <>
                    <Button
                      className="flex-1 sm:flex-none"
                      disabled={actioningId === selectedRequest.id}
                      onClick={() =>
                        openConfirmAction(selectedRequest, "APPROVE")
                      }
                    >
                      <Check className="mr-2 size-4" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 sm:flex-none"
                      disabled={actioningId === selectedRequest.id}
                      onClick={() =>
                        openConfirmAction(selectedRequest, "REJECT")
                      }
                    >
                      <X className="mr-2 size-4" /> Reject
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === "APPROVE"
                ? "Confirm Approve Request"
                : "Confirm Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction
                ? `Are you sure you want to ${
                    confirmAction.action === "APPROVE" ? "approve" : "reject"
                  } ${confirmAction.request.employeeName}'s leave request?`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            {confirmAction && (
              <Button
                variant={
                  confirmAction.action === "APPROVE" ? "default" : "destructive"
                }
                disabled={actioningId === confirmAction.request.id}
                onClick={handleConfirmAction}
              >
                {confirmAction.action === "APPROVE" ? "Approve" : "Reject"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
