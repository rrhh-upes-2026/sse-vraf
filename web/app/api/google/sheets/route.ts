import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getIndicadores } from "@/services/monitoreo";

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
    const data = await getIndicadores(wsId, refresh);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("[api/google/sheets] error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve indicators", wsId },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/google/sheets
 * Writes a single metadata field (descripcion or formula) back to Google Sheets
 * via the GAS doPost endpoint. Requires GAS_WRITE_KEY env var.
 *
 * Body: { wsId, indicadorId, campo: "descripcion" | "formula", valor }
 */
export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const patchToken = cookieStore.get(SESSION_COOKIE)?.value;
  const patchUser = patchToken ? await verifySessionToken(patchToken) : null;
  if (!patchUser) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      wsId: string;
      indicadorId: string;
      campo: "descripcion" | "formula";
      valor: string;
    };

    const { wsId, indicadorId, campo, valor } = body;

    if (!wsId || !indicadorId || !campo) {
      return NextResponse.json(
        { error: "Parámetros requeridos: wsId, indicadorId, campo" },
        { status: 400 },
      );
    }

    const gasUrl  = process.env.APPS_SCRIPT_WEB_APP_URL;
    const writeKey = process.env.GAS_WRITE_KEY;

    if (!gasUrl) {
      return NextResponse.json({ error: "APPS_SCRIPT_WEB_APP_URL no configurado." }, { status: 500 });
    }
    if (!writeKey) {
      return NextResponse.json({ error: "GAS_WRITE_KEY no configurado." }, { status: 500 });
    }

    const gasRes = await fetch(gasUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action:      "updateIndicador",
        writeKey,
        wsId,
        indicadorId,
        campo,
        valor,
      }),
      // GAS Web Apps sometimes redirect; follow redirects server-side
      redirect: "follow",
    });

    const data = await gasRes.json();

    if (data.error) {
      console.error("[api/google/sheets PATCH] GAS error:", data);
      return NextResponse.json(data, { status: data.code ?? 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/google/sheets PATCH] error:", err);
    return NextResponse.json(
      { error: "Error al escribir en Google Sheets." },
      { status: 500 },
    );
  }
}
