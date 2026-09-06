"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/core-lib/utils";

export default function FaqSection({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="card divide-y divide-ink-100">
      <h2 className="px-4 py-3 text-sm font-semibold text-ink-800">Frequently asked questions</h2>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-ink-800 focus-ring"
            >
              {item.question}
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-400 transition-transform", open && "rotate-180")} />
            </button>
            {open && <p className="px-4 pb-3 text-sm text-ink-500">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
