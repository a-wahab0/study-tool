import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Calculator,
  CalendarClock,
  Layers,
  Timer,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI study assistant",
    description: "Ask questions, simplify concepts, and generate revision notes.",
  },
  {
    icon: FileText,
    title: "PDF utilities",
    description: "Merge, split, and convert PDFs directly in your browser.",
  },
  {
    icon: ImageIcon,
    title: "Image tools",
    description: "Compress, resize, and convert images without uploading them anywhere.",
  },
  {
    icon: Calculator,
    title: "Calculators",
    description: "GPA, percentage, grade, and unit calculators that work offline.",
  },
  {
    icon: CalendarClock,
    title: "Study planner",
    description: "Track tasks, deadlines, and study sessions in one place.",
  },
  {
    icon: Layers,
    title: "Flashcards & quizzes",
    description: "Build decks, study with spaced review, and test yourself.",
  },
];

const POPULAR_TOOLS = [
  { name: "AI Quiz Generator", href: "/quiz" },
  { name: "PDF Compressor", href: "/tools" },
  { name: "PDF to Word", href: "/tools" },
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "GPA Calculator", href: "/tools/gpa-calculator" },
  { name: "Flashcards", href: "/flashcards" },
  { name: "Pomodoro", href: "/tools/pomodoro" },
  { name: "Study Planner", href: "/planner" },
];

const STEPS = [
  { step: "1", title: "Pick a tool", description: "Browse the tools directory or jump straight into a study feature." },
  { step: "2", title: "Work in your browser", description: "Most file tools process locally, so nothing leaves your device." },
  { step: "3", title: "Keep your progress", description: "Notes, decks, and planner data are saved automatically on your device." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-brand-600" />
            <span className="text-base font-semibold tracking-tight">StudyHub</span>
          </div>
          <Link href="/dashboard" className="btn-primary">
            Open dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Study smarter. Get more done.
          </h1>
          <p className="mt-4 text-base text-ink-500 sm:text-lg">
            AI study tools, PDF utilities, image tools, calculators, planners, and everything
            students need — all in one place.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-primary">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/tools" className="btn-secondary">
              Browse tools
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-ink-500">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            File tools run in your browser — your files are not uploaded.
          </div>
        </div>
      </section>

      {/* Popular tools grid */}
      <section className="border-y border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            Popular tools
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {POPULAR_TOOLS.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="card px-4 py-3 text-sm font-medium text-ink-700 hover:shadow-md focus-ring"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
          Everything you need to study smarter
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="w-fit rounded-lg bg-brand-50 p-2">
                <f.icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900">How it works</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {s.step}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink-900">Ready to get started?</h2>
            <p className="mt-1 text-sm text-ink-500">
              No account required. Your data stays on your device.
            </p>
          </div>
          <Link href="/dashboard" className="btn-primary shrink-0">
            Open dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-200">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-brand-600" />
            <span className="font-medium text-ink-700">StudyHub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Timer className="h-4 w-4" />
            Built for students who want to get more done.
          </div>
        </div>
      </footer>
    </div>
  );
}
