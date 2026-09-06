"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pin, Trash2, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getNotes, upsertNote, deleteNote, getSubjects } from "@/core-lib/storage";
import type { Note, Subject } from "@/types";
import { useToast } from "@/components/Toast";
import { cn } from "@/core-lib/utils";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Note | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { show } = useToast();

  useEffect(() => {
    setNotes(getNotes());
    setSubjects(getSubjects());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => subjectFilter === "all" || n.subjectId === subjectFilter)
      .filter(
        (n) =>
          q.length === 0 ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, query, subjectFilter]);

  const createNote = () => {
    const created = upsertNote({ title: "Untitled note", content: "" });
    setNotes(getNotes());
    setSelected(created);
  };

  const saveSelected = (updates: Partial<Note>) => {
    if (!selected) return;
    const updated = upsertNote({ ...selected, ...updates });
    setSelected(updated);
    setNotes(getNotes());
  };

  const togglePin = (note: Note) => {
    upsertNote({ id: note.id, pinned: !note.pinned });
    setNotes(getNotes());
    if (selected?.id === note.id) setSelected({ ...note, pinned: !note.pinned });
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteNote(confirmDeleteId);
    setNotes(getNotes());
    if (selected?.id === confirmDeleteId) setSelected(null);
    setConfirmDeleteId(null);
    show("Note deleted", "success");
  };

  const subjectName = (id: string | null) => subjects.find((s) => s.id === id)?.name ?? "General";

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Create, organize, and search your study notes."
        actions={
          <button onClick={createNote} className="btn-primary">
            <Plus className="h-4 w-4" /> New note
          </button>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes..."
              className="input pl-9"
            />
          </div>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="input sm:w-52">
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            {filtered.length === 0 ? (
              <EmptyState icon={Search} title="No notes found" description="Try a different search or create a new note." />
            ) : (
              <ul className="space-y-2">
                {filtered.map((note) => (
                  <li key={note.id}>
                    <button
                      onClick={() => setSelected(note)}
                      className={cn(
                        "card w-full p-3 text-left focus-ring",
                        selected?.id === note.id && "ring-2 ring-brand-500"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-ink-900">{note.title}</p>
                        {note.pinned && <Pin className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-ink-500">{note.content || "No content yet"}</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-400">
                        <span>{subjectName(note.subjectId)}</span>
                        {note.tags.length > 0 && <span>· {note.tags.join(", ")}</span>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            {selected ? (
              <div className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <input
                    value={selected.title}
                    onChange={(e) => saveSelected({ title: e.target.value })}
                    className="w-full border-none bg-transparent text-lg font-semibold text-ink-900 focus-ring rounded-md px-1 py-0.5"
                    aria-label="Note title"
                  />
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => togglePin(selected)}
                      className="btn-ghost !px-2"
                      aria-label={selected.pinned ? "Unpin note" : "Pin note"}
                    >
                      <Pin className={cn("h-4 w-4", selected.pinned && "fill-amber-400 text-amber-400")} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(selected.id)}
                      className="btn-ghost !px-2 text-red-500"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="note-subject">
                      Subject
                    </label>
                    <select
                      id="note-subject"
                      value={selected.subjectId ?? ""}
                      onChange={(e) => saveSelected({ subjectId: e.target.value || null })}
                      className="input"
                    >
                      <option value="">General</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="note-tags">
                      Tags (comma separated)
                    </label>
                    <input
                      id="note-tags"
                      value={selected.tags.join(", ")}
                      onChange={(e) =>
                        saveSelected({
                          tags: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="label" htmlFor="note-content">
                    Content
                  </label>
                  <textarea
                    id="note-content"
                    value={selected.content}
                    onChange={(e) => saveSelected({ content: e.target.value })}
                    rows={12}
                    className="input resize-y"
                  />
                </div>
              </div>
            ) : (
              <EmptyState icon={Plus} title="Select or create a note" description="Choose a note from the list, or create a new one." />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete this note?"
        description="This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
