import { ADMIN_TOOLS, STUDIO_TOOLS, getWorkspace, getWorkspaceSection } from "@/config/nav";

const SYSTEM_LABELS: Record<string, string> = {
  "platform/wizard": "Asistente de Instalación",
};

export interface Breadcrumb {
  crumbA: string;
  crumbB: string;
}

/** Mirrors the prototype's crumbA/crumbB computation from the current route. */
export function computeBreadcrumb(pathname: string): Breadcrumb {
  if (pathname.startsWith("/mi-trabajo")) {
    return { crumbA: "SSE-VRAF", crumbB: "" };
  }

  const wsMatch = pathname.match(/^\/ws\/([^/]+)\/([^/]+)?/);
  if (wsMatch) {
    const ws = getWorkspace(wsMatch[1]);
    const section = wsMatch[2] ? getWorkspaceSection(wsMatch[2]) : undefined;
    return {
      crumbA: ws?.short ?? "SSE-VRAF",
      crumbB: section?.label ?? "",
    };
  }

  const studioMatch = pathname.match(/^\/studio\/([^/]+)?/);
  if (studioMatch) {
    const tool = studioMatch[1]
      ? STUDIO_TOOLS.find((t) => t.slug === studioMatch[1])
      : undefined;
    return { crumbA: "Studio", crumbB: tool?.label ?? "" };
  }

  const systemMatch = pathname.match(/^\/system\/(.+)?/);
  if (systemMatch) {
    const sub = systemMatch[1]?.replace(/\/$/, "") ?? "";
    return { crumbA: "Sistema", crumbB: SYSTEM_LABELS[sub] ?? "" };
  }

  const adminMatch = pathname.match(/^\/admin\/([^/]+)?/);
  if (adminMatch) {
    const tool = adminMatch[1]
      ? ADMIN_TOOLS.find((t) => t.slug === adminMatch[1])
      : undefined;
    return { crumbA: "Administración", crumbB: tool?.label ?? "" };
  }

  return { crumbA: "SSE-VRAF", crumbB: "" };
}
