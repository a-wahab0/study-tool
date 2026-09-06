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

const tool = getToolBySlug("image-converter")!;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const FORMATS: { label: string; mime: string; ext: string; supportsQuality: boolean }[] = [
  { label: "JPG", mime: "image/jpeg", ext: "jpg", supportsQuality: true },
  { label: "PNG", mime: "image/png", ext: "png", supportsQuality: false },
  { label: "WebP", mime: "image/webp", ext: "webp", supportsQuality: true },
];

export default function ImageConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState(FORMATS[0]);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    recordRecentTool(tool.slug);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

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
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResultBlob(null);
    setResultUrl(null);
    setUnsupported(false);
  };

  const convert = async () => {
    if (!file || !previewUrl) return;
    try {
      const img = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image"));
      });
      img.src = previewUrl;
      await loaded;

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      // Fill white background for JPG since it doesn't support transparency.
      if (targetFormat.mime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, targetFormat.mime, targetFormat.supportsQuality ? 0.9 : undefined)
      );
      if (!blob) throw new Error("Conversion failed");

      // Some browsers silently fall back to PNG if WebP encoding isn't supported.
      if (targetFormat.mime === "image/webp" && blob.type !== "image/webp") {
        setUnsupported(true);
      } else {
        setUnsupported(false);
      }

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      show(err instanceof Error ? err.message : "Something went wrong converting this image.", "error");
    }
  };

  const baseName = file ? file.name.replace(/\.[^.]+$/, "") : "image";

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {!file ? (
          <FileDropzone accept="image/*" onFiles={handleFiles} hint={`JPG, PNG, WebP — up to ${formatBytes(MAX_FILE_SIZE)}`} />
        ) : (
          <div className="space-y-4">
            <div className="card p-3">
              {previewUrl && (
                <img src={resultUrl ?? previewUrl} alt="Preview" className="max-h-72 w-full rounded-md object-contain" />
              )}
              <p className="mt-2 text-xs text-ink-500">
                Source type: {file.type || "unknown"} — {formatBytes(file.size)}
              </p>
            </div>

            <div>
              <p className="label">Convert to</p>
              <div className="flex gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.mime}
                    onClick={() => setTargetFormat(f)}
                    className={
                      "rounded-lg border px-3 py-2 text-sm font-medium focus-ring " +
                      (targetFormat.mime === f.mime
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-ink-200 bg-white text-ink-600 hover:bg-ink-100")
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {unsupported && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2">
                Your browser does not support encoding WebP — the file was kept as PNG instead.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={convert} className="btn-primary">
                Convert
              </button>
              {resultBlob && (
                <DownloadButton
                  onClick={() => downloadBlob(resultBlob, `${baseName}.${targetFormat.ext}`)}
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Why might WebP conversion not work?",
                answer: "A small number of older browsers cannot encode WebP with the canvas API. If that happens, the tool clearly tells you and keeps the file as PNG instead of silently failing.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
