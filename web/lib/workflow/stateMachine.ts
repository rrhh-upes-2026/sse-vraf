import type { WorkflowState, TransitionType } from "@/types/workflow";

// Which source states each transition type is valid from, and what it transitions to.
// approve/reject/return/escalate are stage-level transitions — they keep the workflow
// in_progress while the stageEngine handles the stage-level state change.
const TRANSITION_MAP: Record<
  TransitionType,
  { from: WorkflowState[]; to: WorkflowState }
> = {
  start:    { from: ["created"],                                     to: "in_progress" },
  approve:  { from: ["in_progress"],                                 to: "in_progress" },
  reject:   { from: ["in_progress"],                                 to: "in_progress" },
  return:   { from: ["in_progress"],                                 to: "in_progress" },
  escalate: { from: ["in_progress"],                                 to: "in_progress" },
  complete: { from: ["in_progress"],                                 to: "completed"   },
  cancel:   { from: ["created", "in_progress", "waiting", "blocked"], to: "cancelled"  },
  block:    { from: ["in_progress"],                                 to: "blocked"     },
  unblock:  { from: ["blocked"],                                     to: "in_progress" },
  wait:     { from: ["in_progress"],                                 to: "waiting"     },
  resume:   { from: ["waiting"],                                     to: "in_progress" },
  reopen:   { from: ["completed", "cancelled"],                      to: "in_progress" },
  archive:  { from: ["completed", "cancelled"],                      to: "archived"    },
};

export function canTransition(
  current: WorkflowState,
  type: TransitionType,
): boolean {
  return TRANSITION_MAP[type]?.from.includes(current) ?? false;
}

export function applyStateTransition(
  current: WorkflowState,
  type: TransitionType,
): WorkflowState {
  if (!canTransition(current, type)) {
    throw new Error(`Illegal workflow transition: ${type} from state "${current}"`);
  }
  return TRANSITION_MAP[type].to;
}

export const TERMINAL_STATES: WorkflowState[] = ["completed", "cancelled", "archived"];

export function isTerminal(state: WorkflowState): boolean {
  return TERMINAL_STATES.includes(state);
}
