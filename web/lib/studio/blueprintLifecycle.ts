import type { BlueprintStatus, BlueprintLifecycleTransition } from "@/types/studio";

const LIFECYCLE_MAP: Record<
  BlueprintLifecycleTransition,
  { from: BlueprintStatus[]; to: BlueprintStatus }
> = {
  submit:     { from: ["draft"],                  to: "validating" },
  publish:    { from: ["validating"],             to: "published"  },
  reject:     { from: ["validating"],             to: "draft"      },
  deprecate:  { from: ["published"],              to: "deprecated" },
  archive:    { from: ["deprecated", "draft"],    to: "archived"   },
  reactivate: { from: ["deprecated"],             to: "published"  },
};

export function canTransition(
  status: BlueprintStatus,
  transition: BlueprintLifecycleTransition,
): boolean {
  return LIFECYCLE_MAP[transition]?.from.includes(status) ?? false;
}

export function applyTransition(
  status: BlueprintStatus,
  transition: BlueprintLifecycleTransition,
): BlueprintStatus {
  if (!canTransition(status, transition)) {
    throw new Error(
      `Illegal blueprint lifecycle transition: "${transition}" from status "${status}"`,
    );
  }
  return LIFECYCLE_MAP[transition].to;
}

export function getAvailableTransitions(
  status: BlueprintStatus,
): BlueprintLifecycleTransition[] {
  return (Object.entries(LIFECYCLE_MAP) as [BlueprintLifecycleTransition, { from: BlueprintStatus[] }][])
    .filter(([, cfg]) => cfg.from.includes(status))
    .map(([t]) => t);
}

export const TERMINAL_BLUEPRINT_STATES: BlueprintStatus[] = ["archived"];

export function isTerminalBlueprint(status: BlueprintStatus): boolean {
  return TERMINAL_BLUEPRINT_STATES.includes(status);
}
