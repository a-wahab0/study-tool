"use client";

import { useEffect, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import FileDropzone from "@/components/FileDropzone";
import DownloadButton from "@/components/DownloadButton";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";
import { downloadBlob, formatBytes } from "@/core-lib/utils";
import { useToast } from "@/components/Toast";

const tool = getToolBySlug("split-pdf")!;
const MAX_FILE_SIZE = 40 * 1024 * 1024;

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(1);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
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
    setResultBlob(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();
      setPageCount(count);
      setStart(1);
      setEnd(count);
    } catch {
      show("Could not read this PDF. It may be corrupted or password-protected.", "error");
      setFile(null);
    }
  };

  const split = async () => {
    if (!file || !pageCount) return;
    const s = Math.max(1, Math.min(start, pageCount));
    const e = Math.max(s, Math.min(end, pageCount));
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const indices = Array.from({ length: e - s + 1 }, (_, i) => s - 1 + i);
      const pages = await newDoc.copyPages(doc, indices);
      pages.forEach((p) => newDoc.addPage(p));
      const outBytes = await newDoc.save();
      setResultBlob(new Blob([outBytes], { type: "application/pdf" }));
      show("Pages extracted successfully.", "success");
    } catch {
      show("Could not split this PDF.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {!file ? (
          <FileDropzone
            accept="application/pdf"
            onFiles={handleFiles}
            hint={`PDF file only — up to ${formatBytes(MAX_FILE_SIZE)}`}
          />
        ) : (
          <div className="space-y-4">
            <div className="card p-3 text-sm text-ink-600">
              {file.name} — {pageCount ?? "…"} pages
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="split-start">
                  Start page
                </label>
                <input
                  id="split-start"
                  type="number"
                  min={1}
                  max={pageCount ?? undefined}
                  value={start}
                  onChange={(e) => setStart(Number(e.target.value) || 1)}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="split-end">
                  End page
                </label>
                <input
                  id="split-end"
                  type="number"
                  min={1}
                  max={pageCount ?? undefined}
                  value={end}
                  onChange={(e) => setEnd(Number(e.target.value) || 1)}
                  className="input"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={split} className="btn-primary" disabled={processing}>
                Extract pages
              </button>
              {resultBlob && (
                <DownloadButton onClick={() => downloadBlob(resultBlob, `pages-${start}-${end}.pdf`)} />
              )}
              <button
                onClick={() => {
                  setFile(null);
                  setPageCount(null);
                  setResultBlob(null);
                }}
                className="btn-secondary"
              >
                Choose a different file
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Can I extract a single page?",
                answer: "Yes — set the start and end page to the same number to extract just one page.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
