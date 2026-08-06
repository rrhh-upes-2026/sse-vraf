import { NextRequest, NextResponse } from "next/server";
import { getIndicadores } from "@/services/monitoreo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const wsId = req.nextUrl.searchParams.get("wsId") ?? "vraf";

  try {
    const data = await getIndicadores(wsId);
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
