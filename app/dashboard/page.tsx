"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  BookOpen,
  ListChecks,
  NotebookPen,
  Layers,
  HelpCircle,
  Timer,
  CalendarClock,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import {
  getMeta,
  getSessions,
  getSubjects,
  getTasks,
  getNotes,
} from "@/core-lib/storage";
import type { AppMeta, Note, PlannerTask, StudySession, Subject } from "@/types";

export default function DashboardPage() {
  const [meta, setMeta] = useState<AppMeta | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    setMeta(getMeta());
    setSessions(getSessions());
    setSubjects(getSubjects());
    setTasks(getTasks());
    setNotes(getNotes());
  }, []);

  const todayMinutes = sessions
    .filter((s) => s.date === new Date().toISOString().slice(0, 10))
    .reduce((sum, s) => sum + s.minutes, 0);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const upcomingTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, 5);
  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  const subjectName = (id: string | null) =>
    subjects.find((s) => s.id === id)?.name ?? "General";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <PageHeader title={`${greeting}.`} description="Here's where things stand today." />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Clock} label="Today's study time" value={`${todayMinutes} min`} />
          <StatCard icon={Flame} label="Current streak" value={`${meta?.streak ?? 0} days`} />
          <StatCard icon={BookOpen} label="Subjects" value={String(subjects.length)} />
          <StatCard icon={ListChecks} label="Total study time" value={`${totalMinutes} min`} />
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-ink-800">Quick actions</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { href: "/flashcards", label: "Flashcards", icon: Layers },
              { href: "/quiz", label: "Generate Quiz", icon: HelpCircle },
              { href: "/notes", label: "Study Notes", icon: NotebookPen },
              { href: "/tools/pomodoro", label: "Pomodoro", icon: Timer },
              { href: "/planner", label: "Study Planner", icon: CalendarClock },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="card flex flex-col items-center gap-2 px-3 py-4 text-center hover:shadow-md focus-ring"
              >
                <action.icon className="h-5 w-5 text-brand-600" />
                <span className="text-xs font-medium text-ink-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Upcoming tasks */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-800">Upcoming tasks</h2>
              <Link href="/planner" className="text-xs font-medium text-brand-600 hover:underline">
                View planner
              </Link>
            </div>
            <div className="mt-3">
              {upcomingTasks.length === 0 ? (
                <EmptyState icon={ListChecks} title="No upcoming tasks" description="Add a task in the planner to see it here." />
              ) : (
                <ul className="card divide-y divide-ink-100">
                  {upcomingTasks.map((t) => (
                    <li key={t.id} className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-800">{t.title}</p>
                        <p className="text-xs text-ink-500">{subjectName(t.subjectId)}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-400">
                        {t.dueDate ?? "No due date"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent notes */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-800">Recent notes</h2>
              <Link href="/notes" className="text-xs font-medium text-brand-600 hover:underline">
                View notes
              </Link>
            </div>
            <div className="mt-3">
              {recentNotes.length === 0 ? (
                <EmptyState icon={NotebookPen} title="No notes yet" description="Create your first note to see it here." />
              ) : (
                <ul className="card divide-y divide-ink-100">
                  {recentNotes.map((n) => (
                    <li key={n.id} className="px-4 py-3">
                      <p className="truncate text-sm font-medium text-ink-800">{n.title}</p>
                      <p className="truncate text-xs text-ink-500">{n.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
