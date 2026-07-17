"use client";

import { useState, useEffect } from "react";
import type { WorkspaceUser, RoleCode } from "@/types/workspace-admin";
import type { WorkspaceId } from "@/config/nav";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import { Drawer, DrawerSection, DrawerField } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface UserDrawerProps {
  wsId: WorkspaceId;
  user: WorkspaceUser | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const ROL_OPTIONS: { value: RoleCode; label: string; description: string }[] = [
  { value: "ADMIN", label: "Admin", description: "Acceso total al workspace" },
  { value: "HEAD", label: "Head", description: "Gestión de procesos y aprobaciones" },
  { value: "ANALYST", label: "Analista", description: "Creación y edición de objetos" },
  { value: "OPS", label: "Operador", description: "Ejecución de procesos" },
  { value: "AUDIT", label: "Auditor", description: "Solo lectura y auditoría" },
];

const ROL_SELECT = ROL_OPTIONS.map((r) => ({ value: r.value, label: `${r.label} — ${r.description}` }));

export function UserDrawer({ wsId, user, open, onClose, onSaved }: UserDrawerProps) {
  const isNew = !user;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol: "OPS" as RoleCode,
    activo: true,
  });

  useEffect(() => {
    if (user) {
      setForm({ nombre: user.nombre, email: user.email, rol: user.rol, activo: user.activo });
    } else {
      setForm({ nombre: "", email: "", rol: "OPS", activo: true });
    }
    setSaved(false);
  }, [user, open]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) {
        await WorkspaceAdminService.createUser(wsId, form);
      } else {
        await WorkspaceAdminService.updateUserRole(user!.id, form.rol);
        if (form.activo !== user!.activo) await WorkspaceAdminService.toggleUserActive(user!.id, form.activo);
      }
      setSaved(true);
      setTimeout(() => { onSaved(); onClose(); }, 800);
    } finally {
      setSaving(false);
    }
  }

  const initials = form.nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";
  const rolInfo = ROL_OPTIONS.find((r) => r.value === form.rol);
  const ROL_COLORS: Record<RoleCode, string> = { ADMIN: "#E54D4D", HEAD: "#2E6BE6", ANALYST: "#5B4FD0", OPS: "#0F8A8A", AUDIT: "#E5A100" };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isNew ? "Nuevo Usuario" : user!.nombre}
      subtitle={isNew ? `Workspace ${wsId.toUpperCase()}` : user!.email}
      width="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || !form.nombre || !form.email}>
            {saved ? "✓ Guardado" : saving ? "Guardando…" : isNew ? "Agregar usuario" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 border-b border-sse-border px-6 py-6">
        <div
          className="flex size-16 items-center justify-center rounded-2xl text-[22px] font-bold text-white"
          style={{ backgroundColor: ROL_COLORS[form.rol] }}
        >
          {initials}
        </div>
        <div className="text-center">
          <p className="text-[14px] font-semibold text-sse-ink">{form.nombre || "Nuevo usuario"}</p>
          <p className="text-[12px] text-sse-muted">{form.email || "sin correo"}</p>
          <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ backgroundColor: ROL_COLORS[form.rol] }}>
            {rolInfo?.label}
          </span>
        </div>
      </div>

      <DrawerSection>
        <DrawerField label="Nombre completo" required>
          <input
            className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-sse-primary/30"
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            placeholder="Lic. Nombre Apellido"
            disabled={!isNew}
          />
        </DrawerField>
        <DrawerField label="Correo institucional" required>
          <input
            type="email"
            className="w-full rounded-sm border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-2 focus:ring-sse-primary/30 disabled:opacity-60"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="usuario@upes.edu.sv"
            disabled={!isNew}
          />
        </DrawerField>
        <DrawerField label="Rol en el workspace">
          <Select value={form.rol} onValueChange={(v) => set("rol", v as RoleCode)} options={ROL_SELECT} />
          {rolInfo && <p className="mt-1.5 text-[11px] text-sse-muted">{rolInfo.description}</p>}
        </DrawerField>
        <DrawerField label="Estado">
          <Switch checked={form.activo} onCheckedChange={(v) => set("activo", v)} label={form.activo ? "Usuario activo" : "Usuario inactivo"} />
        </DrawerField>
      </DrawerSection>

      {user && (
        <DrawerSection title="Información de acceso" className="border-t border-sse-border">
          <div className="space-y-2 text-[12px] text-sse-muted">
            <div className="flex justify-between">
              <span>Último acceso</span>
              <span className="text-sse-ink">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("es-SV") : "Nunca"}</span>
            </div>
            <div className="flex justify-between">
              <span>Creado</span>
              <span className="text-sse-ink">{new Date(user.createdAt).toLocaleDateString("es-SV")}</span>
            </div>
            <div className="flex justify-between">
              <span>ID</span>
              <span className="font-mono text-sse-ink">{user.id}</span>
            </div>
          </div>
        </DrawerSection>
      )}
    </Drawer>
  );
}
