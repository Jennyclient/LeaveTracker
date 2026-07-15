"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Pencil,
  RefreshCw,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { FormField } from "@/components/shared/form-field";
import { PayrollStatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormErrors } from "@/hooks/use-form-errors";
import {
  buildFieldErrors,
  hasFieldErrors,
  validateRequired,
} from "@/lib/form-validation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  actionAdminPayrollEntry,
  editAdminPayrollEntry,
  formatCurrency,
  formatPayrollMonthLabel,
  generateAdminPayroll,
  getAdminPayroll,
  getCurrentPayrollMonth,
} from "@/lib/payroll";
import type {
  PayrollEntry,
  PayrollEntryAction,
  PayrollStatusFilter,
  PayrollSummary,
} from "@/types";

function emptySummary(): PayrollSummary {
  return {
    totalGrossSalary: 0,
    totalDeduction: 0,
    totalBonus: 0,
    netDisbursement: 0,
    draftCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  };
}

export default function AdminPayrollPage() {
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [summary, setSummary] = useState<PayrollSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [monthYear, setMonthYear] = useState(getCurrentPayrollMonth());
  const [statusFilter, setStatusFilter] = useState<PayrollStatusFilter>("ALL");
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PayrollEntry | null>(null);
  const [grossSalary, setGrossSalary] = useState("");
  const [deduction, setDeduction] = useState("");
  const [bonus, setBonus] = useState("");
  const [rejectTarget, setRejectTarget] = useState<PayrollEntry | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { errors, setFormErrors, clearFieldError, clearAllErrors } =
    useFormErrors<"rejectionReason">();

  const loadPayroll = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAdminPayroll({
        monthYear,
        status: statusFilter,
      });
      setEntries(result.entries);
      setSummary(result.summary);
      setSelectedEntry((current) => {
        if (!current) return null;
        return (
          result.entries.find(
            (entry) => entry.employeeId === current.employeeId
          ) ?? null
        );
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load payroll";
      toast.error(message);
      setEntries([]);
      setSummary(emptySummary());
    } finally {
      setIsLoading(false);
    }
  }, [monthYear, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPayroll();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadPayroll]);

  const handleGenerateMonthly = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAdminPayroll(monthYear);
      toast.success(result.message ?? "Payroll generated");
      await loadPayroll();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate payroll";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const openEditDialog = (entry: PayrollEntry) => {
    setEditTarget(entry);
    setGrossSalary(String(entry.grossSalary));
    setDeduction(String(entry.deduction));
    setBonus(String(entry.bonus));
    setEditOpen(true);
  };

  const handleEditEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTarget) return;

    const parsedGross = Number(grossSalary);
    const parsedDeduction = Number(deduction);
    const parsedBonus = Number(bonus);

    if (
      Number.isNaN(parsedGross) ||
      Number.isNaN(parsedDeduction) ||
      Number.isNaN(parsedBonus)
    ) {
      toast.error("Enter valid numeric amounts");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await editAdminPayrollEntry(
        monthYear,
        editTarget.employeeId,
        {
          grossSalary: parsedGross,
          deduction: parsedDeduction,
          bonus: parsedBonus,
        }
      );
      toast.success("Payroll entry updated");
      setEditOpen(false);
      setEditTarget(null);
      if (updated) setSelectedEntry(updated);
      await loadPayroll();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update payroll entry";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusAction = async (
    entry: PayrollEntry,
    action: PayrollEntryAction,
    reason?: string
  ) => {
    if (action === "REJECT" && !reason?.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const updated = await actionAdminPayrollEntry(
        monthYear,
        entry.employeeId,
        { action, reason }
      );
      toast.success(
        action === "APPROVE"
          ? `Payroll approved for ${entry.employeeName}`
          : `Payroll rejected for ${entry.employeeName}`
      );
      if (updated) setSelectedEntry(updated);
      setRejectTarget(null);
      setRejectionReason("");
      clearAllErrors();
      await loadPayroll();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update payroll entry status";
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmReject = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!rejectTarget) return;

    const nextErrors = buildFieldErrors<"rejectionReason">([
      {
        field: "rejectionReason",
        error: validateRequired(
          rejectionReason,
          "Please provide a rejection reason"
        ),
      },
    ]);

    setFormErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) return;

    await handleStatusAction(rejectTarget, "REJECT", rejectionReason);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary & Payroll"
        description="Generate monthly payroll, adjust draft amounts, and approve or reject employee entries"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => void loadPayroll()}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
            <Button
              onClick={() => void handleGenerateMonthly()}
              disabled={isGenerating || isLoading}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Wallet className="mr-2 size-4" />
              )}
              Generate Month
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gross Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.totalGrossSalary)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.totalDeduction)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.totalBonus)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Disbursement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.netDisbursement)}
            </p>
            <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              <p>Draft: {summary.draftCount}</p>
              <p>Approved: {summary.approvedCount}</p>
              <p>Rejected: {summary.rejectedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Payroll Records</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatPayrollMonthLabel(monthYear)}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Payroll Month" htmlFor="monthYear">
                <Input
                  id="monthYear"
                  type="month"
                  value={monthYear}
                  onChange={(event) => setMonthYear(event.target.value)}
                />
              </FormField>
              <FormField label="Status">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as PayrollStatusFilter)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Deduction</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableEmptyRow
                    colSpan={7}
                    message="No payroll records found for this month"
                  />
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.employeeId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.employeeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.employeeId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(entry.grossSalary)}</TableCell>
                      <TableCell>{formatCurrency(entry.deduction)}</TableCell>
                      <TableCell>{formatCurrency(entry.bonus)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(entry.netSalary)}
                      </TableCell>
                      <TableCell>
                        <PayrollStatusBadge status={entry.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSelectedEntry(entry)}
                            aria-label={`View ${entry.employeeName} payroll`}
                          >
                            <Wallet className="size-4" />
                          </Button>
                          {entry.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEditDialog(entry)}
                              aria-label={`Edit ${entry.employeeName} payroll`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={selectedEntry !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEntry.employeeName}</DialogTitle>
                <DialogDescription>
                  {formatPayrollMonthLabel(selectedEntry.monthYear)} payroll
                  entry
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <PayrollStatusBadge status={selectedEntry.status} />
                  <p className="text-sm text-muted-foreground">
                    {selectedEntry.employeeId}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="mb-3 text-sm font-medium">Compensation</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Salary</span>
                      <span>{formatCurrency(selectedEntry.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deduction</span>
                      <span>{formatCurrency(selectedEntry.deduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus</span>
                      <span>{formatCurrency(selectedEntry.bonus)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>Net Salary</span>
                      <span>{formatCurrency(selectedEntry.netSalary)}</span>
                    </div>
                  </div>
                </div>

                {selectedEntry.reason?.trim() && (
                  <div className="rounded-lg border p-4 text-sm">
                    <p className="mb-1 font-medium">Reason</p>
                    <p className="text-muted-foreground">{selectedEntry.reason}</p>
                  </div>
                )}

                {selectedEntry.status === "draft" && (
                  <DialogFooter className="sm:justify-start">
                    <Button
                      onClick={() =>
                        void handleStatusAction(selectedEntry, "APPROVE")
                      }
                      disabled={isUpdatingStatus}
                    >
                      <CheckCircle2 className="mr-2 size-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRejectTarget(selectedEntry);
                        setRejectionReason("");
                        clearAllErrors();
                      }}
                      disabled={isUpdatingStatus}
                    >
                      <XCircle className="mr-2 size-4" />
                      Reject
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => openEditDialog(selectedEntry)}
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit Amounts
                    </Button>
                  </DialogFooter>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payroll Entry</DialogTitle>
            <DialogDescription>
              Update draft amounts for{" "}
              <span className="font-medium text-foreground">
                {editTarget?.employeeName}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void handleEditEntry(event)}
            className="space-y-5"
            noValidate
          >
            <FormField label="Gross Salary" htmlFor="grossSalary" required>
              <Input
                id="grossSalary"
                type="number"
                min="0"
                step="0.01"
                value={grossSalary}
                onChange={(event) => setGrossSalary(event.target.value)}
              />
            </FormField>
            <FormField label="Deduction" htmlFor="deduction" required>
              <Input
                id="deduction"
                type="number"
                min="0"
                step="0.01"
                value={deduction}
                onChange={(event) => setDeduction(event.target.value)}
              />
            </FormField>
            <FormField label="Bonus" htmlFor="bonus" required>
              <Input
                id="bonus"
                type="number"
                min="0"
                step="0.01"
                value={bonus}
                onChange={(event) => setBonus(event.target.value)}
              />
            </FormField>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isUpdatingStatus) {
            setRejectTarget(null);
            setRejectionReason("");
            clearAllErrors();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Payroll Entry</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting{" "}
              <span className="font-medium text-foreground">
                {rejectTarget?.employeeName}
              </span>
              &apos;s payroll entry.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void handleConfirmReject(event)}
            className="space-y-5"
            noValidate
          >
            <FormField
              label="Reason"
              htmlFor="rejectionReason"
              required
              error={errors.rejectionReason}
            >
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) => {
                  setRejectionReason(event.target.value);
                  clearFieldError("rejectionReason");
                }}
                placeholder="e.g. Incorrect leave deduction — please recalculate LOP days."
                rows={4}
              />
            </FormField>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectTarget(null)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? "Rejecting..." : "Reject Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
