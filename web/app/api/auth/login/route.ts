import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, MAX_AGE } from "@/lib/session";
import { getAppsScriptClient } from "@/services/adapters/getAppsScriptClient";
import { HistorialService } from "@/services";
import type { RoleCode } from "@/types/roles";
import type { WorkspaceId } from "@/config/nav";

const ALLOWED_DOMAIN = "upes.edu.sv";

interface LoginResult {
  usuarioId: string;
  nombre: string;
  email: string;
  rol: RoleCode;
  unidadId: WorkspaceId;
  mustChangePassword?: boolean;
}

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") {
    const token = await createSessionToken({
      usuarioId: "temp-admin",
      nombre:    "Administrador Temporal",
      name:      "Administrador Temporal",
      email:     "admin@upes.edu.sv",
      rol:       "ADMIN" as RoleCode,
      unidadId:  "vraf" as WorkspaceId,
      mustChangePassword: false,
    });
    const res = NextResponse.json({ ok: true, mustChangePassword: false });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   MAX_AGE,
      path:     "/",
    });
    return res;
  }

  const body = await req.json() as { email?: string; password?: string };
  const email    = typeof body.email    === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Correo y contraseña son requeridos." }, { status: 400 });
  }

  const domain = email.split("@")[1] ?? "";
  if (domain !== ALLOWED_DOMAIN) {
    return NextResponse.json(
      { error: "Acceso permitido únicamente para cuentas institucionales UPES." },
      { status: 403 },
    );
  }

  const ip        = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "";
  const userAgent = req.headers.get("user-agent") ?? "";

  try {
    const client = getAppsScriptClient();
    const user = await client.call<LoginResult>("auth.login", { email, password, ip, userAgent });

    const token = await createSessionToken({
      usuarioId:          user.usuarioId,
      nombre:             user.nombre,
      name:               user.nombre,
      email:              user.email,
      rol:                user.rol,
      unidadId:           user.unidadId,
      mustChangePassword: user.mustChangePassword ?? false,
    });

    HistorialService.create({
      entidadTipo: "auth",
      entidadId:   user.email,
      usuarioId:   user.usuarioId,
      accion:      "auth.login",
      resultado:   "ok",
      fecha:       new Date().toISOString(),
    }).catch(() => {});

    const res = NextResponse.json({ ok: true, mustChangePassword: user.mustChangePassword ?? false });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   MAX_AGE,
      path:     "/",
    });
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("bloqueada") || msg.includes("intentos") ? 429
                 : msg.includes("institucional") ? 403
                 : 401;
    return NextResponse.json({ error: msg }, { status });
  }
}
