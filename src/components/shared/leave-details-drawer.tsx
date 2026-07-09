"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { formatDate } from "@/lib/format";
import type { EmployeeLeaveBalanceItem } from "@/lib/employee-leave-balance";

interface LeaveDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: EmployeeLeaveBalanceItem | null;
}

export function LeaveDetailsDrawer({
  open,
  onOpenChange,
  balance,
}: LeaveDetailsDrawerProps) {
  const leaveType = balance?.leaveName ?? "Leave";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{leaveType} Details</DialogTitle>
          <DialogDescription>
            View balance history and policy information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="history" className="pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1">
              Leave Requests
            </TabsTrigger>
            <TabsTrigger value="policy" className="flex-1">
              Policy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!balance || balance.leaveRequests.length === 0 ? (
                  <TableEmptyRow colSpan={3} message="No leave requests found" />
                ) : (
                  balance.leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{formatDate(request.startDate)}</TableCell>
                      <TableCell>{formatDate(request.endDate)}</TableCell>
                      <TableCell className="capitalize">
                        {request.status.toLowerCase()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="policy" className="mt-4 space-y-4">
            <div className="space-y-3 rounded-lg border p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Policy Name
                </p>
                <p className="text-sm font-medium">
                  {balance?.policyName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Annual Quota
                </p>
                <p className="text-sm">
                  {balance?.annualQuota ?? balance?.allocatedLeaves ?? 0} days
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Carry Forward
                </p>
                <p className="text-sm">
                  {balance?.carryForward
                    ? `Up to ${balance.maxCarryForward} days`
                    : "Not allowed"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Allocated Leaves
                </p>
                <p className="text-sm">{balance?.allocatedLeaves ?? 0}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Available Leaves
                </p>
                <p className="text-sm">{balance?.availableLeaves ?? 0}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
