export type UserRole = "admin" | "manager" | "employee";

export type LoginPortal = "admin" | "employee";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type ProfileApprovalStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "rejected";

export type HalfDayPeriod = "FIRST_HALF" | "SECOND_HALF";

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

export interface EmployeeProfileManager {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  designation: string;
  employeeId: string;
}

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  contactNo: string;
  designation: string;
  joiningDate: string;
  role: UserRole;
  status: "active" | "inactive";
  manager: EmployeeProfileManager | null;
  salary?: EmployeeSalary;
  bank?: EmployeeBankDetails;
  bankStatus?: ProfileApprovalStatus;
  skills?: EmployeeSkill[];
  skillsStatus?: ProfileApprovalStatus;
  primarySkill?: string;
  certifications?: EmployeeCertification[];
  createdAt?: string;
  updatedAt?: string;
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

export type EmploymentType = "permanent" | "contract" | "intern";

export type PayrollType = "monthly" | "weekly";

export type PayrollDisbursementStatus = "pending" | "approved" | "disbursed";

export type PayrollPayslipAction = "APPROVE" | "DISBURSE" | "REVERT";

export interface EmployeeSkill {
  name: string;
  proficiency: number;
}

export interface EmployeeCertification {
  name: string;
  issuedBy: string;
  issueDate: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface EmployeeSalary {
  ctc?: number;
  basicSalary?: number;
  hra?: number;
  specialAllowance?: number;
  providentFund?: number;
  professionalTax?: number;
  effectiveFrom?: string;
  payrollType?: PayrollType;
}

export interface EmployeeBankDetails {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  contactNo?: string;
  designation: string;
  department?: string;
  manager: string;
  managerId: string;
  leavePolicy?: string;
  leavePolicyId?: string;
  status: "active" | "inactive";
  joinDate: string;
  yearsOfExperience?: number;
  employmentType?: EmploymentType;
  workLocation?: string;
  salary?: EmployeeSalary;
  bank?: EmployeeBankDetails;
  bankStatus?: ProfileApprovalStatus;
  skills?: EmployeeSkill[];
  skillsStatus?: ProfileApprovalStatus;
  primarySkill?: string;
  certifications?: EmployeeCertification[];
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
  requestedLeaveDays?: number;
  currentLeaveBalance?: number;
  totalAvailableLeaves?: number;
  status: LeaveStatus;
  manager: string;
  managerId: string;
  reason: string;
  emergencyContactNo?: string;
  location?: string;
  rejectionReason?: string;
  appliedDate: string;
  halfDay?: boolean;
  halfDayPeriod?: HalfDayPeriod;
  attachmentDoc?: string;
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

export interface ApprovedLeaveCalendarEntry {
  id: string;
  employeeId: string;
  employeeName?: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: string;
  days: number;
}

export interface HolidayCalendarData {
  holidays: Holiday[];
  approvedLeaves: ApprovedLeaveCalendarEntry[];
}

export interface AdminSettings {
  id: string;
  organization: {
    organizationName: string;
    timezone: string;
    fiscalYearStart: string;
  };
  leaveSettings: {
    weekendAsWorkingDay: boolean;
    autoApproveSickLeave: boolean;
    emailNotification: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PayslipEarnings {
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  grossPay: number;
}

export interface PayslipDeductions {
  providentFund: number;
  professionalTax: number;
  totalDeductions: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeUserId: string;
  employeeName: string;
  payrollMonth: string;
  periodStart: string;
  periodEnd: string;
  earnings: PayslipEarnings;
  deductions: PayslipDeductions;
  netPay: number;
  annualCtc?: number;
  payrollType: PayrollType;
  disbursementStatus: PayrollDisbursementStatus;
  notes?: string | null;
  approvedAt?: string | null;
  disbursedAt?: string | null;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
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
