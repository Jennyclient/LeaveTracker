import API from "@/lib/api";
import type { Holiday, LeaveRequest, LeaveStatus } from "@/types";

export interface LeaveUtilizationItem {
  type: string;
  used: number;
  total: number;
}

export interface MonthlyLeaveTrendItem {
  month: string;
  leaves: number;
  approved: number;
}

interface DashboardApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
  dashboard?: unknown;
}

interface AdminDashboardData {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    onLeave: number;
    pendingRequests: number;
  };
  recentRequests: LeaveRequest[];
  upcomingHolidays: Holiday[];
  leaveUtilization: LeaveUtilizationItem[];
  monthlyLeaveTrend: MonthlyLeaveTrendItem[];
}

export interface EmployeeLeaveTypeBalance {
  leaveName: string;
  allocatedLeaves: number;
  consumedLeaves: number;
  availableLeaves: number;
}

interface EmployeeDashboardData {
  stats: {
    availableLeaves: number;
    pendingRequests: number;
    approvedRequests: number;
    upcomingHolidays: number;
  };
  leaveTypes: EmployeeLeaveTypeBalance[];
  recentRequests: LeaveRequest[];
  upcomingHolidays: Holiday[];
}

interface ManagerDashboardData {
  stats: {
    teamSize: number;
    pendingApprovals: number;
    onLeave: number;
    upcomingLeaves: number;
  };
}

const defaultLeaveStatus: LeaveStatus = "pending";

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function mapLeaveStatus(value: unknown): LeaveStatus {
  const normalized = String(value ?? "").toLowerCase();
  if (
    normalized === "approved" ||
    normalized === "rejected" ||
    normalized === "cancelled"
  ) {
    return normalized;
  }
  return defaultLeaveStatus;
}

function getRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function mapLeaveRequest(item: unknown): LeaveRequest {
  const record = getRecord(item);
  return {
    id: String(record.id ?? record._id ?? ""),
    employeeId: String(record.employeeId ?? ""),
    employeeName: String(record.employeeName ?? record.name ?? "—"),
    leaveType: String(record.leaveType ?? record.leaveTypeName ?? "—"),
    leaveTypeId: String(record.leaveTypeId ?? ""),
    startDate: String(record.startDate ?? ""),
    endDate: String(record.endDate ?? ""),
    days: toNumber(record.days ?? record.noOfDays ?? record.leaveDays),
    status: mapLeaveStatus(record.status),
    manager: String(record.managerName ?? record.manager ?? "—"),
    managerId: String(record.managerId ?? ""),
    reason: String(record.reason ?? ""),
    appliedDate: String(record.appliedDate ?? record.createdAt ?? record.startDate ?? ""),
    halfDay: Boolean(record.halfDay),
    attachmentDoc:
      typeof record.attachmentDoc === "string" ? record.attachmentDoc : undefined,
  };
}

function mapHoliday(item: unknown): Holiday {
  const record = getRecord(item);
  const type = String(record.type ?? "public").toLowerCase();
  return {
    id: String(record.id ?? record._id ?? ""),
    name: String(record.holidayName ?? record.name ?? "Holiday"),
    date: String(record.date ?? ""),
    type:
      type === "restricted" || type === "optional" ? type : "public",
  };
}

function getPayload(data: DashboardApiResponse): Record<string, unknown> {
  return getRecord(data.data ?? data.dashboard ?? {});
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const { data } = await API.get<DashboardApiResponse>("/admin/dashboard");
  if (data.success === false) {
    throw new Error(data.message ?? "Failed to fetch admin dashboard");
  }

  const root = getRecord(data);
  const payload = getPayload(data);
  const stats = getRecord(payload.stats ?? payload.summary);
  const requests = getArray(
    payload.recentRequests ??
      payload.leaveRequests ??
      payload.requests ??
      root.recentRequests ??
      root.leaveRequests ??
      root.requests
  );
  const holidays = getArray(
    payload.upcomingHolidays ??
      payload.holidays ??
      root.upcomingHolidays ??
      root.holidays
  );
  const employeeConsumedLeaves = getArray(
    payload.employeeConsumedLeaves ?? root.employeeConsumedLeaves
  );
  const monthlyLeaveStats = getArray(
    payload.monthlyLeaveStats ?? root.monthlyLeaveStats
  );

  const maxConsumed = employeeConsumedLeaves.reduce((max, item) => {
    const record = getRecord(item);
    return Math.max(max, toNumber(record.totalConsumedLeaves));
  }, 0);

  return {
    stats: {
      totalEmployees: toNumber(root.totalEmployees ?? stats.totalEmployees),
      activeEmployees: toNumber(root.activeEmployees ?? stats.activeEmployees),
      onLeave: toNumber(
        root.employeesOnLeaveToday ?? stats.onLeave ?? stats.employeesOnLeave
      ),
      pendingRequests: toNumber(
        root.pendingRequestCount ?? stats.pendingRequests
      ),
    },
    recentRequests: requests.map(mapLeaveRequest).slice(0, 5),
    upcomingHolidays: holidays
      .map(mapHoliday)
      .filter((h) => Boolean(h.date))
      .slice(0, 5),
    leaveUtilization: employeeConsumedLeaves.map((item) => {
      const record = getRecord(item);
      const consumed = toNumber(record.totalConsumedLeaves);
      const percent = maxConsumed > 0 ? (consumed / maxConsumed) * 100 : 0;

      return {
        type: String(record.employeeName ?? "Employee"),
        used: Number(percent.toFixed(1)),
        total: consumed,
      };
    }),
    monthlyLeaveTrend: monthlyLeaveStats.map((item) => {
      const record = getRecord(item);
      return {
        month: String(record.monthName ?? record.month ?? ""),
        leaves: toNumber(record.appliedLeaves ?? record.leaves),
        approved: toNumber(record.approvedLeaves ?? record.approved),
      };
    }),
  };
}

function mapEmployeeLeaveType(item: unknown): EmployeeLeaveTypeBalance {
  const record = getRecord(item);
  return {
    leaveName: String(record.leaveName ?? "Leave"),
    allocatedLeaves: toNumber(record.allocatedLeaves),
    consumedLeaves: toNumber(record.consumedLeaves),
    availableLeaves: toNumber(record.availableLeaves),
  };
}

export async function getEmployeeDashboard(): Promise<EmployeeDashboardData> {
  const { data } = await API.get<DashboardApiResponse>("/employee/dashboard");
  if (data.success === false) {
    throw new Error(data.message ?? "Failed to fetch employee dashboard");
  }

  const root = getRecord(data);
  const payload = getPayload(data);
  const stats = getRecord(payload.stats ?? payload.summary);
  const leaveTypes = getArray(root.leaveTypes ?? payload.leaveTypes);
  const requests = getArray(
    root.recentLeaveRequests ??
      root.recentRequests ??
      root.leaveRequests ??
      root.requests ??
      payload.recentLeaveRequests ??
      payload.recentRequests ??
      payload.leaveRequests ??
      payload.requests
  );
  const holidays = getArray(
    root.upcomingHolidays ?? payload.upcomingHolidays ?? payload.holidays
  );

  return {
    stats: {
      availableLeaves: toNumber(
        root.availableLeaveCount ?? stats.availableLeaves
      ),
      pendingRequests: toNumber(
        root.pendingRequestCount ?? stats.pendingRequests
      ),
      approvedRequests: toNumber(
        root.approvedRequestCount ?? stats.approvedRequests
      ),
      upcomingHolidays: toNumber(
        root.upcomingHolidaysCount ?? stats.upcomingHolidays
      ),
    },
    leaveTypes: leaveTypes.map(mapEmployeeLeaveType),
    recentRequests: requests.map(mapLeaveRequest).slice(0, 5),
    upcomingHolidays: holidays
      .map(mapHoliday)
      .filter((h) => Boolean(h.date))
      .slice(0, 3),
  };
}

export async function getManagerDashboard(): Promise<ManagerDashboardData> {
  const { data } = await API.get<DashboardApiResponse>(
    "/employee/manager/dashboard"
  );
  if (data.success === false) {
    throw new Error(data.message ?? "Failed to fetch manager dashboard");
  }

  const root = getRecord(data);
  const payload = getPayload(data);
  const stats = getRecord(payload.stats ?? payload.summary);

  return {
    stats: {
      teamSize: toNumber(
        root.totalTeamMembers ?? root.teamSize ?? root.teamCount ?? stats.teamSize
      ),
      pendingApprovals: toNumber(
        root.pendingRequestCount ??
          root.pendingApprovalsCount ??
          stats.pendingApprovals
      ),
      onLeave: toNumber(
        root.teamMembersOnLeaveToday ??
          root.employeesOnLeaveToday ??
          root.onLeave ??
          stats.onLeave ??
          stats.employeesOnLeave
      ),
      upcomingLeaves: toNumber(
        root.upcomingWeekLeaveCount ??
          root.upcomingLeavesCount ??
          root.upcomingLeaves ??
          stats.upcomingLeaves
      ),
    },
  };
}
