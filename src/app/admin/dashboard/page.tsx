import {
  CalendarDays,
  ClipboardList,
  Users,
  UserCheck,
} from "lucide-react";

import {
  LeaveUtilizationChart,
  MonthlyLeaveTrendChart,
} from "@/components/charts/leave-charts";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminStats, holidays, leaveRequests } from "@/data/mock-data";
import { formatDate } from "@/lib/format";

export default function AdminDashboardPage() {
  const recentRequests = leaveRequests.slice(0, 5);
  const upcomingHolidays = holidays
    .filter((h) => new Date(h.date) >= new Date())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your organization's leave management"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={adminStats.totalEmployees}
          change="+5 this month"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Active Employees"
          value={adminStats.activeEmployees}
          change="93% active rate"
          trend="up"
          icon={UserCheck}
        />
        <StatCard
          title="Employees On Leave"
          value={adminStats.onLeave}
          change="Today"
          icon={CalendarDays}
        />
        <StatCard
          title="Pending Requests"
          value={adminStats.pendingRequests}
          change="Needs attention"
          trend="down"
          icon={ClipboardList}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LeaveUtilizationChart />
        <MonthlyLeaveTrendChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.employeeName}</TableCell>
                    <TableCell>{req.leaveType}</TableCell>
                    <TableCell>{req.days}</TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Holiday</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingHolidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell>{formatDate(holiday.date)}</TableCell>
                    <TableCell className="capitalize">{holiday.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
