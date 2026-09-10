import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getEvidencias } from "@/services/monitoreo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const wsId    = req.nextUrl.searchParams.get("wsId") ?? "vraf";
  const refresh = req.nextUrl.searchParams.get("refresh") === "true";

  try {
    const data = await getEvidencias(wsId, refresh);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/google/drive] error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve evidencias", wsId },
      { status: 500 },
    );
  }
}
