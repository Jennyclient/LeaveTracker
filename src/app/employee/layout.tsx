import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { demoUsers } from "@/data/mock-data";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="employee" user={demoUsers.employee}>
      {children}
    </DashboardLayout>
  );
}
