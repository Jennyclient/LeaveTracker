"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Users,
  Wallet,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getManagerDashboard } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const PRESENCE_COLORS = ["var(--chart-1)", "var(--chart-2)"];

const quickActions = [
  {
    title: "Team Requests",
    description: "Review and approve leave requests",
    href: "/manager/team-requests",
    icon: ClipboardCheck,
  },
  {
    title: "Team Calendar",
    description: "View team leave schedule",
    href: "/manager/team-calendar",
    icon: Calendar,
  },
  {
    title: "Team Balances",
    description: "Check leave balances for your team",
    href: "/manager/team-balances",
    icon: Wallet,
  },
] as const;

export default function ManagerDashboardPage() {
  const [managerStats, setManagerStats] = useState({
    teamSize: 0,
    pendingApprovals: 0,
    onLeave: 0,
    upcomingLeaves: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const data = await getManagerDashboard();
        if (!cancelled) {
          setManagerStats(data.stats);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load manager dashboard";
          toast.error(message);
        }
      }
    }

    void fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableToday = Math.max(0, managerStats.teamSize - managerStats.onLeave);
  const presenceRate =
    managerStats.teamSize > 0
      ? Math.round((availableToday / managerStats.teamSize) * 100)
      : 0;

  const presenceData = useMemo(
    () =>
      [
        { name: "On Leave", value: managerStats.onLeave },
        { name: "Available", value: availableToday },
      ].filter((item) => item.value > 0),
    [availableToday, managerStats.onLeave]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        description="Overview of your team's leave activity"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Team Size"
          value={managerStats.teamSize}
          change="Active members"
          icon={Users}
          href="/manager/team-balances"
        />
        <StatCard
          title="Pending Approvals"
          value={managerStats.pendingApprovals}
          change={
            managerStats.pendingApprovals > 0 ? "Action required" : "All caught up"
          }
          trend={managerStats.pendingApprovals > 0 ? "down" : "up"}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-4" />
              </span>
              Team Availability Today
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {managerStats.teamSize === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No team members assigned yet
              </p>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <div className="relative size-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          presenceData.length > 0
                            ? presenceData
                            : [{ name: "No data", value: 1 }]
                        }
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={presenceData.length > 1 ? 4 : 0}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {(presenceData.length > 0
                          ? presenceData
                          : [{ name: "No data", value: 1 }]
                        ).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              presenceData.length > 0
                                ? PRESENCE_COLORS[index % PRESENCE_COLORS.length]
                                : "var(--muted)"
                            }
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-semibold">{presenceRate}%</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="rounded-xl border bg-linear-to-br from-background to-muted/30 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Available today</span>
                      <span className="font-semibold">{availableToday}</span>
                    </div>
                    <Progress value={presenceRate} className="mt-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground">On leave</p>
                      <p className="mt-1 text-xl font-semibold text-primary">
                        {managerStats.onLeave}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground">Team size</p>
                      <p className="mt-1 text-xl font-semibold">
                        {managerStats.teamSize}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="size-4" />
              </span>
              Upcoming Week Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-full flex-col justify-between pt-6">
            <div className="space-y-6">
              <div className="rounded-xl border bg-linear-to-br from-primary/5 to-background p-6 text-center">
                <p className="text-sm text-muted-foreground">Leaves in next 7 days</p>
                <p className="mt-2 text-5xl font-semibold tracking-tight text-primary">
                  {managerStats.upcomingLeaves}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Workload indicator</span>
                  <span className="font-medium">
                    {managerStats.upcomingLeaves === 0
                      ? "Light"
                      : managerStats.upcomingLeaves <= 2
                        ? "Moderate"
                        : "Busy"}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, (managerStats.upcomingLeaves / 5) * 100)}
                />
                <p className="text-xs text-muted-foreground">
                  {managerStats.upcomingLeaves === 0
                    ? "No upcoming leaves scheduled this week."
                    : `${managerStats.upcomingLeaves} team leave${managerStats.upcomingLeaves === 1 ? "" : "s"} planned in the next 7 days.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
              <CardContent className="flex items-start justify-between gap-4 pt-0">
                <div className="space-y-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <action.icon className="size-5" />
                  </div>
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    "group-hover:translate-x-0.5 group-hover:text-primary"
                  )}
                />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
