import { NextRequest, NextResponse } from "next/server";
import { handleGWPCallback } from "@/services/gwp";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/ws/gwp/gwp-oauth?error=${encodeURIComponent(error)}`, req.nextUrl.origin),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/ws/gwp/gwp-oauth?error=missing_params", req.nextUrl.origin),
    );
  }

  try {
    await handleGWPCallback(code, state);
    return NextResponse.redirect(
      new URL("/ws/gwp/gwp-oauth?success=1", req.nextUrl.origin),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.redirect(
      new URL(`/ws/gwp/gwp-oauth?error=${encodeURIComponent(msg)}`, req.nextUrl.origin),
    );
  }
}
