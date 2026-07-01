import type { UserRole } from "@/types";

export interface NavLink {
  title: string;
  href: string;
  icon: string;
}

export interface NavGroup {
  title: string;
  items: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

export const adminNavigation: NavEntry[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  {
    title: "Employee Management",
    items: [
      { title: "Employees", href: "/admin/employees", icon: "Users" },
      { title: "Managers", href: "/admin/managers", icon: "UserCog" },
    ],
  },
  {
    title: "Leave Management",
    items: [
      { title: "Leaves", href: "/admin/leave-types", icon: "Tags" },
      { title: "Leave Requests", href: "/admin/leave-requests", icon: "ClipboardList" },
      { title: "Leave Balances", href: "/admin/leave-balances", icon: "Wallet" },
    ],
  },
  { title: "Holiday Management", href: "/admin/holidays", icon: "CalendarDays" },
  { title: "Reports", href: "/admin/reports", icon: "BarChart3" },
  { title: "Settings", href: "/admin/settings", icon: "Settings" },
];

export const managerNavigation: NavLink[] = [
  { title: "Dashboard", href: "/manager/dashboard", icon: "LayoutDashboard" },
  { title: "Team Requests", href: "/manager/team-requests", icon: "ClipboardCheck" },
  { title: "Team Calendar", href: "/manager/team-calendar", icon: "Calendar" },
  { title: "Team Balances", href: "/manager/team-balances", icon: "Wallet" },
  { title: "Reports", href: "/manager/reports", icon: "BarChart3" },
];

export const employeeNavigation: NavLink[] = [
  { title: "Dashboard", href: "/employee/dashboard", icon: "LayoutDashboard" },
  { title: "Apply Leave", href: "/employee/apply-leave", icon: "PlusCircle" },
  { title: "My Leaves", href: "/employee/my-leaves", icon: "ClipboardList" },
  { title: "Leave Balance", href: "/employee/leave-balance", icon: "Wallet" },
  { title: "Holiday Calendar", href: "/employee/holiday-calendar", icon: "CalendarDays" },
  { title: "Profile", href: "/employee/profile", icon: "User" },
];

export function getNavigationForRole(role: UserRole): NavEntry[] | NavLink[] {
  switch (role) {
    case "admin":
      return adminNavigation;
    case "manager":
      return managerNavigation;
    case "employee":
      return employeeNavigation;
  }
}

export function getRoleBasePath(role: UserRole): string {
  return `/${role}`;
}

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  employee: "Employee",
};
