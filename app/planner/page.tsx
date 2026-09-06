"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CategoryFilter from "@/components/CategoryFilter";
import EmptyState from "@/components/EmptyState";
import { getTasks, upsertTask, deleteTask, getSubjects } from "@/core-lib/storage";
import type { PlannerTask, Subject } from "@/types";
import { cn } from "@/core-lib/utils";

type ViewMode = "all" | "today" | "week";

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function PlannerPage() {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [view, setView] = useState<ViewMode>("all");
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  useEffect(() => {
    setTasks(getTasks());
    setSubjects(getSubjects());
  }, []);

  const addTask = () => {
    if (!newTitle.trim()) return;
    upsertTask({ title: newTitle.trim(), subjectId: newSubject || null, dueDate: newDueDate || null });
    setTasks(getTasks());
    setNewTitle("");
    setNewDueDate("");
  };

  const toggleComplete = (task: PlannerTask) => {
    upsertTask({ id: task.id, completed: !task.completed });
    setTasks(getTasks());
  };

  const removeTask = (id: string) => {
    deleteTask(id);
    setTasks(getTasks());
  };

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekStart = startOfWeek(new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return tasks
      .filter((t) => {
        if (view === "all") return true;
        if (!t.dueDate) return false;
        if (view === "today") return t.dueDate === today;
        const due = new Date(t.dueDate);
        return due >= weekStart && due <= weekEnd;
      })
      .sort((a, b) => Number(a.completed) - Number(b.completed) || (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  }, [tasks, view]);

  const subjectName = (id: string | null) => subjects.find((s) => s.id === id)?.name ?? "General";

  return (
    <div>
      <PageHeader title="Study Planner" description="Track tasks, deadlines, and study sessions." />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="card p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a task..."
              className="input"
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="input">
              <option value="">General</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="input"
            />
            <button onClick={addTask} className="btn-primary">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>

        <div className="mt-5">
          <CategoryFilter
            options={[
              { value: "all", label: "All tasks" },
              { value: "today", label: "Today" },
              { value: "week", label: "This week" },
            ]}
            active={view}
            onChange={setView}
          />
        </div>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState icon={Plus} title="No tasks here" description="Add a task above to get started." />
          ) : (
            <ul className="card divide-y divide-ink-100">
              {filtered.map((task) => (
                <li key={task.id} className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => toggleComplete(task)}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border focus-ring",
                      task.completed ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300"
                    )}
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.completed && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm font-medium", task.completed ? "text-ink-400 line-through" : "text-ink-800")}>
                      {task.title}
                    </p>
                    <p className="text-xs text-ink-400">
                      {subjectName(task.subjectId)}
                      {task.dueDate ? ` · Due ${task.dueDate}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="btn-ghost !px-2 shrink-0 text-red-500"
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
