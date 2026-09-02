import { AuthGate } from "@/components/auth/auth-gate";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentProvider } from "@/lib/student-context";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGate>
      <StudentProvider>
        <DashboardShell>{children}</DashboardShell>
      </StudentProvider>
    </AuthGate>
  );
}
