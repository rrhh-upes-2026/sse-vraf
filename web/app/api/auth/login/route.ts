import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, MAX_AGE } from "@/lib/session";
import { UsuariosService, HistorialService } from "@/services";

const ALLOWED_DOMAIN = "upes.edu.sv";

export async function POST(req: NextRequest) {
  const body = await req.json() as { email?: string };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Email requerido." }, { status: 400 });
  }

  const domain = email.split("@")[1] ?? "";
  if (domain !== ALLOWED_DOMAIN) {
    return NextResponse.json(
      { error: "Acceso permitido únicamente para cuentas institucionales UPES." },
      { status: 403 },
    );
  }

  const [usuario] = await UsuariosService.list({ email });

  if (!usuario || usuario.activo !== true) {
    return NextResponse.json({ error: "Usuario no autorizado." }, { status: 403 });
  }

  const token = await createSessionToken({
    usuarioId: usuario.id,
    nombre:    usuario.nombre,
    name:      usuario.nombre,
    email:     usuario.email,
    rol:       usuario.rol,
    unidadId:  usuario.unidadId,
  });

  HistorialService.create({
    entidadTipo: "auth",
    entidadId:   usuario.email,
    usuarioId:   usuario.id,
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
}
