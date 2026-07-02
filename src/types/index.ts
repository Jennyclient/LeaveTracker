export type UserRole = "admin" | "manager" | "employee";

export type LoginPortal = "admin" | "employee";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type AccrualType = "monthly" | "quarterly" | "yearly" | "none";

export type HolidayType = "public" | "restricted" | "optional";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isManager?: boolean;
  avatar?: string;
  manager?: string;
  leavePolicy?: string;
  employeeId?: string;
}

export interface ManagerTeamMember {
  id: string;
  name: string;
  designation: string;
  status: "active" | "inactive";
}

export interface Manager {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  contactNo?: string;
  designation: string;
  teamSize: number;
  status: "active" | "inactive";
  joinDate: string;
  teamMembers: ManagerTeamMember[];
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  contactNo?: string;
  designation: string;
  manager: string;
  managerId: string;
  leavePolicy?: string;
  leavePolicyId?: string;
  status: "active" | "inactive";
  joinDate: string;
}

export interface LeaveType {
  id: string;
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
  createdAt?: string;
  updatedAt?: string;
  color: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  manager: string;
  managerId: string;
  reason: string;
  appliedDate: string;
  halfDay?: boolean;
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  paidLeave: number;
  casualLeave: number;
  sickLeave: number;
  compOff: number;
  consumed: {
    paidLeave: number;
    casualLeave: number;
    sickLeave: number;
    compOff: number;
  };
  annualQuota: {
    paidLeave: number;
    casualLeave: number;
    sickLeave: number;
    compOff: number;
  };
  carryForward: {
    paidLeave: number;
    casualLeave: number;
    sickLeave: number;
    compOff: number;
  };
}

export interface BalanceHistory {
  id: string;
  date: string;
  change: number;
  balance: number;
  reason: string;
  leaveType: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: HolidayType;
}

export interface NavItem {
  title: string;
  href?: string;
  icon?: string;
  items?: NavItem[];
}

export interface DashboardStat {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
}
