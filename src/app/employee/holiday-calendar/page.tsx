"use client";

import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Holiday } from "@/types";

export default function HolidayCalendarPage() {
  const holidays: Holiday[] = [];
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const getHolidayForDay = (day: Date) =>
    holidays.find((h) => isSameDay(parseISO(h.date), day));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holiday Calendar"
        description="View company holidays for the year"
      />

      <Card>
        <CardHeader>
          <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
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
              const holiday = getHolidayForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  title={holiday?.name}
                  className={cn(
                    "flex min-h-12 w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-lg p-1 text-sm",
                    holiday && "bg-primary/10 font-medium text-primary"
                  )}
                >
                  <span>{format(day, "d")}</span>
                  {holiday && (
                    <span className="mt-0.5 w-full truncate text-center text-[9px] leading-tight">
                      {holiday.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Holiday List</CardTitle>
        </CardHeader>
        <CardContent>
          {holidays.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No holidays configured
            </p>
          ) : (
            <div className="space-y-3">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{holiday.name}</p>
                    <p className="text-sm capitalize text-muted-foreground">{holiday.type}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(holiday.date)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
