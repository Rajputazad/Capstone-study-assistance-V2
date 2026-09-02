"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AiAssistantIcon,
  ProfileIcon,
  UnitResourcesIcon,
} from "@/components/icons";
import { useStudent } from "@/lib/student-context";
import { clearAuthToken } from "@/lib/auth";

const navItems = [
  { href: "/", label: "AI Assistant", Icon: AiAssistantIcon },
  { href: "/unit-resources", label: "Unit Resources", Icon: UnitResourcesIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, approvedUnits } = useStudent();

  function signOut() {
    clearAuthToken();
    localStorage.removeItem("capstone_auth_role");
    localStorage.removeItem("capstone_auth_user");
    router.replace("/login");
  }

  return (
    <aside className="flex w-[210px] shrink-0 flex-col border-r border-capstone-border bg-white">
      <div className="px-4 pb-4 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-capstone-red text-[11px] font-bold text-white">
            CS
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase leading-[1.3] tracking-[0.06em] text-capstone-red">
              Capstone
            </p>
            <p className="text-[10px] font-bold uppercase leading-[1.3] tracking-[0.08em] text-gray-900">
              Study Assistant
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400">
          Approved Units
        </p>
        {approvedUnits.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {approvedUnits.map((unit) => (
              <span
                key={unit.code}
                className="rounded-full border border-capstone-red bg-white px-2 py-[2px] text-[10px] font-semibold text-capstone-red"
              >
                {unit.code}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[10px] leading-snug text-gray-500">No approved units yet</p>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {navItems.map(({ href, label, Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-capstone-red-light text-capstone-red"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`shrink-0 ${active ? "text-capstone-red" : "text-gray-500"}`}
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-capstone-border p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-capstone-red text-xs font-semibold text-white">
            {profile.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-gray-900">{profile.name}</p>
            <p className="text-[11px] text-gray-500">{profile.studentId}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="mt-2.5 text-left text-[11px] font-semibold leading-snug text-capstone-red hover:text-capstone-red-dark"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
