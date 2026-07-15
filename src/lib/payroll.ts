import API from "@/lib/api";
import type {
  PayrollEntry,
  PayrollEntryAction,
  PayrollEntryStatus,
  PayrollResult,
  PayrollStatusFilter,
  PayrollSummary,
} from "@/types";

type ApiPayrollEntryStatus = "DRAFT" | "APPROVED" | "REJECTED";

interface ApiPayrollEntry {
  employeeId?: string;
  employeeName?: string;
  name?: string;
  monthYear?: string;
  grossSalary?: number;
  deduction?: number;
  bonus?: number;
  netSalary?: number;
  netPay?: number;
  status?: ApiPayrollEntryStatus;
  reason?: string | null;
  actionReason?: string | null;
}

interface ApiPayrollSummary {
  totalGrossSalary?: number;
  totalDeduction?: number;
  totalBonus?: number;
  netDisbursement?: number;
  draftCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
}

interface AdminPayrollResponse {
  success: boolean;
  message?: string;
  monthYear?: string;
  employeeSalary?: ApiPayrollEntry[];
  employeeSalaries?: ApiPayrollEntry[];
  entries?: ApiPayrollEntry[];
  payroll?: {
    monthYear?: string;
    employeeSalary?: ApiPayrollEntry[];
    employeeSalaries?: ApiPayrollEntry[];
    entries?: ApiPayrollEntry[];
    summary?: ApiPayrollSummary;
  };
  summary?: ApiPayrollSummary;
  data?: {
    monthYear?: string;
    employeeSalary?: ApiPayrollEntry[];
    employeeSalaries?: ApiPayrollEntry[];
    entries?: ApiPayrollEntry[];
    summary?: ApiPayrollSummary;
  };
}

interface GeneratePayrollResponse {
  success: boolean;
  message?: string;
}

interface MutatePayrollEntryResponse {
  success: boolean;
  message?: string;
  employeeSalary?: ApiPayrollEntry;
  entry?: ApiPayrollEntry;
  data?: ApiPayrollEntry;
}

interface EmployeePayrollResponse {
  success: boolean;
  message?: string;
  employeeSalary?: ApiPayrollEntry;
  payroll?: ApiPayrollEntry | { employeeSalary?: ApiPayrollEntry };
  data?: ApiPayrollEntry | { employeeSalary?: ApiPayrollEntry };
}

export interface EditPayrollEntryInput {
  grossSalary?: number;
  deduction?: number;
  bonus?: number;
}

function mapEntryStatus(status?: ApiPayrollEntryStatus): PayrollEntryStatus {
  switch (status) {
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "DRAFT":
    default:
      return "draft";
  }
}

function computeNetSalary(
  grossSalary: number,
  deduction: number,
  bonus: number
): number {
  return grossSalary - deduction + bonus;
}

function mapApiPayrollEntry(
  api: ApiPayrollEntry,
  monthYear: string
): PayrollEntry {
  const grossSalary = Number(api.grossSalary ?? 0);
  const deduction = Number(api.deduction ?? 0);
  const bonus = Number(api.bonus ?? 0);
  const netSalary = Number(
    api.netSalary ?? api.netPay ?? computeNetSalary(grossSalary, deduction, bonus)
  );

  return {
    employeeId: api.employeeId ?? "",
    employeeName: api.employeeName ?? api.name ?? api.employeeId ?? "Unknown",
    monthYear: api.monthYear ?? monthYear,
    grossSalary,
    deduction,
    bonus,
    netSalary,
    status: mapEntryStatus(api.status),
    reason: api.reason ?? api.actionReason ?? null,
  };
}

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

function mapApiSummary(
  api: ApiPayrollSummary | undefined,
  entries: PayrollEntry[]
): PayrollSummary {
  if (api) {
    return {
      totalGrossSalary: Number(api.totalGrossSalary ?? 0),
      totalDeduction: Number(api.totalDeduction ?? 0),
      totalBonus: Number(api.totalBonus ?? 0),
      netDisbursement: Number(api.netDisbursement ?? 0),
      draftCount: Number(api.draftCount ?? 0),
      approvedCount: Number(api.approvedCount ?? 0),
      rejectedCount: Number(api.rejectedCount ?? 0),
    };
  }

  return entries.reduce(
    (acc, entry) => {
      acc.totalGrossSalary += entry.grossSalary;
      acc.totalDeduction += entry.deduction;
      acc.totalBonus += entry.bonus;
      acc.netDisbursement += entry.netSalary;
      if (entry.status === "draft") acc.draftCount += 1;
      if (entry.status === "approved") acc.approvedCount += 1;
      if (entry.status === "rejected") acc.rejectedCount += 1;
      return acc;
    },
    emptySummary()
  );
}

function extractAdminPayrollPayload(data: AdminPayrollResponse) {
  const nested = data.payroll ?? data.data;
  const monthYear = data.monthYear ?? nested?.monthYear ?? "";
  const entries =
    data.employeeSalary ??
    data.employeeSalaries ??
    data.entries ??
    nested?.employeeSalary ??
    nested?.employeeSalaries ??
    nested?.entries ??
    [];
  const summary = data.summary ?? nested?.summary;

  return { monthYear, entries, summary };
}

export async function generateAdminPayroll(
  monthYear: string
): Promise<GeneratePayrollResponse> {
  const { data } = await API.post<GeneratePayrollResponse>(
    "/admin/payroll/generate",
    { monthYear }
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to generate payroll");
  }

  return data;
}

export async function getAdminPayroll(filters: {
  monthYear: string;
  status?: PayrollStatusFilter;
}): Promise<PayrollResult> {
  const { data } = await API.get<AdminPayrollResponse>("/admin/payroll", {
    params: {
      monthYear: filters.monthYear,
      status: filters.status ?? "ALL",
    },
  });

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch payroll");
  }

  const payload = extractAdminPayrollPayload(data);
  const monthYear = payload.monthYear || filters.monthYear;
  const entries = payload.entries.map((entry) =>
    mapApiPayrollEntry(entry, monthYear)
  );

  return {
    monthYear,
    entries,
    summary: mapApiSummary(payload.summary, entries),
  };
}

export async function editAdminPayrollEntry(
  monthYear: string,
  employeeId: string,
  input: EditPayrollEntryInput
): Promise<PayrollEntry | null> {
  const { data } = await API.put<MutatePayrollEntryResponse>(
    `/admin/payroll/${monthYear}/employees/${employeeId}`,
    input
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update payroll entry");
  }

  const entry = data.employeeSalary ?? data.entry ?? data.data;
  return entry ? mapApiPayrollEntry(entry, monthYear) : null;
}

export async function actionAdminPayrollEntry(
  monthYear: string,
  employeeId: string,
  input: { action: PayrollEntryAction; reason?: string }
): Promise<PayrollEntry | null> {
  const payload = {
    action: input.action,
    ...(input.reason?.trim() ? { reason: input.reason.trim() } : {}),
  };

  const { data } = await API.put<MutatePayrollEntryResponse>(
    `/admin/payroll/${monthYear}/employees/${employeeId}/action`,
    payload
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update payroll entry status");
  }

  const entry = data.employeeSalary ?? data.entry ?? data.data;
  return entry ? mapApiPayrollEntry(entry, monthYear) : null;
}

function isWrappedEmployeeEntry(
  value: NonNullable<
    EmployeePayrollResponse["payroll"] | EmployeePayrollResponse["data"]
  >
): value is { employeeSalary?: ApiPayrollEntry } {
  return "employeeSalary" in value;
}

function unwrapEmployeeEntry(
  value: EmployeePayrollResponse["payroll"] | EmployeePayrollResponse["data"]
): ApiPayrollEntry | undefined {
  if (!value) return undefined;
  if (isWrappedEmployeeEntry(value)) {
    return value.employeeSalary;
  }
  return value;
}

export async function getEmployeePayroll(
  monthYear: string
): Promise<PayrollEntry | null> {
  const { data } = await API.get<EmployeePayrollResponse>("/employee/payroll", {
    params: { monthYear },
  });

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch payroll");
  }

  const entry =
    data.employeeSalary ??
    unwrapEmployeeEntry(data.payroll) ??
    unwrapEmployeeEntry(data.data);

  if (!entry) {
    return null;
  }

  return mapApiPayrollEntry(entry, monthYear);
}

export async function downloadEmployeeSalarySlip(
  monthYear: string
): Promise<void> {
  const response = await API.get<Blob>("/employee/payroll/salary-slip", {
    params: { monthYear },
    responseType: "blob",
  });

  const contentType = String(response.headers["content-type"] ?? "");
  const isPdf = contentType.includes("pdf");
  const blob = new Blob([response.data], {
    type: isPdf ? "application/pdf" : contentType || "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `salary-slip-${monthYear}.${isPdf ? "pdf" : "html"}`;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatPayrollMonthLabel(monthYear: string): string {
  const [year, month] = monthYear.split("-").map(Number);
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
