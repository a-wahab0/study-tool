"use client";

import { FileText, X, GripVertical } from "lucide-react";
import { formatBytes } from "@/core-lib/utils";

export interface FileListItem {
  id: string;
  name: string;
  size: number;
}

export default function FileList({
  files,
  onRemove,
  reorderable = false,
  onReorder,
}: {
  files: FileListItem[];
  onRemove: (id: string) => void;
  reorderable?: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}) {
  if (files.length === 0) return null;

  return (
    <ul className="mt-3 divide-y divide-ink-100 rounded-lg border border-ink-200 bg-white">
      {files.map((file, index) => (
        <li
          key={file.id}
          className="flex items-center gap-3 px-3 py-2.5"
          draggable={reorderable}
          onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
          onDragOver={(e) => reorderable && e.preventDefault()}
          onDrop={(e) => {
            if (!reorderable || !onReorder) return;
            const from = Number(e.dataTransfer.getData("text/plain"));
            onReorder(from, index);
          }}
        >
          {reorderable && <GripVertical className="h-4 w-4 shrink-0 text-ink-300" />}
          <FileText className="h-4 w-4 shrink-0 text-ink-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-800">{file.name}</p>
            <p className="text-xs text-ink-400">{formatBytes(file.size)}</p>
          </div>
          <button
            onClick={() => onRemove(file.id)}
            aria-label={`Remove ${file.name}`}
            className="p-1 rounded-md hover:bg-ink-100 focus-ring shrink-0"
          >
            <X className="h-4 w-4 text-ink-400" />
          </button>
        </li>
      ))}
    </ul>
  );
}
