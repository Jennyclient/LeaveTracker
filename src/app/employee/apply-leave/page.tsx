"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getEmployeeHolidays } from "@/lib/holidays";
import { calculateLeaveDays, formatLeaveDayCount } from "@/lib/leave-days";
import { createEmployeeLeaveRequest } from "@/lib/leave-requests";
import { getEmployeeLeaveTypesWithBalance } from "@/lib/leave-types";
import { toast } from "sonner";
import type { HalfDayPeriod, Holiday, LeaveType } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type LeaveBalanceByType = Record<
  string,
  { allocatedLeaves: number; consumedLeaves: number; availableLeaves: number }
>;

export default function ApplyLeavePage() {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalancesByType, setLeaveBalancesByType] = useState<LeaveBalanceByType>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [halfDay, setHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<HalfDayPeriod>("FIRST_HALF");
  const [reason, setReason] = useState("");
  const [attachmentDoc, setAttachmentDoc] = useState("");
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaveTypes() {
      try {
        const items = await getEmployeeLeaveTypesWithBalance();
        if (cancelled) {
          return;
        }

        const activeItems = items.filter(({ leaveType }) => leaveType.status === "active");
        setLeaveTypes(activeItems.map(({ leaveType }) => leaveType));
        setLeaveBalancesByType(
          Object.fromEntries(
            activeItems.map((item) => [
              item.leaveType.leaveName.trim().toLowerCase(),
              {
                allocatedLeaves: item.allocatedLeaves,
                consumedLeaves: item.consumedLeaves,
                availableLeaves: item.availableLeaves,
              },
            ])
          )
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load leave types";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadLeaveTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHolidays() {
      try {
        const data = await getEmployeeHolidays();
        if (!cancelled) {
          setHolidays(data.holidays);
        }
      } catch {
        if (!cancelled) {
          setHolidays([]);
        }
      }
    }

    void loadHolidays();

    return () => {
      cancelled = true;
    };
  }, []);

  const requestedLeaveDays = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }

    const effectiveEndDate = halfDay ? startDate : endDate;

    if (new Date(startDate) > new Date(effectiveEndDate)) {
      return null;
    }

    return calculateLeaveDays({
      startDate,
      endDate: effectiveEndDate,
      halfDay,
      holidays,
    });
  }, [startDate, endDate, halfDay, holidays]);

  const handleHalfDayChange = (checked: boolean) => {
    setHalfDay(checked);
    if (checked) {
      setHalfDayPeriod("FIRST_HALF");
      if (startDate) {
        setEndDate(startDate);
      }
    }
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (halfDay) {
      setEndDate(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveTypeId) {
      toast.error("Please select a leave type");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    if (halfDay && !halfDayPeriod) {
      toast.error("Please select first half or second half");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEmployeeLeaveRequest({
        leaveType: leaveTypeId,
        startDate,
        endDate: halfDay ? startDate : endDate,
        halfDay,
        halfDayPeriod: halfDay ? halfDayPeriod : undefined,
        reason,
        attachmentDoc: attachmentDoc.trim() || undefined,
      });

      toast.success("Leave request submitted successfully");
      router.push("/employee/my-leaves");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit leave request";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply Leave"
        description="Submit a new leave request"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leave Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select
                  value={leaveTypeId}
                  onValueChange={setLeaveTypeId}
                  disabled={isLoading || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((lt) => (
                      <SelectItem key={lt.id} value={lt.id}>
                        {lt.leaveName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    disabled={isLoading || isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isLoading || isSubmitting || halfDay}
                    min={startDate || undefined}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Half Day</p>
                  <p className="text-xs text-muted-foreground">
                    Apply for half day leave
                  </p>
                </div>
                <Switch
                  checked={halfDay}
                  onCheckedChange={handleHalfDayChange}
                  disabled={isLoading || isSubmitting}
                />
              </div>

              {halfDay && (
                <div className="space-y-3 rounded-lg border p-3">
                  <p className="text-sm font-medium">Select Half</p>
                  <RadioGroup
                    value={halfDayPeriod}
                    onValueChange={(value) =>
                      setHalfDayPeriod(value as HalfDayPeriod)
                    }
                    disabled={isLoading || isSubmitting}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <div className="flex items-center gap-2 rounded-md border p-3">
                      <RadioGroupItem value="FIRST_HALF" id="first-half" />
                      <Label htmlFor="first-half" className="font-normal">
                        First Half
                      </Label>
                    </div>
                    <div className="flex items-center gap-2 rounded-md border p-3">
                      <RadioGroupItem value="SECOND_HALF" id="second-half" />
                      <Label htmlFor="second-half" className="font-normal">
                        Second Half
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {requestedLeaveDays !== null && (
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-sm font-medium">
                    Leave days applying for:{" "}
                    <span className="text-primary">
                      {formatLeaveDayCount(requestedLeaveDays)}
                    </span>
                  </p>
                  {requestedLeaveDays === 0 && (
                    <p className="mt-1 text-xs text-destructive">
                      No applicable leave days in the selected range after excluding
                      holidays.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide reason for leave..."
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isLoading || isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachmentDoc">Attachment Path</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="attachmentDoc"
                    placeholder="uploads/leave-docs/document.pdf"
                    value={attachmentDoc}
                    onChange={(e) => setAttachmentDoc(e.target.value)}
                    disabled={isLoading || isSubmitting}
                  />
                  <Button type="button" variant="outline" size="sm" disabled>
                    <Upload className="mr-2 size-4" />
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional supporting document path
                </p>
              </div>

              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isLoading || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Leave Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Leave Balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading leave types...</p>
            ) : leaveTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leave types available</p>
            ) : (
              leaveTypes.map((lt) => (
                <div
                  key={lt.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: lt.color }}
                    />
                    {lt.leaveName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {leaveBalancesByType[lt.leaveName.trim().toLowerCase()]
                      ?.availableLeaves ?? 0}
                  </span>
                </div>
              ))
            )}
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Balance summary</p>
              <p className="mt-1">
                Available leaves are calculated as total allocated leave minus used leave.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
