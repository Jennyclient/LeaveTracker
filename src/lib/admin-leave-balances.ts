import API from "@/lib/api";
import { getEmployees } from "@/lib/employees";

interface ApiLeaveRequestSummary {
  id: string;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  status: string;
  reason?: string | null;
}

interface ApiAdminLeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveName?: string | null;
  policyName?: string | null;
  annualQuota?: number | null;
  carryForward?: boolean;
  maxCarryForward?: number;
  allocatedLeaves: number;
  consumedLeaves: number;
  availableLeaves: number;
  leaveRequests?: ApiLeaveRequestSummary[];
}

interface GetAdminLeaveBalancesResponse {
  success: boolean;
  message?: string;
  count?: number;
  employeeId?: string;
  leaveBalances?: ApiAdminLeaveBalance[];
}

export interface AdminLeaveBalanceItem {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveName: string;
  policyName: string;
  annualQuota: number | null;
  carryForward: boolean;
  maxCarryForward: number;
  allocatedLeaves: number;
  consumedLeaves: number;
  availableLeaves: number;
  leaveRequests: ApiLeaveRequestSummary[];
}

export interface AdminLeaveBalanceColumn {
  leaveTypeId: string;
  leaveName: string;
}

export interface AdminLeaveBalanceRow {
  employeeId: string;
  employeeName: string;
  balances: Record<string, AdminLeaveBalanceItem | undefined>;
}

export interface AdminLeaveBalanceTable {
  columns: AdminLeaveBalanceColumn[];
  rows: AdminLeaveBalanceRow[];
}

async function getLeaveBalancesByEndpoint(
  endpoint: string,
  employeeId?: string
): Promise<AdminLeaveBalanceItem[]> {
  const { data } = await API.get<GetAdminLeaveBalancesResponse>(endpoint, {
    params: employeeId ? { employeeId } : undefined,
  });

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch leave balances");
  }

  return (data.leaveBalances ?? []).map(mapApiBalance);
}

function mapApiBalance(item: ApiAdminLeaveBalance): AdminLeaveBalanceItem {
  return {
    id: item.id,
    employeeId: item.employeeId,
    leaveTypeId: item.leaveTypeId,
    leaveName: item.leaveName?.trim() || "—",
    policyName: item.policyName?.trim() || "",
    annualQuota: item.annualQuota ?? null,
    carryForward: item.carryForward ?? false,
    maxCarryForward: item.maxCarryForward ?? 0,
    allocatedLeaves: item.allocatedLeaves ?? 0,
    consumedLeaves: item.consumedLeaves ?? 0,
    availableLeaves: item.availableLeaves ?? 0,
    leaveRequests: item.leaveRequests ?? [],
  };
}

export function buildAdminLeaveBalanceTable(
  balances: AdminLeaveBalanceItem[],
  employeeNames: Record<string, string>
): AdminLeaveBalanceTable {
  const columnMap = new Map<string, AdminLeaveBalanceColumn>();
  const rowMap = new Map<string, AdminLeaveBalanceRow>();

  for (const balance of balances) {
    if (!columnMap.has(balance.leaveTypeId)) {
      columnMap.set(balance.leaveTypeId, {
        leaveTypeId: balance.leaveTypeId,
        leaveName: balance.leaveName,
      });
    }

    if (!rowMap.has(balance.employeeId)) {
      rowMap.set(balance.employeeId, {
        employeeId: balance.employeeId,
        employeeName: employeeNames[balance.employeeId] ?? balance.employeeId,
        balances: {},
      });
    }

    const row = rowMap.get(balance.employeeId)!;
    row.balances[balance.leaveTypeId] = balance;
  }

  const columns = [...columnMap.values()].sort((a, b) =>
    a.leaveName.localeCompare(b.leaveName)
  );

  const rows = [...rowMap.values()].sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName)
  );

  return { columns, rows };
}

export async function getAdminLeaveBalances(
  employeeId?: string
): Promise<AdminLeaveBalanceItem[]> {
  return getLeaveBalancesByEndpoint("/admin/leave-balances", employeeId);
}

export async function getManagerLeaveBalances(
  employeeId?: string
): Promise<AdminLeaveBalanceItem[]> {
  return getLeaveBalancesByEndpoint("/employee/manager/leave-balances", employeeId);
}

export async function loadAdminLeaveBalanceTable(
  employeeId?: string
): Promise<AdminLeaveBalanceTable> {
  const balances = await getAdminLeaveBalances(employeeId);

  let employeeNames: Record<string, string> = {};

  try {
    const employees = await getEmployees();
    employeeNames = Object.fromEntries(
      employees.map((employee) => [employee.employeeId, employee.name])
    );
  } catch {
    // Leave balances can still render with employee IDs if names fail to load.
  }

  return buildAdminLeaveBalanceTable(balances, employeeNames);
}
