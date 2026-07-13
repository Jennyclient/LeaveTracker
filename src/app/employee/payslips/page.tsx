"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DisbursementStatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  downloadEmployeePayslip,
  formatCurrency,
  formatPayrollMonthLabel,
  getEmployeePayslips,
} from "@/lib/payroll";
import type { Payslip } from "@/types";

export default function EmployeePayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPayslips() {
      try {
        const records = await getEmployeePayslips();
        if (!cancelled) {
          setPayslips(records);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load payslips";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPayslips();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = async (payslip: Payslip) => {
    setDownloadingId(payslip.id);
    try {
      await downloadEmployeePayslip(payslip);
      toast.success("Payslip downloaded");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to download payslip";
      toast.error(message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payslips"
        description="View and download your approved monthly payslips"
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">Read-only access</p>
            <p className="text-muted-foreground">
              For security, you can only view and download payslips that have been
              approved and published by payroll administration. Editing or uploading
              payroll records is not permitted.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Monthly Payslips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payroll Month</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.length === 0 ? (
                  <TableEmptyRow
                    colSpan={6}
                    message="No published payslips available yet"
                  />
                ) : (
                  payslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell className="font-medium">
                        {formatPayrollMonthLabel(payslip.payrollMonth)}
                      </TableCell>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleDownload(payslip)}
                          disabled={downloadingId === payslip.id}
                        >
                          {downloadingId === payslip.id ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 size-4" />
                          )}
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
