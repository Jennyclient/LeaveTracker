"use client";

import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isWithinInterval } from "date-fns";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leaveRequests } from "@/data/mock-data";
import { cn } from "@/lib/utils";

const currentMonth = new Date(2026, 5, 1);
const monthStart = startOfMonth(currentMonth);
const monthEnd = endOfMonth(currentMonth);
const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
const startPadding = getDay(monthStart);

const teamLeaves = leaveRequests.filter((r) => r.managerId === "mgr-001" && r.status === "approved");

function getLeavesForDay(day: Date) {
  return teamLeaves.filter((leave) => {
    const start = parseISO(leave.startDate);
    const end = parseISO(leave.endDate);
    return isWithinInterval(day, { start, end });
  });
}

export default function TeamCalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Calendar"
        description="View team availability and scheduled leaves"
      />

      <Card>
        <CardHeader>
          <CardTitle>June 2026 — Team Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-16" />
            ))}
            {days.map((day) => {
              const leaves = getLeavesForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-16 rounded-lg border p-1 text-xs",
                    leaves.length > 0 && "border-primary/30 bg-primary/5"
                  )}
                >
                  <span className="font-medium">{format(day, "d")}</span>
                  {leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="mt-0.5 truncate rounded bg-primary/20 px-1 text-[10px] text-primary"
                    >
                      {leave.employeeName.split(" ")[0]}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team on Leave</CardTitle>
        </CardHeader>
        <CardContent>
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
                  {format(parseISO(leave.startDate), "MMM d")} — {format(parseISO(leave.endDate), "MMM d")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
