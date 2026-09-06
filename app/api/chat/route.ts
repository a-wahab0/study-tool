import { NextRequest, NextResponse } from "next/server";
import { callAi, demoChatReply, hasAiKey } from "@/core-lib/ai";

export const runtime = "nodejs";

interface ChatRequestBody {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "A non-empty 'message' field is required." }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "Message is too long (max 4000 characters)." }, { status: 400 });
  }

  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];

  if (!hasAiKey()) {
    return NextResponse.json({ reply: demoChatReply(message), demo: true });
  }

  try {
    const reply = await callAi([
      {
        role: "system",
        content:
          "You are a helpful, encouraging study assistant for students. Explain concepts clearly, use examples, and keep answers focused and well organized.",
      },
      ...history.map((h) => ({ role: h.role, content: String(h.content).slice(0, 4000) })),
      { role: "user", content: message },
    ]);
    return NextResponse.json({ reply, demo: false });
  } catch {
    // Never crash the app — fall back to demo mode on any AI provider failure.
    return NextResponse.json({ reply: demoChatReply(message), demo: true });
  }
}
