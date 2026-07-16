"use client";
import { create } from "zustand";
import type { WorkflowEvent, WorkflowEventType } from "@/types/workflow";

type Handler = (event: WorkflowEvent) => void;

// Module-level registry — subscribe/unsubscribe are O(1) with no Zustand
// state churn or component re-renders. The Zustand store wraps only stable
// method references, so calling useEventBus() never triggers a re-render.
const _registry = new Map<WorkflowEventType | "*", Set<Handler>>();

interface EventBusStore {
  emit: (event: WorkflowEvent) => void;
  subscribe: (type: WorkflowEventType | "*", handler: Handler) => () => void;
}

export const useEventBus = create<EventBusStore>(() => ({
  emit(event: WorkflowEvent) {
    _registry.get(event.type)?.forEach((h) => h(event));
    _registry.get("*")?.forEach((h) => h(event));
  },

  subscribe(type, handler) {
    if (!_registry.has(type)) _registry.set(type, new Set());
    _registry.get(type)!.add(handler);
    return () => {
      _registry.get(type)?.delete(handler);
    };
  },
}));

export function emitEvents(events: WorkflowEvent[]): void {
  const { emit } = useEventBus.getState();
  events.forEach(emit);
}
