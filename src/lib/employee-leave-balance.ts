import API from "@/lib/api";

const LEAVE_TYPE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export interface EmployeeLeaveRequestSummary {
  id: string;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  status: string;
  reason?: string | null;
}

export interface EmployeeLeaveBalanceItem {
  id: string;
  leaveTypeId: string;
  leaveName: string;
  policyName: string;
  annualQuota: number | null;
  carryForward: boolean;
  maxCarryForward: number;
  allocatedLeaves: number;
  consumedLeaves: number;
  availableLeaves: number;
  leaveRequests: EmployeeLeaveRequestSummary[];
  color: string;
}

interface ApiLeaveRequestSummary {
  id: string;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  status: string;
  reason?: string | null;
}

interface ApiEmployeeLeaveBalance {
  id: string;
  employeeId?: string;
  leaveTypeId: string;
  leaveName?: string | null;
  policyName?: string | null;
  annualQuota?: number | null;
  carryForward?: boolean;
  maxCarryForward?: number;
  allocatedLeaves?: number;
  consumedLeaves?: number;
  availableLeaves?: number;
  leaveRequests?: ApiLeaveRequestSummary[];
}

interface GetEmployeeLeaveBalanceResponse {
  success: boolean;
  message?: string;
  count?: number;
  leaveBalances?: ApiEmployeeLeaveBalance[];
}

function getLeaveTypeColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LEAVE_TYPE_COLORS[Math.abs(hash) % LEAVE_TYPE_COLORS.length];
}

function mapApiBalance(item: ApiEmployeeLeaveBalance): EmployeeLeaveBalanceItem {
  const leaveTypeId = item.leaveTypeId ?? item.id;

  return {
    id: item.id,
    leaveTypeId,
    leaveName: item.leaveName?.trim() || "—",
    policyName: item.policyName?.trim() || "",
    annualQuota: item.annualQuota ?? null,
    carryForward: item.carryForward ?? false,
    maxCarryForward: item.maxCarryForward ?? 0,
    allocatedLeaves: item.allocatedLeaves ?? 0,
    consumedLeaves: item.consumedLeaves ?? 0,
    availableLeaves: item.availableLeaves ?? 0,
    leaveRequests: (item.leaveRequests ?? []).map((request) => ({
      id: request.id,
      startDate: request.startDate,
      endDate: request.endDate,
      halfDay: request.halfDay,
      status: request.status,
      reason: request.reason ?? null,
    })),
    color: getLeaveTypeColor(leaveTypeId),
  };
}

export async function getEmployeeLeaveBalance(): Promise<EmployeeLeaveBalanceItem[]> {
  const { data } = await API.get<GetEmployeeLeaveBalanceResponse>(
    "/employee/leave-balances"
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch leave balance");
  }

  return (data.leaveBalances ?? []).map(mapApiBalance);
}
