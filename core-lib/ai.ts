// Server-only AI abstraction. Never import this from client components —
// it reads process.env.OPENROUTER_API_KEY, which must stay off the browser bundle.

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function hasAiKey(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

/**
 * Calls OpenRouter's chat completion endpoint. Throws on any failure —
 * callers are expected to catch and fall back to demo mode.
 */
export async function callAi(messages: OpenRouterMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("AI_KEY_MISSING");
  }

  const model = process.env.OPENROUTER_MODEL || "openrouter/auto";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`AI_REQUEST_FAILED: ${response.status} ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("AI_EMPTY_RESPONSE");
  }
  return content;
}

// ---------- Demo mode fallbacks ----------
// These keep every AI feature usable with zero configuration.

export function demoChatReply(userMessage: string): string {
  const trimmed = userMessage.trim();
  return (
    `Demo mode response (no OPENROUTER_API_KEY configured).\n\n` +
    `You asked: "${trimmed.slice(0, 160)}${trimmed.length > 160 ? "..." : ""}"\n\n` +
    `Once an API key is added to your environment variables, this panel will send your ` +
    `question to a real model and return a full explanation, example, or summary here.`
  );
}

export function demoSummary(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const preview = words.slice(0, 40).join(" ");
  return (
    `Demo summary (no API key configured): This text is approximately ${words.length} words. ` +
    `A real summary will condense the key points once an AI provider is connected. ` +
    `Preview of the source text: "${preview}${words.length > 40 ? "..." : ""}"`
  );
}

export function demoQuizQuestions(topic: string, count: number) {
  const base = [
    {
      question: `Which statement about "${topic}" is most accurate?`,
      options: [
        "It has no practical applications",
        "It is a foundational concept covered in most courses",
        "It was disproven in the last decade",
        "It only applies to advanced graduate study",
      ],
      correctIndex: 1,
      explanation: "This is a demo question. Connect an API key to generate real, topic-specific questions.",
    },
    {
      question: `A key term related to "${topic}" is best defined as:`,
      options: [
        "A term with no formal definition",
        "A concept unrelated to the topic",
        "A core idea directly tied to the topic",
        "An outdated term no longer in use",
      ],
      correctIndex: 2,
      explanation: "This is a demo question generated without an AI provider connected.",
    },
  ];
  const result = [];
  for (let i = 0; i < count; i++) {
    const q = base[i % base.length];
    result.push({ ...q, id: `demo-${i}` });
  }
  return result;
}

export function demoFlashcards(topic: string, count: number) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: `demo-card-${i}`,
      front: `Demo question ${i + 1} about ${topic}`,
      back: `Demo answer ${i + 1}. Connect an API key to generate real flashcards.`,
    });
  }
  return result;
}
