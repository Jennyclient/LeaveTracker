import { BarChart3, Calendar, TrendingUp } from "lucide-react";

import { MonthlyUsageBarChart } from "@/components/charts/leave-charts";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { reportStats } from "@/data/mock-data";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analytics and insights on leave usage across the organization"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Leave Taken"
          value={reportStats.totalLeaveTaken}
          change="Year to date"
          icon={Calendar}
        />
        <StatCard
          title="Average Leave Usage"
          value={`${reportStats.averageUsage}%`}
          change="+3% vs last year"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="Most Used Leave Type"
          value={reportStats.mostUsedType}
          icon={BarChart3}
        />
      </div>

      <MonthlyUsageBarChart />
    </div>
  );
}
