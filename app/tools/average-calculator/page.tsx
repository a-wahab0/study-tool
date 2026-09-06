"use client";

import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("average-calculator")!;

export default function AverageCalculatorPage() {
  const [input, setInput] = useState("85, 90, 78, 92, 88");

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const stats = useMemo(() => {
    const numbers = input
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    if (numbers.length === 0) return null;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const average = sum / numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    return { count: numbers.length, sum, average, min: sorted[0], max: sorted[sorted.length - 1], median };
  }, [input]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
        <label className="label" htmlFor="avg-input">
          Numbers (comma or space separated)
        </label>
        <textarea
          id="avg-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="input resize-y"
        />

        {stats ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ResultCard label="Average" value={stats.average.toFixed(2)} emphasis />
            <ResultCard label="Median" value={String(stats.median)} />
            <ResultCard label="Count" value={String(stats.count)} />
            <ResultCard label="Sum" value={String(stats.sum)} />
            <ResultCard label="Min" value={String(stats.min)} />
            <ResultCard label="Max" value={String(stats.max)} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-500">Enter at least one number.</p>
        )}

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Can I paste a column of numbers?",
                answer: "Yes — numbers separated by commas, spaces, or line breaks are all recognized.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
