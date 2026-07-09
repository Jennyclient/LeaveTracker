"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getEmployeeDashboard,
  type EmployeeLeaveTypeBalance,
} from "@/lib/dashboard";
import { formatDate } from "@/lib/format";
import type { Holiday } from "@/types";

export default function EmployeeDashboardPage() {
  const [upcomingHolidays, setUpcomingHolidays] = useState<Holiday[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<EmployeeLeaveTypeBalance[]>([]);
  const [employeeStats, setEmployeeStats] = useState({
    availableLeaves: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    upcomingHolidays: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const data = await getEmployeeDashboard();
        if (!cancelled) {
          setEmployeeStats(data.stats);
          setLeaveTypes(data.leaveTypes);
          setUpcomingHolidays(data.upcomingHolidays);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load employee dashboard";
          toast.error(message);
        }
      }
    }

    void fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        description="Your leave overview and quick actions"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Available Leaves" value={employeeStats.availableLeaves} icon={Wallet} href="/employee/leave-balance" />
        <StatCard title="Pending Requests" value={employeeStats.pendingRequests} icon={Clock} href="/employee/my-leaves" />
        <StatCard title="Approved Requests" value={employeeStats.approvedRequests} icon={CheckCircle} href="/employee/my-leaves" />
        <StatCard title="Upcoming Holidays" value={employeeStats.upcomingHolidays} icon={CalendarDays} href="/employee/holiday-calendar" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Leave Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveTypes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No leave balance data
              </p>
            ) : (
              leaveTypes.map((item) => (
                <div key={item.leaveName} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.leaveName}</span>
                    <span className="text-muted-foreground">
                      {item.availableLeaves} / {item.allocatedLeaves}
                    </span>
                  </div>
                  <Progress
                    value={
                      item.allocatedLeaves > 0
                        ? (item.availableLeaves / item.allocatedLeaves) * 100
                        : 0
                    }
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingHolidays.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No upcoming holidays
                </p>
              ) : (
                upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{holiday.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{holiday.type}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(holiday.date)}</p>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
