"use client";

import { useEffect, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import DownloadButton from "@/components/DownloadButton";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";
import { useToast } from "@/components/Toast";

const tool = getToolBySlug("text-to-pdf")!;

export default function TextToPdfPage() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("Document");
  const { show } = useToast();

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const generate = async () => {
    if (!text.trim()) {
      show("Add some text first.", "error");
      return;
    }
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;

    doc.setFontSize(11);
    const lines = doc.splitTextToSize(text, usableWidth);

    let y = margin;
    const lineHeight = 16;
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    doc.save(`${title || "document"}.pdf`);
    show("PDF generated.", "success");
  };

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="max-w-sm">
          <label className="label" htmlFor="pdf-title">
            File name
          </label>
          <input
            id="pdf-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="pdf-text">
            Text content
          </label>
          <textarea
            id="pdf-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="input resize-y"
            placeholder="Type or paste the text you want turned into a PDF..."
          />
        </div>

        <div className="mt-4">
          <DownloadButton onClick={generate} label="Generate and download PDF" />
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Does this preserve formatting like bold or bullet points?",
                answer: "No — this generates a plain-text PDF using a single font and size. It's meant for quick notes and drafts, not styled documents.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
