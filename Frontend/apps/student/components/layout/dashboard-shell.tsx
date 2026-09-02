"use client";

import { AppHeader } from "@/components/layout/app-header";
import { StudentSidebar } from "@/components/layout/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        <StudentSidebar />
        <div className="flex min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
