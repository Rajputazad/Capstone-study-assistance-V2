import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentProvider } from "@/lib/student-context";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StudentProvider>
      <DashboardShell>{children}</DashboardShell>
    </StudentProvider>
  );
}
