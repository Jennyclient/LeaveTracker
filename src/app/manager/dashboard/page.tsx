import {
  CalendarDays,
  ClipboardCheck,
  Users,
  Clock,
} from "lucide-react";

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
import { leaveRequests, managerStats } from "@/data/mock-data";
import { formatDate } from "@/lib/format";

export default function ManagerDashboardPage() {
  const pendingRequests = leaveRequests.filter(
    (r) => r.managerId === "mgr-001" && r.status === "pending"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        description="Overview of your team's leave activity"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Team Size" value={managerStats.teamSize} icon={Users} />
        <StatCard
          title="Pending Approvals"
          value={managerStats.pendingApprovals}
          change="Action required"
          trend="down"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Employees On Leave"
          value={managerStats.onLeave}
          change="Today"
          icon={CalendarDays}
        />
        <StatCard
          title="Upcoming Leaves"
          value={managerStats.upcomingLeaves}
          change="Next 7 days"
          icon={Clock}
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
              {pendingRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.employeeName}</TableCell>
                  <TableCell>{req.leaveType}</TableCell>
                  <TableCell>
                    {formatDate(req.startDate)} — {formatDate(req.endDate)}
                  </TableCell>
                  <TableCell>{req.days}</TableCell>
                  <TableCell><StatusBadge status={req.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
