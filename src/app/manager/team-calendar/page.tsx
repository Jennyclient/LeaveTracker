"use client";

import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isWithinInterval } from "date-fns";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import type { LeaveRequest } from "@/types";

export default function TeamCalendarPage() {
  const user = useAuthStore((s) => s.user);
  const leaveRequests: LeaveRequest[] = [];
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const teamLeaves = leaveRequests.filter(
    (r) => r.managerId === user?.id && r.status === "approved"
  );

  const getLeavesForDay = (day: Date) =>
    teamLeaves.filter((leave) => {
      const start = parseISO(leave.startDate);
      const end = parseISO(leave.endDate);
      return isWithinInterval(day, { start, end });
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Calendar"
        description="View team availability and scheduled leaves"
      />

      <Card>
        <CardHeader>
          <CardTitle>{format(currentMonth, "MMMM yyyy")} — Team Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const leaves = getLeavesForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex min-h-16 flex-col items-center rounded-lg p-1 text-sm",
                    leaves.length > 0 && "bg-amber-500/10"
                  )}
                >
                  <span className="font-medium">{format(day, "d")}</span>
                  {leaves.map((leave) => (
                    <span
                      key={leave.id}
                      className="mt-0.5 w-full truncate text-center text-[9px] text-amber-700 dark:text-amber-400"
                    >
                      {leave.employeeName}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Team Leaves</CardTitle>
        </CardHeader>
        <CardContent>
          {teamLeaves.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No scheduled team leaves
            </p>
          ) : (
            <div className="space-y-3">
              {teamLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{leave.employeeName}</p>
                    <p className="text-sm text-muted-foreground">{leave.leaveType}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(leave.startDate), "MMM d")} —{" "}
                    {format(parseISO(leave.endDate), "MMM d")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
