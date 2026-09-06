"use client";

import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("date-difference")!;

export default function DateDifferencePage() {
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState("");

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const result = useMemo(() => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
    const diffMs = Math.abs(e.getTime() - s.getTime());
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return { days, weeks: (days / 7).toFixed(1), months: (days / 30.44).toFixed(1) };
  }, [start, end]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="start-date">
              Start date
            </label>
            <input id="start-date" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="end-date">
              End date
            </label>
            <input id="end-date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="input" />
          </div>
        </div>

        <div className="mt-5">
          {result === null ? (
            <ResultCard label="Difference" value="Choose both dates" />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <ResultCard label="Days" value={String(result.days)} emphasis />
              <ResultCard label="Weeks" value={result.weeks} />
              <ResultCard label="Months (approx.)" value={result.months} />
            </div>
          )}
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Does this count leap years?",
                answer: "Yes — the calculation is based on the actual calendar difference between the two dates, so leap years are automatically accounted for.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
