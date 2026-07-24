"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  label?: string;
  accept?: string;
  onFileSelect?: (name: string) => void;
  fileName?: string;
  className?: string;
  disabled?: boolean;
}

export function Dropzone({ label = "Arrastra o haz clic para adjuntar", accept, onFileSelect, fileName, className, disabled }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect?.(file.name);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelect?.(file.name);
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-5 transition-colors cursor-pointer",
        dragging ? "border-sse-primary bg-sse-primary/5" : "border-sse-border bg-sse-surface hover:border-sse-primary/40",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
        className={cn("w-6 h-6", fileName ? "text-sse-primary" : "text-sse-muted")}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d={fileName
            ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            : "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          }
        />
      </svg>
      {fileName ? (
        <div className="text-center">
          <p className="text-[12px] font-medium text-sse-ink">{fileName}</p>
          <p className="text-[11px] text-sse-primary">Cambiar archivo</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-[12px] text-sse-muted">{label}</p>
          <p className="text-[11px] text-sse-muted">PDF, DOCX, XLSX, PNG, JPG</p>
        </div>
      )}
    </div>
  );
}
