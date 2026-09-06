"use client";

import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("word-counter")!;

export default function WordCounterPage() {
  const [text, setText] = useState("");

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed.length === 0 ? 0 : (trimmed.match(/[.!?]+(\s|$)/g) ?? []).length || 1;
    const readingMinutes = Math.max(1, Math.round(words / 200));
    return { words, characters, charactersNoSpaces, sentences, readingMinutes };
  }, [text]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <label className="label" htmlFor="word-counter-input">
          Paste or type your text
        </label>
        <textarea
          id="word-counter-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing..."
          rows={10}
          className="input resize-y"
        />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ResultCard label="Words" value={String(stats.words)} emphasis />
          <ResultCard label="Characters" value={String(stats.characters)} />
          <ResultCard label="No spaces" value={String(stats.charactersNoSpaces)} />
          <ResultCard label="Sentences" value={String(stats.sentences)} />
        </div>
        <p className="mt-3 text-sm text-ink-500">
          Estimated reading time: {stats.readingMinutes} minute{stats.readingMinutes === 1 ? "" : "s"}
        </p>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Is my text uploaded anywhere?",
                answer: "No. Counting happens entirely in your browser as you type — nothing is sent to a server.",
              },
              {
                question: "How is reading time calculated?",
                answer: "Reading time is estimated at roughly 200 words per minute, a common average reading speed.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
