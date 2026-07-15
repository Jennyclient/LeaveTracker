"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { LeaveDetailsDrawer } from "@/components/shared/leave-details-drawer";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getEmployeeLeaveBalance,
  type EmployeeLeaveBalanceItem,
} from "@/lib/employee-leave-balance";

export default function LeaveBalancePage() {
  const [balances, setBalances] = useState<EmployeeLeaveBalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] =
    useState<EmployeeLeaveBalanceItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBalances() {
      try {
        const items = await getEmployeeLeaveBalance();
        if (!cancelled) {
          setBalances(items);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Balance"
        description="View your available leave balances by type"
      />

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : balances.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No leave balances found
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {balances.map((balance) => {
            const quota = balance.annualQuota ?? balance.allocatedLeaves;

            return (
              <Card key={`${balance.leaveTypeId}-${balance.id}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: balance.color }}
                    />
                    {balance.leaveName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="text-2xl font-semibold text-primary">
                        {balance.availableLeaves}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Consumed</p>
                      <p className="text-2xl font-semibold">
                        {balance.consumedLeaves}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Annual Quota
                      </p>
                      <p className="text-sm font-medium">{quota}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Carry Forward
                      </p>
                      <p className="text-sm font-medium">
                        {balance.carryForward ? balance.maxCarryForward : 0}
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={
                      quota > 0
                        ? (balance.availableLeaves / quota) * 100
                        : 0
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedBalance(balance);
                      setDrawerOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <LeaveDetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        balance={selectedBalance}
      />
    </div>
  );
}
