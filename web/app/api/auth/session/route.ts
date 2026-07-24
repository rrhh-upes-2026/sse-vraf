import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

const TEMP_ADMIN = {
  usuarioId: "temp-admin",
  nombre:    "Administrador Temporal",
  name:      "Administrador Temporal",
  email:     "admin@upes.edu.sv",
  rol:       "ADMIN" as const,
  unidadId:  "vraf" as const,
  mustChangePassword: false,
};

export async function GET() {
  if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") {
    return NextResponse.json({ user: TEMP_ADMIN });
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  return NextResponse.json({ user: user ?? null });
}
