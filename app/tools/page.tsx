"use client";

import { useEffect, useMemo, useState } from "react";
import { Wrench, Clock, Star } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ToolSearch from "@/components/ToolSearch";
import CategoryFilter from "@/components/CategoryFilter";
import ToolCard from "@/components/ToolCard";
import EmptyState from "@/components/EmptyState";
import { TOOLS, CATEGORY_LABELS, getToolBySlug } from "@/core-lib/tools-registry";
import { getFavoriteTools, toggleFavoriteTool, getRecentTools } from "@/core-lib/storage";
import type { ToolCategory } from "@/types";

type FilterValue = "all" | ToolCategory;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "study", label: "Study" },
  { value: "pdf", label: "PDF" },
  { value: "images", label: "Images" },
  { value: "text", label: "Text" },
  { value: "calculators", label: "Calculators" },
  { value: "student", label: "Student" },
];

export default function ToolsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterValue>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoriteTools());
    setRecents(getRecentTools());
  }, []);

  const handleToggleFavorite = (slug: string) => {
    setFavorites(toggleFavoriteTool(slug));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const matchesCategory = category === "all" || tool.category === category;
      const matchesQuery =
        q.length === 0 ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const favoriteTools = favorites.map((slug) => getToolBySlug(slug)).filter(Boolean);
  const recentTools = recents.map((slug) => getToolBySlug(slug)).filter(Boolean);

  const grouped = useMemo(() => {
    const map = new Map<ToolCategory, typeof TOOLS>();
    for (const tool of filtered) {
      const list = map.get(tool.category) ?? [];
      list.push(tool);
      map.set(tool.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      <PageHeader title="Tools" description="Every study and file utility in one directory." />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-80">
            <ToolSearch value={query} onChange={setQuery} />
          </div>
          <CategoryFilter options={FILTERS} active={category} onChange={setCategory} />
        </div>

        {query.length === 0 && category === "all" && (
          <>
            {favoriteTools.length > 0 && (
              <section className="mt-8">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
                  <Star className="h-4 w-4 text-amber-400" /> Favorite tools
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteTools.map(
                    (tool) =>
                      tool && (
                        <ToolCard
                          key={tool.slug}
                          tool={tool}
                          favorited={favorites.includes(tool.slug)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      )
                  )}
                </div>
              </section>
            )}

            {recentTools.length > 0 && (
              <section className="mt-8">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
                  <Clock className="h-4 w-4 text-ink-400" /> Recently used
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recentTools.map(
                    (tool) =>
                      tool && (
                        <ToolCard
                          key={tool.slug}
                          tool={tool}
                          favorited={favorites.includes(tool.slug)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      )
                  )}
                </div>
              </section>
            )}
          </>
        )}

        <section className="mt-8">
          {filtered.length === 0 ? (
            <EmptyState icon={Wrench} title="No tools found" description="Try a different search term or category." />
          ) : query.length > 0 || category !== "all" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  tool={tool}
                  favorited={favorites.includes(tool.slug)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            Array.from(grouped.entries()).map(([cat, tools]) => (
              <div key={cat} className="mb-8">
                <h2 className="text-sm font-semibold text-ink-800">{CATEGORY_LABELS[cat]}</h2>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <ToolCard
                      key={tool.slug}
                      tool={tool}
                      favorited={favorites.includes(tool.slug)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
