"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { FormField } from "@/components/shared/form-field";
import { DisbursementStatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormErrors } from "@/hooks/use-form-errors";
import {
  buildFieldErrors,
  hasFieldErrors,
  validateRequired,
  validateSelect,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEmployees } from "@/lib/employees";
import { formatDate } from "@/lib/format";
import {
  createAdminPayslip,
  deleteAdminPayslip,
  formatCurrency,
  formatPayrollMonthLabel,
  generateAdminMonthlyPayslips,
  getAdminPayslips,
  getCurrentPayrollMonth,
  updateAdminPayslipStatus,
} from "@/lib/payroll";
import type { Employee, PayrollDisbursementStatus, Payslip } from "@/types";

type CreatePayslipField = "createEmployeeId" | "createMonth";

export default function AdminPayrollPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(getCurrentPayrollMonth());
  const [statusFilter, setStatusFilter] = useState<"all" | PayrollDisbursementStatus>(
    "all"
  );
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Payslip | null>(null);
  const [createEmployeeId, setCreateEmployeeId] = useState("");
  const [createMonth, setCreateMonth] = useState(getCurrentPayrollMonth());
  const { errors, setFormErrors, clearFieldError, clearAllErrors } =
    useFormErrors<CreatePayslipField>();

  const loadPayslips = useCallback(async () => {
    setIsLoading(true);
    try {
      const [records, employeeList] = await Promise.all([
        getAdminPayslips({
          payrollMonth,
          disbursementStatus:
            statusFilter === "all" ? undefined : statusFilter,
        }),
        getEmployees(),
      ]);
      setPayslips(records);
      setEmployees(employeeList);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load payroll records";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [payrollMonth, statusFilter]);

  useEffect(() => {
    void loadPayslips();
  }, [loadPayslips]);

  const summary = useMemo(() => {
    return payslips.reduce(
      (acc, payslip) => {
        acc.gross += payslip.earnings.grossPay;
        acc.deductions += payslip.deductions.totalDeductions;
        acc.net += payslip.netPay;
        acc[payslip.disbursementStatus] += 1;
        return acc;
      },
      {
        gross: 0,
        deductions: 0,
        net: 0,
        pending: 0,
        approved: 0,
        disbursed: 0,
      }
    );
  }, [payslips]);

  const handleGenerateMonthly = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAdminMonthlyPayslips(payrollMonth);
      toast.success(result.message ?? "Monthly payslips generated");
      await loadPayslips();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate payslips";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePayslip = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = buildFieldErrors<CreatePayslipField>([
      {
        field: "createEmployeeId",
        error: validateSelect(createEmployeeId, "Please select an employee"),
      },
      {
        field: "createMonth",
        error: validateRequired(createMonth, "Payroll month is required"),
      },
    ]);

    setFormErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    setIsCreating(true);
    try {
      await createAdminPayslip({
        employeeUserId: createEmployeeId,
        payrollMonth: createMonth,
      });
      toast.success("Payslip created");
      setCreateOpen(false);
      setCreateEmployeeId("");
      await loadPayslips();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create payslip";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusAction = async (
    payslip: Payslip,
    action: "APPROVE" | "DISBURSE" | "REVERT"
  ) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateAdminPayslipStatus(payslip.id, action);
      toast.success(`Payslip marked as ${updated.disbursementStatus}`);
      setSelectedPayslip(updated);
      await loadPayslips();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update payslip status";
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAdminPayslip(deleteTarget.id);
      toast.success("Payslip deleted");
      if (selectedPayslip?.id === deleteTarget.id) {
        setSelectedPayslip(null);
      }
      setDeleteTarget(null);
      await loadPayslips();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete payslip";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary & Payroll"
        description="Maintain payroll records, review compensation breakdowns, and manage disbursement approvals"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => void loadPayslips()}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleGenerateMonthly()}
              disabled={isGenerating || isLoading}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              Generate Month
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" />
              Create Payslip
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
            <p className="text-2xl font-semibold">{formatCurrency(summary.gross)}</p>
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
              {formatCurrency(summary.deductions)}
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
            <p className="text-2xl font-semibold">{formatCurrency(summary.net)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Mix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Pending: {summary.pending}</p>
            <p>Approved: {summary.approved}</p>
            <p>Disbursed: {summary.disbursed}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Payroll Records</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatPayrollMonthLabel(payrollMonth)}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Payroll Month" htmlFor="payrollMonth">
                <Input
                  id="payrollMonth"
                  type="month"
                  value={payrollMonth}
                  onChange={(event) => setPayrollMonth(event.target.value)}
                />
              </FormField>
              <FormField label="Status">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as "all" | PayrollDisbursementStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="disbursed">Disbursed</SelectItem>
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
                  <TableHead>Month</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.length === 0 ? (
                  <TableEmptyRow colSpan={7} message="No payroll records found" />
                ) : (
                  payslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payslip.employeeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {payslip.employeeId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatPayrollMonthLabel(payslip.payrollMonth)}</TableCell>
                      <TableCell>{formatCurrency(payslip.earnings.grossPay)}</TableCell>
                      <TableCell>
                        {formatCurrency(payslip.deductions.totalDeductions)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payslip.netPay)}
                      </TableCell>
                      <TableCell>
                        <DisbursementStatusBadge status={payslip.disbursementStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSelectedPayslip(payslip)}
                            aria-label={`View ${payslip.employeeName} payslip`}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {payslip.disbursementStatus !== "disbursed" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(payslip)}
                              aria-label={`Delete ${payslip.employeeName} payslip`}
                            >
                              <Trash2 className="size-4" />
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

      <Sheet
        open={selectedPayslip !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPayslip(null);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selectedPayslip && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedPayslip.employeeName}</SheetTitle>
                <SheetDescription>
                  {formatPayrollMonthLabel(selectedPayslip.payrollMonth)} payroll
                  breakdown
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5 px-1">
                <div className="flex items-center justify-between">
                  <DisbursementStatusBadge status={selectedPayslip.disbursementStatus} />
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedPayslip.periodStart)} -{" "}
                    {formatDate(selectedPayslip.periodEnd)}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="mb-3 text-sm font-medium">Earnings</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Basic Salary</span>
                      <span>{formatCurrency(selectedPayslip.earnings.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HRA</span>
                      <span>{formatCurrency(selectedPayslip.earnings.hra)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Special Allowance</span>
                      <span>
                        {formatCurrency(selectedPayslip.earnings.specialAllowance)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>Gross Pay</span>
                      <span>{formatCurrency(selectedPayslip.earnings.grossPay)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="mb-3 text-sm font-medium">Deductions</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Provident Fund</span>
                      <span>
                        {formatCurrency(selectedPayslip.deductions.providentFund)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional Tax</span>
                      <span>
                        {formatCurrency(selectedPayslip.deductions.professionalTax)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>Total Deductions</span>
                      <span>
                        {formatCurrency(selectedPayslip.deductions.totalDeductions)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="size-4 text-primary" />
                      <span className="font-medium">Net Pay</span>
                    </div>
                    <span className="text-lg font-semibold text-primary">
                      {formatCurrency(selectedPayslip.netPay)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedPayslip.disbursementStatus === "pending" && (
                    <Button
                      onClick={() => void handleStatusAction(selectedPayslip, "APPROVE")}
                      disabled={isUpdatingStatus}
                    >
                      <CheckCircle2 className="mr-2 size-4" />
                      Approve
                    </Button>
                  )}
                  {selectedPayslip.disbursementStatus === "approved" && (
                    <Button
                      onClick={() => void handleStatusAction(selectedPayslip, "DISBURSE")}
                      disabled={isUpdatingStatus}
                    >
                      <Wallet className="mr-2 size-4" />
                      Mark Disbursed
                    </Button>
                  )}
                  {selectedPayslip.disbursementStatus !== "disbursed" && (
                    <Button
                      variant="outline"
                      onClick={() => void handleStatusAction(selectedPayslip, "REVERT")}
                      disabled={isUpdatingStatus}
                    >
                      Revert to Pending
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) {
          clearAllErrors();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payslip</DialogTitle>
            <DialogDescription>
              Generate a payroll record from the employee&apos;s assigned salary structure.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => void handleCreatePayslip(event)}
            className="space-y-5"
            noValidate
          >
            <FormField
              label="Employee"
              htmlFor="createEmployee"
              required
              error={errors.createEmployeeId}
            >
              <Select
                value={createEmployeeId}
                onValueChange={(value) => {
                  setCreateEmployeeId(value);
                  clearFieldError("createEmployeeId");
                }}
              >
                <SelectTrigger id="createEmployee" className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              label="Payroll Month"
              htmlFor="createMonth"
              required
              error={errors.createMonth}
            >
              <Input
                id="createMonth"
                type="month"
                value={createMonth}
                onChange={(event) => {
                  setCreateMonth(event.target.value);
                  clearFieldError("createMonth");
                }}
              />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Payslip"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Payslip</DialogTitle>
            <DialogDescription>
              This will permanently delete the payroll record for{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.employeeName}
              </span>{" "}
              ({deleteTarget ? formatPayrollMonthLabel(deleteTarget.payrollMonth) : ""}).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Payslip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
