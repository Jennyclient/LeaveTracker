import API from "@/lib/api";
import type { HalfDayPeriod, LeaveRequest, LeaveStatus } from "@/types";

type ApiLeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface ApiLeaveRequest {
  id: string;
  employeeId?: string;
  employeeName?: string;
  leaveTypeId?: string;
  leaveType?: { id?: string; _id?: string; leaveName?: string } | string;
  leaveTypeName?: string;
  startDate: string;
  endDate: string;
  days?: number;
  noOfDays?: number;
  status: ApiLeaveStatus | LeaveStatus | string;
  managerId?: string;
  managerName?: string;
  reason?: string;
  attachmentDoc?: string;
  createdAt?: string;
  appliedDate?: string;
  halfDay?: boolean;
  halfDayPeriod?: HalfDayPeriod;
}

interface GetLeaveRequestsResponse {
  success: boolean;
  message?: string;
  leaveRequests?: ApiLeaveRequest[];
  requests?: ApiLeaveRequest[];
  data?: ApiLeaveRequest[];
}

interface LeaveRequestActionResponse {
  success: boolean;
  message?: string;
}

export interface AdminLeaveRequestFilters {
  employeeName?: string;
  status?: LeaveStatus;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export type ManagerLeaveRequestFilters = AdminLeaveRequestFilters;

export type LeaveRequestAction = "APPROVE" | "REJECT";

function mapStatus(status: ApiLeaveRequest["status"]): LeaveStatus {
  const normalized = String(status).toLowerCase();
  if (
    normalized === "approved" ||
    normalized === "rejected" ||
    normalized === "cancelled"
  ) {
    return normalized;
  }
  return "pending";
}

function toUpperStatus(status: LeaveStatus): ApiLeaveStatus {
  switch (status) {
    case "approved":
      return "APPROVED";
    case "rejected":
      return "REJECTED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

function mapApiLeaveRequestToLeaveRequest(api: ApiLeaveRequest): LeaveRequest {
  const start = new Date(api.startDate);
  const end = new Date(api.endDate);
  const startTime = Number.isNaN(start.getTime()) ? 0 : start.getTime();
  const endTime = Number.isNaN(end.getTime()) ? startTime : end.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const calculatedDays = Math.max(1, Math.floor((endTime - startTime) / oneDayMs) + 1);

  const leaveTypeName =
    typeof api.leaveType === "string"
      ? api.leaveType
      : api.leaveType?.leaveName || api.leaveTypeName || "—";

  const leaveTypeId =
    api.leaveTypeId ??
    (typeof api.leaveType === "object"
      ? api.leaveType?.id ?? api.leaveType?._id ?? ""
      : "");

  return {
    id: api.id,
    employeeId: api.employeeId ?? "",
    employeeName: api.employeeName ?? "—",
    leaveType: leaveTypeName,
    leaveTypeId,
    startDate: api.startDate,
    endDate: api.endDate,
    days: api.days ?? api.noOfDays ?? calculatedDays,
    status: mapStatus(api.status),
    manager: api.managerName ?? "—",
    managerId: api.managerId ?? "",
    reason: api.reason ?? "",
    appliedDate: api.appliedDate ?? api.createdAt ?? api.startDate,
    halfDay: api.halfDay,
    halfDayPeriod: api.halfDayPeriod,
    attachmentDoc: api.attachmentDoc,
  };
}

function buildLeaveRequestQueryParams(
  filters?: AdminLeaveRequestFilters
): Record<string, string> | undefined {
  const params: Record<string, string> = {};

  if (filters?.employeeName?.trim()) {
    params.employeeName = filters.employeeName.trim();
  }
  if (filters?.status) {
    params.status = toUpperStatus(filters.status);
  }
  if (filters?.sortOrder) {
    params.sortOrder = filters.sortOrder;
  }
  if (filters?.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters?.endDate) {
    params.endDate = filters.endDate;
  }

  return Object.keys(params).length ? params : undefined;
}

export async function getAdminLeaveRequests(
  filters?: AdminLeaveRequestFilters
): Promise<LeaveRequest[]> {
  const { data } = await API.get<GetLeaveRequestsResponse>(
    "/admin/leave-all-requests",
    {
      params: buildLeaveRequestQueryParams(filters),
    }
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch leave requests");
  }

  const requests = data.leaveRequests ?? data.requests ?? data.data ?? [];
  return requests.map(mapApiLeaveRequestToLeaveRequest);
}

export async function getManagerLeaveRequests(
  filters?: ManagerLeaveRequestFilters
): Promise<LeaveRequest[]> {
  const { data } = await API.get<GetLeaveRequestsResponse>(
    "/employee/manager/leave-requests",
    {
      params: buildLeaveRequestQueryParams(filters),
    }
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch team leave requests");
  }

  const requests = data.leaveRequests ?? data.requests ?? data.data ?? [];
  return requests.map(mapApiLeaveRequestToLeaveRequest);
}

export async function updateLeaveRequestAction(
  leaveRequestId: string,
  input: {
    action: LeaveRequestAction;
    employeeId: string;
    leaveType: string;
  }
): Promise<void> {
  const payload = {
    action: input.action,
    employeeId: input.employeeId,
    leaveType: input.leaveType,
  };

  const { data } = await API.put<LeaveRequestActionResponse>(
    `/admin/leave-requests/${leaveRequestId}/action`,
    payload
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update leave request status");
  }
}

export async function updateManagerLeaveRequestAction(
  leaveRequestId: string,
  input: {
    action: LeaveRequestAction;
    employeeId: string;
    leaveType: string;
  }
): Promise<void> {
  const payload = {
    action: input.action,
    employeeId: input.employeeId,
    leaveType: input.leaveType,
  };

  const { data } = await API.put<LeaveRequestActionResponse>(
    `/employee/manager/leave-requests/${leaveRequestId}/action`,
    payload
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update leave request status");
  }
}

export interface CreateEmployeeLeaveRequestInput {
  leaveType: string;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  halfDayPeriod?: HalfDayPeriod;
  reason: string;
  attachmentDoc?: string;
}

interface CreateEmployeeLeaveRequestResponse {
  success: boolean;
  message?: string;
  leaveRequest?: ApiLeaveRequest;
}

interface GetEmployeeLeaveRequestsResponse {
  success: boolean;
  message?: string;
  leaveRequests?: ApiLeaveRequest[];
  requests?: ApiLeaveRequest[];
  data?: ApiLeaveRequest[];
}

export async function getEmployeeLeaveRequests(): Promise<LeaveRequest[]> {
  const { data } = await API.get<GetEmployeeLeaveRequestsResponse>(
    "/employee/leave-requests"
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch leave requests");
  }

  const requests = data.leaveRequests ?? data.requests ?? data.data ?? [];
  return requests.map(mapApiLeaveRequestToLeaveRequest);
}

export async function createEmployeeLeaveRequest(
  input: CreateEmployeeLeaveRequestInput
): Promise<LeaveRequest> {
  const payload = {
    leaveType: input.leaveType,
    startDate: input.startDate,
    endDate: input.endDate,
    halfDay: input.halfDay,
    ...(input.halfDay && input.halfDayPeriod
      ? { halfDayPeriod: input.halfDayPeriod }
      : {}),
    reason: input.reason.trim(),
    ...(input.attachmentDoc ? { attachmentDoc: input.attachmentDoc } : {}),
  };

  const { data } = await API.post<CreateEmployeeLeaveRequestResponse>(
    "/employee/leave-requests",
    payload
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to submit leave request");
  }

  if (!data.leaveRequest) {
    throw new Error(data.message ?? "Leave request submitted but response was incomplete");
  }

  return mapApiLeaveRequestToLeaveRequest(data.leaveRequest);
}
