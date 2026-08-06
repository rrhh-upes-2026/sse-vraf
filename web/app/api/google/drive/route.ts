import { NextRequest, NextResponse } from "next/server";
import { getEvidencias } from "@/services/monitoreo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const wsId = req.nextUrl.searchParams.get("wsId") ?? "vraf";

  try {
    const data = await getEvidencias(wsId);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
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
