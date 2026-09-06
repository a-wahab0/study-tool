import { NextRequest, NextResponse } from "next/server";
import { callAi, demoFlashcards, hasAiKey } from "@/core-lib/ai";

export const runtime = "nodejs";

interface FlashcardRequestBody {
  topic: string;
  count?: number;
}

interface RawCard {
  front: string;
  back: string;
}

function normalizeCards(raw: unknown): RawCard[] {
  if (!Array.isArray(raw)) return [];
  const cleaned: RawCard[] = [];
  for (const item of raw) {
    if (item && typeof item.front === "string" && typeof item.back === "string") {
      cleaned.push({ front: item.front, back: item.back });
    }
  }
  return cleaned;
}

export async function POST(req: NextRequest) {
  let body: FlashcardRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!topic) {
    return NextResponse.json({ error: "A non-empty 'topic' field is required." }, { status: 400 });
  }
  const count = Math.min(20, Math.max(1, Number(body.count) || 8));

  if (!hasAiKey()) {
    return NextResponse.json({ cards: demoFlashcards(topic, count), demo: true });
  }

  try {
    const prompt =
      `Generate ${count} flashcards for studying "${topic}". ` +
      `Respond ONLY with a JSON array, no preamble or markdown fences, where each item has ` +
      `"front" (a short question or term) and "back" (a concise answer or definition).`;

    const raw = await callAi([
      { role: "system", content: "You output only valid JSON arrays when asked to generate flashcard data." },
      { role: "user", content: prompt },
    ]);

    const cleanedText = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    const cards = normalizeCards(parsed).slice(0, count);

    if (cards.length === 0) {
      throw new Error("AI returned no valid cards");
    }

    const withIds = cards.map((c, i) => ({ ...c, id: `ai-card-${i}` }));
    return NextResponse.json({ cards: withIds, demo: false });
  } catch {
    return NextResponse.json({ cards: demoFlashcards(topic, count), demo: true });
  }
}
