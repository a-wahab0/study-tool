"use client";

import { Search, X } from "lucide-react";

export default function ToolSearch({
  value,
  onChange,
  placeholder = "Search tools...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search tools"
        className="input pl-9 pr-9"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-ink-100 focus-ring"
        >
          <X className="h-4 w-4 text-ink-400" />
        </button>
      )}
    </div>
  );
}
