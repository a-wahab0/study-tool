"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Flame, ListChecks, HelpCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { getSessions, getTasks, getQuizAttempts, getDecks, getMeta } from "@/core-lib/storage";
import type { StudySession, PlannerTask, QuizAttempt, FlashcardDeck, AppMeta } from "@/types";

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [meta, setMeta] = useState<AppMeta | null>(null);

  useEffect(() => {
    setSessions(getSessions());
    setTasks(getTasks());
    setAttempts(getQuizAttempts());
    setDecks(getDecks());
    setMeta(getMeta());
  }, []);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const avgQuizScore =
    attempts.length > 0
      ? Math.round((attempts.reduce((sum, a) => sum + a.score / a.total, 0) / attempts.length) * 100)
      : null;
  const totalCards = decks.reduce((sum, d) => sum + d.cards.length, 0);
  const reviewedCards = decks.reduce((sum, d) => sum + d.cards.filter((c) => c.reviewCount > 0).length, 0);

  const weekly = useMemo(() => {
    const days = lastNDays(7);
    return days.map((day) => ({
      day,
      minutes: sessions.filter((s) => s.date === day).reduce((sum, s) => sum + s.minutes, 0),
    }));
  }, [sessions]);

  const maxMinutes = Math.max(1, ...weekly.map((d) => d.minutes));

  return (
    <div>
      <PageHeader title="Progress" description="A snapshot of your study activity." />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Clock} label="Total study time" value={`${totalMinutes} min`} />
          <StatCard icon={Flame} label="Current streak" value={`${meta?.streak ?? 0} days`} />
          <StatCard icon={ListChecks} label="Tasks completed" value={String(completedTasks)} />
          <StatCard
            icon={HelpCircle}
            label="Avg. quiz score"
            value={avgQuizScore === null ? "—" : `${avgQuizScore}%`}
          />
        </div>

        <div className="mt-8 card p-4">
          <h2 className="text-sm font-semibold text-ink-800">Weekly activity</h2>
          <div className="mt-4 flex items-end gap-2 sm:gap-4" style={{ height: 140 }}>
            {weekly.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-brand-500"
                    style={{ height: `${Math.max(4, (d.minutes / maxMinutes) * 100)}%` }}
                    title={`${d.minutes} min`}
                  />
                </div>
                <span className="text-[10px] text-ink-400">
                  {new Date(d.day).toLocaleDateString(undefined, { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-ink-800">Flashcard progress</h2>
            {totalCards === 0 ? (
              <EmptyState icon={ListChecks} title="No flashcards yet" description="Create a deck to start tracking progress." />
            ) : (
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${Math.round((reviewedCards / totalCards) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-ink-500">
                  {reviewedCards} of {totalCards} cards reviewed at least once
                </p>
              </div>
            )}
          </div>

          <div className="card p-4">
            <h2 className="text-sm font-semibold text-ink-800">Recent quiz attempts</h2>
            {attempts.length === 0 ? (
              <EmptyState icon={HelpCircle} title="No quizzes taken yet" description="Take a quiz to see your scores here." />
            ) : (
              <ul className="mt-3 space-y-2">
                {attempts.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-ink-700">{a.topic}</span>
                    <span className="shrink-0 text-ink-500">
                      {a.score}/{a.total}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
