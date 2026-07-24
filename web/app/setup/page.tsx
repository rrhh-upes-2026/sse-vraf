"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlatformStatus } from "@/services/platform-bootstrap";
import { InstallationWizard } from "@/components/system/InstallationWizard";

export default function SetupPage() {
  const router  = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getPlatformStatus()
      .then((s) => {
        if (s.installed) {
          // Already installed — send the user to login
          router.replace("/login");
        } else {
          setReady(true);
        }
      })
      .catch(() => setReady(true)); // show wizard on error so admin can diagnose
  }, [router]);

  if (!ready) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #080f1e 0%, #0d1a2e 60%, #111827 100%)",
        color: "rgba(255,255,255,0.4)", gap: 10, fontFamily: "system-ui, sans-serif",
      }}>
        <span style={{ fontSize: 14 }}>Verificando estado de la plataforma…</span>
      </div>
    );
  }

  return <InstallationWizard />;
}
