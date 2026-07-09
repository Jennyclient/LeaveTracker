"use client";

import { BarChart3, TrendingUp, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface LeaveUtilizationItem {
  type: string;
  used: number;
  total: number;
}

export interface MonthlyLeaveTrendItem {
  month: string;
  leaves: number;
  approved: number;
}

const UTILIZATION_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function abbreviateMonth(month: string) {
  return month.slice(0, 3);
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaveUtilizationChart({
  data,
}: {
  data: LeaveUtilizationItem[];
}) {
  const sorted = [...data].sort((a, b) => b.total - a.total);
  const totalConsumed = sorted.reduce((sum, item) => sum + item.total, 0);
  const chartData =
    totalConsumed > 0
      ? sorted.map((item) => ({
          ...item,
          share: Number(((item.total / totalConsumed) * 100).toFixed(1)),
        }))
      : [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-4" />
              </span>
              Leave Utilization
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Consumed leave days by employee
            </p>
          </div>
          {sorted.length > 0 && (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-right">
              <p className="text-xs font-medium text-muted-foreground">Total consumed</p>
              <p className="text-xl font-semibold text-primary">{totalConsumed}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Users className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No utilization data</p>
            <p className="text-xs text-muted-foreground">
              Employee leave consumption will appear here
            </p>
          </div>
        ) : totalConsumed <= 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Leave data exists but no consumed leaves yet
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-center">
            <div className="mx-auto h-[220px] w-full max-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="total"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`slice-${index}`}
                        fill={UTILIZATION_COLORS[index % UTILIZATION_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <ChartTooltip
                        active={active}
                        label={String(
                          label ??
                            payload?.[0]?.payload?.type ??
                            payload?.[0]?.name ??
                            ""
                        )}
                        payload={payload?.map((p) => ({
                          name: "Days consumed",
                          value: p.value as number,
                          color: p.color,
                        }))}
                      />
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div
                  key={item.type}
                  className="rounded-lg border bg-muted/20 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            UTILIZATION_COLORS[index % UTILIZATION_COLORS.length],
                        }}
                      />
                      <p className="text-sm font-medium">{item.type}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.total} day{item.total === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.share}% of total utilization
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MonthlyLeaveTrendChart({
  data,
}: {
  data: MonthlyLeaveTrendItem[];
}) {
  const chartData = data.map((item) => ({
    ...item,
    monthLabel: abbreviateMonth(item.month),
  }));

  const totalApplied = data.reduce((sum, item) => sum + item.leaves, 0);
  const totalApproved = data.reduce((sum, item) => sum + item.approved, 0);
  const peakMonth = [...data].sort((a, b) => b.leaves - a.leaves)[0];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="size-4" />
              </span>
              Monthly Leave Trend
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Applied vs approved leaves across the year
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: "var(--chart-1)" }}
              />
              Applied: <strong>{totalApplied}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: "var(--chart-2)" }}
              />
              Approved: <strong>{totalApproved}</strong>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <BarChart3 className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No trend data</p>
            <p className="text-xs text-muted-foreground">
              Monthly leave statistics will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="appliedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border/60"
                />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip
                      active={active}
                      label={String(label)}
                      payload={payload?.map((p) => ({
                        name: p.name,
                        value: p.value as number,
                        color: p.color,
                      }))}
                    />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="leaves"
                  name="Applied"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#appliedGradient)"
                  dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--background)" }}
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  name="Approved"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  fill="url(#approvedGradient)"
                  dot={{ r: 3, fill: "var(--chart-2)", strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--background)" }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {peakMonth && peakMonth.leaves > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Peak activity in{" "}
                <span className="font-medium text-foreground">{peakMonth.month}</span>{" "}
                with {peakMonth.leaves} applied leave
                {peakMonth.leaves === 1 ? "" : "s"}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MonthlyUsageBarChart({
  data = [],
}: {
  data?: MonthlyLeaveTrendItem[];
}) {
  const chartData = data.map((item) => ({
    ...item,
    monthLabel: abbreviateMonth(item.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Leave Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
            <XAxis dataKey="monthLabel" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="leaves"
              fill="var(--chart-1)"
              name="Leaves"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
