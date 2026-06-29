import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { demoUsers, employees } from "@/data/mock-data";
import { formatDate } from "@/lib/format";

export default function EmployeeProfilePage() {
  const employee = employees.find((e) => e.id === "emp-001")!;
  const user = demoUsers.employee;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your employee information and leave policy details"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{employee.designation}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">{employee.employeeId}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Manager</p>
                <p className="font-medium">{employee.manager}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Join Date</p>
                <p className="font-medium">{formatDate(employee.joinDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{employee.status}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Leave Policy</p>
              <p className="font-medium">{employee.leavePolicy}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Standard leave policy with monthly accrual for paid and casual leaves
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
