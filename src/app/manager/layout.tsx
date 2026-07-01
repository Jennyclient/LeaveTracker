import { ProtectedLayout } from "@/components/auth/protected-layout";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout role="manager">{children}</ProtectedLayout>;
}
