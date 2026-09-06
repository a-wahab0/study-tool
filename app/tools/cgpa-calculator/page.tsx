"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import ToolHeader from "@/components/ToolHeader";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool, uid } from "@/core-lib/storage";

const tool = getToolBySlug("cgpa-calculator")!;

interface Semester {
  id: string;
  label: string;
  gpa: string;
  credits: string;
}

export default function CgpaCalculatorPage() {
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: uid(), label: "Semester 1", gpa: "3.5", credits: "15" },
    { id: uid(), label: "Semester 2", gpa: "3.7", credits: "15" },
  ]);

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const update = (id: string, updates: Partial<Semester>) => {
    setSemesters((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const add = () => {
    setSemesters((prev) => [
      ...prev,
      { id: uid(), label: `Semester ${prev.length + 1}`, gpa: "3.5", credits: "15" },
    ]);
  };

  const remove = (id: string) => setSemesters((prev) => prev.filter((s) => s.id !== id));

  const { cgpa, totalCredits } = useMemo(() => {
    let points = 0;
    let credits = 0;
    for (const s of semesters) {
      const c = Number(s.credits) || 0;
      const g = Number(s.gpa) || 0;
      points += c * g;
      credits += c;
    }
    return { cgpa: credits > 0 ? points / credits : 0, totalCredits: credits };
  }, [semesters]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="space-y-2">
          {semesters.map((s) => (
            <div key={s.id} className="flex flex-col gap-2 rounded-lg border border-ink-200 bg-white p-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={s.label}
                onChange={(e) => update(s.id, { label: e.target.value })}
                className="input sm:flex-1"
                aria-label="Semester label"
              />
              <input
                type="number"
                value={s.gpa}
                onChange={(e) => update(s.id, { gpa: e.target.value })}
                className="input sm:w-24"
                step={0.01}
                min={0}
                max={4}
                aria-label="Semester GPA"
                placeholder="GPA"
              />
              <input
                type="number"
                value={s.credits}
                onChange={(e) => update(s.id, { credits: e.target.value })}
                className="input sm:w-24"
                min={0}
                aria-label="Credits"
                placeholder="Credits"
              />
              <button onClick={() => remove(s.id)} className="btn-ghost !px-2" aria-label={`Remove ${s.label}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button onClick={add} className="btn-secondary mt-3">
          <Plus className="h-4 w-4" /> Add semester
        </button>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <ResultCard label="CGPA" value={cgpa.toFixed(2)} emphasis />
          <ResultCard label="Total credits" value={String(totalCredits)} />
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "How is CGPA different from GPA?",
                answer: "GPA reflects one semester; CGPA is the credit-weighted average of your GPA across every semester entered here.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
