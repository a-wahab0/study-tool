"use client";

import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import ResultCard from "@/components/ResultCard";
import CalculatorInput from "@/components/CalculatorInput";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("reading-time")!;

export default function ReadingTimePage() {
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState("200");

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const stats = useMemo(() => {
    const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
    const rate = Number(wpm) > 0 ? Number(wpm) : 200;
    const minutes = words / rate;
    const wholeMinutes = Math.floor(minutes);
    const seconds = Math.round((minutes - wholeMinutes) * 60);
    return { words, wholeMinutes, seconds };
  }, [text, wpm]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <label className="label" htmlFor="reading-time-input">
          Text
        </label>
        <textarea
          id="reading-time-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="input resize-y"
          placeholder="Paste your passage..."
        />

        <div className="mt-4 max-w-xs">
          <CalculatorInput label="Reading speed" value={wpm} onChange={setWpm} suffix="wpm" min={50} max={1000} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <ResultCard label="Word count" value={String(stats.words)} />
          <ResultCard
            label="Estimated reading time"
            value={`${stats.wholeMinutes}m ${stats.seconds}s`}
            emphasis
          />
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "What reading speed should I use?",
                answer: "200 words per minute is a common average for adult silent reading. Adjust it to match your own pace or presentation style.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
