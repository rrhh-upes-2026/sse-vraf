import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

const GAS_URL = process.env.APPS_SCRIPT_WEB_APP_URL;
const SECRET  = process.env.WEBHOOK_SHARED_SECRET;

/**
 * Proxy for all Apps Script calls from client-side code.
 *
 * - Validates the session (401 if unauthenticated)
 * - Injects WEBHOOK_SHARED_SECRET server-side (never sent to the browser)
 * - Adds userId / userEmail from the session for audit trails
 * - Forwards to APPS_SCRIPT_WEB_APP_URL and streams the response back
 *
 * Client components send: POST /api/apps-script  { action, params }
 * This proxy sends:       POST <GAS_URL>          { action, params, userId, userEmail, secret? }
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionUser = token ? await verifySessionToken(token) : null;
  if (!sessionUser) {
    return NextResponse.json(
      { success: false, errors: [{ code: "UNAUTHORIZED", message: "Not authenticated" }] },
      { status: 401 },
    );
  }

  if (!GAS_URL) {
    return NextResponse.json(
      { success: false, errors: [{ code: "NOT_CONFIGURED", message: "APPS_SCRIPT_WEB_APP_URL is not set" }] },
      { status: 503 },
    );
  }

  const body = await req.json();
  const payload = {
    ...body,
    userId:    sessionUser.usuarioId,
    userEmail: sessionUser.email,
    ...(SECRET ? { secret: SECRET } : {}),
  };

  try {
    const res = await fetch(GAS_URL, {
      method:  "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body:    JSON.stringify(payload),
      cache:   "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, errors: [{ code: "GATEWAY_ERROR", message: String(err) }] },
      { status: 502 },
    );
  }
}
