"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import ToolHeader from "@/components/ToolHeader";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";
import { useToast } from "@/components/Toast";

const tool = getToolBySlug("case-converter")!;

function toTitleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function toSentenceCase(s: string) {
  const lower = s.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

const CONVERSIONS: { label: string; transform: (s: string) => string }[] = [
  { label: "UPPERCASE", transform: (s) => s.toUpperCase() },
  { label: "lowercase", transform: (s) => s.toLowerCase() },
  { label: "Title Case", transform: toTitleCase },
  { label: "Sentence case", transform: toSentenceCase },
];

export default function CaseConverterPage() {
  const [text, setText] = useState("");
  const { show } = useToast();

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      show("Copied to clipboard", "success");
    } catch {
      show("Could not copy — select and copy manually.", "error");
    }
  };

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <label className="label" htmlFor="case-input">
          Text
        </label>
        <textarea
          id="case-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="input resize-y"
          placeholder="Type or paste your text..."
        />

        <div className="mt-4 space-y-3">
          {CONVERSIONS.map((c) => (
            <div key={c.label} className="rounded-lg border border-ink-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
                  {c.label}
                </span>
                <button
                  onClick={() => copy(c.transform(text))}
                  className="btn-ghost !px-2 !py-1 text-xs"
                  aria-label={`Copy ${c.label} result`}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <p className="mt-1.5 break-words text-sm text-ink-800">
                {text ? c.transform(text) : <span className="text-ink-300">Result will appear here</span>}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "What is sentence case?",
                answer: "Sentence case capitalizes only the first letter of each sentence, matching standard prose formatting.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
