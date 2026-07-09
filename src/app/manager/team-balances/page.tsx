"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getManagerLeaveBalances,
  type AdminLeaveBalanceItem,
} from "@/lib/admin-leave-balances";

export default function TeamBalancesPage() {
  const [rows, setRows] = useState<AdminLeaveBalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTeamBalances() {
      try {
        const balances = await getManagerLeaveBalances();
        if (cancelled) return;
        setRows(
          [...balances].sort((a, b) =>
            `${a.employeeId}-${a.leaveName}`.localeCompare(
              `${b.employeeId}-${b.leaveName}`
            )
          )
        );
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load team leave balances";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTeamBalances();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Balances"
        description="View leave balances for your team members"
      />

      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Leave Name</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead>Annual Quota</TableHead>
                <TableHead>Carry Forward</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Consumed</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Requests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmptyRow colSpan={10} message="No team leave balances found" />
              ) : (
                rows.map((bal) => {
                  const total = bal.availableLeaves + bal.consumedLeaves;
                  const utilization =
                    total > 0 ? Math.round((bal.consumedLeaves / total) * 100) : 0;

                  return (
                    <TableRow key={bal.id}>
                      <TableCell className="font-medium">{bal.employeeId}</TableCell>
                      <TableCell>{bal.leaveName}</TableCell>
                      <TableCell>{bal.policyName || "—"}</TableCell>
                      <TableCell>{bal.annualQuota ?? "—"}</TableCell>
                      <TableCell>
                        {bal.carryForward ? `Yes (${bal.maxCarryForward})` : "No"}
                      </TableCell>
                      <TableCell>{bal.allocatedLeaves}</TableCell>
                      <TableCell>{bal.consumedLeaves}</TableCell>
                      <TableCell>{bal.availableLeaves}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={utilization} className="w-24" />
                          <span className="text-sm text-muted-foreground">
                            {utilization}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{bal.leaveRequests.length}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
