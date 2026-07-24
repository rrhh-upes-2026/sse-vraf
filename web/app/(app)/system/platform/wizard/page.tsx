import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { InstallationWizard } from "@/components/system/InstallationWizard";

export const metadata = { title: "Asistente de Instalación | SSE-VRAF" };

export default async function PlatformWizardPage() {
  // Non-admin users have no business here
  if (process.env.NEXT_PUBLIC_SKIP_AUTH !== "true") {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (session && session.rol !== "ADMIN") {
      redirect("/ws/vraf/dashboard");
    }
  }

  return <InstallationWizard />;
}
