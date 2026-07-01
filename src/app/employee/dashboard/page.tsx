"use client";

import {
  CalendarDays,
  CheckCircle,
  Clock,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import type { Holiday, LeaveRequest } from "@/types";

const emptyBalance = {
  paidLeave: 0,
  casualLeave: 0,
  sickLeave: 0,
  compOff: 0,
  annualQuota: { paidLeave: 0, casualLeave: 0, sickLeave: 0, compOff: 0 },
};

export default function EmployeeDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const leaveRequests: LeaveRequest[] = [];
  const holidays: Holiday[] = [];
  const employeeStats = {
    availableLeaves: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    upcomingHolidays: 0,
  };
  const employeeBalance = emptyBalance;

  const myRequests = leaveRequests.filter((r) => r.employeeId === user?.id);
  const upcomingHolidays = holidays
    .filter((h) => new Date(h.date) >= new Date())
    .slice(0, 3);

  const balanceItems = [
    { label: "Paid Leave", available: employeeBalance.paidLeave, total: employeeBalance.annualQuota.paidLeave },
    { label: "Casual Leave", available: employeeBalance.casualLeave, total: employeeBalance.annualQuota.casualLeave },
    { label: "Sick Leave", available: employeeBalance.sickLeave, total: employeeBalance.annualQuota.sickLeave },
    { label: "Comp Off", available: employeeBalance.compOff, total: 10 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        description="Your leave overview and quick actions"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Available Leaves" value={employeeStats.availableLeaves} icon={Wallet} href="/employee/leave-balance" />
        <StatCard title="Pending Requests" value={employeeStats.pendingRequests} icon={Clock} href="/employee/my-leaves" />
        <StatCard title="Approved Requests" value={employeeStats.approvedRequests} icon={CheckCircle} href="/employee/my-leaves" />
        <StatCard title="Upcoming Holidays" value={employeeStats.upcomingHolidays} icon={CalendarDays} href="/employee/holiday-calendar" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>My Leave Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {balanceItems.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">
                    {item.available} / {item.total}
                  </span>
                </div>
                <Progress value={item.total > 0 ? (item.available / item.total) * 100 : 0} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingHolidays.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No upcoming holidays
                </p>
              ) : (
                upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{holiday.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{holiday.type}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(holiday.date)}</p>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.length === 0 ? (
                  <TableEmptyRow colSpan={3} message="No recent requests" />
                ) : (
                  myRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.leaveType}</TableCell>
                    <TableCell>{req.days}</TableCell>
                    <TableCell><StatusBadge status={req.status} /></TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
