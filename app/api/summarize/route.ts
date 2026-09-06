import { NextRequest, NextResponse } from "next/server";
import { callAi, demoSummary, hasAiKey } from "@/core-lib/ai";

export const runtime = "nodejs";

interface SummarizeRequestBody {
  text: string;
  length?: "short" | "medium" | "long";
}

export async function POST(req: NextRequest) {
  let body: SummarizeRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "A non-empty 'text' field is required." }, { status: 400 });
  }
  if (text.length > 20000) {
    return NextResponse.json({ error: "Text is too long (max 20,000 characters)." }, { status: 400 });
  }
  const length = (["short", "medium", "long"] as const).includes(body.length as any)
    ? (body.length as "short" | "medium" | "long")
    : "medium";

  if (!hasAiKey()) {
    return NextResponse.json({ summary: demoSummary(text), demo: true });
  }

  try {
    const lengthInstruction =
      length === "short" ? "in 2-3 sentences" : length === "long" ? "in a detailed multi-paragraph summary" : "in one focused paragraph";

    const summary = await callAi([
      { role: "system", content: "You summarize study material clearly and accurately for students, preserving key facts and terminology. Use plain paragraphs or simple Markdown lists — no emojis or decorative symbols." },
      { role: "user", content: `Summarize the following text ${lengthInstruction}:\n\n${text}` },
    ]);
    return NextResponse.json({ summary, demo: false });
  } catch {
    return NextResponse.json({ summary: demoSummary(text), demo: true });
  }
}
