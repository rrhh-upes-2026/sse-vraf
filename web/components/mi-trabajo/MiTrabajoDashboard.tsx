"use client";

import { isFeatureEnabled } from "@/lib/featureFlags";
import { WelcomeBanner } from "./WelcomeBanner";
import { MyProcesses } from "./MyProcesses";
import { MyActivities } from "./MyActivities";
import { MyEvidences } from "./MyEvidences";
import { MyIndicators } from "./MyIndicators";
import { Alerts } from "./Alerts";
import { QuickActions } from "./QuickActions";

export function MiTrabajoDashboard() {
  const showIndicators = isFeatureEnabled("miTrabajo.indicators");
  const showAlerts     = isFeatureEnabled("miTrabajo.alerts");
  const showQuickActs  = isFeatureEnabled("miTrabajo.quickActions");

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      {showAlerts && <Alerts />}

      <MyProcesses />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MyActivities />
          <MyEvidences />
        </div>

        <div className="space-y-6">
          {showIndicators && <MyIndicators />}
          {showQuickActs && <QuickActions />}
        </div>
      </div>
    </div>
  );
}
