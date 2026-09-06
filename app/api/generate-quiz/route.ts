import { NextRequest, NextResponse } from "next/server";
import { callAi, demoQuizQuestions, hasAiKey } from "@/core-lib/ai";

export const runtime = "nodejs";

interface QuizRequestBody {
  subject?: string;
  topic: string;
  difficulty?: "easy" | "medium" | "hard";
  count?: number;
}

interface RawQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function normalizeQuestions(raw: unknown, fallbackTopic: string): RawQuestion[] {
  if (!Array.isArray(raw)) return [];
  const cleaned: RawQuestion[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item.question === "string" &&
      Array.isArray(item.options) &&
      item.options.length >= 2 &&
      item.options.every((o: unknown) => typeof o === "string") &&
      typeof item.correctIndex === "number" &&
      item.correctIndex >= 0 &&
      item.correctIndex < item.options.length
    ) {
      cleaned.push({
        question: item.question,
        options: item.options,
        correctIndex: item.correctIndex,
        explanation: typeof item.explanation === "string" ? item.explanation : `Correct answer relates to ${fallbackTopic}.`,
      });
    }
  }
  return cleaned;
}

export async function POST(req: NextRequest) {
  let body: QuizRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!topic) {
    return NextResponse.json({ error: "A non-empty 'topic' field is required." }, { status: 400 });
  }
  const subject = typeof body.subject === "string" ? body.subject.trim() : "General";
  const difficulty = (["easy", "medium", "hard"] as const).includes(body.difficulty as any)
    ? (body.difficulty as "easy" | "medium" | "hard")
    : "medium";
  const count = Math.min(10, Math.max(1, Number(body.count) || 5));

  if (!hasAiKey()) {
    const demoQuestions = demoQuizQuestions(topic, count);
    return NextResponse.json({ questions: demoQuestions, demo: true });
  }

  try {
    const prompt =
      `Generate ${count} multiple-choice quiz questions for a student studying "${subject}", ` +
      `specifically about "${topic}", at ${difficulty} difficulty. ` +
      `Respond ONLY with a JSON array, no preamble or markdown fences, where each item has: ` +
      `"question" (string), "options" (array of 4 strings), "correctIndex" (0-based number), "explanation" (short string).`;

    const raw = await callAi([
      { role: "system", content: "You output only valid JSON arrays when asked to generate quiz data." },
      { role: "user", content: prompt },
    ]);

    const cleanedText = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    const questions = normalizeQuestions(parsed, topic).slice(0, count);

    if (questions.length === 0) {
      throw new Error("AI returned no valid questions");
    }

    const withIds = questions.map((q, i) => ({ ...q, id: `ai-${i}` }));
    return NextResponse.json({ questions: withIds, demo: false });
  } catch {
    // Fall back to demo mode rather than surfacing a broken quiz to the student.
    const demoQuestions = demoQuizQuestions(topic, count);
    return NextResponse.json({ questions: demoQuestions, demo: true });
  }
}
