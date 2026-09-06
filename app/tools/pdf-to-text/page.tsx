"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import ToolHeader from "@/components/ToolHeader";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import DownloadButton from "@/components/DownloadButton";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";
import { downloadBlob, formatBytes } from "@/core-lib/utils";
import { useToast } from "@/components/Toast";

const tool = getToolBySlug("pdf-to-text")!;
const MAX_FILE_SIZE = 40 * 1024 * 1024;
const PDFJS_VERSION = "3.11.174";

export default function PdfToTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const handleFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      show("Please choose a PDF file.", "error");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      show(`File is larger than the ${formatBytes(MAX_FILE_SIZE)} limit.`, "error");
      return;
    }
    setFile(f);
    setText("");
    setProcessing(true);
    setProgress(5);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

      const bytes = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      let combined = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => ("str" in item ? item.str : "")).join(" ");
        combined += pageText + "\n\n";
        setProgress(Math.round((i / doc.numPages) * 100));
      }
      setText(combined.trim());
      if (!combined.trim()) {
        show("No selectable text was found — this PDF may be a scanned image.", "info");
      }
    } catch {
      show("Could not read this PDF. It may be corrupted, password-protected, or a scanned image.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      show("Text copied to clipboard", "success");
    } catch {
      show("Could not copy — select and copy manually.", "error");
    }
  };

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {!file ? (
          <FileDropzone
            accept="application/pdf"
            onFiles={handleFiles}
            hint={`PDF file only — up to ${formatBytes(MAX_FILE_SIZE)}`}
          />
        ) : (
          <div className="space-y-4">
            <div className="card p-3 text-sm text-ink-600">{file.name}</div>
            {processing && <ProgressBar value={progress} label="Extracting text..." />}
            {!processing && (
              <>
                <div className="flex items-center justify-between">
                  <label className="label" htmlFor="extracted-text">
                    Extracted text
                  </label>
                  <div className="flex gap-2">
                    <button onClick={copy} className="btn-ghost !px-2 !py-1 text-xs" disabled={!text}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                    {text && (
                      <DownloadButton
                        onClick={() =>
                          downloadBlob(new Blob([text], { type: "text/plain" }), `${file.name.replace(/\.pdf$/i, "")}.txt`)
                        }
                        label="Download .txt"
                      />
                    )}
                  </div>
                </div>
                <textarea readOnly value={text} rows={14} className="input resize-y bg-ink-50" />
              </>
            )}
            <button
              onClick={() => {
                setFile(null);
                setText("");
              }}
              className="btn-secondary"
            >
              Choose a different file
            </button>
          </div>
        )}

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Why is the extracted text empty?",
                answer: "If a PDF is a scanned image rather than real text, there is no text layer to extract. This tool does not perform optical character recognition (OCR).",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
