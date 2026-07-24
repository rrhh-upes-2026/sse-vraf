"use client";

import { use } from "react";
import { IDEIndicatorPreview } from "@/components/workspace/ide/IndicatorPreview";

export default function IDEPreviewPage({ params }: { params: Promise<{ wsId: string; id: string }> }) {
  const { wsId, id } = use(params);
  return <IDEIndicatorPreview wsId={wsId} indicatorId={id} />;
}
