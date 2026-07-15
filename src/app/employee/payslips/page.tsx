"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { FormField } from "@/components/shared/form-field";
import { PayrollStatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  downloadEmployeeSalarySlip,
  formatCurrency,
  formatPayrollMonthLabel,
  getCurrentPayrollMonth,
  getEmployeePayroll,
} from "@/lib/payroll";
import type { PayrollEntry } from "@/types";

export default function EmployeePayslipsPage() {
  const [monthYear, setMonthYear] = useState(getCurrentPayrollMonth());
  const [entry, setEntry] = useState<PayrollEntry | null>(null);
  const [emptyMessage, setEmptyMessage] = useState(
    "No payroll record available for this month"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadPayroll = useCallback(async () => {
    setIsLoading(true);
    try {
      const record = await getEmployeePayroll(monthYear);
      setEntry(record);
      setEmptyMessage("No payroll record available for this month");
    } catch (error) {
      setEntry(null);
      setEmptyMessage(
        error instanceof Error
          ? error.message
          : "No payroll record available for this month"
      );
    } finally {
      setIsLoading(false);
    }
  }, [monthYear]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPayroll();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadPayroll]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadEmployeeSalarySlip(monthYear);
      toast.success("Salary slip downloaded");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to download salary slip";
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payslips"
        description="View your monthly payroll details and download your salary slip"
        actions={
          <FormField label="Payroll Month" htmlFor="employeeMonthYear">
            <Input
              id="employeeMonthYear"
              type="month"
              value={monthYear}
              onChange={(event) => setMonthYear(event.target.value)}
              className="w-44"
            />
          </FormField>
        }
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">Read-only access</p>
            <p className="text-muted-foreground">
              You can view payroll amounts and download the salary slip for the
              selected month. Editing payroll is managed by administration.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              {formatPayrollMonthLabel(monthYear)}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleDownload()}
              disabled={isDownloading || isLoading || !entry}
            >
              {isDownloading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              Download Salary Slip
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={1} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Deduction</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!entry ? (
                  <TableEmptyRow colSpan={5} message={emptyMessage} />
                ) : (
                  <TableRow>
                    <TableCell>{formatCurrency(entry.grossSalary)}</TableCell>
                    <TableCell>{formatCurrency(entry.deduction)}</TableCell>
                    <TableCell>{formatCurrency(entry.bonus)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(entry.netSalary)}
                    </TableCell>
                    <TableCell>
                      <PayrollStatusBadge status={entry.status} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {entry?.reason?.trim() && (
            <p className="mt-4 text-sm text-muted-foreground">
              Reason: {entry.reason}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
