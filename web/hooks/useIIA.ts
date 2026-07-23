"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  iiaChat,
  listIIAConversations, getIIAConversation, deleteIIAConversation,
  getIIADashboard,
  getIIAConfig, updateIIAConfig,
  listIIAPrompts, updateIIAPrompt,
  getIIAHistory,
  checkIIAStatus, clearIIAHistory,
} from "@/services/iia";
import type {
  IIAChatParams,
  IIAUpdateConfigParams,
  IIAUpdatePromptParams,
  IIAListConversationsParams,
  IIAGetHistoryParams,
} from "@/types/iia";

// ─── Query keys ───────────────────────────────────────────────────────────────

const K = {
  dashboard:     ["iia", "dashboard"]                               as const,
  conversations: (p?: IIAListConversationsParams) => ["iia", "conversations", p] as const,
  conversation:  (id: string) => ["iia", "conversation", id]        as const,
  config:        ["iia", "config"]                                  as const,
  prompts:       ["iia", "prompts"]                                 as const,
  history:       (p?: IIAGetHistoryParams) => ["iia", "history", p] as const,
  status:        ["iia", "status"]                                  as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useIIADashboard() {
  return useQuery({ queryKey: K.dashboard, queryFn: getIIADashboard });
}

export function useIIAConversations(params?: IIAListConversationsParams) {
  return useQuery({
    queryKey: K.conversations(params),
    queryFn:  () => listIIAConversations(params),
  });
}

export function useIIAConversation(id: string) {
  return useQuery({
    queryKey: K.conversation(id),
    queryFn:  () => getIIAConversation(id),
    enabled:  !!id,
  });
}

export function useIIAConfig() {
  return useQuery({ queryKey: K.config, queryFn: getIIAConfig });
}

export function useIIAPrompts() {
  return useQuery({ queryKey: K.prompts, queryFn: listIIAPrompts });
}

export function useIIAHistory(params?: IIAGetHistoryParams) {
  return useQuery({
    queryKey: K.history(params),
    queryFn:  () => getIIAHistory(params),
  });
}

export function useIIAStatus() {
  return useQuery({
    queryKey:       K.status,
    queryFn:        checkIIAStatus,
    refetchInterval: 30_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useIIAChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: IIAChatParams) => iiaChat(params),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["iia", "conversations"] });
      void qc.invalidateQueries({ queryKey: ["iia", "dashboard"] });
      void qc.invalidateQueries({ queryKey: ["iia", "history"] });
    },
  });
}

export function useDeleteIIAConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIIAConversation(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["iia", "conversations"] });
      void qc.invalidateQueries({ queryKey: ["iia", "dashboard"] });
    },
  });
}

export function useUpdateIIAConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: IIAUpdateConfigParams) => updateIIAConfig(params),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["iia", "config"] });
      void qc.invalidateQueries({ queryKey: ["iia", "status"] });
    },
  });
}

export function useUpdateIIAPrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: IIAUpdatePromptParams) => updateIIAPrompt(params),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["iia", "prompts"] });
    },
  });
}

export function useClearIIAHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearIIAHistory,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["iia", "history"] });
      void qc.invalidateQueries({ queryKey: ["iia", "dashboard"] });
    },
  });
}
