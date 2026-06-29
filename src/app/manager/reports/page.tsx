import { MonthlyUsageBarChart } from "@/components/charts/leave-charts";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Calendar, TrendingUp, Users } from "lucide-react";

export default function ManagerReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Reports"
        description="Leave analytics for your team"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Team Leave Taken" value={48} change="This quarter" icon={Calendar} />
        <StatCard title="Avg. Utilization" value="62%" trend="up" change="+5% vs last quarter" icon={TrendingUp} />
        <StatCard title="Team Members" value={12} icon={Users} />
      </div>

      <MonthlyUsageBarChart />
    </div>
  );
}
