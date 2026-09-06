"use client";

import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import CalculatorInput from "@/components/CalculatorInput";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("grade-calculator")!;

export default function GradeCalculatorPage() {
  const [currentGrade, setCurrentGrade] = useState("78");
  const [currentWeight, setCurrentWeight] = useState("70");
  const [desiredGrade, setDesiredGrade] = useState("85");

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const result = useMemo(() => {
    const current = Number(currentGrade);
    const weight = Number(currentWeight) / 100;
    const desired = Number(desiredGrade);
    if ([current, weight, desired].some((n) => Number.isNaN(n)) || weight <= 0 || weight >= 1) {
      return null;
    }
    const finalWeight = 1 - weight;
    const needed = (desired - current * weight) / finalWeight;
    return needed;
  }, [currentGrade, currentWeight, desiredGrade]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CalculatorInput label="Current grade" value={currentGrade} onChange={setCurrentGrade} suffix="%" />
          <CalculatorInput
            label="Weight completed so far"
            value={currentWeight}
            onChange={setCurrentWeight}
            suffix="%"
          />
          <CalculatorInput label="Desired final grade" value={desiredGrade} onChange={setDesiredGrade} suffix="%" />
        </div>

        <div className="mt-5">
          {result === null ? (
            <ResultCard label="Score needed on remaining work" value="Enter a weight between 1–99%" />
          ) : (
            <ResultCard
              label="Score needed on remaining work"
              value={`${result.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
              emphasis
              helper={
                result > 100
                  ? "Not achievable — even 100% won't reach your target."
                  : result < 0
                  ? "Already achieved — you can score 0% and still hit your target."
                  : undefined
              }
            />
          )}
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "How is this calculated?",
                answer:
                  "It assumes your final grade is a weighted average of your current grade and the remaining coursework, then solves for the score needed on the remaining portion.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
