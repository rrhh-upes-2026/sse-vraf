"use client";

import { useState } from "react";
import {
  useGWPCreateFolder, useGWPUploadFile, useGWPDeleteFile,
  useGWPShareFile, useGWPGenerateLink, useGWPListVersions,
  useGWPGetFileMetadata, useGWPMoveFile,
} from "@/hooks/useGWP";
import type { GWPDriveFile, GWPFileRole } from "@/types/gwp";

function fmtBytes(n?: number) {
  if (!n) return "—";
  if (n < 1_048_576) return (n / 1_024).toFixed(1) + " KB";
  if (n < 1_073_741_824) return (n / 1_048_576).toFixed(1) + " MB";
  return (n / 1_073_741_824).toFixed(2) + " GB";
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-SV", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

function FileRow({ file, userId, onRefresh }: { file: GWPDriveFile; userId: string; onRefresh: () => void }) {
  const [expanded, setExpanded]   = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole]  = useState<GWPFileRole>("reader");
  const [newParent, setNewParent]  = useState("");
  const [link, setLink]            = useState("");

  const deleteFile   = useGWPDeleteFile();
  const shareFile    = useGWPShareFile();
  const generateLink = useGWPGenerateLink();
  const listVersions = useGWPListVersions();
  const moveFile     = useGWPMoveFile();

  return (
    <div className="rounded border border-sse-border bg-sse-surface">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-sse-border/20"
      >
        <svg className="w-4 h-4 shrink-0 text-[#0F9D58]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {file.mimeType?.includes("folder")
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          }
        </svg>
        <span className="flex-1 text-[12px] font-medium text-sse-ink truncate">{file.name}</span>
        <span className="text-[10px] text-sse-muted font-mono shrink-0">{fmtBytes(file.size)}</span>
        <span className="text-[10px] text-sse-muted shrink-0">{fmtDate(file.modifiedTime)}</span>
        <span className="text-[10px] text-sse-muted">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-sse-border px-4 py-3 bg-sse-border/10 space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
            <div><span className="text-sse-muted">ID:</span> <span className="font-mono text-sse-ink">{file.id}</span></div>
            <div><span className="text-sse-muted">Tipo:</span> <span className="text-sse-ink">{file.mimeType}</span></div>
            {file.webViewLink && (
              <div className="col-span-2">
                <span className="text-sse-muted">Enlace: </span>
                <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="text-[#0F9D58] hover:underline text-[10px] font-mono break-all">{file.webViewLink}</a>
              </div>
            )}
            {link && (
              <div className="col-span-2">
                <span className="text-sse-muted">Enlace generado: </span>
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-[#0F9D58] hover:underline text-[10px] font-mono break-all">{link}</a>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => generateLink.mutateAsync({ userId, fileId: file.id }).then((r) => setLink(r.webViewLink))}
              disabled={generateLink.isPending}
              className="text-[10px] px-2 py-1 rounded bg-sse-border text-sse-ink hover:bg-sse-border/70 disabled:opacity-50"
            >
              Generar enlace
            </button>
            <button
              onClick={() => listVersions.mutateAsync({ userId, fileId: file.id })}
              disabled={listVersions.isPending}
              className="text-[10px] px-2 py-1 rounded bg-sse-border text-sse-ink hover:bg-sse-border/70 disabled:opacity-50"
            >
              Versiones
            </button>
            <button
              onClick={() => { if (confirm("¿Eliminar archivo?")) deleteFile.mutateAsync({ userId, fileId: file.id }).then(onRefresh); }}
              disabled={deleteFile.isPending}
              className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>

          {/* Share */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-sse-muted mb-0.5">Compartir con</label>
              <input value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="email@dominio.com"
                className="w-full text-[11px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink" />
            </div>
            <select value={shareRole} onChange={(e) => setShareRole(e.target.value as GWPFileRole)}
              className="text-[11px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink">
              <option value="reader">Lector</option>
              <option value="writer">Editor</option>
              <option value="commenter">Comentador</option>
            </select>
            <button
              onClick={() => shareFile.mutateAsync({ userId, fileId: file.id, emailAddress: shareEmail, role: shareRole })}
              disabled={!shareEmail || shareFile.isPending}
              className="text-[10px] px-3 py-1.5 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50"
            >
              Compartir
            </button>
          </div>

          {/* Move */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] text-sse-muted mb-0.5">Mover a carpeta (ID destino)</label>
              <input value={newParent} onChange={(e) => setNewParent(e.target.value)} placeholder="ID de carpeta destino"
                className="w-full text-[11px] rounded border border-sse-border px-2 py-1 bg-sse-surface text-sse-ink" />
            </div>
            <button
              onClick={() => moveFile.mutateAsync({ userId, fileId: file.id, newParentId: newParent }).then(onRefresh)}
              disabled={!newParent || moveFile.isPending}
              className="text-[10px] px-3 py-1.5 rounded border border-sse-border text-sse-muted hover:text-sse-ink disabled:opacity-50"
            >
              Mover
            </button>
          </div>

          {listVersions.data && listVersions.data.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-sse-muted mb-1">Versiones ({listVersions.data.length})</p>
              <div className="space-y-0.5">
                {listVersions.data.map((v) => (
                  <div key={v.id} className="flex gap-3 text-[10px] text-sse-muted">
                    <span className="font-mono">v{v.id}</span>
                    <span>{fmtDate(v.modifiedTime)}</span>
                    <span>{fmtBytes(v.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GWPDrive({ wsId }: { wsId: string }) {
  void wsId;
  const [userId, setUserId]     = useState("");
  const [files, setFiles]       = useState<GWPDriveFile[]>([]);
  const [folderName, setFolderName] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadMime, setUploadMime] = useState("text/plain");

  const createFolder = useGWPCreateFolder();
  const uploadFile   = useGWPUploadFile();
  const getMetadata  = useGWPGetFileMetadata();

  async function handleCreateFolder() {
    const f = await createFolder.mutateAsync({ userId, name: folderName });
    setFiles((prev) => [f, ...prev]);
    setFolderName("");
  }

  async function handleUpload() {
    const f = await uploadFile.mutateAsync({ userId, name: uploadName, mimeType: uploadMime, content: uploadContent });
    setFiles((prev) => [f, ...prev]);
    setUploadName(""); setUploadContent("");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-sse-border bg-sse-surface px-4 py-3 space-y-2">
        <p className="text-[11px] font-medium text-sse-ink">ID de usuario Google</p>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="sub de Google OAuth"
          className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-green-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Create folder */}
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          <p className="text-[12px] font-semibold text-sse-ink">Crear carpeta</p>
          <input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Nombre de la carpeta"
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          <button onClick={handleCreateFolder} disabled={!userId || !folderName || createFolder.isPending}
            className="text-[11px] px-4 py-1.5 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50">
            {createFolder.isPending ? "Creando…" : "Crear carpeta"}
          </button>
        </div>

        {/* Upload file */}
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
          <p className="text-[12px] font-semibold text-sse-ink">Subir archivo</p>
          <input value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="Nombre del archivo"
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          <select value={uploadMime} onChange={(e) => setUploadMime(e.target.value)}
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink">
            <option value="text/plain">text/plain</option>
            <option value="application/json">application/json</option>
            <option value="text/csv">text/csv</option>
            <option value="text/html">text/html</option>
          </select>
          <textarea value={uploadContent} onChange={(e) => setUploadContent(e.target.value)} rows={3} placeholder="Contenido del archivo"
            className="w-full text-[11px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink font-mono" />
          <button onClick={handleUpload} disabled={!userId || !uploadName || !uploadContent || uploadFile.isPending}
            className="text-[11px] px-4 py-1.5 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50">
            {uploadFile.isPending ? "Subiendo…" : "Subir archivo"}
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-sse-muted font-medium">{files.length} archivos en esta sesión</p>
          {files.map((f) => (
            <FileRow key={f.id} file={f} userId={userId} onRefresh={() => {}} />
          ))}
        </div>
      )}

      {/* Quick metadata lookup */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
        <p className="text-[12px] font-semibold text-sse-ink">Consultar metadatos por ID</p>
        <div className="flex gap-2">
          <input id="meta-file-id" placeholder="File ID de Drive"
            className="flex-1 text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink" />
          <button
            onClick={() => {
              const id = (document.getElementById("meta-file-id") as HTMLInputElement).value;
              if (id && userId) getMetadata.mutateAsync({ userId, fileId: id }).then((f) => setFiles((p) => [f, ...p]));
            }}
            disabled={!userId || getMetadata.isPending}
            className="text-[11px] px-3 py-1.5 rounded border border-sse-border text-sse-muted hover:text-sse-ink disabled:opacity-50">
            Consultar
          </button>
        </div>
      </div>
    </div>
  );
}
