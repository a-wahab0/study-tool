import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/core-lib/utils";

/**
 * Renders AI-generated text as formatted Markdown, including LaTeX math
 * wrapped in $...$ (inline) or $$...$$ (block). Used anywhere the AI
 * Study Assistant, quiz explanations, or generated notes are shown, so
 * headings, bold terms, and formulas render properly instead of showing
 * raw markup like "**term**" or "$$E=mc^2$$".
 */
export default function MarkdownMessage({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("markdown-body text-sm leading-relaxed", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
