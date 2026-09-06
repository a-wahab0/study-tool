"use client";

import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("character-counter")!;

export default function CharacterCounterPage() {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState("280");

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const stats = useMemo(() => {
    const withSpaces = text.length;
    const withoutSpaces = text.replace(/\s/g, "").length;
    const numericLimit = Number(limit) || 0;
    const remaining = numericLimit > 0 ? numericLimit - withSpaces : null;
    return { withSpaces, withoutSpaces, remaining };
  }, [text, limit]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <label className="label" htmlFor="char-counter-input">
          Text
        </label>
        <textarea
          id="char-counter-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="input resize-y"
          placeholder="Type or paste your text..."
        />

        <div className="mt-4 max-w-xs">
          <label className="label" htmlFor="char-limit">
            Character limit (optional)
          </label>
          <input
            id="char-limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="input"
            min={0}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <ResultCard label="With spaces" value={String(stats.withSpaces)} emphasis />
          <ResultCard label="Without spaces" value={String(stats.withoutSpaces)} />
          {stats.remaining !== null && (
            <ResultCard
              label="Remaining"
              value={String(stats.remaining)}
              helper={stats.remaining < 0 ? "Over the limit" : undefined}
            />
          )}
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Does this include spaces by default?",
                answer: "Both counts are shown side by side so you can use whichever your assignment or platform requires.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
