import { Badge } from "@/components/ui/badge";
import { getMaturityConfig } from "@/lib/studio/maturityConfig";
import type { MaturityLevel } from "@/types/studio";

interface MaturityBadgeProps {
  level: MaturityLevel;
}

export function MaturityBadge({ level }: MaturityBadgeProps) {
  const cfg = getMaturityConfig(level);
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
