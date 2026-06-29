import type {
  BalanceHistory,
  Employee,
  Holiday,
  LeaveBalance,
  LeavePolicy,
  LeaveRequest,
  LeaveType,
  Manager,
  User,
} from "@/types";

export const currentUser: User = {
  id: "emp-001",
  name: "Sarah Johnson",
  email: "sarah.johnson@clashdx.com",
  role: "employee",
  manager: "Michael Chen",
  leavePolicy: "Standard Policy",
  employeeId: "EMP-001",
};

export const demoUsers: Record<string, User> = {
  admin: {
    id: "admin-001",
    name: "Alex Rivera",
    email: "alex.rivera@clashdx.com",
    role: "admin",
    employeeId: "ADM-001",
  },
  manager: {
    id: "mgr-001",
    name: "Michael Chen",
    email: "michael.chen@clashdx.com",
    role: "manager",
    employeeId: "MGR-001",
  },
  employee: currentUser,
};

export const managers: Manager[] = [
  { id: "mgr-001", name: "Michael Chen", email: "michael.chen@clashdx.com", teamSize: 12 },
  { id: "mgr-002", name: "Emily Watson", email: "emily.watson@clashdx.com", teamSize: 8 },
  { id: "mgr-003", name: "James Liu", email: "james.liu@clashdx.com", teamSize: 6 },
  { id: "mgr-004", name: "Priya Sharma", email: "priya.sharma@clashdx.com", teamSize: 10 },
  { id: "mgr-005", name: "David Kim", email: "david.kim@clashdx.com", teamSize: 7 },
];

export const employees: Employee[] = [
  { id: "emp-001", employeeId: "EMP-001", name: "Sarah Johnson", email: "sarah.johnson@clashdx.com", manager: "Michael Chen", managerId: "mgr-001", leavePolicy: "Standard Policy", leavePolicyId: "pol-1", status: "active", joinDate: "2022-03-15", designation: "Senior Developer" },
  { id: "emp-002", employeeId: "EMP-002", name: "John Smith", email: "john.smith@clashdx.com", manager: "Michael Chen", managerId: "mgr-001", leavePolicy: "Standard Policy", leavePolicyId: "pol-1", status: "active", joinDate: "2021-08-20", designation: "Developer" },
  { id: "emp-003", employeeId: "EMP-003", name: "Lisa Anderson", email: "lisa.anderson@clashdx.com", manager: "Emily Watson", managerId: "mgr-002", leavePolicy: "Standard Policy", leavePolicyId: "pol-1", status: "active", joinDate: "2023-01-10", designation: "Product Manager" },
  { id: "emp-004", employeeId: "EMP-004", name: "Robert Taylor", email: "robert.taylor@clashdx.com", manager: "James Liu", managerId: "mgr-003", leavePolicy: "Senior Policy", leavePolicyId: "pol-2", status: "active", joinDate: "2020-11-05", designation: "UI Designer" },
  { id: "emp-005", employeeId: "EMP-005", name: "Maria Garcia", email: "maria.garcia@clashdx.com", manager: "Priya Sharma", managerId: "mgr-004", leavePolicy: "Standard Policy", leavePolicyId: "pol-1", status: "active", joinDate: "2022-06-18", designation: "Marketing Lead" },
  { id: "emp-006", employeeId: "EMP-006", name: "Kevin Brown", email: "kevin.brown@clashdx.com", manager: "Michael Chen", managerId: "mgr-001", leavePolicy: "Standard Policy", leavePolicyId: "pol-1", status: "inactive", joinDate: "2019-04-22", designation: "Tech Lead" },
  { id: "emp-007", employeeId: "EMP-007", name: "Anna Wilson", email: "anna.wilson@clashdx.com", manager: "David Kim", managerId: "mgr-005", leavePolicy: "Standard Policy", leavePolicyId: "pol-1", status: "active", joinDate: "2021-12-01", designation: "Financial Analyst" },
  { id: "emp-008", employeeId: "EMP-008", name: "Tom Harris", email: "tom.harris@clashdx.com", manager: "Michael Chen", managerId: "mgr-001", leavePolicy: "Standard Policy", leavePolicyId: "pol-1", status: "active", joinDate: "2023-07-14", designation: "Junior Developer" },
];

export const leaveTypes: LeaveType[] = [
  { id: "lt-1", name: "Paid Leave", annualQuota: 18, accrualType: "monthly", carryForward: true, maxCarryForward: 5, encashment: true, active: true, color: "#3b82f6" },
  { id: "lt-2", name: "Casual Leave", annualQuota: 12, accrualType: "monthly", carryForward: false, maxCarryForward: 0, encashment: false, active: true, color: "#8b5cf6" },
  { id: "lt-3", name: "Sick Leave", annualQuota: 10, accrualType: "yearly", carryForward: true, maxCarryForward: 3, encashment: false, active: true, color: "#ef4444" },
  { id: "lt-4", name: "Comp Off", annualQuota: 0, accrualType: "none", carryForward: true, maxCarryForward: 10, encashment: false, active: true, color: "#f59e0b" },
  { id: "lt-5", name: "Maternity Leave", annualQuota: 180, accrualType: "none", carryForward: false, maxCarryForward: 0, encashment: false, active: true, color: "#ec4899" },
  { id: "lt-6", name: "Paternity Leave", annualQuota: 15, accrualType: "none", carryForward: false, maxCarryForward: 0, encashment: false, active: true, color: "#06b6d4" },
  { id: "lt-7", name: "Bereavement Leave", annualQuota: 5, accrualType: "none", carryForward: false, maxCarryForward: 0, encashment: false, active: true, color: "#6b7280" },
];

export const leavePolicies: LeavePolicy[] = [
  { id: "pol-1", name: "Standard Policy", assignedEmployees: 85, leaveTypeIds: ["lt-1", "lt-2", "lt-3", "lt-4"], accrualRules: "1.5 days PL per month, 1 CL per month", carryForwardRules: "Max 5 PL, 3 SL carry forward", probationRules: "No leave during first 90 days except SL" },
  { id: "pol-2", name: "Senior Policy", assignedEmployees: 25, leaveTypeIds: ["lt-1", "lt-2", "lt-3", "lt-4", "lt-5", "lt-6"], accrualRules: "2 PL per month, 1.5 CL per month", carryForwardRules: "Max 10 PL, 5 SL carry forward", probationRules: "PL available after 60 days" },
  { id: "pol-3", name: "Contract Policy", assignedEmployees: 12, leaveTypeIds: ["lt-1", "lt-2", "lt-3"], accrualRules: "Pro-rated monthly accrual", carryForwardRules: "No carry forward", probationRules: "Standard 90-day probation" },
];

export const leaveRequests: LeaveRequest[] = [
  { id: "lr-1", employeeId: "emp-001", employeeName: "Sarah Johnson", leaveType: "Paid Leave", leaveTypeId: "lt-1", startDate: "2026-07-01", endDate: "2026-07-05", days: 5, status: "pending", manager: "Michael Chen", managerId: "mgr-001", reason: "Family vacation", appliedDate: "2026-06-15" },
  { id: "lr-2", employeeId: "emp-002", employeeName: "John Smith", leaveType: "Sick Leave", leaveTypeId: "lt-3", startDate: "2026-06-20", endDate: "2026-06-21", days: 2, status: "approved", manager: "Michael Chen", managerId: "mgr-001", reason: "Medical appointment", appliedDate: "2026-06-18" },
  { id: "lr-3", employeeId: "emp-003", employeeName: "Lisa Anderson", leaveType: "Casual Leave", leaveTypeId: "lt-2", startDate: "2026-06-25", endDate: "2026-06-25", days: 1, status: "pending", manager: "Emily Watson", managerId: "mgr-002", reason: "Personal work", appliedDate: "2026-06-20", halfDay: true },
  { id: "lr-4", employeeId: "emp-004", employeeName: "Robert Taylor", leaveType: "Paid Leave", leaveTypeId: "lt-1", startDate: "2026-08-10", endDate: "2026-08-14", days: 5, status: "approved", manager: "James Liu", managerId: "mgr-003", reason: "Summer break", appliedDate: "2026-06-10" },
  { id: "lr-5", employeeId: "emp-005", employeeName: "Maria Garcia", leaveType: "Comp Off", leaveTypeId: "lt-4", startDate: "2026-06-28", endDate: "2026-06-28", days: 1, status: "rejected", manager: "Priya Sharma", managerId: "mgr-004", reason: "Weekend work compensation", appliedDate: "2026-06-22" },
  { id: "lr-6", employeeId: "emp-007", employeeName: "Anna Wilson", leaveType: "Paid Leave", leaveTypeId: "lt-1", startDate: "2026-07-15", endDate: "2026-07-18", days: 4, status: "pending", manager: "David Kim", managerId: "mgr-005", reason: "Wedding ceremony", appliedDate: "2026-06-19" },
  { id: "lr-7", employeeId: "emp-008", employeeName: "Tom Harris", leaveType: "Casual Leave", leaveTypeId: "lt-2", startDate: "2026-06-30", endDate: "2026-06-30", days: 1, status: "approved", manager: "Michael Chen", managerId: "mgr-001", reason: "Moving day", appliedDate: "2026-06-17" },
  { id: "lr-8", employeeId: "emp-001", employeeName: "Sarah Johnson", leaveType: "Sick Leave", leaveTypeId: "lt-3", startDate: "2026-05-10", endDate: "2026-05-11", days: 2, status: "approved", manager: "Michael Chen", managerId: "mgr-001", reason: "Flu", appliedDate: "2026-05-09" },
];

export const leaveBalances: LeaveBalance[] = [
  { employeeId: "emp-001", employeeName: "Sarah Johnson", paidLeave: 12, casualLeave: 8, sickLeave: 7, compOff: 2, consumed: { paidLeave: 6, casualLeave: 4, sickLeave: 3, compOff: 1 }, annualQuota: { paidLeave: 18, casualLeave: 12, sickLeave: 10, compOff: 0 }, carryForward: { paidLeave: 2, casualLeave: 0, sickLeave: 1, compOff: 2 } },
  { employeeId: "emp-002", employeeName: "John Smith", paidLeave: 8, casualLeave: 5, sickLeave: 6, compOff: 0, consumed: { paidLeave: 10, casualLeave: 7, sickLeave: 4, compOff: 0 }, annualQuota: { paidLeave: 18, casualLeave: 12, sickLeave: 10, compOff: 0 }, carryForward: { paidLeave: 0, casualLeave: 0, sickLeave: 0, compOff: 0 } },
  { employeeId: "emp-003", employeeName: "Lisa Anderson", paidLeave: 15, casualLeave: 10, sickLeave: 8, compOff: 1, consumed: { paidLeave: 3, casualLeave: 2, sickLeave: 2, compOff: 0 }, annualQuota: { paidLeave: 18, casualLeave: 12, sickLeave: 10, compOff: 0 }, carryForward: { paidLeave: 0, casualLeave: 0, sickLeave: 0, compOff: 1 } },
  { employeeId: "emp-004", employeeName: "Robert Taylor", paidLeave: 20, casualLeave: 11, sickLeave: 9, compOff: 3, consumed: { paidLeave: 5, casualLeave: 3, sickLeave: 1, compOff: 0 }, annualQuota: { paidLeave: 24, casualLeave: 14, sickLeave: 10, compOff: 0 }, carryForward: { paidLeave: 5, casualLeave: 0, sickLeave: 0, compOff: 3 } },
  { employeeId: "emp-005", employeeName: "Maria Garcia", paidLeave: 10, casualLeave: 6, sickLeave: 5, compOff: 0, consumed: { paidLeave: 8, casualLeave: 6, sickLeave: 5, compOff: 0 }, annualQuota: { paidLeave: 18, casualLeave: 12, sickLeave: 10, compOff: 0 }, carryForward: { paidLeave: 0, casualLeave: 0, sickLeave: 0, compOff: 0 } },
];

export const employeeBalance = leaveBalances[0];

export const holidays: Holiday[] = [
  { id: "h-1", name: "New Year's Day", date: "2026-01-01", type: "public" },
  { id: "h-2", name: "Republic Day", date: "2026-01-26", type: "public" },
  { id: "h-3", name: "Holi", date: "2026-03-14", type: "public" },
  { id: "h-4", name: "Good Friday", date: "2026-04-03", type: "public" },
  { id: "h-5", name: "Independence Day", date: "2026-08-15", type: "public" },
  { id: "h-6", name: "Gandhi Jayanti", date: "2026-10-02", type: "public" },
  { id: "h-7", name: "Diwali", date: "2026-11-08", type: "public" },
  { id: "h-8", name: "Christmas", date: "2026-12-25", type: "public" },
  { id: "h-9", name: "Company Foundation Day", date: "2026-06-15", type: "restricted" },
  { id: "h-10", name: "Team Offsite", date: "2026-09-20", type: "optional" },
];

export const balanceHistory: BalanceHistory[] = [
  { id: "bh-1", date: "2026-06-01", change: 1.5, balance: 12, reason: "Monthly accrual", leaveType: "Paid Leave" },
  { id: "bh-2", date: "2026-05-15", change: -2, balance: 10.5, reason: "Leave taken", leaveType: "Paid Leave" },
  { id: "bh-3", date: "2026-05-01", change: 1.5, balance: 12.5, reason: "Monthly accrual", leaveType: "Paid Leave" },
  { id: "bh-4", date: "2026-04-20", change: -1, balance: 11, reason: "Half day leave", leaveType: "Casual Leave" },
  { id: "bh-5", date: "2026-04-01", change: 1, balance: 8, reason: "Monthly accrual", leaveType: "Casual Leave" },
  { id: "bh-6", date: "2026-03-10", change: -2, balance: 7, reason: "Sick leave", leaveType: "Sick Leave" },
];

export const monthlyLeaveTrend = [
  { month: "Jan", leaves: 42, approved: 38 },
  { month: "Feb", leaves: 35, approved: 32 },
  { month: "Mar", leaves: 48, approved: 45 },
  { month: "Apr", leaves: 52, approved: 48 },
  { month: "May", leaves: 38, approved: 35 },
  { month: "Jun", leaves: 45, approved: 40 },
];

export const leaveUtilization = [
  { type: "Paid Leave", used: 65, total: 100 },
  { type: "Casual Leave", used: 45, total: 100 },
  { type: "Sick Leave", used: 30, total: 100 },
  { type: "Comp Off", used: 20, total: 100 },
];

export const adminStats = {
  totalEmployees: 120,
  activeEmployees: 112,
  onLeave: 8,
  pendingRequests: 12,
};

export const managerStats = {
  teamSize: 12,
  pendingApprovals: 4,
  onLeave: 2,
  upcomingLeaves: 3,
};

export const employeeStats = {
  availableLeaves: 29,
  pendingRequests: 1,
  approvedRequests: 5,
  upcomingHolidays: 2,
};

export const reportStats = {
  totalLeaveTaken: 1248,
  averageUsage: 68,
  mostUsedType: "Paid Leave",
};

export const notifications = [
  { id: "n-1", title: "Leave request pending", message: "Sarah Johnson applied for 5 days PL", time: "2h ago", read: false },
  { id: "n-2", title: "Leave approved", message: "Your sick leave has been approved", time: "5h ago", read: false },
  { id: "n-3", title: "Holiday reminder", message: "Company Foundation Day on Jun 15", time: "1d ago", read: true },
  { id: "n-4", title: "Balance updated", message: "Monthly accrual credited to your account", time: "2d ago", read: true },
];
