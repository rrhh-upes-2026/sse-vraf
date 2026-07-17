import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

/**
 * Server-side session reader. Compatible with the previous Auth.js `auth()` API:
 * returns { user } on a valid session, null otherwise.
 *
 * Used by: AppShell, API routes (apps-script proxy, ping).
 */
export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await verifySessionToken(token);
  if (!user) return null;
  return { user };
}
