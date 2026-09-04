import { NextRequest, NextResponse } from "next/server";
import { getEvidencias } from "@/services/monitoreo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
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
