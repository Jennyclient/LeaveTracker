import API from "@/lib/api";

export interface EmployeeLeaveBalanceItem {
  leaveTypeId: string;
  leaveName: string;
  available: number;
}

interface ApiEmployeeLeaveBalance {
  leaveTypeId?: string;
  leaveType?: string | { id?: string; leaveName?: string };
  leaveName?: string;
  available?: number;
  balance?: number;
  remaining?: number;
}

interface GetEmployeeLeaveBalanceResponse {
  success: boolean;
  message?: string;
  balances?: ApiEmployeeLeaveBalance[];
  leaveBalances?: ApiEmployeeLeaveBalance[];
  data?: ApiEmployeeLeaveBalance[];
}

function mapApiBalance(item: ApiEmployeeLeaveBalance): EmployeeLeaveBalanceItem {
  const leaveTypeName =
    typeof item.leaveType === "string"
      ? item.leaveType
      : item.leaveType?.leaveName || item.leaveName || "—";

  const leaveTypeId =
    item.leaveTypeId ??
    (typeof item.leaveType === "object" ? item.leaveType?.id ?? "" : "");

  return {
    leaveTypeId,
    leaveName: leaveTypeName,
    available: item.available ?? item.balance ?? item.remaining ?? 0,
  };
}

export async function getEmployeeLeaveBalance(): Promise<EmployeeLeaveBalanceItem[]> {
  const { data } = await API.get<GetEmployeeLeaveBalanceResponse>(
    "/employee/leave-balance"
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch leave balance");
  }

  const balances = data.balances ?? data.leaveBalances ?? data.data ?? [];
  return balances.map(mapApiBalance);
}
