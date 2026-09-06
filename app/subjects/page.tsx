"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getSubjects, addSubject, updateSubject, deleteSubject, getNotes, getDecks } from "@/core-lib/storage";
import type { Subject } from "@/types";
import { useToast } from "@/components/Toast";

const COLOR_OPTIONS = ["#3660f5", "#16a34a", "#dc2626", "#9333ea", "#d97706", "#0891b2", "#db2777"];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({});
  const [deckCounts, setDeckCounts] = useState<Record<string, number>>({});
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { show } = useToast();

  useEffect(() => {
    setSubjects(getSubjects());
    const notes = getNotes();
    const decks = getDecks();
    const nc: Record<string, number> = {};
    const dc: Record<string, number> = {};
    for (const n of notes) if (n.subjectId) nc[n.subjectId] = (nc[n.subjectId] ?? 0) + 1;
    for (const d of decks) if (d.subjectId) dc[d.subjectId] = (dc[d.subjectId] ?? 0) + 1;
    setNoteCounts(nc);
    setDeckCounts(dc);
  }, []);

  const create = () => {
    if (!newName.trim()) return;
    addSubject(newName.trim(), newColor);
    setSubjects(getSubjects());
    setNewName("");
  };

  const rename = (id: string, name: string) => {
    updateSubject(id, { name });
    setSubjects(getSubjects());
  };

  const recolor = (id: string, color: string) => {
    updateSubject(id, { color });
    setSubjects(getSubjects());
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteSubject(confirmDeleteId);
    setSubjects(getSubjects());
    setConfirmDeleteId(null);
    show("Subject deleted", "success");
  };

  return (
    <div>
      <PageHeader title="Subjects" description="Organize your notes, flashcards, and quizzes by subject." />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New subject name"
            className="input sm:flex-1"
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
          <div className="flex gap-1.5">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="h-7 w-7 rounded-full ring-offset-2 focus-ring"
                style={{ backgroundColor: c, outline: newColor === c ? `2px solid ${c}` : undefined }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
          <button onClick={create} className="btn-primary">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        <div className="mt-6">
          {subjects.length === 0 ? (
            <EmptyState icon={Plus} title="No subjects yet" description="Add a subject above to get started." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {subjects.map((s) => (
                <div key={s.id} className="card p-4">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                    <input
                      value={s.name}
                      onChange={(e) => rename(s.id, e.target.value)}
                      className="flex-1 border-none bg-transparent text-sm font-semibold text-ink-900 focus-ring rounded-md px-1"
                    />
                    <button
                      onClick={() => setConfirmDeleteId(s.id)}
                      className="btn-ghost !px-2 text-red-500"
                      aria-label={`Delete ${s.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => recolor(s.id, c)}
                        className="h-5 w-5 rounded-full"
                        style={{ backgroundColor: c, outline: s.color === c ? `2px solid ${c}` : undefined, outlineOffset: 2 }}
                        aria-label={`Set color ${c}`}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-ink-500">
                    <Link href="/notes" className="hover:underline">
                      {noteCounts[s.id] ?? 0} notes
                    </Link>
                    <Link href="/flashcards" className="hover:underline">
                      {deckCounts[s.id] ?? 0} decks
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete this subject?"
        description="Notes and decks assigned to it will move to General."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
