"use client";

import { cn } from "@/core-lib/utils";

export default function CategoryFilter<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={active === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-ring",
            active === opt.value
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-ink-200 bg-white text-ink-600 hover:bg-ink-100"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
