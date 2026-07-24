import { SignJWT, jwtVerify } from "jose";
import type { RoleCode } from "@/types/roles";
import type { WorkspaceId } from "@/config/nav";

export interface SessionUser {
  usuarioId: string;
  nombre: string;
  name: string;
  email: string;
  rol: RoleCode;
  unidadId: WorkspaceId;
  mustChangePassword?: boolean;
}

export const SESSION_COOKIE = "sse_session";
export const MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.user as SessionUser) ?? null;
  } catch {
    return null;
  }
}
