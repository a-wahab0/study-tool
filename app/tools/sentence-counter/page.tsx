"use client";

import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("sentence-counter")!;

export default function SentenceCounterPage() {
  const [text, setText] = useState("");

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return { sentences: 0, words: 0, avgWordsPerSentence: 0 };
    const sentenceMatches = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
    const sentences = sentenceMatches.filter((s) => s.trim().length > 0).length || 1;
    const words = trimmed.split(/\s+/).length;
    return { sentences, words, avgWordsPerSentence: Math.round(words / sentences) };
  }, [text]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <label className="label" htmlFor="sentence-input">
          Text
        </label>
        <textarea
          id="sentence-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="input resize-y"
          placeholder="Type or paste your text..."
        />

        <div className="mt-4 grid grid-cols-3 gap-3">
          <ResultCard label="Sentences" value={String(stats.sentences)} emphasis />
          <ResultCard label="Words" value={String(stats.words)} />
          <ResultCard label="Avg. words / sentence" value={String(stats.avgWordsPerSentence)} />
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "How are sentences detected?",
                answer: "Sentences are split on periods, question marks, and exclamation points. Abbreviations may occasionally be counted as sentence breaks.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
