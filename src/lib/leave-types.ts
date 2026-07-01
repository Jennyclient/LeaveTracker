import API from "@/lib/api";
import type { AccrualType, LeaveType } from "@/types";

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

type ApiAccrualType = "NONE" | "YEARLY" | "MONTHLY" | "QUARTERLY";
type ApiLeaveTypeStatus = "ACTIVE" | "INACTIVE";

export interface ApiLeaveType {
  id: string;
  leaveName: string;
  annualQuota: number;
  accrualType: ApiAccrualType;
  carryForward: boolean;
  maxCarryForward: number;
  encashment: boolean;
  status: ApiLeaveTypeStatus;
  policyName?: string | null;
  accrualRules?: string | null;
  carryForwardRules?: string | null;
  probationRules?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetLeaveTypesResponse {
  success: boolean;
  count?: number;
  leaveTypes: ApiLeaveType[];
  message?: string;
}

export interface LeaveTypeMutationResponse {
  success: boolean;
  leaveType: ApiLeaveType;
  message?: string;
}

export interface DeleteLeaveTypeResponse {
  success: boolean;
  message?: string;
}

export interface LeaveTypeInput {
  leaveName: string;
  annualQuota: number;
  accrualType: AccrualType;
  carryForward: boolean;
  maxCarryForward: number;
  encashment: boolean;
  status: "active" | "inactive";
  policyName: string;
  accrualRules: string;
  carryForwardRules: string;
  probationRules: string;
}

function getLeaveTypeColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LEAVE_TYPE_COLORS[Math.abs(hash) % LEAVE_TYPE_COLORS.length];
}

function mapAccrualTypeFromApi(accrualType: ApiAccrualType): AccrualType {
  return accrualType.toLowerCase() as AccrualType;
}

function mapAccrualTypeToApi(accrualType: AccrualType): ApiAccrualType {
  return accrualType.toUpperCase() as ApiAccrualType;
}

function mapStatusFromApi(status: ApiLeaveTypeStatus): "active" | "inactive" {
  return status === "ACTIVE" ? "active" : "inactive";
}

function mapStatusToApi(status: "active" | "inactive"): ApiLeaveTypeStatus {
  return status === "active" ? "ACTIVE" : "INACTIVE";
}

const ACCRUAL_TYPE_LABELS: Record<AccrualType, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  none: "None",
};

export function formatAccrualTypeLabel(accrualType: AccrualType): string {
  return ACCRUAL_TYPE_LABELS[accrualType];
}

export function formatBooleanLabel(value: boolean): string {
  return value ? "Yes" : "No";
}

export function mapApiLeaveTypeToLeaveType(api: ApiLeaveType): LeaveType {
  return {
    id: api.id,
    leaveName: api.leaveName,
    annualQuota: api.annualQuota,
    accrualType: mapAccrualTypeFromApi(api.accrualType),
    carryForward: api.carryForward,
    maxCarryForward: api.maxCarryForward,
    encashment: api.encashment,
    status: mapStatusFromApi(api.status),
    policyName: api.policyName?.trim() ?? "",
    accrualRules: api.accrualRules?.trim() ?? "",
    carryForwardRules: api.carryForwardRules?.trim() ?? "",
    probationRules: api.probationRules?.trim() ?? "",
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    color: getLeaveTypeColor(api.id),
  };
}

function toApiPayload(input: LeaveTypeInput) {
  const policyName =
    input.policyName.trim() || `${input.leaveName.trim()} Policy`;

  return {
    leaveName: input.leaveName.trim(),
    annualQuota: input.annualQuota,
    accrualType: mapAccrualTypeToApi(input.accrualType),
    carryForward: input.carryForward,
    maxCarryForward: input.maxCarryForward,
    encashment: input.encashment,
    status: mapStatusToApi(input.status),
    policyName,
    accrualRules: input.accrualRules.trim() || undefined,
    carryForwardRules: input.carryForwardRules.trim() || undefined,
    probationRules: input.probationRules.trim() || undefined,
  };
}

export async function getLeaveTypes(): Promise<LeaveType[]> {
  const { data } = await API.get<GetLeaveTypesResponse>("/admin/leave-types");

  if (!data.success) {
    throw new Error(data.message ?? "Failed to fetch leave types");
  }

  return data.leaveTypes.map(mapApiLeaveTypeToLeaveType);
}

export async function createLeaveType(input: LeaveTypeInput): Promise<LeaveType> {
  const { data } = await API.post<LeaveTypeMutationResponse>(
    "/admin/leave-types",
    toApiPayload(input)
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to create leave type");
  }

  return mapApiLeaveTypeToLeaveType(data.leaveType);
}

export async function updateLeaveType(
  id: string,
  input: LeaveTypeInput
): Promise<LeaveType> {
  const { data } = await API.put<LeaveTypeMutationResponse>(
    `/admin/leave-types/${id}`,
    toApiPayload(input)
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to update leave type");
  }

  return mapApiLeaveTypeToLeaveType(data.leaveType);
}

export async function deleteLeaveType(id: string): Promise<void> {
  const { data } = await API.delete<DeleteLeaveTypeResponse>(
    `/admin/leave-types/${id}`
  );

  if (!data.success) {
    throw new Error(data.message ?? "Failed to delete leave type");
  }
}
