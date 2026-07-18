import { NextRequest, NextResponse } from "next/server";
import { getAppsScriptClient } from "@/services/adapters/getAppsScriptClient";

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

  const ip        = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "";
  const userAgent = req.headers.get("user-agent") ?? "";

  try {
    const client = getAppsScriptClient();
    await client.call("auth.sendOtp", { email, ip, userAgent });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("espere") || msg.includes("bloqueada") ? 429
                 : msg.includes("autorizado") || msg.includes("institucional") ? 403
                 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
