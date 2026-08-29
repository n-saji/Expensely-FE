"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { cn } from "@/lib/utils";

const ADMIN_TABS = [
  { href: "/admin", label: "Accounts" },
  { href: "/admin/telemetry", label: "Telemetry" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: RootState) => state.user);
  const pathName = usePathname();

  if (!user.isAdmin) {
    return (
      <div className="text-center rounded-2xl border border-border/70 bg-background/80 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-foreground">
          Access Denied
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Please contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-1 border-b border-border/70">
        {ADMIN_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              pathName === tab.href
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
