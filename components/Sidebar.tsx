"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { NAV_ITEMS } from "@/core-lib/nav";
import { cn } from "@/core-lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-ink-200 md:bg-white md:sticky md:top-0 md:h-screen">
      <Link href="/dashboard" className="flex items-center gap-2 px-5 py-5">
        <GraduationCap className="h-6 w-6 text-brand-600" aria-hidden="true" />
        <span className="text-base font-semibold tracking-tight">StudyHub</span>
      </Link>
      <nav className="flex-1 px-3 py-2 space-y-0.5" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-xs text-ink-400 border-t border-ink-200">
        Data is stored locally on this device.
      </div>
    </aside>
  );
}
