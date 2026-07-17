import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, MAX_AGE } from "@/lib/session";
import { getAppsScriptClient } from "@/services/adapters/getAppsScriptClient";
import { HistorialService } from "@/services";
import type { RoleCode } from "@/types/roles";
import type { WorkspaceId } from "@/config/nav";

interface OtpVerifyResult {
  usuarioId: string;
  nombre: string;
  email: string;
  rol: RoleCode;
  unidadId: WorkspaceId;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { email?: string; code?: string };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code  = typeof body.code  === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return NextResponse.json({ error: "Email y código son requeridos." }, { status: 400 });
  }

  try {
    const client = getAppsScriptClient();
    const user = await client.call<OtpVerifyResult>("auth.verifyOtp", { email, code });

    const token = await createSessionToken({
      usuarioId: user.usuarioId,
      nombre:    user.nombre,
      name:      user.nombre,
      email:     user.email,
      rol:       user.rol,
      unidadId:  user.unidadId,
    });

    HistorialService.create({
      entidadTipo: "auth",
      entidadId:   user.email,
      usuarioId:   user.usuarioId,
      accion:      "auth.login",
      resultado:   "ok",
      fecha:       new Date().toISOString(),
    }).catch(() => {});

    const res = NextResponse.json({ ok: true });
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
    const status = msg.includes("Código inválido") ? 401 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
