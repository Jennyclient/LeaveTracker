import { ProtectedLayout } from "@/components/auth/protected-layout";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout role="employee">{children}</ProtectedLayout>;
}
