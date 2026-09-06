"use client";

import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { cn } from "@/core-lib/utils";
import type { ToolDefinition } from "@/types";
import { CATEGORY_LABELS } from "@/core-lib/tools-registry";

export default function ToolCard({
  tool,
  favorited,
  onToggleFavorite,
}: {
  tool: ToolDefinition;
  favorited: boolean;
  onToggleFavorite: (slug: string) => void;
}) {
  const isAvailable = tool.status === "available";

  const content = (
    <div
      className={cn(
        "card group relative flex h-full flex-col gap-2 p-4 transition-shadow",
        isAvailable ? "hover:shadow-md" : "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">
          {CATEGORY_LABELS[tool.category]}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(tool.slug);
          }}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
          className="p-1 rounded-md hover:bg-ink-100 focus-ring"
        >
          <Star
            className={cn("h-4 w-4", favorited ? "fill-amber-400 text-amber-400" : "text-ink-300")}
          />
        </button>
      </div>
      <h3 className="text-sm font-semibold text-ink-900">{tool.name}</h3>
      <p className="text-sm text-ink-500 flex-1">{tool.description}</p>
      {!isAvailable && (
        <span className="inline-flex w-fit items-center gap-1 rounded-md bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-500">
          <Clock className="h-3 w-3" /> Coming soon
        </span>
      )}
    </div>
  );

  if (!isAvailable) {
    return <div aria-disabled="true">{content}</div>;
  }

  return (
    <Link href={`/tools/${tool.slug}`} className="block h-full focus-ring rounded-xl">
      {content}
    </Link>
  );
}
