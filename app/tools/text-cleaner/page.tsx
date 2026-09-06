"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import ToolHeader from "@/components/ToolHeader";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";
import { useToast } from "@/components/Toast";

const tool = getToolBySlug("text-cleaner")!;

export default function TextCleanerPage() {
  const [text, setText] = useState("");
  const { show } = useToast();

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const cleaned = useMemo(() => {
    return text
      .split("\n")
      .map((line) => line.trim().replace(/[ \t]+/g, " "))
      .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
      .join("\n")
      .trim();
  }, [text]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cleaned);
      show("Cleaned text copied", "success");
    } catch {
      show("Could not copy — select and copy manually.", "error");
    }
  };

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <label className="label" htmlFor="cleaner-input">
          Original text
        </label>
        <textarea
          id="cleaner-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="input resize-y"
          placeholder="Paste messy text with extra spaces or blank lines..."
        />

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="cleaner-output">
              Cleaned result
            </label>
            <button onClick={copy} className="btn-ghost !px-2 !py-1 text-xs" disabled={!cleaned}>
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <textarea
            id="cleaner-output"
            readOnly
            value={cleaned}
            rows={8}
            className="input resize-y bg-ink-50"
          />
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "What does this remove exactly?",
                answer: "It trims leading and trailing spaces on each line, collapses repeated spaces and tabs into one, and removes consecutive blank lines.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
