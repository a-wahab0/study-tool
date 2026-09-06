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

const tool = getToolBySlug("image-resizer")!;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const PRESETS = [
  { label: "1920 x 1080", width: 1920, height: 1080 },
  { label: "1280 x 720", width: 1280, height: 720 },
  { label: "800 x 600", width: 800, height: 600 },
  { label: "512 x 512", width: 512, height: 512 },
];

export default function ImageResizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockAspect, setLockAspect] = useState(true);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
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
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
    setFile(f);
    setPreviewUrl(url);
    setResultBlob(null);
    setResultUrl(null);
  };

  const onWidthChange = (value: number) => {
    setWidth(value);
    if (lockAspect && naturalSize) {
      setHeight(Math.round((value * naturalSize.h) / naturalSize.w));
    }
  };

  const onHeightChange = (value: number) => {
    setHeight(value);
    if (lockAspect && naturalSize) {
      setWidth(Math.round((value * naturalSize.w) / naturalSize.h));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  };

  const resize = async () => {
    if (!previewUrl || !file) return;
    try {
      const img = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image"));
      });
      img.src = previewUrl;
      await loaded;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0, width, height);

      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, outputType, 0.9));
      if (!blob) throw new Error("Resize failed");

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      show(err instanceof Error ? err.message : "Something went wrong resizing this image.", "error");
    }
  };

  return (
    <div>
      <ToolHeader title={tool.name} description={tool.description} clientSideOnly={tool.clientSideOnly} />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {!file ? (
          <FileDropzone accept="image/*" onFiles={handleFiles} hint={`Up to ${formatBytes(MAX_FILE_SIZE)}`} />
        ) : (
          <div className="space-y-4">
            <div className="card p-3">
              {previewUrl && (
                <img src={resultUrl ?? previewUrl} alt="Preview" className="max-h-72 w-full rounded-md object-contain" />
              )}
              {naturalSize && (
                <p className="mt-2 text-xs text-ink-500">
                  Original: {naturalSize.w} x {naturalSize.h}px
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="resize-width">
                  Width (px)
                </label>
                <input
                  id="resize-width"
                  type="number"
                  value={width}
                  onChange={(e) => onWidthChange(Number(e.target.value) || 0)}
                  className="input"
                  min={1}
                />
              </div>
              <div>
                <label className="label" htmlFor="resize-height">
                  Height (px)
                </label>
                <input
                  id="resize-height"
                  type="number"
                  value={height}
                  onChange={(e) => onHeightChange(Number(e.target.value) || 0)}
                  className="input"
                  min={1}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={lockAspect}
                onChange={(e) => setLockAspect(e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 accent-brand-600"
              />
              Lock aspect ratio
            </label>

            <div>
              <p className="label">Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.width, p.height)}
                    className="btn-secondary !py-1.5 text-xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={resize} className="btn-primary">
                Resize image
              </button>
              {resultBlob && (
                <DownloadButton onClick={() => downloadBlob(resultBlob, `resized-${file.name}`)} />
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <FaqSection
            items={[
              {
                question: "Will resizing distort my image?",
                answer: "Not if aspect ratio lock is enabled — changing width automatically adjusts height proportionally, and vice versa.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
