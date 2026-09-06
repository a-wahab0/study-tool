"use client";

import { useEffect, useMemo, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";

const tool = getToolBySlug("age-calculator")!;

function calculateAge(birthDate: Date, onDate: Date) {
  let years = onDate.getFullYear() - birthDate.getFullYear();
  let months = onDate.getMonth() - birthDate.getMonth();
  let days = onDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(onDate.getFullYear(), onDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = Math.floor((onDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  return { years, months, days, totalDays };
}

export default function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState("");
  const [onDate, setOnDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const result = useMemo(() => {
    if (!birthDate) return null;
    const b = new Date(birthDate);
    const o = new Date(onDate || new Date().toISOString().slice(0, 10));
    if (Number.isNaN(b.getTime()) || Number.isNaN(o.getTime()) || b > o) return null;
    return calculateAge(b, o);
  }, [birthDate, onDate]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="birth-date">
              Date of birth
            </label>
            <input
              id="birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="on-date">
              Calculate age on
            </label>
            <input
              id="on-date"
              type="date"
              value={onDate}
              onChange={(e) => setOnDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="mt-5">
          {result === null ? (
            <ResultCard label="Age" value="Enter a valid date of birth" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ResultCard label="Years" value={String(result.years)} emphasis />
              <ResultCard label="Months" value={String(result.months)} />
              <ResultCard label="Days" value={String(result.days)} />
              <ResultCard label="Total days lived" value={result.totalDays.toLocaleString()} />
            </div>
          )}
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Can I calculate age on a future or past date?",
                answer: "Yes — set the second date field to any date on or after the date of birth.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
