"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { getSubjects, addQuizAttempt } from "@/core-lib/storage";
import type { QuizQuestion, Subject } from "@/types";
import { useToast } from "@/components/Toast";
import { cn } from "@/core-lib/utils";

type Difficulty = "easy" | "medium" | "hard";

export default function QuizPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    const s = getSubjects();
    setSubjects(s);
    if (s.length > 0) setSubject(s[0].name);
  }, []);

  const generate = async () => {
    if (!topic.trim()) {
      show("Enter a topic to generate questions about.", "error");
      return;
    }
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, difficulty, count }),
      });
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setDemoMode(Boolean(data.demo));
      if (data.demo) {
        show("No AI provider configured — showing demo questions.", "info");
      }
    } catch {
      show("Could not generate questions right now. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const submit = () => {
    if (Object.keys(answers).length < questions.length) {
      show("Answer every question before submitting.", "error");
      return;
    }
    setSubmitted(true);
    const score = questions.filter((q) => answers[q.id] === q.correctIndex).length;
    addQuizAttempt({
      subject,
      topic,
      difficulty,
      score,
      total: questions.length,
      takenAt: new Date().toISOString(),
    });
  };

  const score = questions.filter((q) => answers[q.id] === q.correctIndex).length;

  return (
    <div>
      <PageHeader title="Quiz" description="Generate multiple-choice questions to test yourself." />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="card p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="quiz-subject">
                Subject
              </label>
              <select id="quiz-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="input">
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="quiz-topic">
                Topic
              </label>
              <input
                id="quiz-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Newton's laws"
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="quiz-difficulty">
                Difficulty
              </label>
              <select
                id="quiz-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="input"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="quiz-count">
                Number of questions
              </label>
              <input
                id="quiz-count"
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                className="input"
              />
            </div>
          </div>
          <button onClick={generate} className="btn-primary mt-4" disabled={loading}>
            {loading ? "Generating..." : "Generate quiz"}
          </button>
          {demoMode && (
            <p className="mt-2 text-xs text-amber-700">
              Running in demo mode — connect OPENROUTER_API_KEY for real AI-generated questions.
            </p>
          )}
        </div>

        <div className="mt-6">
          {questions.length === 0 ? (
            <EmptyState icon={HelpCircle} title="No quiz yet" description="Fill in the form above and generate a quiz." />
          ) : (
            <div className="space-y-4">
              {questions.map((q, qi) => {
                const selected = answers[q.id];
                return (
                  <div key={q.id} className="card p-4">
                    <p className="text-sm font-semibold text-ink-900">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, oi) => {
                        const isCorrect = submitted && oi === q.correctIndex;
                        const isWrongSelected = submitted && selected === oi && oi !== q.correctIndex;
                        return (
                          <button
                            key={oi}
                            onClick={() => selectAnswer(q.id, oi)}
                            className={cn(
                              "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm focus-ring",
                              selected === oi && !submitted && "border-brand-500 bg-brand-50",
                              isCorrect && "border-green-500 bg-green-50 text-green-800",
                              isWrongSelected && "border-red-500 bg-red-50 text-red-800",
                              !submitted && selected !== oi && "border-ink-200 hover:bg-ink-50"
                            )}
                          >
                            {opt}
                            {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                            {isWrongSelected && <XCircle className="h-4 w-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && (
                      <p className="mt-2 text-xs text-ink-500">{q.explanation}</p>
                    )}
                  </div>
                );
              })}

              {!submitted ? (
                <button onClick={submit} className="btn-primary">
                  Submit answers
                </button>
              ) : (
                <div className="card p-4 text-center">
                  <p className="text-2xl font-semibold text-ink-900">
                    {score} / {questions.length}
                  </p>
                  <p className="text-sm text-ink-500">
                    {Math.round((score / questions.length) * 100)}% correct
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
