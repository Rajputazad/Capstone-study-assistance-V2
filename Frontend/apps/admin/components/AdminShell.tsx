"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icons";
import { clearToken, fetchOverview, getToken } from "@/lib/api";
import type { AdminUser } from "@/lib/types";

const items = [
  ["/", "Overview", "overview"],
  ["/students", "Students", "students"],
  [
    "/unit-access-requests",
    "Unit Access Requests",
    "requests",
  ],
  [
    "/unit-resources",
    "Unit Resources",
    "resources",
  ],
  [
    "/admin-management",
    "Admin Management",
    "shield",
  ],
] as const;

export default function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [me, setMe] = useState<AdminUser | null>(null);
  const [pending, setPending] = useState(0);
  const [ready, setReady] = useState(false);

  /* Bounce to /login when there is no token, then load the sidebar data. */
  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    setReady(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setMe(data))
      .catch(() => setMe(null));

    fetchOverview()
      .then((data) => setPending(data.pendingRequests))
      .catch(() => setPending(0));
  }, [router]);

  function signOut() {
    clearToken();
    router.replace("/login");
  }

  if (!ready) {
    return null;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brandBlock">
          <div className="logoBox">CS</div>

          <div>
            <div className="brandName">
              Capstone
            </div>

            <div className="brandTag">
              STUDY ASSISTANT
            </div>
          </div>
        </div>

        <div className="portalLabel">
          ADMIN PORTAL
        </div>

        <nav className="menu">
          {items.map(
            ([href, label, icon]) => (
              <Link
                href={href}
                key={href}
                className={`menuItem ${
                  pathname === href
                    ? "active"
                    : ""
                }`}
              >
                <span className="menuIcon">
                  <Icon
                    name={icon}
                    size={23}
                  />
                </span>

                <span>{label}</span>

                {href ===
                  "/unit-access-requests" &&
                  pending > 0 && (
                    <span className="sideBadge">
                      {pending}
                    </span>
                  )}
              </Link>
            )
          )}
        </nav>

        <div className="sidebarUser">
          <div className="avatar dark">
            {me?.name?.[0] ?? "A"}
          </div>

          <div>
            <div className="sideUserName">
              {me?.name ?? "Admin"}
            </div>

            <div className="sideUserRole">
              {me?.email ?? "Admin"}
            </div>
          </div>

          <button
            type="button"
            className="signOutBtn"
            onClick={signOut}
          >
            Sign out
          </button>

          <div className="privacy">
            Do not sell or share my personal info
          </div>
        </div>
      </aside>

      <main className="content">
        {children}
      </main>
    </div>
  );
}