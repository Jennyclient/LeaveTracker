import { PageHeader } from "@/components/layout/page-header";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { employees, leaveBalances } from "@/data/mock-data";

export default function TeamBalancesPage() {
  const teamBalances = leaveBalances.filter((b) =>
    employees.some((e) => e.id === b.employeeId && e.managerId === "mgr-001")
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Balances"
        description="View leave balances for your team members"
      />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Available Leaves</TableHead>
              <TableHead>Consumed Leaves</TableHead>
              <TableHead>Utilization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamBalances.map((bal) => {
              const available = bal.paidLeave + bal.casualLeave + bal.sickLeave + bal.compOff;
              const consumed =
                bal.consumed.paidLeave +
                bal.consumed.casualLeave +
                bal.consumed.sickLeave +
                bal.consumed.compOff;
              const total = available + consumed;
              const utilization = total > 0 ? Math.round((consumed / total) * 100) : 0;

              return (
                <TableRow key={bal.employeeId}>
                  <TableCell className="font-medium">{bal.employeeName}</TableCell>
                  <TableCell>{available}</TableCell>
                  <TableCell>{consumed}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={utilization} className="w-24" />
                      <span className="text-sm text-muted-foreground">{utilization}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
