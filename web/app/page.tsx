import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user  = token ? await verifySessionToken(token) : null;

  if (!user) redirect("/login");

  const wsId = user.unidadId !== "GLOBAL" ? user.unidadId : "vraf";
  redirect(`/ws/${wsId}/dashboard`);
}
