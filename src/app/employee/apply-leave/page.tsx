"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, MapPin, Upload, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { FormField, FormFieldRow } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  uploadLeaveAttachment,
  validateLeaveAttachmentFile,
} from "@/lib/leave-attachments";
import { createEmployeeLeaveRequest } from "@/lib/leave-requests";
import { getEmployeeLeaveTypesWithBalance } from "@/lib/leave-types";
import { useFormErrors } from "@/hooks/use-form-errors";
import {
  buildFieldErrors,
  hasFieldErrors,
  sanitizePhoneInput,
  validateDateRange,
  validatePhone,
  validateRequired,
  validateSelect,
} from "@/lib/form-validation";
import { toast } from "sonner";
import type { HalfDayPeriod, Holiday, LeaveType } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { formatHalfDayPeriod } from "@/lib/format";

type LeaveBalanceByType = Record<
  string,
  { allocatedLeaves: number; consumedLeaves: number; availableLeaves: number }
>;

type ApplyLeaveField =
  | "leaveTypeId"
  | "startDate"
  | "endDate"
  | "halfDayPeriod"
  | "reason"
  | "emergencyContactNo";

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
  const [emergencyContactNo, setEmergencyContactNo] = useState("");
  const [location, setLocation] = useState("");
  const [attachmentDoc, setAttachmentDoc] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { errors, setFormErrors, clearFieldError } = useFormErrors<ApplyLeaveField>();

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

  const selectedLeaveType = useMemo(
    () => leaveTypes.find((leaveType) => leaveType.id === leaveTypeId),
    [leaveTypeId, leaveTypes]
  );

  const availableLeaveBalance = useMemo(() => {
    if (!selectedLeaveType) {
      return null;
    }

    return (
      leaveBalancesByType[selectedLeaveType.leaveName.trim().toLowerCase()]
        ?.availableLeaves ?? 0
    );
  }, [leaveBalancesByType, selectedLeaveType]);

  const remainingLeaveBalance = useMemo(() => {
    if (availableLeaveBalance === null || requestedLeaveDays === null) {
      return null;
    }

    return Math.max(availableLeaveBalance - requestedLeaveDays, 0);
  }, [availableLeaveBalance, requestedLeaveDays]);

  const exceedsAvailableBalance =
    availableLeaveBalance !== null &&
    requestedLeaveDays !== null &&
    requestedLeaveDays > availableLeaveBalance;

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

  const handleAttachmentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError = validateLeaveAttachmentFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSelectedAttachment(file);
    setAttachmentDoc("");
  };

  const handleRemoveAttachment = () => {
    setSelectedAttachment(null);
    setAttachmentDoc("");
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location detection is not supported in this browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setIsDetectingLocation(false);
        toast.success("Current location added");
      },
      (error) => {
        setIsDetectingLocation(false);
        toast.error(error.message || "Unable to detect location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
      }
    );
  };

  const resolveAttachmentDoc = async (): Promise<string | undefined> => {
    if (attachmentDoc.trim()) {
      return attachmentDoc.trim();
    }

    if (!selectedAttachment) {
      return undefined;
    }

    setIsUploadingAttachment(true);
    try {
      const uploadedUrl = await uploadLeaveAttachment(selectedAttachment);
      setAttachmentDoc(uploadedUrl);
      return uploadedUrl;
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const endDateError =
      validateRequired(endDate, "Please select an end date") ??
      validateDateRange(startDate, endDate);

    const nextErrors = buildFieldErrors<ApplyLeaveField>([
      {
        field: "leaveTypeId",
        error: validateSelect(leaveTypeId, "Please select a leave type"),
      },
      {
        field: "startDate",
        error: validateRequired(startDate, "Please select a start date"),
      },
      { field: "endDate", error: endDateError },
      {
        field: "halfDayPeriod",
        error:
          halfDay && !halfDayPeriod
            ? "Please select first half or second half"
            : null,
      },
      {
        field: "reason",
        error: validateRequired(reason, "Please provide a reason for leave"),
      },
      {
        field: "emergencyContactNo",
        error: validatePhone(emergencyContactNo, "emergency contact number"),
      },
    ]);

    setFormErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    if (requestedLeaveDays === null || requestedLeaveDays <= 0) {
      toast.error("Selected dates do not include any applicable leave days");
      return;
    }

    if (exceedsAvailableBalance) {
      toast.error("Requested leave days exceed your available balance");
      return;
    }

    setIsSubmitting(true);
    try {
      const resolvedAttachmentDoc = await resolveAttachmentDoc();

      await createEmployeeLeaveRequest({
        leaveType: leaveTypeId,
        startDate,
        endDate: halfDay ? startDate : endDate,
        halfDay,
        halfDayPeriod: halfDay ? halfDayPeriod : undefined,
        reason,
        emergencyContactNo,
        location: location.trim() || undefined,
        attachmentDoc: resolvedAttachmentDoc,
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
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <FormField
                label="Leave Type"
                htmlFor="leaveType"
                required
                error={errors.leaveTypeId}
              >
                <Select
                  value={leaveTypeId}
                  onValueChange={(value) => {
                    setLeaveTypeId(value);
                    clearFieldError("leaveTypeId");
                  }}
                  disabled={isLoading || isSubmitting}
                >
                  <SelectTrigger id="leaveType" className="w-full">
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
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Start Date"
                  htmlFor="startDate"
                  required
                  error={errors.startDate}
                >
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      handleStartDateChange(e.target.value);
                      clearFieldError("startDate");
                      clearFieldError("endDate");
                    }}
                    disabled={isLoading || isSubmitting}
                  />
                </FormField>
                <FormField
                  label="End Date"
                  htmlFor="endDate"
                  required
                  error={errors.endDate}
                >
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      clearFieldError("endDate");
                    }}
                    disabled={isLoading || isSubmitting || halfDay}
                    min={startDate || undefined}
                  />
                </FormField>
              </div>

              <FormFieldRow
                label="Half Day"
                description="Apply for half day leave"
              >
                <Switch
                  checked={halfDay}
                  onCheckedChange={handleHalfDayChange}
                  disabled={isLoading || isSubmitting}
                />
              </FormFieldRow>

              {halfDay && (
                <FormField
                  label="Half Day Period"
                  description="Choose whether the leave applies to the first or second half of the day."
                  className="rounded-lg border p-4"
                  error={errors.halfDayPeriod}
                >
                  <RadioGroup
                    value={halfDayPeriod}
                    onValueChange={(value) => {
                      setHalfDayPeriod(value as HalfDayPeriod);
                      clearFieldError("halfDayPeriod");
                    }}
                    disabled={isLoading || isSubmitting}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <label
                      htmlFor="first-half"
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-3",
                        halfDayPeriod === "FIRST_HALF" && "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem value="FIRST_HALF" id="first-half" />
                      <span className="text-sm font-normal">First Half</span>
                    </label>
                    <label
                      htmlFor="second-half"
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-3",
                        halfDayPeriod === "SECOND_HALF" && "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem value="SECOND_HALF" id="second-half" />
                      <span className="text-sm font-normal">Second Half</span>
                    </label>
                  </RadioGroup>
                </FormField>
              )}

              {requestedLeaveDays !== null && (
                <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      Leave days applying for:{" "}
                      <span className="text-primary">
                        {formatLeaveDayCount(requestedLeaveDays)}
                      </span>
                    </p>
                    {halfDay && (
                      <span className="rounded-full bg-background px-2 py-1 text-xs text-muted-foreground">
                        {formatHalfDayPeriod(halfDayPeriod)}
                      </span>
                    )}
                  </div>

                  {availableLeaveBalance !== null && (
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <div className="rounded-md border bg-background p-2">
                        <p className="text-xs text-muted-foreground">Available balance</p>
                        <p className="font-medium">
                          {formatLeaveDayCount(availableLeaveBalance)}
                        </p>
                      </div>
                      <div className="rounded-md border bg-background p-2">
                        <p className="text-xs text-muted-foreground">Balance after request</p>
                        <p
                          className={cn(
                            "font-medium",
                            exceedsAvailableBalance && "text-destructive"
                          )}
                        >
                          {remainingLeaveBalance !== null
                            ? formatLeaveDayCount(remainingLeaveBalance)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  )}

                  {requestedLeaveDays === 0 && (
                    <p className="text-xs text-destructive">
                      No applicable leave days in the selected range after excluding
                      holidays.
                    </p>
                  )}

                  {exceedsAvailableBalance && (
                    <p className="text-xs text-destructive">
                      Requested leave days exceed your available balance for this leave
                      type.
                    </p>
                  )}
                </div>
              )}

              <FormField
                label="Reason"
                htmlFor="reason"
                required
                error={errors.reason}
              >
                <Textarea
                  id="reason"
                  placeholder="Provide reason for leave..."
                  rows={4}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    clearFieldError("reason");
                  }}
                  disabled={isLoading || isSubmitting}
                />
              </FormField>

              <FormField
                label="Emergency Contact Number"
                htmlFor="emergencyContactNo"
                required
                error={errors.emergencyContactNo}
              >
                <Input
                  id="emergencyContactNo"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter emergency contact number"
                  value={emergencyContactNo}
                  onChange={(e) => {
                    setEmergencyContactNo(sanitizePhoneInput(e.target.value));
                    clearFieldError("emergencyContactNo");
                  }}
                  disabled={isLoading || isSubmitting}
                />
              </FormField>

              <FormField
                label="Location During Leave"
                htmlFor="location"
                description="Optional. Share where you can be reached during leave."
              >
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="City, address, or coordinates"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isLoading || isSubmitting || isDetectingLocation}
                    className="min-w-0 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={handleDetectLocation}
                    disabled={isLoading || isSubmitting || isDetectingLocation}
                    aria-label="Detect current location"
                  >
                    {isDetectingLocation ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MapPin className="size-4" />
                    )}
                  </Button>
                </div>
              </FormField>

              <FormField
                label="Supporting Document"
                htmlFor="attachment"
                description="Optional. PDF, JPG, PNG, or WEBP up to 5 MB."
              >
                <input
                  ref={fileInputRef}
                  id="attachment"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAttachmentSelect}
                  disabled={isLoading || isSubmitting || isUploadingAttachment}
                />
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || isSubmitting || isUploadingAttachment}
                    >
                      {isUploadingAttachment ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 size-4" />
                      )}
                      {isUploadingAttachment ? "Uploading..." : "Choose File"}
                    </Button>
                    {(selectedAttachment || attachmentDoc) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAttachment}
                        disabled={isLoading || isSubmitting || isUploadingAttachment}
                      >
                        <X className="mr-2 size-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  {selectedAttachment && (
                    <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3 text-sm">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{selectedAttachment.name}</span>
                    </div>
                  )}
                  {!selectedAttachment && attachmentDoc && (
                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                      <a
                        href={attachmentDoc}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        View uploaded attachment
                      </a>
                    </div>
                  )}
                </div>
              </FormField>

              <div className="pt-1">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={
                    isLoading ||
                    isSubmitting ||
                    isUploadingAttachment ||
                    exceedsAvailableBalance ||
                    requestedLeaveDays === 0
                  }
                >
                  {isSubmitting ? "Submitting..." : "Submit Leave Request"}
                </Button>
              </div>
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
