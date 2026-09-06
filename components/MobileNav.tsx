"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { NAV_ITEMS, MOBILE_PRIMARY } from "@/core-lib/nav";
import { cn } from "@/core-lib/utils";

export default function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = NAV_ITEMS.filter((i) => MOBILE_PRIMARY.includes(i.href));
  const secondaryItems = NAV_ITEMS.filter((i) => !MOBILE_PRIMARY.includes(i.href));

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {moreOpen && (
        <div
          role="dialog"
          aria-label="More navigation options"
          className="fixed bottom-16 left-0 right-0 z-50 mx-3 rounded-xl border border-ink-200 bg-white p-2 shadow-card md:hidden"
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-medium text-ink-700">More</span>
            <button
              onClick={() => setMoreOpen(false)}
              className="p-1 rounded-md hover:bg-ink-100 focus-ring"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium focus-ring",
                    isActive(item.href) ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-100"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t border-ink-200 bg-white md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary mobile"
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium focus-ring",
                active ? "text-brand-700" : "text-ink-500"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium focus-ring",
            moreOpen ? "text-brand-700" : "text-ink-500"
          )}
          aria-expanded={moreOpen}
          aria-label="More sections"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          More
        </button>
      </nav>
    </>
  );
}
