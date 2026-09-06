"use client";

import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("text-diff")!;

// Simple line-based diff (LCS-based) — good enough for essay/paragraph comparison
// without pulling in a heavy diff library.
function diffLines(a: string[], b: string[]) {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result: { type: "same" | "removed" | "added"; text: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: a[i] });
      i++;
    } else {
      result.push({ type: "added", text: b[j] });
      j++;
    }
  }
  while (i < n) result.push({ type: "removed", text: a[i++] });
  while (j < m) result.push({ type: "added", text: b[j++] });
  return result;
}

export default function TextDiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const diff = useMemo(() => diffLines(left.split("\n"), right.split("\n")), [left, right]);
  const added = diff.filter((d) => d.type === "added").length;
  const removed = diff.filter((d) => d.type === "removed").length;

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="diff-left">
              Original text
            </label>
            <textarea
              id="diff-left"
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              rows={8}
              className="input resize-y"
            />
          </div>
          <div>
            <label className="label" htmlFor="diff-right">
              Revised text
            </label>
            <textarea
              id="diff-right"
              value={right}
              onChange={(e) => setRight(e.target.value)}
              rows={8}
              className="input resize-y"
            />
          </div>
        </div>

        <p className="mt-3 text-sm text-ink-500">
          {added} line{added === 1 ? "" : "s"} added, {removed} line{removed === 1 ? "" : "s"} removed
        </p>

        <div className="mt-3 card divide-y divide-ink-100 font-mono text-sm">
          {diff.length === 0 ? (
            <p className="px-4 py-3 text-ink-400">Enter text in both boxes to see the comparison.</p>
          ) : (
            diff.map((line, idx) => (
              <div
                key={idx}
                className={
                  "whitespace-pre-wrap break-words px-3 py-1.5 " +
                  (line.type === "added"
                    ? "bg-green-50 text-green-800"
                    : line.type === "removed"
                    ? "bg-red-50 text-red-800 line-through decoration-red-400"
                    : "text-ink-600")
                }
              >
                {line.text || " "}
              </div>
            ))
          )}
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "How does the comparison work?",
                answer: "Text is compared line by line. Lines only in the revised version are highlighted green, and lines only in the original are highlighted red with a strikethrough.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
