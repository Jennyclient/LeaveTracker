"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import {
  getAdminDashboard,
  type LeaveUtilizationItem,
  type MonthlyLeaveTrendItem,
} from "@/lib/dashboard";

export default function AdminDashboardPage() {
  const [adminStats, setAdminStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    pendingRequests: 0,
  });
  const [leaveUtilization, setLeaveUtilization] = useState<LeaveUtilizationItem[]>(
    []
  );
  const [monthlyLeaveTrend, setMonthlyLeaveTrend] = useState<MonthlyLeaveTrendItem[]>(
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const data = await getAdminDashboard();
        if (!cancelled) {
          setAdminStats(data.stats);
          setLeaveUtilization(data.leaveUtilization);
          setMonthlyLeaveTrend(data.monthlyLeaveTrend);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load admin dashboard";
          toast.error(message);
        }
      }
    }

    void fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

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
          href="/admin/employees"
        />
        <StatCard
          title="Active Employees"
          value={adminStats.activeEmployees}
          change="93% active rate"
          trend="up"
          icon={UserCheck}
          href="/admin/employees"
        />
        <StatCard
          title="Employees On Leave"
          value={adminStats.onLeave}
          change="Today"
          icon={CalendarDays}
          href="/admin/leave-requests"
        />
        <StatCard
          title="Pending Requests"
          value={adminStats.pendingRequests}
          change="Needs attention"
          trend="down"
          icon={ClipboardList}
          href="/admin/leave-requests"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LeaveUtilizationChart data={leaveUtilization} />
        <MonthlyLeaveTrendChart data={monthlyLeaveTrend} />
      </div>
    </div>
  );
}
