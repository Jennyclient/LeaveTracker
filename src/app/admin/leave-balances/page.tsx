"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  loadAdminLeaveBalanceTable,
  type AdminLeaveBalanceTable,
} from "@/lib/admin-leave-balances";

export default function LeaveBalancesPage() {
  const [table, setTable] = useState<AdminLeaveBalanceTable>({
    columns: [],
    rows: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchBalances() {
      try {
        const nextTable = await loadAdminLeaveBalanceTable();
        if (!cancelled) {
          setTable(nextTable);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load leave balances";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchBalances();

    return () => {
      cancelled = true;
    };
  }, []);

  const columnCount = table.columns.length + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Balances"
        description="View and adjust employee leave balances"
      />

      <div className="overflow-x-auto rounded-xl border bg-card">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                {table.columns.map((column) => (
                  <TableHead key={column.leaveTypeId}>{column.leaveName}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.length === 0 ? (
                <TableEmptyRow
                  colSpan={columnCount}
                  message="No leave balances found"
                />
              ) : (
                table.rows.map((row) => (
                  <TableRow key={row.employeeId}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{row.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.employeeId}
                        </p>
                      </div>
                    </TableCell>
                    {table.columns.map((column) => {
                      const balance = row.balances[column.leaveTypeId];

                      return (
                        <TableCell key={column.leaveTypeId}>
                          {balance ? (
                            <div>
                              <p className="font-medium">
                                {balance.availableLeaves}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {balance.consumedLeaves} used
                              </p>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
