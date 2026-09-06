"use client";

import { useEffect, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import FileDropzone from "@/components/FileDropzone";
import FileList, { type FileListItem } from "@/components/FileList";
import DownloadButton from "@/components/DownloadButton";
import ProgressBar from "@/components/ProgressBar";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool, uid } from "@/core-lib/storage";
import { downloadBlob, formatBytes, bytesToBlob } from "@/core-lib/utils";
import { useToast } from "@/components/Toast";

const tool = getToolBySlug("merge-pdf")!;
const MAX_FILE_SIZE = 40 * 1024 * 1024;
const MAX_FILES = 15;

interface PdfFile extends FileListItem {
  file: File;
}

export default function MergePdfPage() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { show } = useToast();

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  const handleFiles = (incoming: File[]) => {
    const validPdfs = incoming.filter((f) => f.type === "application/pdf");
    if (validPdfs.length !== incoming.length) {
      show("Some files were skipped — only PDF files are supported.", "error");
    }
    const tooLarge = validPdfs.filter((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge.length > 0) {
      show(`Some files exceed the ${formatBytes(MAX_FILE_SIZE)} limit and were skipped.`, "error");
    }
    const accepted = validPdfs.filter((f) => f.size <= MAX_FILE_SIZE);
    setFiles((prev) => {
      const combined = [...prev, ...accepted.map((f) => ({ id: uid(), name: f.name, size: f.size, file: f }))];
      if (combined.length > MAX_FILES) {
        show(`Only the first ${MAX_FILES} files are kept.`, "info");
      }
      return combined.slice(0, MAX_FILES);
    });
    setResultBlob(null);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const reorder = (from: number, to: number) => {
    setFiles((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  const merge = async () => {
    if (files.length < 2) {
      show("Add at least two PDF files to merge.", "error");
      return;
    }
    setProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const f of files) {
        const bytes = await f.file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = bytesToBlob(bytes, "application/pdf");
      setResultBlob(blob);
      show("PDFs merged successfully.", "success");
    } catch (err) {
      show(
        "Could not merge these files. One of them may be corrupted or password-protected.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <FileDropzone
          accept="application/pdf"
          multiple
          onFiles={handleFiles}
          hint={`PDF files only — up to ${formatBytes(MAX_FILE_SIZE)} each, ${MAX_FILES} files max`}
        />

        <FileList files={files} onRemove={removeFile} reorderable onReorder={reorder} />
        {files.length > 1 && (
          <p className="mt-2 text-xs text-ink-400">Drag files above to reorder before merging.</p>
        )}

        {processing && (
          <div className="mt-4">
            <ProgressBar value={80} label="Merging..." />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={merge} className="btn-primary" disabled={files.length < 2 || processing}>
            Merge {files.length > 0 ? `${files.length} files` : "PDFs"}
          </button>
          {resultBlob && <DownloadButton onClick={() => downloadBlob(resultBlob, "merged.pdf")} />}
        </div>

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "In what order are pages merged?",
                answer: "Files are combined in the order shown in the list above. Drag a file to a new position to change the order before merging.",
              },
              {
                question: "Can I merge password-protected PDFs?",
                answer: "No — encrypted PDFs cannot be read in the browser without the password and will show an error.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
