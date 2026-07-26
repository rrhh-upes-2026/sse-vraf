"use client";

import { useState } from "react";

interface DocumentPreviewProps {
  driveFileId: string;
  fileName: string;
  mimeType?: string;
  onClose: () => void;
}

export function DocumentPreview({ driveFileId, fileName, onClose }: DocumentPreviewProps) {
  const [loading, setLoading] = useState(true);
  const previewUrl = `https://docs.google.com/file/d/${driveFileId}/preview`;
  const driveUrl = `https://drive.google.com/file/d/${driveFileId}/view`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-sse-surface border border-sse-border rounded-lg w-full max-w-3xl mx-4 flex flex-col shadow-2xl"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sse-border flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* File icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-sse-muted flex-shrink-0"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-[13px] font-medium text-sse-ink truncate">{fileName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-sse-hover text-sse-muted hover:text-sse-ink transition-colors flex-shrink-0"
            aria-label="Cerrar vista previa"
          >
            {/* X icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preview area */}
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: 480 }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-sse-shell-canvas">
              <div className="w-6 h-6 border-2 border-sse-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            style={{ minHeight: 480 }}
            onLoad={() => setLoading(false)}
            title={fileName}
            allow="autoplay"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-sse-border flex-shrink-0 gap-2">
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium rounded-sm border border-sse-border text-sse-ink hover:bg-sse-shell-canvas transition-colors"
          >
            {/* External link icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Abrir en Drive
          </a>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-8 px-3 text-[12px] font-medium rounded-sm bg-sse-primary text-white hover:bg-sse-primary-dark transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
