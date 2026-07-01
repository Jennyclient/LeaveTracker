"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const leaveUtilization: { type: string; used: number; total: number }[] = [];
const monthlyLeaveTrend: { month: string; leaves: number; approved: number }[] = [];

export function LeaveUtilizationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Utilization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leaveUtilization.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No utilization data available
          </p>
        ) : (
          leaveUtilization.map((item) => (
          <div key={item.type} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.type}</span>
              <span className="text-muted-foreground">{item.used}%</span>
            </div>
            <Progress value={item.used} />
          </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function MonthlyLeaveTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Leave Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyLeaveTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="leaves"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Applied"
            />
            <Line
              type="monotone"
              dataKey="approved"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Approved"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function MonthlyUsageBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Leave Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyLeaveTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="leaves" fill="hsl(var(--chart-1))" name="Leaves" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
