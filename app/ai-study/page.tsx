"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { getChatHistory, saveChatHistory, clearChatHistory, uid } from "@/core-lib/storage";
import type { ChatMessage } from "@/types";
import { useToast } from "@/components/Toast";
import { cn } from "@/core-lib/utils";

const QUICK_PROMPTS = [
  "Explain this topic simply",
  "Give me an example",
  "Summarize this for me",
  "Create revision notes",
  "Generate 5 MCQs about this",
];

export default function AiStudyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { show } = useToast();

  useEffect(() => {
    setMessages(getChatHistory());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const updated = [...messages, userMessage];
    setMessages(updated);
    saveChatHistory(updated);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: updated.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setDemoMode(Boolean(data.demo));

      const assistantMessage: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: data.reply ?? "Sorry, something went wrong generating a response.",
        createdAt: new Date().toISOString(),
      };
      const withReply = [...updated, assistantMessage];
      setMessages(withReply);
      saveChatHistory(withReply);
    } catch {
      show("Could not reach the assistant. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  const clearHistory = () => {
    clearChatHistory();
    setMessages([]);
  };

  return (
    <div className="flex h-screen flex-col md:h-screen">
      <PageHeader
        title="AI Study Assistant"
        description="Ask questions, simplify concepts, and generate study material."
        actions={
          messages.length > 0 ? (
            <button onClick={clearHistory} className="btn-secondary">
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {messages.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Ask anything about your studies"
              description="Try one of the prompts below, or type your own question."
            />
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm",
                      m.role === "user" ? "bg-brand-600 text-white" : "card text-ink-800"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="card px-4 py-2.5 text-sm text-ink-400">Thinking...</div>
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-ink-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {demoMode && (
            <p className="mb-2 text-xs text-amber-700">
              Running in demo mode — connect OPENROUTER_API_KEY for full AI responses.
            </p>
          )}
          <div className="mb-2 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} onClick={() => send(p)} className="btn-secondary !py-1.5 text-xs" disabled={sending}>
                {p}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask a question..."
              rows={1}
              className="input resize-none"
            />
            <button type="submit" className="btn-primary shrink-0" disabled={sending || !input.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
