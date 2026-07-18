import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

const GAS_URL = process.env.APPS_SCRIPT_WEB_APP_URL;
const SECRET  = process.env.WEBHOOK_SHARED_SECRET;

/**
 * GET /api/apps-script/ping
 *
 * Connectivity smoke-test: calls auth.ping on the deployed Apps Script backend
 * and returns a plain result object. Run this from the browser or curl to verify
 * end-to-end wiring before testing data endpoints.
 *
 * 200 { ok: true,  mode: "live", instance, sprint, requestId, durationMs }
 * 200 { ok: false, mode: "mock"  }   — APPS_SCRIPT_WEB_APP_URL not configured
 * 401                                — session required
 * 502 { ok: false, error: "..." }    — network / parse failure
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionUser = token ? await verifySessionToken(token) : null;
  if (!sessionUser) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  if (!GAS_URL) {
    return NextResponse.json({ ok: false, mode: "mock", error: "APPS_SCRIPT_WEB_APP_URL not configured" });
  }

  try {
    const res = await fetch(GAS_URL, {
      method:  "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body:    JSON.stringify({
        action: "auth.ping",
        params: {},
        ...(SECRET ? { secret: SECRET } : {}),
      }),
      cache: "no-store",
    });

    const envelope = await res.json();
    return NextResponse.json({
      ok:        envelope.success === true,
      mode:      "live",
      instance:  envelope.data?.instance,
      sprint:    envelope.data?.sprint,
      requestId: envelope.requestId,
      durationMs: envelope.metadata?.durationMs,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, mode: "live", error: String(err) }, { status: 502 });
  }
}
