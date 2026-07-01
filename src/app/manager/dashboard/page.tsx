"use client";

import {
  CalendarDays,
  ClipboardCheck,
  Users,
  Clock,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { LeaveRequest } from "@/types";

export default function ManagerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const leaveRequests: LeaveRequest[] = [];
  const managerStats = {
    teamSize: 0,
    pendingApprovals: 0,
    onLeave: 0,
    upcomingLeaves: 0,
  };

  const pendingRequests = leaveRequests.filter(
    (r) => r.managerId === user?.id && r.status === "pending"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        description="Overview of your team's leave activity"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Team Size" value={managerStats.teamSize} icon={Users} href="/manager/team-balances" />
        <StatCard
          title="Pending Approvals"
          value={managerStats.pendingApprovals}
          change="Action required"
          trend="down"
          icon={ClipboardCheck}
          href="/manager/team-requests"
        />
        <StatCard
          title="Employees On Leave"
          value={managerStats.onLeave}
          change="Today"
          icon={CalendarDays}
          href="/manager/team-calendar"
        />
        <StatCard
          title="Upcoming Leaves"
          value={managerStats.upcomingLeaves}
          change="Next 7 days"
          icon={Clock}
          href="/manager/team-calendar"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.length === 0 ? (
                <TableEmptyRow colSpan={5} message="No pending leave requests" />
              ) : (
                pendingRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.employeeName}</TableCell>
                  <TableCell>{req.leaveType}</TableCell>
                  <TableCell>
                    {formatDate(req.startDate)} — {formatDate(req.endDate)}
                  </TableCell>
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
  );
}
