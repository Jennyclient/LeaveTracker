import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { demoUsers } from "@/data/mock-data";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="manager" user={demoUsers.manager}>
      {children}
    </DashboardLayout>
  );
}
