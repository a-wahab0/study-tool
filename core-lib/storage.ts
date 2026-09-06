import type {
  AppMeta,
  ChatMessage,
  Flashcard,
  FlashcardDeck,
  Note,
  PlannerTask,
  PomodoroSettings,
  PomodoroStats,
  QuizAttempt,
  StudySession,
  Subject,
} from "@/types";

const STORAGE_VERSION = 1;

const KEYS = {
  meta: "studyhub:meta",
  subjects: "studyhub:subjects",
  notes: "studyhub:notes",
  decks: "studyhub:decks",
  tasks: "studyhub:tasks",
  sessions: "studyhub:sessions",
  quizAttempts: "studyhub:quiz-attempts",
  pomodoroSettings: "studyhub:pomodoro-settings",
  pomodoroStats: "studyhub:pomodoro-stats",
  chatHistory: "studyhub:chat-history",
  favoriteTools: "studyhub:favorite-tools",
  recentTools: "studyhub:recent-tools",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

/** Safe read: returns fallback on missing key, corrupted JSON, or SSR. */
function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    // Corrupted data — do not throw, fall back silently.
    return fallback;
  }
}

/** Safe write: never throws (e.g. quota exceeded, private browsing). */
function write<T>(key: string, value: T): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Meta / streak ----------

export function getMeta(): AppMeta {
  return read<AppMeta>(KEYS.meta, {
    version: STORAGE_VERSION,
    firstLaunchAt: new Date().toISOString(),
    streak: 0,
    lastActiveDate: null,
  });
}

/** Call once per session on app load to update the daily streak. */
export function touchStreak(): AppMeta {
  const meta = getMeta();
  const today = new Date().toISOString().slice(0, 10);
  if (meta.lastActiveDate === today) return meta;

  let streak = meta.streak;
  if (meta.lastActiveDate) {
    const last = new Date(meta.lastActiveDate);
    const diffDays = Math.round(
      (new Date(today).getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    streak = diffDays === 1 ? streak + 1 : 1;
  } else {
    streak = 1;
  }

  const updated: AppMeta = { ...meta, streak, lastActiveDate: today };
  write(KEYS.meta, updated);
  return updated;
}

// ---------- Subjects ----------

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "sub-physics", name: "Physics", color: "#3660f5", createdAt: new Date().toISOString() },
  { id: "sub-chemistry", name: "Chemistry", color: "#16a34a", createdAt: new Date().toISOString() },
  { id: "sub-biology", name: "Biology", color: "#dc2626", createdAt: new Date().toISOString() },
  { id: "sub-math", name: "Mathematics", color: "#9333ea", createdAt: new Date().toISOString() },
  { id: "sub-english", name: "English", color: "#d97706", createdAt: new Date().toISOString() },
];

export function getSubjects(): Subject[] {
  const existing = read<Subject[] | null>(KEYS.subjects, null);
  if (existing && Array.isArray(existing)) return existing;
  write(KEYS.subjects, DEFAULT_SUBJECTS);
  return DEFAULT_SUBJECTS;
}

export function saveSubjects(subjects: Subject[]): void {
  write(KEYS.subjects, subjects);
}

export function addSubject(name: string, color: string): Subject {
  const subjects = getSubjects();
  const subject: Subject = { id: uid(), name, color, createdAt: new Date().toISOString() };
  saveSubjects([...subjects, subject]);
  return subject;
}

export function updateSubject(id: string, updates: Partial<Subject>): void {
  const subjects = getSubjects().map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveSubjects(subjects);
}

export function deleteSubject(id: string): void {
  saveSubjects(getSubjects().filter((s) => s.id !== id));
}

// ---------- Notes ----------

function seedNotes(): Note[] {
  const now = new Date().toISOString();
  return [
    {
      id: uid(),
      title: "Newton's Laws — quick summary",
      content:
        "1. An object stays at rest or in uniform motion unless acted on by a force.\n2. F = ma.\n3. Every action has an equal and opposite reaction.",
      subjectId: "sub-physics",
      tags: ["mechanics", "exam"],
      pinned: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uid(),
      title: "Cell organelles",
      content: "Mitochondria — energy. Nucleus — DNA storage. Ribosomes — protein synthesis.",
      subjectId: "sub-biology",
      tags: ["cells"],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function getNotes(): Note[] {
  const existing = read<Note[] | null>(KEYS.notes, null);
  if (existing && Array.isArray(existing)) return existing;
  const seeded = seedNotes();
  write(KEYS.notes, seeded);
  return seeded;
}

export function saveNotes(notes: Note[]): void {
  write(KEYS.notes, notes);
}

export function upsertNote(note: Partial<Note> & { id?: string }): Note {
  const notes = getNotes();
  const now = new Date().toISOString();
  if (note.id) {
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      const updated = { ...notes[idx], ...note, updatedAt: now } as Note;
      notes[idx] = updated;
      saveNotes(notes);
      return updated;
    }
  }
  const created: Note = {
    id: uid(),
    title: note.title ?? "Untitled note",
    content: note.content ?? "",
    subjectId: note.subjectId ?? null,
    tags: note.tags ?? [],
    pinned: note.pinned ?? false,
    createdAt: now,
    updatedAt: now,
  };
  saveNotes([created, ...notes]);
  return created;
}

export function deleteNote(id: string): void {
  saveNotes(getNotes().filter((n) => n.id !== id));
}

// ---------- Flashcard decks ----------

function seedDecks(): FlashcardDeck[] {
  return [
    {
      id: uid(),
      name: "Physics: Kinematics",
      subjectId: "sub-physics",
      createdAt: new Date().toISOString(),
      cards: [
        { id: uid(), front: "What is velocity?", back: "Rate of change of displacement with time.", lastResult: null, reviewCount: 0 },
        { id: uid(), front: "Formula for acceleration", back: "a = (v - u) / t", lastResult: null, reviewCount: 0 },
        { id: uid(), front: "Unit of force", back: "Newton (N)", lastResult: null, reviewCount: 0 },
      ],
    },
    {
      id: uid(),
      name: "Biology: Cell Structure",
      subjectId: "sub-biology",
      createdAt: new Date().toISOString(),
      cards: [
        { id: uid(), front: "Powerhouse of the cell", back: "Mitochondria", lastResult: null, reviewCount: 0 },
        { id: uid(), front: "Where is DNA stored?", back: "Nucleus", lastResult: null, reviewCount: 0 },
      ],
    },
  ];
}

export function getDecks(): FlashcardDeck[] {
  const existing = read<FlashcardDeck[] | null>(KEYS.decks, null);
  if (existing && Array.isArray(existing)) return existing;
  const seeded = seedDecks();
  write(KEYS.decks, seeded);
  return seeded;
}

export function saveDecks(decks: FlashcardDeck[]): void {
  write(KEYS.decks, decks);
}

export function upsertDeck(deck: Partial<FlashcardDeck> & { id?: string }): FlashcardDeck {
  const decks = getDecks();
  if (deck.id) {
    const idx = decks.findIndex((d) => d.id === deck.id);
    if (idx >= 0) {
      const updated = { ...decks[idx], ...deck } as FlashcardDeck;
      decks[idx] = updated;
      saveDecks(decks);
      return updated;
    }
  }
  const created: FlashcardDeck = {
    id: uid(),
    name: deck.name ?? "New deck",
    subjectId: deck.subjectId ?? null,
    cards: deck.cards ?? [],
    createdAt: new Date().toISOString(),
  };
  saveDecks([created, ...decks]);
  return created;
}

export function deleteDeck(id: string): void {
  saveDecks(getDecks().filter((d) => d.id !== id));
}

// ---------- Planner tasks ----------

function seedTasks(): PlannerTask[] {
  const inDays = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  return [
    { id: uid(), title: "Finish Physics problem set", subjectId: "sub-physics", dueDate: inDays(2), completed: false, createdAt: new Date().toISOString() },
    { id: uid(), title: "Review Chemistry chapter 4", subjectId: "sub-chemistry", dueDate: inDays(1), completed: false, createdAt: new Date().toISOString() },
    { id: uid(), title: "English essay draft", subjectId: "sub-english", dueDate: inDays(5), completed: false, createdAt: new Date().toISOString() },
  ];
}

export function getTasks(): PlannerTask[] {
  const existing = read<PlannerTask[] | null>(KEYS.tasks, null);
  if (existing && Array.isArray(existing)) return existing;
  const seeded = seedTasks();
  write(KEYS.tasks, seeded);
  return seeded;
}

export function saveTasks(tasks: PlannerTask[]): void {
  write(KEYS.tasks, tasks);
}

export function upsertTask(task: Partial<PlannerTask> & { id?: string }): PlannerTask {
  const tasks = getTasks();
  if (task.id) {
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      const updated = { ...tasks[idx], ...task } as PlannerTask;
      tasks[idx] = updated;
      saveTasks(tasks);
      return updated;
    }
  }
  const created: PlannerTask = {
    id: uid(),
    title: task.title ?? "New task",
    subjectId: task.subjectId ?? null,
    dueDate: task.dueDate ?? null,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  saveTasks([created, ...tasks]);
  return created;
}

export function deleteTask(id: string): void {
  saveTasks(getTasks().filter((t) => t.id !== id));
}

// ---------- Study sessions (for progress tracking) ----------

function seedSessions(): StudySession[] {
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  return [
    { id: uid(), subjectId: "sub-physics", minutes: 45, date: daysAgo(0) },
    { id: uid(), subjectId: "sub-math", minutes: 30, date: daysAgo(1) },
    { id: uid(), subjectId: "sub-chemistry", minutes: 50, date: daysAgo(2) },
    { id: uid(), subjectId: "sub-biology", minutes: 20, date: daysAgo(3) },
    { id: uid(), subjectId: "sub-english", minutes: 35, date: daysAgo(4) },
  ];
}

export function getSessions(): StudySession[] {
  const existing = read<StudySession[] | null>(KEYS.sessions, null);
  if (existing && Array.isArray(existing)) return existing;
  const seeded = seedSessions();
  write(KEYS.sessions, seeded);
  return seeded;
}

export function addSession(session: Omit<StudySession, "id">): void {
  const sessions = getSessions();
  write(KEYS.sessions, [{ ...session, id: uid() }, ...sessions]);
}

// ---------- Quiz attempts ----------

export function getQuizAttempts(): QuizAttempt[] {
  return read<QuizAttempt[]>(KEYS.quizAttempts, []);
}

export function addQuizAttempt(attempt: Omit<QuizAttempt, "id">): void {
  const attempts = getQuizAttempts();
  write(KEYS.quizAttempts, [{ ...attempt, id: uid() }, ...attempts]);
}

// ---------- Pomodoro ----------

export function getPomodoroSettings(): PomodoroSettings {
  return read<PomodoroSettings>(KEYS.pomodoroSettings, {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
  });
}

export function savePomodoroSettings(settings: PomodoroSettings): void {
  write(KEYS.pomodoroSettings, settings);
}

export function getPomodoroStats(): PomodoroStats {
  return read<PomodoroStats>(KEYS.pomodoroStats, {
    completedSessions: 0,
    totalFocusMinutes: 0,
    history: [],
  });
}

export function recordPomodoroSession(focusMinutes: number): PomodoroStats {
  const stats = getPomodoroStats();
  const today = new Date().toISOString().slice(0, 10);
  const history = [...stats.history];
  const idx = history.findIndex((h) => h.date === today);
  if (idx >= 0) {
    history[idx] = { ...history[idx], sessions: history[idx].sessions + 1 };
  } else {
    history.push({ date: today, sessions: 1 });
  }
  const updated: PomodoroStats = {
    completedSessions: stats.completedSessions + 1,
    totalFocusMinutes: stats.totalFocusMinutes + focusMinutes,
    history: history.slice(-30),
  };
  write(KEYS.pomodoroStats, updated);
  return updated;
}

// ---------- AI chat history ----------

export function getChatHistory(): ChatMessage[] {
  return read<ChatMessage[]>(KEYS.chatHistory, []);
}

export function saveChatHistory(messages: ChatMessage[]): void {
  write(KEYS.chatHistory, messages.slice(-100));
}

export function clearChatHistory(): void {
  write(KEYS.chatHistory, []);
}

// ---------- Tool favorites / recents ----------

export function getFavoriteTools(): string[] {
  return read<string[]>(KEYS.favoriteTools, []);
}

export function toggleFavoriteTool(slug: string): string[] {
  const favs = getFavoriteTools();
  const updated = favs.includes(slug) ? favs.filter((s) => s !== slug) : [...favs, slug];
  write(KEYS.favoriteTools, updated);
  return updated;
}

export function getRecentTools(): string[] {
  return read<string[]>(KEYS.recentTools, []);
}

export function recordRecentTool(slug: string): string[] {
  const recents = getRecentTools().filter((s) => s !== slug);
  const updated = [slug, ...recents].slice(0, 8);
  write(KEYS.recentTools, updated);
  return updated;
}

export { uid };
