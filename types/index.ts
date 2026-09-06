export type ToolCategory =
  | "study"
  | "pdf"
  | "images"
  | "text"
  | "calculators"
  | "student";

export type ToolStatus = "available" | "coming-soon";

export interface ToolDefinition {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  clientSideOnly: boolean;
  keywords: string[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string | null;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  lastResult: "easy" | "good" | "hard" | null;
  reviewCount: number;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  subjectId: string | null;
  cards: Flashcard[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  score: number;
  total: number;
  takenAt: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  subjectId: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string | null;
  minutes: number;
  date: string;
}

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export interface PomodoroStats {
  completedSessions: number;
  totalFocusMinutes: number;
  history: { date: string; sessions: number }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AppMeta {
  version: number;
  firstLaunchAt: string;
  streak: number;
  lastActiveDate: string | null;
}
