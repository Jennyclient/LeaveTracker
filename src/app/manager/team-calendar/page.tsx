"use client";

import { useEffect, useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from "date-fns";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getManagerHolidays } from "@/lib/holidays";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ApprovedLeaveCalendarEntry, Holiday } from "@/types";

function toDateInputValue(value: string): string {
  return value.includes("T") ? value.split("T")[0] : value;
}

export default function TeamCalendarPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [approvedLeaves, setApprovedLeaves] = useState<ApprovedLeaveCalendarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  useEffect(() => {
    let cancelled = false;

    async function loadTeamCalendar() {
      try {
        const data = await getManagerHolidays();
        if (cancelled) {
          return;
        }

        setHolidays(data.holidays);
        setApprovedLeaves(data.approvedLeaves);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load team calendar";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTeamCalendar();

    return () => {
      cancelled = true;
    };
  }, []);

  const holidaysByDate = useMemo(() => {
    const map = new Map<string, Holiday>();
    for (const holiday of holidays) {
      map.set(toDateInputValue(holiday.date), holiday);
    }
    return map;
  }, [holidays]);

  const getHolidayForDay = (day: Date) => holidaysByDate.get(format(day, "yyyy-MM-dd"));

  const getLeavesForDay = (day: Date) =>
    approvedLeaves.filter((leave) => {
      const start = parseISO(leave.startDate);
      const end = parseISO(leave.endDate);
      return isWithinInterval(day, { start, end });
    });

  const sortedLeaves = useMemo(
    () =>
      [...approvedLeaves].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [approvedLeaves]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Calendar"
        description="View team availability, holidays, and scheduled leaves"
      />

      <Card>
        <CardHeader>
          <CardTitle>{format(currentMonth, "MMMM yyyy")} — Team Availability</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <>
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {days.map((day) => {
                  const holiday = getHolidayForDay(day);
                  const leaves = getLeavesForDay(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "flex min-h-16 flex-col items-center rounded-lg p-1 text-sm",
                        holiday && "bg-primary/10 font-medium text-primary",
                        !holiday && leaves.length > 0 && "bg-amber-500/10"
                      )}
                    >
                      <span className="font-medium">{format(day, "d")}</span>
                      {holiday && (
                        <span className="mt-0.5 w-full truncate text-center text-[9px] leading-tight">
                          {holiday.name}
                        </span>
                      )}
                      {!holiday &&
                        leaves.map((leave) => (
                          <span
                            key={leave.id}
                            className="mt-0.5 w-full truncate text-center text-[9px] text-amber-700 dark:text-amber-400"
                          >
                            {leave.employeeName ?? leave.employeeId}
                          </span>
                        ))}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Team Leaves</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : sortedLeaves.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No scheduled team leaves
            </p>
          ) : (
            <div className="space-y-3">
              {sortedLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{leave.employeeName ?? leave.employeeId}</p>
                    <p className="text-sm text-muted-foreground">
                      {leave.leaveType} · {leave.days} day(s)
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(leave.startDate)}
                    {leave.startDate !== leave.endDate && ` — ${formatDate(leave.endDate)}`}
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
