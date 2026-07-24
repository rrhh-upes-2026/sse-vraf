import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, createSessionToken, SESSION_COOKIE, MAX_AGE } from "@/lib/session";
import { getAppsScriptClient } from "@/services/adapters/getAppsScriptClient";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionUser = token ? await verifySessionToken(token) : null;

  if (!sessionUser) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const body = await req.json() as { newPassword?: string };
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  try {
    const client = getAppsScriptClient();
    await client.call("auth.changePassword", { email: sessionUser.email, newPassword });

    // Re-issue the session token with mustChangePassword cleared
    const newToken = await createSessionToken({
      ...sessionUser,
      mustChangePassword: false,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, newToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   MAX_AGE,
      path:     "/",
    });
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
