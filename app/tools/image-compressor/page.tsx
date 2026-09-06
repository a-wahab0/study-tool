"use client";

import { useEffect, useRef, useState } from "react";
import ToolHeader from "@/components/ToolHeader";
import FileDropzone from "@/components/FileDropzone";
import DownloadButton from "@/components/DownloadButton";
import ProgressBar from "@/components/ProgressBar";
import ResultCard from "@/components/ResultCard";
import FaqSection from "@/components/FaqSection";
import { getToolBySlug } from "@/core-lib/tools-registry";
import { recordRecentTool } from "@/core-lib/storage";
import { formatBytes, downloadBlob } from "@/core-lib/utils";
import { useToast } from "@/components/Toast";

const tool = getToolBySlug("image-compressor")!;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { show } = useToast();

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  // Clean up object URLs whenever they're replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [previewUrl, compressedUrl]);

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      show("Please choose an image file.", "error");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      show(`File is larger than the ${formatBytes(MAX_FILE_SIZE)} limit.`, "error");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setCompressedBlob(null);
    setCompressedUrl(null);
  };

  const compress = async () => {
    if (!file || !previewUrl) return;
    setProcessing(true);
    try {
      const img = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image"));
      });
      img.src = previewUrl;
      await loaded;

      const canvas = canvasRef.current ?? document.createElement("canvas");
      canvasRef.current = canvas;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0);

      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, outputType, outputType === "image/jpeg" ? quality : undefined)
      );
      if (!blob) throw new Error("Compression failed");

      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      setCompressedBlob(blob);
      setCompressedUrl(URL.createObjectURL(blob));
    } catch (err) {
      show(err instanceof Error ? err.message : "Something went wrong compressing this image.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const savedPercent =
    file && compressedBlob ? Math.max(0, Math.round((1 - compressedBlob.size / file.size) * 100)) : null;

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setFile(null);
    setPreviewUrl(null);
    setCompressedBlob(null);
    setCompressedUrl(null);
  };

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {!file ? (
          <FileDropzone
            accept="image/*"
            onFiles={handleFiles}
            hint={`JPG, PNG, or WebP — up to ${formatBytes(MAX_FILE_SIZE)}`}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="card p-3">
                <p className="mb-2 text-xs font-medium text-ink-500">Original — {formatBytes(file.size)}</p>
                {previewUrl && <img src={previewUrl} alt="Original preview" className="max-h-64 w-full rounded-md object-contain" />}
              </div>
              <div className="card p-3">
                <p className="mb-2 text-xs font-medium text-ink-500">
                  Compressed{compressedBlob ? ` — ${formatBytes(compressedBlob.size)}` : ""}
                </p>
                {compressedUrl ? (
                  <img src={compressedUrl} alt="Compressed preview" className="max-h-64 w-full rounded-md object-contain" />
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-ink-400">
                    Not compressed yet
                  </div>
                )}
              </div>
            </div>

            {file.type !== "image/png" && (
              <div>
                <label className="label" htmlFor="quality-slider">
                  Quality: {Math.round(quality * 100)}%
                </label>
                <input
                  id="quality-slider"
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            )}

            {processing && <ProgressBar value={70} label="Compressing..." />}

            {savedPercent !== null && (
              <ResultCard label="Size reduction" value={`${savedPercent}%`} emphasis />
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={compress} className="btn-primary" disabled={processing}>
                {compressedBlob ? "Re-compress" : "Compress image"}
              </button>
              {compressedBlob && (
                <DownloadButton
                  onClick={() => downloadBlob(compressedBlob, `compressed-${file.name}`)}
                  label="Download"
                />
              )}
              <button onClick={reset} className="btn-secondary">
                Reset
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Is my image uploaded to a server?",
                answer: "No. Compression happens using your browser's canvas, and the file never leaves your device.",
              },
              {
                question: "Why is there no quality slider for PNG?",
                answer: "PNG is a lossless format, so quality is not adjustable the way it is for JPEG. Re-encoding a PNG can still reduce size slightly.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
