"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ArrowLeft, ArrowRight, RotateCw, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getDecks, upsertDeck, deleteDeck, getSubjects, uid } from "@/core-lib/storage";
import type { Flashcard, FlashcardDeck, Subject } from "@/types";
import { useToast } from "@/components/Toast";
import { cn } from "@/core-lib/utils";

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [query, setQuery] = useState("");
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [studying, setStudying] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { show } = useToast();

  useEffect(() => {
    setDecks(getDecks());
    setSubjects(getSubjects());
  }, []);

  const activeDeck = decks.find((d) => d.id === activeDeckId) ?? null;

  const filteredDecks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return decks;
    return decks.filter((d) => d.name.toLowerCase().includes(q));
  }, [decks, query]);

  const createDeck = () => {
    const deck = upsertDeck({ name: "New deck", cards: [] });
    setDecks(getDecks());
    setActiveDeckId(deck.id);
  };

  const renameDeck = (id: string, name: string) => {
    upsertDeck({ id, name });
    setDecks(getDecks());
  };

  const setDeckSubject = (id: string, subjectId: string | null) => {
    upsertDeck({ id, subjectId });
    setDecks(getDecks());
  };

  const addCard = (deck: FlashcardDeck) => {
    const newCard: Flashcard = { id: uid(), front: "", back: "", lastResult: null, reviewCount: 0 };
    upsertDeck({ id: deck.id, cards: [...deck.cards, newCard] });
    setDecks(getDecks());
  };

  const updateCard = (deck: FlashcardDeck, cardId: string, updates: Partial<Flashcard>) => {
    upsertDeck({
      id: deck.id,
      cards: deck.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
    });
    setDecks(getDecks());
  };

  const removeCard = (deck: FlashcardDeck, cardId: string) => {
    upsertDeck({ id: deck.id, cards: deck.cards.filter((c) => c.id !== cardId) });
    setDecks(getDecks());
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteDeck(confirmDeleteId);
    setDecks(getDecks());
    if (activeDeckId === confirmDeleteId) setActiveDeckId(null);
    setConfirmDeleteId(null);
    show("Deck deleted", "success");
  };

  const startStudy = (deck: FlashcardDeck) => {
    if (deck.cards.length === 0) {
      show("Add at least one card before studying.", "error");
      return;
    }
    setActiveDeckId(deck.id);
    setStudying(true);
    setCardIndex(0);
    setFlipped(false);
  };

  const markResult = (result: "easy" | "good" | "hard") => {
    if (!activeDeck) return;
    const card = activeDeck.cards[cardIndex];
    updateCard(activeDeck, card.id, { lastResult: result, reviewCount: card.reviewCount + 1 });
    goNext();
  };

  const goNext = () => {
    if (!activeDeck) return;
    setFlipped(false);
    setCardIndex((i) => Math.min(i + 1, activeDeck.cards.length - 1));
  };

  const goPrev = () => {
    setFlipped(false);
    setCardIndex((i) => Math.max(i - 1, 0));
  };

  const subjectName = (id: string | null) => subjects.find((s) => s.id === id)?.name ?? "General";

  // ---------- Study mode ----------
  if (studying && activeDeck) {
    const card = activeDeck.cards[cardIndex];
    const progress = Math.round(((cardIndex + 1) / activeDeck.cards.length) * 100);
    return (
      <div>
        <PageHeader
          title={activeDeck.name}
          description={`Card ${cardIndex + 1} of ${activeDeck.cards.length}`}
          actions={
            <button className="btn-secondary" onClick={() => setStudying(false)}>
              Exit study mode
            </button>
          }
        />
        <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <button
            onClick={() => setFlipped((f) => !f)}
            className="card mt-6 flex min-h-[240px] w-full flex-col items-center justify-center gap-2 p-8 text-center focus-ring"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
              {flipped ? "Answer" : "Question"}
            </span>
            <p className="text-lg font-medium text-ink-900">{flipped ? card.back : card.front}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-ink-400">
              <RotateCw className="h-3.5 w-3.5" /> Tap to flip
            </span>
          </button>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button onClick={goPrev} disabled={cardIndex === 0} className="btn-secondary">
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
            <button
              onClick={goNext}
              disabled={cardIndex === activeDeck.cards.length - 1}
              className="btn-secondary"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {flipped && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button onClick={() => markResult("hard")} className="btn bg-red-50 text-red-700 hover:bg-red-100">
                Hard
              </button>
              <button onClick={() => markResult("good")} className="btn bg-amber-50 text-amber-700 hover:bg-amber-100">
                Good
              </button>
              <button onClick={() => markResult("easy")} className="btn bg-green-50 text-green-700 hover:bg-green-100">
                Easy
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- Deck editor ----------
  if (activeDeck) {
    return (
      <div>
        <PageHeader
          title="Edit deck"
          actions={
            <button className="btn-secondary" onClick={() => setActiveDeckId(null)}>
              Back to decks
            </button>
          }
        />
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="deck-name">
                Deck name
              </label>
              <input
                id="deck-name"
                value={activeDeck.name}
                onChange={(e) => renameDeck(activeDeck.id, e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="deck-subject">
                Subject
              </label>
              <select
                id="deck-subject"
                value={activeDeck.subjectId ?? ""}
                onChange={(e) => setDeckSubject(activeDeck.id, e.target.value || null)}
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
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => startStudy(activeDeck)} className="btn-primary">
              Study this deck
            </button>
            <button onClick={() => addCard(activeDeck)} className="btn-secondary">
              <Plus className="h-4 w-4" /> Add card
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {activeDeck.cards.length === 0 ? (
              <EmptyState icon={Plus} title="No cards yet" description="Add your first card to this deck." />
            ) : (
              activeDeck.cards.map((card, i) => (
                <div key={card.id} className="card p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-400">Card {i + 1}</span>
                    <button
                      onClick={() => removeCard(activeDeck, card.id)}
                      className="btn-ghost !px-2 text-red-500"
                      aria-label="Remove card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <textarea
                      value={card.front}
                      onChange={(e) => updateCard(activeDeck, card.id, { front: e.target.value })}
                      placeholder="Front (question)"
                      rows={2}
                      className="input resize-y"
                    />
                    <textarea
                      value={card.back}
                      onChange={(e) => updateCard(activeDeck, card.id, { back: e.target.value })}
                      placeholder="Back (answer)"
                      rows={2}
                      className="input resize-y"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Deck list ----------
  return (
    <div>
      <PageHeader
        title="Flashcards"
        description="Create decks and study with spaced review."
        actions={
          <button onClick={createDeck} className="btn-primary">
            <Plus className="h-4 w-4" /> New deck
          </button>
        }
      />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search decks..."
            className="input pl-9"
          />
        </div>

        <div className="mt-6">
          {filteredDecks.length === 0 ? (
            <EmptyState icon={Plus} title="No decks found" description="Create a new deck to get started." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDecks.map((deck) => (
                <div key={deck.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-ink-900">{deck.name}</h3>
                      <p className="text-xs text-ink-500">
                        {subjectName(deck.subjectId)} · {deck.cards.length} card
                        {deck.cards.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      onClick={() => setConfirmDeleteId(deck.id)}
                      className="btn-ghost !px-2 text-red-500"
                      aria-label={`Delete ${deck.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className={cn("mt-4 flex gap-2")}>
                    <button onClick={() => startStudy(deck)} className="btn-primary flex-1">
                      Study
                    </button>
                    <button onClick={() => setActiveDeckId(deck.id)} className="btn-secondary flex-1">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete this deck?"
        description="All cards in this deck will be permanently removed."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
