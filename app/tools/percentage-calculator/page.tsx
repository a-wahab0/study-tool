"use client";

import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import CalculatorInput from "@/components/CalculatorInput";
import ResultCard from "@/components/ResultCard";
import CategoryFilter from "@/components/CategoryFilter";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("percentage-calculator")!;

type Mode = "basic" | "change" | "of-total";

export default function PercentageCalculatorPage() {
  const [mode, setMode] = useState<Mode>("basic");
  const [a, setA] = useState("25");
  const [b, setB] = useState("200");

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const result = useMemo(() => {
    const numA = Number(a);
    const numB = Number(b);
    if (Number.isNaN(numA) || Number.isNaN(numB)) return null;
    if (mode === "basic") return (numA / 100) * numB;
    if (mode === "of-total") return numB === 0 ? null : (numA / numB) * 100;
    if (mode === "change") return numA === 0 ? null : ((numB - numA) / Math.abs(numA)) * 100;
    return null;
  }, [mode, a, b]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
        <CategoryFilter
          options={[
            { value: "basic", label: "X% of Y" },
            { value: "of-total", label: "X is what % of Y" },
            { value: "change", label: "% change" },
          ]}
          active={mode}
          onChange={setMode}
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          {mode === "basic" && (
            <>
              <CalculatorInput label="Percentage" value={a} onChange={setA} suffix="%" />
              <CalculatorInput label="Of value" value={b} onChange={setB} />
            </>
          )}
          {mode === "of-total" && (
            <>
              <CalculatorInput label="Value" value={a} onChange={setA} />
              <CalculatorInput label="Total" value={b} onChange={setB} />
            </>
          )}
          {mode === "change" && (
            <>
              <CalculatorInput label="Original value" value={a} onChange={setA} />
              <CalculatorInput label="New value" value={b} onChange={setB} />
            </>
          )}
        </div>

        <div className="mt-5">
          {result === null ? (
            <ResultCard label="Result" value="Enter valid numbers" />
          ) : mode === "basic" ? (
            <ResultCard label="Result" value={result.toLocaleString(undefined, { maximumFractionDigits: 2 })} emphasis />
          ) : (
            <ResultCard
              label={mode === "of-total" ? "Percentage" : "Percentage change"}
              value={`${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`}
              emphasis
              helper={mode === "change" ? (result >= 0 ? "Increase" : "Decrease") : undefined}
            />
          )}
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Which mode should I use for grades?",
                answer: "Use 'X is what % of Y' with your score as X and the total possible marks as Y.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
