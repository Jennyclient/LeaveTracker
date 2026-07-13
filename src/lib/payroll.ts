import API from "@/lib/api";
import type {
  PayrollDisbursementStatus,
  PayrollPayslipAction,
  PayrollType,
  Payslip,
} from "@/types";

type ApiPayrollType = "MONTHLY" | "WEEKLY";
type ApiPayrollDisbursementStatus = "PENDING" | "APPROVED" | "DISBURSED";

interface ApiPayslipEarnings {
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  grossPay: number;
}

interface ApiPayslipDeductions {
  providentFund: number;
  professionalTax: number;
  totalDeductions: number;
}

interface ApiPayslip {
  id: string;
  employeeId: string;
  employeeUserId: string;
  employeeName: string;
  payrollMonth: string;
  periodStart: string;
  periodEnd: string;
  earnings: ApiPayslipEarnings;
  deductions: ApiPayslipDeductions;
  netPay: number;
  annualCtc?: number;
  payrollType: ApiPayrollType;
  disbursementStatus: ApiPayrollDisbursementStatus;
  notes?: string | null;
  approvedAt?: string | null;
  disbursedAt?: string | null;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PayslipsResponse {
  success: boolean;
  message?: string;
  count?: number;
  payslips?: ApiPayslip[];
}

interface PayslipResponse {
  success: boolean;
  message?: string;
  payslip?: ApiPayslip;
}

interface GeneratePayslipsResponse {
  success: boolean;
  message?: string;
  created?: number;
  skipped?: Array<{ employeeId: string; reason: string }>;
}

export interface AdminPayslipFilters {
  payrollMonth?: string;
  disbursementStatus?: PayrollDisbursementStatus;
  employeeId?: string;
}

function mapPayrollType(type: ApiPayrollType): PayrollType {
  return type.toLowerCase() as PayrollType;
}

function mapDisbursementStatus(
  status: ApiPayrollDisbursementStatus
): PayrollDisbursementStatus {
  return status.toLowerCase() as PayrollDisbursementStatus;
}

function toApiDisbursementStatus(
  status: PayrollDisbursementStatus
): ApiPayrollDisbursementStatus {
  return status.toUpperCase() as ApiPayrollDisbursementStatus;
}

function mapApiPayslip(api: ApiPayslip): Payslip {
  return {
    id: api.id,
    employeeId: api.employeeId,
    employeeUserId: api.employeeUserId,
    employeeName: api.employeeName,
    payrollMonth: api.payrollMonth,
    periodStart: api.periodStart,
    periodEnd: api.periodEnd,
    earnings: api.earnings,
    deductions: api.deductions,
    netPay: api.netPay,
    annualCtc: api.annualCtc,
    payrollType: mapPayrollType(api.payrollType),
    disbursementStatus: mapDisbursementStatus(api.disbursementStatus),
    notes: api.notes,
    approvedAt: api.approvedAt,
    disbursedAt: api.disbursedAt,
    isPublished: api.isPublished,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export async function getAdminPayslips(
  filters?: AdminPayslipFilters
): Promise<Payslip[]> {
  const params: Record<string, string> = {};

  if (filters?.payrollMonth) {
    params.payrollMonth = filters.payrollMonth;
  }
  if (filters?.employeeId) {
    params.employeeId = filters.employeeId;
  }
  if (filters?.disbursementStatus) {
    params.disbursementStatus = toApiDisbursementStatus(filters.disbursementStatus);
  }

  const { data } = await API.get<PayslipsResponse>("/admin/payroll/payslips", {
    params,
  });

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch payroll records");
  }

  return (data.payslips ?? []).map(mapApiPayslip);
}

export async function createAdminPayslip(input: {
  employeeUserId: string;
  payrollMonth: string;
  notes?: string;
}): Promise<Payslip> {
  const { data } = await API.post<PayslipResponse>("/admin/payroll/payslips", input);

  if (!data.success || !data.payslip) {
    throw new Error(data.message ?? "Failed to create payslip");
  }

  return mapApiPayslip(data.payslip);
}

export async function generateAdminMonthlyPayslips(
  payrollMonth: string
): Promise<GeneratePayslipsResponse> {
  const { data } = await API.post<GeneratePayslipsResponse>(
    "/admin/payroll/payslips/generate",
    { payrollMonth }
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to generate monthly payslips");
  }

  return data;
}

export async function updateAdminPayslipStatus(
  payslipId: string,
  action: PayrollPayslipAction
): Promise<Payslip> {
  const { data } = await API.put<PayslipResponse>(
    `/admin/payroll/payslips/${payslipId}/status`,
    { action }
  );

  if (!data.success || !data.payslip) {
    throw new Error(data.message ?? "Failed to update payslip status");
  }

  return mapApiPayslip(data.payslip);
}

export async function deleteAdminPayslip(payslipId: string): Promise<void> {
  const { data } = await API.delete<{ success: boolean; message?: string }>(
    `/admin/payroll/payslips/${payslipId}`
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to delete payslip");
  }
}

export async function getEmployeePayslips(): Promise<Payslip[]> {
  const { data } = await API.get<PayslipsResponse>("/employee/payslips");

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch payslips");
  }

  return (data.payslips ?? []).map(mapApiPayslip);
}

export async function downloadEmployeePayslip(payslip: Payslip): Promise<void> {
  const response = await API.get<Blob>(`/employee/payslips/${payslip.id}/download`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `payslip-${payslip.payrollMonth}-${payslip.employeeId}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatPayrollMonthLabel(payrollMonth: string): string {
  const [year, month] = payrollMonth.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatCurrency(amount?: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

export function getCurrentPayrollMonth(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
