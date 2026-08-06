export interface Evidencia {
  id: string;
  nombre: string;
  tipo: string;
  tamaño?: number;
  fechaModificacion: string;
  carpeta: string;
  driveId: string;
  driveUrl: string;
  responsable?: string;
  wsId: string;
}

export interface CarpetaEvidencia {
  id: string;
  nombre: string;
  driveId: string;
  cantidad: number;
  ultimaModificacion?: string;
  archivos?: Evidencia[];
}

export function formatTamaño(bytes: number): string {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + "KB";
  return (bytes / 1048576).toFixed(1) + "MB";
}

export function iconoTipo(tipo: string): string {
  const t = tipo.toLowerCase();
  if (t === "pdf") return "📄";
  if (t === "xlsx" || t === "xls") return "📊";
  if (t === "docx" || t === "doc") return "📝";
  if (t === "jpg" || t === "jpeg" || t === "png") return "🖼️";
  return "📎";
}
