"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import ToolHeader from "@/components/ToolHeader";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool, uid } from "@/core-lib/storage";

const tool = getToolBySlug("gpa-calculator")!;

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: string;
}

export default function GpaCalculatorPage() {
  const [courses, setCourses] = useState<Course[]>([
    { id: uid(), name: "Course 1", grade: "A", credits: "3" },
    { id: uid(), name: "Course 2", grade: "B+", credits: "3" },
  ]);

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const addCourse = () => {
    setCourses((prev) => [...prev, { id: uid(), name: `Course ${prev.length + 1}`, grade: "A", credits: "3" }]);
  };

  const removeCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const { gpa, totalCredits } = useMemo(() => {
    let points = 0;
    let credits = 0;
    for (const c of courses) {
      const credit = Number(c.credits) || 0;
      const gradePoint = GRADE_POINTS[c.grade] ?? 0;
      points += credit * gradePoint;
      credits += credit;
    }
    return { gpa: credits > 0 ? points / credits : 0, totalCredits: credits };
  }, [courses]);

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="space-y-2">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col gap-2 rounded-lg border border-ink-200 bg-white p-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={course.name}
                onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                className="input sm:flex-1"
                aria-label="Course name"
              />
              <select
                value={course.grade}
                onChange={(e) => updateCourse(course.id, { grade: e.target.value })}
                className="input sm:w-28"
                aria-label="Grade"
              >
                {Object.keys(GRADE_POINTS).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={course.credits}
                onChange={(e) => updateCourse(course.id, { credits: e.target.value })}
                className="input sm:w-24"
                min={0}
                aria-label="Credits"
              />
              <button
                onClick={() => removeCourse(course.id)}
                className="btn-ghost !px-2 sm:w-auto"
                aria-label={`Remove ${course.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button onClick={addCourse} className="btn-secondary mt-3">
          <Plus className="h-4 w-4" /> Add course
        </button>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <ResultCard label="GPA" value={gpa.toFixed(2)} emphasis />
          <ResultCard label="Total credits" value={String(totalCredits)} />
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "What grading scale is used?",
                answer: "This calculator uses the standard U.S. 4.0 scale. If your institution uses a different scale, the credit-weighted average logic still applies — only the grade point values would differ.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
