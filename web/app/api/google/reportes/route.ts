import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getReportes } from "@/services/reportes";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (process.env.REQUIRE_AUTH === "true") {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = token ? await verifySessionToken(token) : null;
    if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const wsId = req.nextUrl.searchParams.get("wsId") ?? "";
  if (!wsId) {
    return NextResponse.json({ error: "wsId requerido" }, { status: 400 });
  }

  try {
    const data = await getReportes(wsId);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("[api/google/reportes] error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve reportes", wsId },
      { status: 500 },
    );
  }
}
