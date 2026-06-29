import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { demoUsers } from "@/data/mock-data";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="admin" user={demoUsers.admin}>
      {children}
    </DashboardLayout>
  );
}
